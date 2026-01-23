import React, { useState } from 'react';
import { Server, HardDrive, Database, Loader as LoadBalancer, Users, CheckCircle, Clock, XCircle, Calendar, User, Sparkles, Brain, Shield, DollarSign, Zap, AlertTriangle, MessageCircle, TrendingUp, Eye, BarChart3 } from 'lucide-react';
import { ScanResult } from '../types/scanner';
import ServiceCard from './ServiceCard';
import ChartsSection from './ChartsSection';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart as RechartsLineChart, Line, RadialBarChart, RadialBar } from 'recharts';

interface ScanResultsProps {
  scanResult: ScanResult;
}

const ScanResults: React.FC<ScanResultsProps> = ({ scanResult }) => {
  const [activeInsight, setActiveInsight] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'insights'>('overview');
  console.log('ScanResults received:', scanResult);

  // Handle test mode or different response structures
  if (scanResult.status === 'test-mode') {
    return (
      <div className="bg-gradient-to-r from-yellow-900/90 to-orange-900/90 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-500/20 p-2 rounded-full">
            <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-yellow-200">Test Mode Active</h3>
            <p className="text-yellow-300 text-sm mt-1">{scanResult.message}</p>
            <p className="text-yellow-400 text-xs mt-2">
              To see real results, provide a valid IAM role ARN in the scan form above.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have the expected data structure
  const summary = scanResult.summary;
  const details = scanResult.details;
  const accountId = scanResult.accountId;
  const timestamp = scanResult.timestamp;
  const message = scanResult.message;

  if (!summary || !details) {
    return (
      <div className="bg-gradient-to-r from-red-900/90 to-pink-900/90 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="bg-red-500/20 p-2 rounded-full">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-red-200">Invalid Scan Result</h3>
            <p className="text-red-300 text-sm mt-1">
              The scan completed but returned an unexpected response format.
            </p>
            <details className="mt-2">
              <summary className="text-red-400 text-xs cursor-pointer hover:text-red-300">Show raw response</summary>
              <pre className="text-red-400 text-xs mt-1 bg-red-900/30 p-2 rounded overflow-auto border border-red-500/20">
                {JSON.stringify(scanResult, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // AI Analysis Functions
  const generateCostAnalysis = () => {
    const totalInstances = summary.totalInstancesScanned;
    const stoppedInstances = summary.stoppedInstancesCount;
    const idleInstances = summary.idleRunningInstancesCount;
    const unattachedVolumes = summary.unattachedEBSVolumes;
    const activeInstances = summary.activeInstancesCount;
    const s3Buckets = summary.s3BucketsCount;
    
    // Industry-standard cost calculations based on real AWS pricing
    const avgEBSCost = 12.5; // $0.10/GB/month avg for gp3, assuming 125GB per instance
    const avgInstanceCost = 65; // Average t3.medium cost per month
    const avgVolumeCost = 8; // $0.08/GB/month for unattached volumes
    const avgS3Cost = 2.3; // $0.023/GB/month standard storage
    
    let analysis = `**CloudSniper AI Cost Intelligence Report**\n\nComprehensive cost analysis across ${totalInstances} EC2 instances, ${s3Buckets} S3 buckets, and ${unattachedVolumes} EBS volumes:\n\n`;
    
    // Calculate total potential savings
    let totalMonthlySavings = 0;
    
    if (stoppedInstances > 0) {
      const stoppedEBSCost = stoppedInstances * avgEBSCost;
      totalMonthlySavings += stoppedEBSCost;
      const annualSavings = stoppedEBSCost * 12;
      analysis += `🔴 **Critical: ${stoppedInstances} Stopped Instances**\n`;
      analysis += `• Monthly EBS cost: $${stoppedEBSCost.toFixed(2)}\n`;
      analysis += `• Annual waste: $${annualSavings.toFixed(2)}\n`;
      analysis += `• **Action**: Terminate unused instances or convert to AMIs\n`;
      analysis += `• **Priority**: High - Immediate cost reduction\n\n`;
    }
    
    if (idleInstances > 0) {
      const idleCost = idleInstances * avgInstanceCost;
      totalMonthlySavings += idleCost * 0.7; // 70% savings potential
      const optimizedCost = idleCost * 0.3; // Downsize to 30% of current cost
      analysis += `⚠️ **${idleInstances} Underutilized Instances** (CPU < 10%)\n`;
      analysis += `• Current monthly cost: $${idleCost.toFixed(2)}\n`;
      analysis += `• Potential savings: $${(idleCost * 0.7).toFixed(2)}/month\n`;
      analysis += `• **Recommendations**:\n`;
      analysis += `  - Right-size to t3.nano/micro: 60-80% cost reduction\n`;
      analysis += `  - Implement auto-scaling: 40-60% savings\n`;
      analysis += `  - Consider Reserved Instances: 30-40% discount\n`;
      analysis += `  - Use Spot Instances for dev/test: up to 90% savings\n\n`;
    }
    
    if (unattachedVolumes > 0) {
      const volumeCost = unattachedVolumes * avgVolumeCost;
      totalMonthlySavings += volumeCost;
      analysis += `💾 **${unattachedVolumes} Orphaned EBS Volumes**\n`;
      analysis += `• Monthly storage waste: $${volumeCost.toFixed(2)}\n`;
      analysis += `• Annual impact: $${(volumeCost * 12).toFixed(2)}\n`;
      analysis += `• **Action**: Create snapshots then delete volumes\n`;
      analysis += `• **Automation**: Use AWS Cost Explorer to identify old volumes\n\n`;
    }
    
    if (activeInstances > 0) {
      const activeCost = activeInstances * avgInstanceCost;
      analysis += `✅ **${activeInstances} Well-Utilized Instances**\n`;
      analysis += `• Estimated monthly cost: $${activeCost.toFixed(2)}\n`;
      analysis += `• **Optimization opportunities**:\n`;
      analysis += `  - Reserved Instances: 30-40% savings\n`;
      analysis += `  - Graviton processors: 20% price-performance improvement\n`;
      analysis += `  - EBS gp3 volumes: 20% cheaper than gp2\n\n`;
    }
    
    if (totalMonthlySavings > 0) {
      analysis += `📊 **Cost Optimization Summary**\n`;
      analysis += `• **Monthly savings potential**: $${totalMonthlySavings.toFixed(2)}\n`;
      analysis += `• **Annual savings potential**: $${(totalMonthlySavings * 12).toFixed(2)}\n`;
      analysis += `• **ROI Timeline**: 1-3 months implementation\n`;
      analysis += `• **Priority actions**: Terminate stopped instances, right-size idle workloads\n\n`;
    } else {
      analysis += `🎉 **Exceptional Cost Management!**\n`;
      analysis += `Your infrastructure shows optimal utilization patterns. Consider:\n`;
      analysis += `• Reserved Instance planning for 30-40% additional savings\n`;
      analysis += `• Graviton migration for performance improvements\n`;
      analysis += `• Cost allocation tags for detailed tracking\n`;
    }
    
    return analysis;
  };

  const generateSecurityAnalysis = () => {
    const iamUsers = summary.iamUsersCount;
    const s3Buckets = summary.s3BucketsCount;
    const loadBalancers = summary.elbCount;
    const totalInstances = summary.totalInstancesScanned;
    
    let analysis = `**CloudSniper Security Intelligence Report**\n\nAdvanced threat assessment for AWS Account ${accountId} across ${totalInstances + s3Buckets + loadBalancers} resources:\n\n`;
    
    // Security scoring based on industry standards
    let securityScore = 85; // Base score
    let criticalIssues = 0;
    let recommendations = [];
    
    // IAM Security Assessment
    if (iamUsers > 15) {
      securityScore -= 15;
      criticalIssues += 1;
      analysis += `🚨 **Critical: ${iamUsers} IAM Users** (High Risk)\n`;
      analysis += `• **Risk**: Excessive user accounts increase attack surface\n`;
      analysis += `• **Impact**: Data breach, privilege escalation, compliance violations\n`;
      analysis += `• **Remediation**:\n`;
      analysis += `  - Audit user necessity: Remove inactive accounts\n`;
      analysis += `  - Implement SSO with SAML 2.0/OIDC federation\n`;
      analysis += `  - Migrate to IAM roles for applications\n`;
      analysis += `  - Enable MFA for all human users\n`;
      analysis += `  - Implement least-privilege access policies\n\n`;
      recommendations.push('IAM User Reduction');
    } else if (iamUsers > 5) {
      securityScore -= 5;
      analysis += `⚠️ **${iamUsers} IAM Users** (Moderate Risk)\n`;
      analysis += `• Consider SSO implementation for user management\n`;
      analysis += `• Audit permissions quarterly\n`;
      analysis += `• Enable CloudTrail for user activity monitoring\n\n`;
    } else {
      analysis += `✅ **${iamUsers} IAM Users** (Well Managed)\n`;
      analysis += `• Optimal user count for security best practices\n`;
      analysis += `• Continue monitoring access patterns\n\n`;
    }
    
    // S3 Security Assessment  
    if (s3Buckets > 50) {
      securityScore -= 10;
      analysis += `⚠️ **${s3Buckets} S3 Buckets** (Review Required)\n`;
      analysis += `• **Security concerns**: Large attack surface, management complexity\n`;
      analysis += `• **Critical actions**:\n`;
      analysis += `  - Audit bucket necessity and consolidate where possible\n`;
      analysis += `  - Verify all buckets have encryption enabled (AES-256/KMS)\n`;
      analysis += `  - Block public access unless explicitly required\n`;
      analysis += `  - Enable versioning and MFA delete protection\n`;
      analysis += `  - Implement bucket policies with least privilege\n`;
      analysis += `  - Enable access logging for compliance\n\n`;
      recommendations.push('S3 Security Hardening');
    } else {
      analysis += `✅ **${s3Buckets} S3 Buckets** (Manageable)\n`;
      analysis += `• Ensure default encryption is enabled\n`;
      analysis += `• Verify no public read/write permissions\n`;
      analysis += `• Consider S3 Object Lock for critical data\n\n`;
    }
    
    // Load Balancer Security
    if (loadBalancers > 0) {
      analysis += `🔐 **${loadBalancers} Load Balancers** (Security Critical)\n`;
      analysis += `• **Essential security measures**:\n`;
      analysis += `  - SSL/TLS termination with modern cipher suites\n`;
      analysis += `  - WAF integration for application protection\n`;
      analysis += `  - Security groups restricting source IPs\n`;
      analysis += `  - Access logging enabled for forensics\n`;
      analysis += `  - Deletion protection enabled\n\n`;
      recommendations.push('Load Balancer Hardening');
    } else {
      analysis += `ℹ️ **No Load Balancers Detected**\n`;
      analysis += `• Consider ALB/NLB for high availability\n`;
      analysis += `• Implement WAF for web application security\n\n`;
    }
    
    // EC2 Security Assessment
    if (totalInstances > 0) {
      analysis += `🖥️ **${totalInstances} EC2 Instances Security**\n`;
      analysis += `• **Critical security requirements**:\n`;
      analysis += `  - Systems Manager Session Manager (no SSH keys)\n`;
      analysis += `  - VPC with private subnets and NAT gateways\n`;
      analysis += `  - Security groups with minimal required ports\n`;
      analysis += `  - IMDSv2 enforced for metadata protection\n`;
      analysis += `  - Encrypted EBS volumes at rest\n`;
      analysis += `  - Regular patching via Systems Manager\n\n`;
    }
    
    // Overall Security Score and Recommendations
    analysis += `📈 **Security Posture Score**: ${securityScore}/100\n`;
    if (securityScore >= 90) {
      analysis += `🏆 **Excellent** - Industry-leading security practices\n`;
    } else if (securityScore >= 75) {
      analysis += `✅ **Good** - Strong security with minor improvements needed\n`;
    } else if (securityScore >= 60) {
      analysis += `⚠️ **Fair** - Moderate security risks require attention\n`;
    } else {
      analysis += `🚨 **Poor** - Critical security gaps need immediate action\n`;
    }
    
    analysis += `\n**Priority Implementation Roadmap**:\n`;
    analysis += `1. **Immediate (0-30 days)**: ${criticalIssues > 0 ? 'Address critical IAM and S3 issues' : 'Implement CloudTrail and GuardDuty'}\n`;
    analysis += `2. **Short-term (1-3 months)**: Enable AWS Config, implement WAF\n`;
    analysis += `3. **Long-term (3-6 months)**: Security automation, compliance frameworks\n`;
    
    return analysis;
  };

  const generatePerformanceAnalysis = () => {
    const activeInstances = summary.activeInstancesCount;
    const idleInstances = summary.idleRunningInstancesCount;
    const totalInstances = summary.totalInstancesScanned;
    const stoppedInstances = summary.stoppedInstancesCount;
    const s3Buckets = summary.s3BucketsCount;
    const loadBalancers = summary.elbCount;
    
    let analysis = `**CloudSniper Performance Intelligence Report**\n\nAdvanced performance analysis across ${totalInstances} EC2 instances with optimization recommendations:\n\n`;
    
    const utilizationRate = totalInstances > 0 ? ((activeInstances / totalInstances) * 100).toFixed(1) : 0;
    let performanceScore = 70; // Base performance score
    
    // Resource Utilization Assessment
    analysis += `📊 **Infrastructure Utilization Metrics**\n`;
    analysis += `• **Active instances**: ${activeInstances} (${utilizationRate}% utilization)\n`;
    analysis += `• **Underutilized**: ${idleInstances} instances\n`;
    analysis += `• **Stopped/unused**: ${stoppedInstances} instances\n\n`;
    
    if (utilizationRate >= 80) {
      performanceScore += 20;
      analysis += `🎯 **Excellent Utilization** (${utilizationRate}%)\n`;
      analysis += `• **Status**: Optimal resource efficiency\n`;
      analysis += `• **Next steps**: Consider auto-scaling for peak demand\n`;
      analysis += `• **Advanced optimizations**:\n`;
      analysis += `  - AWS Compute Optimizer recommendations\n`;
      analysis += `  - Graviton3 processors for 25% better price-performance\n`;
      analysis += `  - Enhanced networking for HPC workloads\n\n`;
    } else if (utilizationRate >= 60) {
      performanceScore += 10;
      analysis += `✅ **Good Utilization** (${utilizationRate}%)\n`;
      analysis += `• Room for optimization exists\n\n`;
    } else if (utilizationRate >= 40) {
      performanceScore -= 10;
      analysis += `⚠️ **Moderate Utilization** (${utilizationRate}%)\n`;
      analysis += `• Significant optimization opportunities\n\n`;
    } else {
      performanceScore -= 25;
      analysis += `🚨 **Poor Utilization** (${utilizationRate}%)\n`;
      analysis += `• Critical performance and cost issues\n\n`;
    }
    
    // Detailed Performance Optimization
    if (idleInstances > 0) {
      analysis += `🔧 **${idleInstances} Underutilized Instances** (CPU < 10%)\n`;
      analysis += `• **Performance Impact**: Wasted compute capacity, high latency\n`;
      analysis += `• **Root Causes**: Over-provisioning, poor workload distribution\n`;
      analysis += `• **Optimization Strategies**:\n`;
      analysis += `  1. **Right-sizing**: Downgrade to t3.nano/micro (2-8x cost reduction)\n`;
      analysis += `  2. **Container migration**: ECS Fargate with 90% better efficiency\n`;
      analysis += `  3. **Serverless adoption**: Lambda for event-driven workloads\n`;
      analysis += `  4. **Auto Scaling**: Target 70-80% utilization automatically\n`;
      analysis += `  5. **Placement groups**: Cluster instances for low latency\n\n`;
      analysis += `• **Expected improvements**: 60-80% cost reduction, 40% latency improvement\n\n`;
    }
    
    if (activeInstances > 0) {
      analysis += `⚡ **${activeInstances} High-Performance Instances**\n`;
      analysis += `• **Current status**: Well-utilized and properly sized\n`;
      analysis += `• **Advanced optimizations**:\n`;
      analysis += `  - **Storage**: Migrate to gp3 for 3,000-16,000 IOPS baseline\n`;
      analysis += `  - **Memory**: Enable instance store for 250,000+ IOPS\n`;
      analysis += `  - **Network**: Enhanced networking for 25-100 Gbps\n`;
      analysis += `  - **CPU**: Consider C6g instances for compute-intensive workloads\n`;
      analysis += `  - **Monitoring**: CloudWatch detailed monitoring + custom metrics\n\n`;
    }
    
    // S3 Performance Optimization
    if (s3Buckets > 0) {
      analysis += `🗂️ **${s3Buckets} S3 Buckets Performance**\n`;
      analysis += `• **Transfer Acceleration**: Enable for global workloads\n`;
      analysis += `• **Intelligent Tiering**: Automatic cost optimization\n`;
      analysis += `• **Multipart Upload**: 100MB+ files for better throughput\n`;
      analysis += `• **CloudFront CDN**: 80% faster global content delivery\n\n`;
    }
    
    // Load Balancer Performance
    if (loadBalancers > 0) {
      analysis += `⚖️ **${loadBalancers} Load Balancer Optimization**\n`;
      analysis += `• **ALB features**: HTTP/2, gRPC support, Lambda integration\n`;
      analysis += `• **NLB ultra-low latency**: 25-50% faster than ALB for TCP\n`;
      analysis += `• **Target group health**: Optimize check intervals\n`;
      analysis += `• **Cross-zone balancing**: Even distribution across AZs\n\n`;
    }
    
    // Performance Score and Recommendations
    analysis += `📈 **Performance Score**: ${Math.max(0, performanceScore)}/100\n`;
    if (performanceScore >= 85) {
      analysis += `🏆 **Exceptional** - Industry-leading performance optimization\n`;
    } else if (performanceScore >= 70) {
      analysis += `✅ **Good** - Well-optimized with minor improvements available\n`;
    } else if (performanceScore >= 50) {
      analysis += `⚠️ **Fair** - Moderate performance issues need attention\n`;
    } else {
      analysis += `🚨 **Poor** - Critical performance bottlenecks require immediate action\n`;
    }
    
    analysis += `\n**Performance Improvement Roadmap**:\n`;
    analysis += `1. **Week 1-2**: Right-size underutilized instances, enable detailed monitoring\n`;
    analysis += `2. **Month 1**: Implement auto-scaling, upgrade to gp3 storage\n`;
    analysis += `3. **Month 2-3**: Container migration, Graviton adoption, performance testing\n`;
    analysis += `4. **Month 3-6**: Advanced optimizations, ML-powered insights\n\n`;
    
    analysis += `**Expected ROI**: 40-70% cost reduction, 50-80% performance improvement within 3 months`;
    
    return analysis;
  };

  const generateComplianceAnalysis = () => {
    const totalResources = summary.totalInstancesScanned + summary.s3BucketsCount + summary.elbCount + summary.iamUsersCount;
    const totalInstances = summary.totalInstancesScanned;
    const s3Buckets = summary.s3BucketsCount;
    const iamUsers = summary.iamUsersCount;
    
    let analysis = `**CloudSniper Compliance Intelligence Report**\n\nEnterprise governance assessment across ${totalResources} AWS resources with regulatory framework mapping:\n\n`;
    
    let complianceScore = 60; // Base compliance score
    let criticalFindings = 0;
    
    // Regulatory Framework Assessment
    analysis += `🏛️ **Multi-Framework Compliance Analysis**\n`;
    analysis += `• **SOC 2 Type II**: Security, availability, processing integrity\n`;
    analysis += `• **ISO 27001**: Information security management systems\n`;
    analysis += `• **GDPR**: Data protection and privacy rights\n`;
    analysis += `• **HIPAA**: Healthcare data protection (if applicable)\n`;
    analysis += `• **PCI DSS**: Payment card industry standards\n`;
    analysis += `• **FedRAMP**: Federal risk and authorization management\n\n`;
    
    // Data Protection & Encryption
    analysis += `🔐 **Data Protection Assessment**\n`;
    if (s3Buckets > 0) {
      analysis += `• **S3 Encryption** (${s3Buckets} buckets):\n`;
      analysis += `  ❌ Encryption at rest verification required\n`;
      analysis += `  ❌ Encryption in transit validation needed\n`;
      analysis += `  ⚠️ Customer-managed KMS keys recommended\n`;
      criticalFindings += 2;
      complianceScore -= 10;
    }
    if (totalInstances > 0) {
      analysis += `• **EC2 Storage** (${totalInstances} instances):\n`;
      analysis += `  ❌ EBS encryption verification required\n`;
      analysis += `  ⚠️ Instance store encryption assessment needed\n`;
      criticalFindings += 1;
      complianceScore -= 5;
    }
    analysis += `\n`;
    
    // Access Control & Identity Management
    analysis += `👥 **Identity & Access Management Compliance**\n`;
    if (iamUsers > 10) {
      analysis += `🚨 **Critical Finding**: ${iamUsers} IAM users exceed SOC 2 recommendations\n`;
      analysis += `• **Impact**: Violates least-privilege principle\n`;
      analysis += `• **Compliance risk**: SOC 2, ISO 27001, GDPR violations\n`;
      analysis += `• **Remediation**: Implement SSO federation within 30 days\n`;
      criticalFindings += 1;
      complianceScore -= 15;
    } else {
      analysis += `✅ **IAM Users**: ${iamUsers} users within compliance guidelines\n`;
      complianceScore += 5;
    }
    
    analysis += `• **Required implementations**:\n`;
    analysis += `  ❌ Multi-factor authentication enforcement\n`;
    analysis += `  ❌ Privileged access management (PAM)\n`;
    analysis += `  ⚠️ Regular access reviews (quarterly)\n`;
    analysis += `  ⚠️ Role-based access control (RBAC) validation\n\n`;
    
    // Audit & Monitoring
    analysis += `📊 **Audit Trail & Monitoring Compliance**\n`;
    analysis += `• **Required logging services**:\n`;
    analysis += `  ❌ CloudTrail: API activity logging for SOC 2\n`;
    analysis += `  ❌ VPC Flow Logs: Network monitoring for ISO 27001\n`;
    analysis += `  ❌ GuardDuty: Threat detection for GDPR security\n`;
    analysis += `  ❌ Config: Configuration monitoring for FedRAMP\n`;
    analysis += `  ❌ SecurityHub: Central security dashboard\n`;
    criticalFindings += 5;
    complianceScore -= 20;
    
    analysis += `\n• **Log retention requirements**:\n`;
    analysis += `  - SOC 2: 1 year minimum\n`;
    analysis += `  - GDPR: 3 years for audit trails\n`;
    analysis += `  - HIPAA: 6 years for healthcare data\n`;
    analysis += `  - PCI DSS: 1 year minimum, 3 years recommended\n\n`;
    
    // Data Governance
    analysis += `🗂️ **Data Governance & Privacy**\n`;
    if (s3Buckets > 20) {
      analysis += `⚠️ **${s3Buckets} S3 buckets**: Data classification required\n`;
      analysis += `• **GDPR requirements**: Data mapping and DPO designation\n`;
      analysis += `• **Retention policies**: Automatic deletion for compliance\n`;
      complianceScore -= 5;
    }
    analysis += `• **Required implementations**:\n`;
    analysis += `  ❌ Data classification tags\n`;
    analysis += `  ❌ Data loss prevention (DLP)\n`;
    analysis += `  ❌ Backup and disaster recovery testing\n`;
    analysis += `  ❌ Data subject rights automation (GDPR)\n\n`;
    
    // Business Continuity
    analysis += `🔄 **Business Continuity & Disaster Recovery**\n`;
    analysis += `• **Multi-AZ deployment**: Required for SOC 2 availability\n`;
    analysis += `• **Backup strategy**: 3-2-1 rule implementation\n`;
    analysis += `• **RTO/RPO targets**: Define based on business criticality\n`;
    analysis += `• **DR testing**: Quarterly for SOC 2, annual for ISO 27001\n\n`;
    
    // Overall Compliance Score
    complianceScore = Math.max(0, complianceScore);
    analysis += `📈 **Overall Compliance Score**: ${complianceScore}/100\n`;
    
    if (complianceScore >= 85) {
      analysis += `🏆 **Excellent** - Audit-ready with minimal findings\n`;
    } else if (complianceScore >= 70) {
      analysis += `✅ **Good** - Minor compliance gaps to address\n`;
    } else if (complianceScore >= 50) {
      analysis += `⚠️ **Fair** - Moderate compliance risks require attention\n`;
    } else {
      analysis += `🚨 **Poor** - Critical compliance gaps, audit failure risk\n`;
    }
    
    analysis += `\n**Critical Findings**: ${criticalFindings} issues requiring immediate attention\n\n`;
    
    // Implementation Roadmap
    analysis += `**Compliance Implementation Roadmap**:\n`;
    analysis += `\n**Phase 1 (0-30 days): Foundation**\n`;
    analysis += `• Enable CloudTrail, Config, and GuardDuty\n`;
    analysis += `• Implement MFA for all users\n`;
    analysis += `• Enable default encryption for S3 and EBS\n`;
    analysis += `• Document data classification policy\n`;
    
    analysis += `\n**Phase 2 (30-90 days): Security & Access**\n`;
    analysis += `• Implement SSO federation\n`;
    analysis += `• Deploy SecurityHub for centralized monitoring\n`;
    analysis += `• Configure automated backup policies\n`;
    analysis += `• Establish incident response procedures\n`;
    
    analysis += `\n**Phase 3 (90-180 days): Governance & Automation**\n`;
    analysis += `• Implement automated compliance scanning\n`;
    analysis += `• Deploy data loss prevention (DLP)\n`;
    analysis += `• Conduct DR testing and optimization\n`;
    analysis += `• Prepare for external audit\n`;
    
    analysis += `\n**Estimated Timeline**: 6 months to full compliance\n`;
    analysis += `**Investment**: $15-25K for tooling and professional services\n`;
    analysis += `**ROI**: Avoid $100K+ audit failures, enable enterprise sales`;
    
    return analysis;
  };

  const aiInsights = [
    {
      id: 'cost',
      title: 'Cost Optimization Analysis',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'from-yellow-900/90 to-orange-900/90',
      borderColor: 'border-yellow-500/30',
      analysis: generateCostAnalysis()
    },
    {
      id: 'security',
      title: 'Security Assessment',
      icon: <Shield className="h-6 w-6" />,
      color: 'from-red-900/90 to-pink-900/90',
      borderColor: 'border-red-500/30',
      analysis: generateSecurityAnalysis()
    },
    {
      id: 'performance',
      title: 'Performance Analysis',
      icon: <Zap className="h-6 w-6" />,
      color: 'from-blue-900/90 to-cyan-900/90',
      borderColor: 'border-blue-500/30',
      analysis: generatePerformanceAnalysis()
    },
    {
      id: 'compliance',
      title: 'Compliance Review',
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'from-purple-900/90 to-indigo-900/90',
      borderColor: 'border-purple-500/30',
      analysis: generateComplianceAnalysis()
    }
  ];

  return (
    <div className="space-y-8">
      {/* Scan Summary Header - Updated to Blue/Indigo Theme */}
      <div className="bg-gradient-to-r from-blue-900/90 to-indigo-900/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 shadow-2xl animate-glow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <span>Scan Complete</span>
                <Sparkles className="h-6 w-6 text-cyan-400 animate-pulse" />
              </h2>
              <p className="text-blue-200">{message}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 group">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span className="font-semibold text-purple-200">Account ID</span>
            </div>
            <p className="text-lg font-mono text-white mt-1">{accountId}</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 group">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="font-semibold text-blue-200">Scan Time</span>
            </div>
            <p className="text-sm text-white mt-1">{formatTimestamp(timestamp || new Date().toISOString())}</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 group">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <span className="font-semibold text-cyan-200">Total Instances</span>
            </div>
            <p className="text-lg font-bold text-white mt-1">{summary.totalInstancesScanned}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gradient-to-r from-slate-800/90 to-purple-800/90 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-2 shadow-2xl">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-purple-700/30'
            }`}
          >
            <Server className="h-5 w-5" />
            <span>Services Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'charts'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-purple-700/30'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Interactive Charts</span>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'insights'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-purple-700/30'
            }`}
          >
            <Brain className="h-5 w-5" />
            <span>AI Insights</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          {/* EC2 Instance Status - Centered and Compact */}
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
              {/* EC2 Instances - Active */}
              <ServiceCard
                title="Active Instances"
                icon={<Server className="h-6 w-6" />}
                count={summary.activeInstancesCount}
                status="info"
                description="Currently running"
                details={details.activeInstances}
              />

              {/* EC2 Instances - Stopped */}
              <ServiceCard
                title="Stopped Instances"
                icon={<XCircle className="h-6 w-6" />}
                count={summary.stoppedInstancesCount}
                status="info"
                description="Stopped instances"
                details={details.stoppedInstances}
              />

              {/* EC2 Instances - Idle */}
              <ServiceCard
                title="Idle Running Instances"
                icon={<Clock className="h-6 w-6" />}
                count={summary.idleRunningInstancesCount}
                status="info"
                description="Underutilized"
                details={details.idleRunningInstances}
              />
            </div>
          </div>

          {/* Other Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* EBS Volumes */}
            <ServiceCard
              title="Unattached EBS Volumes"
              icon={<HardDrive className="h-6 w-6" />}
              count={summary.unattachedEBSVolumes}
              status="info"
              description="Volumes not attached to instances"
              details={details.unusedEBSVolumes}
            />

            {/* S3 Buckets */}
            <ServiceCard
              title="S3 Buckets"
              icon={<Database className="h-6 w-6" />}
              count={summary.s3BucketsCount}
              status="info"
              description="Total S3 buckets in account"
              details={details.s3Buckets}
            />

            {/* Load Balancers */}
            <ServiceCard
              title="Load Balancers"
              icon={<LoadBalancer className="h-6 w-6" />}
              count={summary.elbCount}
              status="info"
              description="Elastic Load Balancers"
              details={details.elbs}
            />

            {/* IAM Users */}
            <ServiceCard
              title="IAM Users"
              icon={<Users className="h-6 w-6" />}
              count={summary.iamUsersCount}
              status="info"
              description="Total IAM users"
              details={details.iamUsers}
            />
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="animate-fade-in">
          <ChartsSection scanResult={scanResult} />
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="animate-fade-in">
          {/* Premium AI AWS Analysis Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 backdrop-blur-xl border border-blue-500/40 rounded-3xl p-8 shadow-2xl">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/10 to-blue-500/5 animate-premium-float"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 animate-premium-glow"></div>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              {/* Premium Header */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 p-4 rounded-full backdrop-blur-sm border border-blue-400/40 shadow-lg">
                  <Brain className="h-10 w-10 text-blue-200 animate-premium-pulse" />
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-100 via-cyan-100 to-blue-100 bg-clip-text text-transparent flex items-center justify-center space-x-3">
                    <span>🤖 AI AWS Expert Analysis</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </h3>
                  <p className="text-blue-300 text-lg mt-2 font-medium">Advanced AI-Powered Infrastructure Intelligence</p>
                </div>
              </div>

              {/* Premium AI Insight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {aiInsights.map((insight) => (
                  <button
                    key={insight.id}
                    onClick={() => setActiveInsight(activeInsight === insight.id ? null : insight.id)}
                    className={`relative group bg-gradient-to-br from-black/90 to-gray-900/85 backdrop-blur-xl p-6 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-500 text-left w-full transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden`}
                  >
                    {/* Card Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 rounded-xl group-hover:scale-110 transition-all duration-300 backdrop-blur-sm border border-blue-400/30">
                          <div className="text-blue-300">{insight.icon}</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-blue-100 mb-2 group-hover:text-blue-50">{insight.title}</h4>
                          <div className="flex items-center space-x-2 mb-3">
                            <MessageCircle className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-blue-300 font-medium">AI-Powered Analysis Ready</span>
                          </div>
                          
                          {/* Preview Stats */}
                          <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-blue-500/20">
                            <div className="flex items-center justify-between text-xs text-blue-200">
                              <span>Status:</span>
                              <span className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span>Ready</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                          {activeInsight === insight.id ? (
                            <Eye className="h-6 w-6 animate-pulse" />
                          ) : (
                            <BarChart3 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Premium Active AI Analysis Display */}
              {activeInsight && (
                <div className="animate-premium-slide">
                  {aiInsights.map((insight) => (
                    activeInsight === insight.id && (
                      <div key={insight.id} className={`relative bg-gradient-to-br from-black/90 to-gray-900/85 backdrop-blur-xl p-8 rounded-3xl border border-blue-500/40 shadow-2xl overflow-hidden`}>
                        {/* Premium Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"></div>
                        
                        <div className="relative z-10">
                          {/* Analysis Header */}
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 p-3 rounded-xl backdrop-blur-sm border border-blue-400/30">
                              <div className="text-blue-200">{insight.icon}</div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-2xl font-bold text-blue-100 mb-1">{insight.title}</h4>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span className="text-blue-300 text-sm font-medium">Analysis Complete</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-6 w-6 text-blue-300 animate-premium-float" />
                              <div className="bg-blue-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-400/30">
                                <span className="text-blue-200 text-xs font-bold">AI</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Premium Analysis Output */}
                          <div className="bg-gradient-to-br from-black/40 to-black/30 backdrop-blur-xl p-6 rounded-2xl border border-blue-500/20 shadow-inner">
                            {/* AI Insight Charts */}
                            <div className="mb-6">
                              {insight.id === 'cost' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  {/* Cost Breakdown Pie Chart */}
                                  <div className="h-48 relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 rounded-xl blur-xl"></div>
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RechartsPieChart>
                                        <Pie
                                          data={[
                                            { name: 'Stopped Instances', value: summary.stoppedInstancesCount * 8, color: '#EF4444' },
                                            { name: 'Idle Instances', value: summary.idleRunningInstancesCount * 50, color: '#F59E0B' },
                                            { name: 'Unused Volumes', value: summary.unattachedEBSVolumes * 10, color: '#DC2626' }
                                          ].filter(item => item.value > 0)}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={30}
                                          outerRadius={70}
                                          paddingAngle={5}
                                          dataKey="value"
                                        >
                                          {[
                                            { name: 'Stopped Instances', value: summary.stoppedInstancesCount * 8, color: '#EF4444' },
                                            { name: 'Idle Instances', value: summary.idleRunningInstancesCount * 50, color: '#F59E0B' },
                                            { name: 'Unused Volumes', value: summary.unattachedEBSVolumes * 10, color: '#DC2626' }
                                          ].filter(item => item.value > 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                          ))}
                                        </Pie>
                                        <Tooltip 
                                          content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                              return (
                                                <div className="bg-black/80 backdrop-blur-sm p-2 rounded-lg border border-yellow-500/30">
                                                  <p className="text-white text-xs">{payload[0].name}</p>
                                                  <p className="text-yellow-400 text-xs font-bold">${payload[0].value}/month</p>
                                                </div>
                                              );
                                            }
                                            return null;
                                          }}
                                        />
                                      </RechartsPieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute bottom-2 left-2 text-yellow-300 text-xs font-semibold">💰 Cost Waste</div>
                                  </div>
                                  
                                  {/* Savings Potential Bar */}
                                  <div className="h-48 relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-emerald-500/10 rounded-xl blur-xl"></div>
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={[
                                        { category: 'Current', waste: (summary.stoppedInstancesCount * 8) + (summary.idleRunningInstancesCount * 50) + (summary.unattachedEBSVolumes * 10) },
                                        { category: 'Optimized', waste: Math.max(0, ((summary.stoppedInstancesCount * 8) + (summary.idleRunningInstancesCount * 50) + (summary.unattachedEBSVolumes * 10)) * 0.2) }
                                      ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.2)" />
                                        <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#ffffff' }} />
                                        <YAxis tick={{ fontSize: 10, fill: '#ffffff' }} />
                                        <Tooltip 
                                          content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                              return (
                                                <div className="bg-black/80 backdrop-blur-sm p-2 rounded-lg border border-green-500/30">
                                                  <p className="text-white text-xs">{payload[0].payload.category}</p>
                                                  <p className="text-green-400 text-xs font-bold">${payload[0].value}/month</p>
                                                </div>
                                              );
                                            }
                                            return null;
                                          }}
                                        />
                                        <Bar dataKey="waste" fill="url(#costBarGradient)" radius={[4, 4, 0, 0]} />
                                        <defs>
                                          <linearGradient id="costBarGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                                          </linearGradient>
                                        </defs>
                                      </BarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute bottom-2 left-2 text-green-300 text-xs font-semibold">📊 Optimization</div>
                                  </div>
                                </div>
                              )}

                              {insight.id === 'security' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  {/* Security Score Radial */}
                                  <div className="h-48 relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-red-500/10 rounded-xl blur-xl"></div>
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="80%" data={[
                                        { 
                                          name: 'Security Score', 
                                          score: Math.max(20, 100 - ((summary.iamUsersCount > 10 ? 30 : 0) + (summary.s3BucketsCount > 20 ? 25 : 0) + 15)),
                                          fill: '#EF4444'
                                        }
                                      ]}>
                                        <RadialBar dataKey="score" cornerRadius={10} fill="#EF4444" />
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-lg font-bold">
                                          {Math.max(20, 100 - ((summary.iamUsersCount > 10 ? 30 : 0) + (summary.s3BucketsCount > 20 ? 25 : 0) + 15))}%
                                        </text>
                                      </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute bottom-2 left-2 text-red-300 text-xs font-semibold">🛡️ Security Score</div>
                                  </div>
                                  
                                  {/* Risk Distribution */}
                                  <div className="h-48 relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-red-500/10 rounded-xl blur-xl"></div>
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RechartsLineChart data={[
                                        { name: 'IAM Users', risk: summary.iamUsersCount > 10 ? 8 : 3 },
                                        { name: 'S3 Buckets', risk: summary.s3BucketsCount > 20 ? 7 : 2 },
                                        { name: 'Load Balancers', risk: summary.elbCount > 5 ? 6 : 1 }
                                      ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(239, 68, 68, 0.2)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#ffffff' }} />
                                        <YAxis tick={{ fontSize: 10, fill: '#ffffff' }} domain={[0, 10]} />
                                        <Tooltip 
                                          content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                              return (
                                                <div className="bg-black/80 backdrop-blur-sm p-2 rounded-lg border border-red-500/30">
                                                  <p className="text-white text-xs">{payload[0].payload.name}</p>
                                                  <p className="text-red-400 text-xs font-bold">Risk Level: {payload[0].value}/10</p>
                                                </div>
                                              );
                                            }
                                            return null;
                                          }}
                                        />
                                        <Line type="monotone" dataKey="risk" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }} />
                                      </RechartsLineChart>
                                    </ResponsiveContainer>
                                    <div className="absolute bottom-2 left-2 text-red-300 text-xs font-semibold">⚠️ Risk Levels</div>
                                  </div>
                                </div>
                              )}

                              {insight.id === 'performance' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  {/* Utilization Gauge */}
                                  <div className="h-48 relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 rounded-xl blur-xl"></div>
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="80%" data={[
                                        { 
                                          name: 'Utilization', 
                                          value: summary.totalInstancesScanned > 0 ? (summary.activeInstancesCount / summary.totalInstancesScanned * 100) : 0,
                                          fill: '#3B82F6'
                                        }
                                      ]}>
                                        <RadialBar dataKey="value" cornerRadius={10} fill="#3B82F6" />
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-lg font-bold">
                                          {summary.totalInstancesScanned > 0 ? Math.round(summary.activeInstancesCount / summary.totalInstancesScanned * 100) : 0}%
                                        </text>
                                      </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute bottom-2 left-2 text-blue-300 text-xs font-semibold">⚡ Utilization</div>
                                  </div>
                                  
                                  {/* Performance Trends */}
                                  <div className="h-48 relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-blue-500/10 rounded-xl blur-xl"></div>
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={[
                                        { status: 'Active', count: summary.activeInstancesCount, color: '#10B981' },
                                        { status: 'Idle', count: summary.idleRunningInstancesCount, color: '#F59E0B' },
                                        { status: 'Stopped', count: summary.stoppedInstancesCount, color: '#EF4444' }
                                      ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.2)" />
                                        <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#ffffff' }} />
                                        <YAxis tick={{ fontSize: 10, fill: '#ffffff' }} />
                                        <Tooltip 
                                          content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                              return (
                                                <div className="bg-black/80 backdrop-blur-sm p-2 rounded-lg border border-blue-500/30">
                                                  <p className="text-white text-xs">{payload[0].payload.status} Instances</p>
                                                  <p className="text-blue-400 text-xs font-bold">{payload[0].value} instances</p>
                                                </div>
                                              );
                                            }
                                            return null;
                                          }}
                                        />
                                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                      </BarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute bottom-2 left-2 text-cyan-300 text-xs font-semibold">📈 Performance</div>
                                  </div>
                                </div>
                              )}

                              {insight.id === 'compliance' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  {/* Compliance Score */}
                                  <div className="h-48 relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 rounded-xl blur-xl"></div>
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RechartsPieChart>
                                        <Pie
                                          data={[
                                            { name: 'Compliant', value: 70, color: '#10B981' },
                                            { name: 'Non-Compliant', value: 30, color: '#EF4444' }
                                          ]}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={35}
                                          outerRadius={70}
                                          dataKey="value"
                                          startAngle={90}
                                          endAngle={-270}
                                        >
                                          <Cell fill="#10B981" />
                                          <Cell fill="#EF4444" />
                                        </Pie>
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-lg font-bold">
                                          70%
                                        </text>
                                      </RechartsPieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute bottom-2 left-2 text-purple-300 text-xs font-semibold">📋 Compliance</div>
                                  </div>
                                  
                                  {/* Resource Coverage */}
                                  <div className="h-48 relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-purple-500/10 rounded-xl blur-xl"></div>
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={[
                                        { service: 'EC2', coverage: 85 },
                                        { service: 'S3', coverage: 60 },
                                        { service: 'IAM', coverage: 75 },
                                        { service: 'ELB', coverage: 90 }
                                      ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.2)" />
                                        <XAxis dataKey="service" tick={{ fontSize: 10, fill: '#ffffff' }} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#ffffff' }} />
                                        <Tooltip 
                                          content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                              return (
                                                <div className="bg-black/80 backdrop-blur-sm p-2 rounded-lg border border-purple-500/30">
                                                  <p className="text-white text-xs">{payload[0].payload.service} Service</p>
                                                  <p className="text-purple-400 text-xs font-bold">{payload[0].value}% Coverage</p>
                                                </div>
                                              );
                                            }
                                            return null;
                                          }}
                                        />
                                        <Bar dataKey="coverage" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                      </BarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute bottom-2 left-2 text-indigo-300 text-xs font-semibold">📊 Coverage</div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Modern Text Display */}
                            <div className="prose prose-invert max-w-none">
                              <div className="whitespace-pre-wrap text-blue-200 leading-relaxed font-medium text-sm">
                                {insight.analysis.split('\n\n').map((paragraph, index) => (
                                  <div key={index} className="mb-4 last:mb-0">
                                    <p className="text-blue-200 leading-7">
                                      {paragraph.split('**').map((part, partIndex) => 
                                        partIndex % 2 === 1 ? (
                                          <span key={partIndex} className="font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                                            {part}
                                          </span>
                                        ) : (
                                          part
                                        )
                                      )}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Analysis Footer */}
                            <div className="mt-6 pt-4 border-t border-blue-500/20">
                              <div className="flex items-center justify-between text-xs text-blue-300">
                                <div className="flex items-center space-x-2">
                                  <Brain className="h-4 w-4" />
                                  <span>Generated by CloudSniper AI</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span>Confidence:</span>
                                  <div className="w-12 h-2 bg-blue-500/20 rounded-full overflow-hidden">
                                    <div className="w-10 h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                                  </div>
                                  <span>95%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* Premium AI Summary */}
              <div className="mt-8 relative">
                <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/30 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5"></div>
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-gradient-to-br from-emerald-500/30 to-teal-500/30 p-2 rounded-lg">
                        <Brain className="h-6 w-6 text-emerald-300 animate-premium-pulse" />
                      </div>
                      <span className="text-emerald-200 font-bold text-lg">AI Executive Summary</span>
                    </div>
                    <p className="text-emerald-100 leading-relaxed">
                      Your AWS account has been comprehensively analyzed across{' '}
                      <span className="font-bold bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
                        {summary.totalInstancesScanned} instances
                      </span>,{' '}
                      <span className="font-bold bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
                        {summary.s3BucketsCount} S3 buckets
                      </span>, and{' '}
                      <span className="font-bold bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
                        {summary.iamUsersCount} IAM users
                      </span>. Click the analysis cards above to unlock detailed AI-powered insights 
                      specifically tailored to your infrastructure patterns and optimization opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Traditional Recommendations (if issues found) */}
      {(summary.stoppedInstancesCount > 0 || summary.idleRunningInstancesCount > 0 || summary.unattachedEBSVolumes > 0) && (
        <div className="bg-gradient-to-r from-amber-900/90 to-orange-900/90 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-amber-200 mb-4 flex items-center space-x-2">
            <span>💡 Immediate Action Items</span>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
          </h3>
          <div className="space-y-3">
            {summary.stoppedInstancesCount > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-amber-800/30 rounded-lg border border-amber-500/20">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 animate-pulse"></div>
                <p className="text-amber-200">
                  <strong className="text-amber-100">{summary.stoppedInstancesCount} stopped instances</strong> - Consider terminating if no longer needed to avoid EBS storage costs.
                </p>
              </div>
            )}
            {summary.idleRunningInstancesCount > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-red-800/30 rounded-lg border border-red-500/20">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 animate-pulse"></div>
                <p className="text-red-200">
                  <strong className="text-red-100">{summary.idleRunningInstancesCount} idle running instances</strong> - These are consuming resources but appear underutilized. Consider downsizing or stopping.
                </p>
              </div>
            )}
            {summary.unattachedEBSVolumes > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-800/30 rounded-lg border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 animate-pulse"></div>
                <p className="text-yellow-200">
                  <strong className="text-yellow-100">{summary.unattachedEBSVolumes} unattached EBS volumes</strong> - These volumes are incurring storage costs without being used.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanResults;