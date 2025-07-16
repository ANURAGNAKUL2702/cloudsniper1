# CloudSniper - AWS Security & Cost Optimization Scanner

## 🚀 Live Demo deployed link: astonishing-blancmange-9cb4f0.netlify.app

![CloudSniper Logo](https://img.shields.io/badge/CloudSniper-AWS%20Security%20Scanner-blue?style=for-the-badge&logo=amazon-aws)

A production-ready web application that provides comprehensive AWS account security scanning and cost optimization insights using **AWS Lambda** as the core backend engine.

## 🚀 Live Demo deployed link: astonishing-blancmange-9cb4f0.netlify.app

**Frontend**: [CloudSniper Web App](https://your-netlify-url.netlify.app)  
**Backend**: AWS Lambda Function URL

## 📋 Table of Contents

- [Overview](#overview)
- [AWS Lambda Implementation](#aws-lambda-implementation)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Contributing](#contributing)

## 🎯 Overview

CloudSniper is a modern web application that scans AWS accounts for security vulnerabilities and cost optimization opportunities. The application leverages **AWS Lambda** as its primary backend service, providing serverless, scalable, and cost-effective infrastructure scanning capabilities.

### Key Highlights
- ✅ **Serverless Architecture** powered by AWS Lambda
- ✅ **Real-time AWS Account Scanning** across multiple regions
- ✅ **Interactive Data Visualizations** with charts and analytics
- ✅ **AI-powered Insights** for cost optimization and security
- ✅ **Production-ready** with authentication and responsive design

## ⚡ AWS Lambda Implementation

### Lambda Function Architecture

Our application uses **AWS Lambda with Function URL** as the core backend service, eliminating the need for API Gateway while providing direct HTTP access.

#### Lambda Function Details

| Component | Details |
|-----------|---------|
| **Runtime** | Python 3.9+ |
| **Handler** | `lambda_function.lambda_handler` |
| **Trigger** | Function URL (HTTP/HTTPS) |
| **Memory** | 512 MB |
| **Timeout** | 5 minutes |
| **Concurrency** | On-demand scaling |

#### Function URL Configuration
```
URL: https://tczswboifjsccnvhzq2vng2xm40kmrfb.lambda-url.ap-south-1.on.aws/
Methods: GET, POST, OPTIONS
CORS: Enabled for cross-origin requests
Authentication: None (public access)
```

### Lambda Trigger Implementation

The Lambda function is triggered via **HTTP requests** through the Function URL:

```python
def lambda_handler(event, context):
    """
    Main Lambda handler triggered by HTTP requests
    Supports GET, POST, and OPTIONS methods
    """
    
    # Handle CORS preflight requests
    if event.get('httpMethod') == 'OPTIONS':
        return cors_response()
    
    # Handle GET requests (health check)
    if event.get('httpMethod') == 'GET':
        return health_check_response()
    
    # Handle POST requests (AWS scanning)
    if event.get('httpMethod') == 'POST':
        return process_scan_request(event)
```

### AWS Services Integration

The Lambda function integrates with multiple AWS services:

```python
# AWS SDK Integration
import boto3

def scan_aws_account(role_arn):
    # Assume cross-account role
    sts = boto3.client('sts')
    assumed_role = sts.assume_role(
        RoleArn=role_arn,
        RoleSessionName="CloudSniperSession"
    )
    
    # Create service clients with assumed credentials
    ec2 = boto3.client('ec2', **credentials)
    s3 = boto3.client('s3', **credentials)
    iam = boto3.client('iam', **credentials)
    cloudwatch = boto3.client('cloudwatch', **credentials)
    
    # Multi-region scanning
    regions = ec2.describe_regions()['Regions']
    for region in regions:
        scan_region(region['RegionName'])
```

### Lambda Function Features

#### 1. **Cross-Account Role Assumption**
```python
def assume_role_and_get_clients(role_arn):
    """Securely assume IAM role for cross-account access"""
    sts = boto3.client('sts')
    assumed = sts.assume_role(
        RoleArn=role_arn,
        RoleSessionName="CloudSniperSession",
        DurationSeconds=3600
    )
    return create_service_clients(assumed['Credentials'])
```

#### 2. **Multi-Region Scanning**
```python
def get_all_regions(ec2_client):
    """Discover and scan all AWS regions"""
    regions = ec2_client.describe_regions(AllRegions=False)
    return [r['RegionName'] for r in regions['Regions']]
```

#### 3. **Comprehensive Resource Discovery**
- **EC2 Instances**: Active, stopped, and idle detection
- **S3 Buckets**: Security and encryption analysis
- **EBS Volumes**: Unattached volume identification
- **Load Balancers**: ELB and ALB discovery
- **IAM Users**: User account enumeration

#### 4. **Error Handling & CORS**
```python
def format_response(result, is_http_request, status_code=200):
    """Format Lambda response with proper CORS headers"""
    if is_http_request:
        return {
            "statusCode": status_code,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps(result, default=str)
        }
```

### Lambda Deployment

The Lambda function is deployed with the following configuration:

```yaml
# CloudFormation Template (excerpt)
CloudSniperLambda:
  Type: AWS::Lambda::Function
  Properties:
    FunctionName: cloudsniper-scanner
    Runtime: python3.9
    Handler: lambda_function.lambda_handler
    Code:
      ZipFile: |
        # Lambda function code
    MemorySize: 512
    Timeout: 300
    Environment:
      Variables:
        PYTHONPATH: /var/runtime
```

### Performance & Scaling

- **Cold Start**: ~2-3 seconds for initial invocation
- **Warm Execution**: ~500ms for subsequent requests
- **Concurrent Executions**: Auto-scaling based on demand
- **Cost Optimization**: Pay-per-request pricing model

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   AWS Lambda     │    │  AWS Services   │
│   (Frontend)    │───▶│  Function URL    │───▶│  EC2, S3, IAM   │
│                 │    │                  │    │  ELB, CloudWatch│
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Netlify CDN   │    │  CloudWatch      │    │  Cross-Account  │
│   (Hosting)     │    │  (Logging)       │    │  IAM Roles      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow

1. **User Input**: User enters IAM role ARN in React frontend
2. **HTTP Request**: Frontend sends POST request to Lambda Function URL
3. **Lambda Trigger**: Function URL triggers Lambda execution
4. **Role Assumption**: Lambda assumes provided IAM role
5. **AWS Scanning**: Lambda scans AWS services across regions
6. **Data Processing**: Results processed and formatted
7. **HTTP Response**: JSON response sent back to frontend
8. **Visualization**: Frontend displays interactive charts and insights

## 🌟 Features

### Frontend Features
- 🔐 **Secure Authentication** with bcrypt encryption
- 🎨 **Dual Theme Support** (Dark/Light modes)
- 📊 **Interactive Charts** using Recharts
- 🤖 **AI-Powered Analysis** with intelligent insights
- 📱 **Responsive Design** for all devices
- ⚡ **Real-time Scanning** with animated progress

### Backend Features (AWS Lambda)
- ☁️ **Multi-Region Scanning** across all AWS regions
- 🔒 **Secure Cross-Account Access** via IAM roles
- 📈 **Cost Optimization Analysis** with savings calculations
- 🛡️ **Security Assessment** with compliance checks
- 🚀 **Serverless Scalability** with automatic scaling
- 📝 **Comprehensive Logging** via CloudWatch

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI framework
- **TypeScript 5.5.3** - Type-safe development
- **Tailwind CSS 3.4.1** - Utility-first styling
- **Vite 5.4.2** - Fast build tool
- **Recharts 2.12.7** - Data visualization
- **Lucide React 0.344.0** - Icon library

### Backend
- **AWS Lambda** - Serverless compute (Python 3.9+)
- **boto3** - AWS SDK for Python
- **Function URL** - Direct HTTP access
- **CloudWatch** - Logging and monitoring

### Infrastructure
- **Netlify** - Frontend hosting with global CDN
- **AWS Lambda** - Backend serverless functions
- **AWS IAM** - Cross-account access management
- **localStorage** - Browser-based data persistence

## 🚀 Setup & Installation

### Prerequisites
- AWS Account with appropriate permissions
- Node.js 18+ and npm
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/cloudsniper.git
cd cloudsniper
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Deploy AWS Lambda Function

#### Option A: Manual Deployment
1. Create a new Lambda function in AWS Console
2. Upload the `lambda_function.py` code
3. Configure Function URL with CORS enabled
4. Set appropriate IAM execution role

#### Option B: CloudFormation Deployment
```bash
# Deploy using provided CloudFormation template
aws cloudformation deploy \
  --template-file cloudformation.yaml \
  --stack-name cloudsniper-lambda \
  --capabilities CAPABILITY_IAM
```

### 4. Configure Environment
```bash
# Update vite.config.ts with your Lambda Function URL
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'YOUR_LAMBDA_FUNCTION_URL',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Build for Production
```bash
npm run build
```

## 📖 Usage

### 1. Authentication
- Create an account or sign in using the header buttons
- User data is securely stored in browser localStorage
- Passwords are encrypted using bcrypt

### 2. AWS Setup
- Download the CloudFormation YAML template
- Deploy it in your AWS account to create the required IAM role
- Copy the IAM role ARN from CloudFormation outputs

### 3. Scanning
- Paste the IAM role ARN in the scan form
- Click "Start Scan" to begin analysis
- View real-time scanning progress with animated graphics
- Explore results in the interactive dashboard

### 4. Analysis
- **Overview Tab**: Service-by-service breakdown
- **Charts Tab**: Interactive visualizations and metrics
- **AI Insights Tab**: Intelligent cost and security analysis

## 📡 API Documentation

### Lambda Function URL Endpoints

#### Health Check
```http
GET https://your-lambda-url.lambda-url.region.on.aws/
```

**Response:**
```json
{
  "status": "healthy",
  "message": "CloudSniper Lambda is running!",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

#### AWS Account Scan
```http
POST https://your-lambda-url.lambda-url.region.on.aws/
Content-Type: application/json

{
  "roleArn": "arn:aws:iam::123456789012:role/CloudSniperRole"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "✅ CloudSniper Scan Complete!",
  "accountId": "123456789012",
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": {
    "totalInstancesScanned": 15,
    "stoppedInstancesCount": 3,
    "idleRunningInstancesCount": 2,
    "activeInstancesCount": 10,
    "unattachedEBSVolumes": 5,
    "s3BucketsCount": 25,
    "elbCount": 4,
    "iamUsersCount": 8
  },
  "details": {
    "stoppedInstances": [...],
    "idleRunningInstances": [...],
    "activeInstances": [...],
    "unusedEBSVolumes": [...],
    "s3Buckets": [...],
    "elbs": [...],
    "iamUsers": [...]
  }
}
```

#### CORS Preflight
```http
OPTIONS https://your-lambda-url.lambda-url.region.on.aws/
```

**Response Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 🔒 Security

### Lambda Security Features
- **IAM Role-based Access**: Secure cross-account scanning
- **Least Privilege Principle**: Minimal required permissions
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses without data leakage
- **CORS Configuration**: Proper cross-origin resource sharing

### Required IAM Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeRegions",
        "ec2:DescribeVolumes",
        "s3:ListAllMyBuckets",
        "s3:GetBucketPolicyStatus",
        "s3:GetBucketEncryption",
        "iam:ListUsers",
        "elasticloadbalancing:DescribeLoadBalancers",
        "cloudwatch:GetMetricStatistics"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AWS Lambda** for providing serverless compute capabilities
- **React** and **TypeScript** for the modern frontend framework
- **Tailwind CSS** for beautiful, responsive styling
- **Recharts** for interactive data visualizations
- **Netlify** for seamless frontend deployment

---

**Built with ❤️ using AWS Lambda and modern web technologies**

![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange?style=flat-square&logo=amazon-aws)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-blue?style=flat-square&logo=tailwind-css)
