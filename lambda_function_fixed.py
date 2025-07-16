import boto3
import datetime
import json
from botocore.exceptions import ClientError

DEFAULT_BUCKET_NAME = 'cloudsniper-scan-results'
DEFAULT_ROLE_ARN = None

def check_bucket_public(s3_client, bucket_name):
    try:
        status = s3_client.get_bucket_policy_status(Bucket=bucket_name)
        return status['PolicyStatus']['IsPublic']
    except ClientError:
        return False

def check_bucket_encryption(s3_client, bucket_name):
    try:
        encryption = s3_client.get_bucket_encryption(Bucket=bucket_name)
        return bool(encryption['ServerSideEncryptionConfiguration'])
    except ClientError:
        return False

def assume_role_and_get_clients(role_arn):
    sts = boto3.client('sts')
    try:
        assumed = sts.assume_role(
            RoleArn=role_arn,
            RoleSessionName="CloudSniperSession",
            DurationSeconds=3600
        )
        creds = assumed['Credentials']
        session = boto3.Session(
            aws_access_key_id=creds['AccessKeyId'],
            aws_secret_access_key=creds['SecretAccessKey'],
            aws_session_token=creds['SessionToken']
        )
        return {
            'session': session,
            'ec2': session.client('ec2'),
            's3': session.client('s3'),
            'iam': session.client('iam'),
            'sts': session.client('sts'),
            'credentials': creds
        }
    except Exception as e:
        print("❌ STS AssumeRole Failed:", str(e))
        return None

def get_all_regions(ec2_client):
    regions = ec2_client.describe_regions(AllRegions=False)
    return [r['RegionName'] for r in regions['Regions']]

def parse_request(event):
    """Parse request from different event sources"""
    print(f"🔍 Raw event keys: {list(event.keys())}")
    
    # Handle different event structures
    body_content = None
    
    # Check for Lambda Function URL format
    if 'body' in event:
        body_content = event['body']
    
    # Parse body if it exists
    if body_content:
        try:
            if isinstance(body_content, str):
                body = json.loads(body_content)
            else:
                body = body_content
            
            role_arn = body.get('roleArn', DEFAULT_ROLE_ARN)
            bucket_name = body.get('bucketName', DEFAULT_BUCKET_NAME)
            print(f"📋 Parsed from body - roleArn: {role_arn}")
            return {
                'roleArn': role_arn,
                'bucketName': bucket_name,
                'isHttpRequest': True
            }
        except Exception as e:
            print(f"❌ JSON parse error: {str(e)}")
            print(f"❌ Body content: {body_content}")
    
    # Fallback to direct event parameters
    role_arn = event.get('roleArn', DEFAULT_ROLE_ARN)
    bucket_name = event.get('bucketName', DEFAULT_BUCKET_NAME)
    is_http = 'requestContext' in event or 'httpMethod' in event
    
    print(f"📋 Fallback parse - roleArn: {role_arn}, isHttp: {is_http}")
    return {
        'roleArn': role_arn,
        'bucketName': bucket_name,
        'isHttpRequest': is_http
    }

def get_cors_headers():
    """Return comprehensive CORS headers for all responses"""
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
        "Access-Control-Max-Age": "86400",
        "Access-Control-Allow-Credentials": "false"
    }

def format_response(result, is_http_request, status_code=200):
    """Format response with proper CORS headers"""
    if is_http_request:
        response = {
            "statusCode": status_code,
            "headers": get_cors_headers(),
            "body": json.dumps(result, indent=2, default=str)
        }
        print(f"✅ HTTP Response: {response['statusCode']} with CORS headers")
        return response
    else:
        return result

def run_scan(role_arn, bucket_name):
    clients = assume_role_and_get_clients(role_arn)
    if not clients:
        raise Exception("Unable to assume role - check IAM role ARN and permissions")

    session = clients['session']
    account_id = clients['sts'].get_caller_identity()['Account']
    now = datetime.datetime.utcnow()

    result = {
        "status": "success",
        "message": "✅ CloudSniper Scan Complete!",
        "accountId": account_id,
        "timestamp": now.isoformat() + "Z",
        "summary": {
            "totalInstancesScanned": 0,
            "stoppedInstancesCount": 0,
            "idleRunningInstancesCount": 0,
            "activeInstancesCount": 0,
            "unattachedEBSVolumes": 0,
            "s3BucketsCount": 0,
            "elbCount": 0,
            "iamUsersCount": 0
        },
        "details": {
            "stoppedInstances": [],
            "idleRunningInstances": [],
            "activeInstances": [],
            "unusedEBSVolumes": [],
            "s3Buckets": [],
            "elbs": [],
            "iamUsers": []
        }
    }

    all_regions = get_all_regions(clients['ec2'])
    for region in all_regions:
        print(f"🔍 Scanning region: {region}")
        reg_client = boto3.Session(
            aws_access_key_id=clients['credentials']['AccessKeyId'],
            aws_secret_access_key=clients['credentials']['SecretAccessKey'],
            aws_session_token=clients['credentials']['SessionToken'],
            region_name=region
        )

        ec2 = reg_client.client('ec2')
        cloudwatch = reg_client.client('cloudwatch')
        elbv2 = reg_client.client('elbv2')
        elb = reg_client.client('elb')

        try:
            reservations = ec2.describe_instances()['Reservations']
            for res in reservations:
                for inst in res['Instances']:
                    instance_id = inst['InstanceId']
                    state = inst['State']['Name']
                    result['summary']['totalInstancesScanned'] += 1
                    if state == 'stopped':
                        result['summary']['stoppedInstancesCount'] += 1
                        result['details']['stoppedInstances'].append({'instanceId': instance_id, 'region': region})
                    elif state == 'running':
                        metrics = cloudwatch.get_metric_statistics(
                            Namespace='AWS/EC2',
                            MetricName='CPUUtilization',
                            Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
                            StartTime=now - datetime.timedelta(days=7),
                            EndTime=now,
                            Period=3600,
                            Statistics=['Average']
                        )
                        avg_cpu = sum([pt['Average'] for pt in metrics['Datapoints']]) / len(metrics['Datapoints']) if metrics['Datapoints'] else 0
                        if avg_cpu < 5:
                            result['summary']['idleRunningInstancesCount'] += 1
                            result['details']['idleRunningInstances'].append({'instanceId': instance_id, 'region': region, 'avgCPU': avg_cpu})
                        else:
                            result['summary']['activeInstancesCount'] += 1
                            result['details']['activeInstances'].append({'instanceId': instance_id, 'region': region, 'avgCPU': avg_cpu})
        except Exception as e:
            print("❌ EC2 scan error in region", region, str(e))

        try:
            volumes = ec2.describe_volumes(Filters=[{'Name': 'status', 'Values': ['available']}])['Volumes']
            result['summary']['unattachedEBSVolumes'] += len(volumes)
            result['details']['unusedEBSVolumes'].extend([{
                'volumeId': v['VolumeId'],
                'size': v['Size'],
                'az': v['AvailabilityZone'],
                'region': region
            } for v in volumes])
        except Exception as e:
            print("❌ EBS scan error in region", region, str(e))

        try:
            classic = elb.describe_load_balancers()['LoadBalancerDescriptions']
            appnlb = elbv2.describe_load_balancers()['LoadBalancers']
            total = classic + appnlb
            result['summary']['elbCount'] += len(total)
            for el in total:
                result['details']['elbs'].append({
                    'name': el.get('LoadBalancerName', el.get('LoadBalancerArn')),
                    'type': 'classic' if 'LoadBalancerName' in el else el.get('Type', 'unknown'),
                    'dns': el.get('DNSName'),
                    'region': region
                })
        except Exception as e:
            print("❌ ELB scan error in region", region, str(e))

    try:
        s3 = clients['s3']
        buckets = s3.list_buckets()['Buckets']
        result['summary']['s3BucketsCount'] = len(buckets)
        for bucket in buckets:
            name = bucket['Name']
            result['details']['s3Buckets'].append({
                'name': name,
                'creationDate': bucket['CreationDate'].isoformat(),
                'isPublic': check_bucket_public(s3, name),
                'isEncrypted': check_bucket_encryption(s3, name)
            })
    except Exception as e:
        print("❌ S3 scan error:", str(e))

    try:
        iam = clients['iam']
        users = iam.list_users()['Users']
        result['summary']['iamUsersCount'] = len(users)
        result['details']['iamUsers'] = [{
            'userName': u['UserName'],
            'createDate': u['CreateDate'].isoformat()
        } for u in users]
    except Exception as e:
        print("❌ IAM scan error:", str(e))

    return result

def lambda_handler(event, context):
    try:
        print(f"🚀 Lambda invoked")
        print(f"📋 Event keys: {list(event.keys())}")
        
        # Determine HTTP method from various event structures
        http_method = None
        if 'httpMethod' in event:
            http_method = event['httpMethod']
        elif 'requestContext' in event:
            if 'http' in event['requestContext']:
                http_method = event['requestContext']['http']['method']
            elif 'httpMethod' in event['requestContext']:
                http_method = event['requestContext']['httpMethod']
        
        print(f"🔍 HTTP Method: {http_method}")
        
        # Handle OPTIONS preflight request for CORS
        if http_method == "OPTIONS":
            print("✅ Handling CORS preflight request")
            return {
                "statusCode": 200,
                "headers": get_cors_headers(),
                "body": json.dumps({"message": "CORS preflight successful"})
            }
        
        # Handle GET requests (for testing)
        if http_method == "GET":
            print("✅ Handling GET request - returning test response")
            test_response = {
                "status": "healthy",
                "message": "CloudSniper Lambda is running! Send a POST request with roleArn to start scanning.",
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "version": "1.0.0"
            }
            return format_response(test_response, True)

        # Parse the request
        request = parse_request(event)
        role_arn = request['roleArn']
        bucket_name = request['bucketName']
        is_http_request = request['isHttpRequest']

        print(f"📋 Final parsed values - roleArn: {role_arn}, isHttp: {is_http_request}")

        # Handle test mode when no role ARN is provided
        if not role_arn:
            print("🧪 Running in test mode - no roleArn provided")
            sample_result = {
                "status": "test-mode",
                "message": "🧪 Test Mode: No roleArn provided. This is sample data to demonstrate the interface.",
                "accountId": "123456789012",
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "summary": {
                    "totalInstancesScanned": 8,
                    "stoppedInstancesCount": 2,
                    "idleRunningInstancesCount": 1,
                    "activeInstancesCount": 5,
                    "unattachedEBSVolumes": 3,
                    "s3BucketsCount": 12,
                    "elbCount": 2,
                    "iamUsersCount": 4
                },
                "details": {
                    "stoppedInstances": [
                        {"instanceId": "i-1234567890abcdef0", "region": "us-east-1"},
                        {"instanceId": "i-0987654321fedcba0", "region": "us-west-2"}
                    ],
                    "idleRunningInstances": [
                        {"instanceId": "i-abcd1234efgh5678", "region": "us-east-1", "avgCPU": 2.1}
                    ],
                    "activeInstances": [
                        {"instanceId": "i-active001", "region": "us-east-1", "avgCPU": 45.2},
                        {"instanceId": "i-active002", "region": "us-west-2", "avgCPU": 78.9},
                        {"instanceId": "i-active003", "region": "eu-west-1", "avgCPU": 32.5},
                        {"instanceId": "i-active004", "region": "ap-south-1", "avgCPU": 67.3},
                        {"instanceId": "i-active005", "region": "us-east-1", "avgCPU": 89.1}
                    ],
                    "unusedEBSVolumes": [
                        {"volumeId": "vol-1234567890abcdef0", "size": 8, "az": "us-east-1a", "region": "us-east-1"},
                        {"volumeId": "vol-0987654321fedcba0", "size": 20, "az": "us-west-2b", "region": "us-west-2"},
                        {"volumeId": "vol-abcdef1234567890", "size": 100, "az": "eu-west-1c", "region": "eu-west-1"}
                    ],
                    "s3Buckets": [
                        {"name": "my-production-bucket", "creationDate": "2024-01-15T10:30:00", "isPublic": False, "isEncrypted": True},
                        {"name": "backup-storage-bucket", "creationDate": "2024-02-01T14:20:00", "isPublic": False, "isEncrypted": True},
                        {"name": "logs-archive-bucket", "creationDate": "2024-01-10T09:15:00", "isPublic": False, "isEncrypted": False},
                        {"name": "static-website-assets", "creationDate": "2024-03-01T16:45:00", "isPublic": True, "isEncrypted": False}
                    ],
                    "elbs": [
                        {"name": "production-alb", "type": "application", "dns": "prod-alb-123456789.us-east-1.elb.amazonaws.com", "region": "us-east-1"},
                        {"name": "api-nlb", "type": "network", "dns": "api-nlb-987654321.us-west-2.elb.amazonaws.com", "region": "us-west-2"}
                    ],
                    "iamUsers": [
                        {"userName": "admin-user", "createDate": "2024-01-01T00:00:00"},
                        {"userName": "developer-john", "createDate": "2024-02-15T10:30:00"},
                        {"userName": "backup-service", "createDate": "2024-01-20T14:20:00"},
                        {"userName": "monitoring-bot", "createDate": "2024-03-01T08:45:00"}
                    ]
                },
                "note": "This is sample data. Provide a valid IAM role ARN to scan your actual AWS account."
            }
            return format_response(sample_result, is_http_request)

        # Run the actual scan
        print("🔍 Starting AWS account scan...")
        result = run_scan(role_arn, bucket_name)
        print("✅ Scan completed successfully")
        return format_response(result, is_http_request)

    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {str(e)}")
        error_response = {
            "status": "error",
            "message": f"Invalid JSON in request body: {str(e)}",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        return format_response(error_response, True, 400)
    
    except ClientError as e:
        print(f"❌ AWS API error: {str(e)}")
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        error_message = e.response.get('Error', {}).get('Message', str(e))
        
        error_response = {
            "status": "error",
            "message": f"AWS API Error ({error_code}): {error_message}",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        return format_response(error_response, True, 500)
    
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        error_response = {
            "status": "error",
            "message": f"Internal server error: {str(e)}",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        return format_response(error_response, True, 500)