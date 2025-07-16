import React, { useState } from 'react';
import { Server, HardDrive, Database, Loader as LoadBalancer, Users, CheckCircle, Clock, XCircle, Calendar, User, Sparkles, Brain, Shield, DollarSign, Zap, AlertTriangle, MessageCircle, TrendingUp, Eye, BarChart3 } from 'lucide-react';
import { ScanResult } from '../types/scanner';
import ServiceCard from './ServiceCard';
import ChartsSection from './ChartsSection';

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
    
    let analysis = `Based on your AWS account scan, I've analyzed ${totalInstances} EC2 instances and found several cost optimization opportunities:\n\n`;
    
    if (stoppedInstances > 0) {
      const estimatedMonthlyCost = stoppedInstances * 8; // Rough estimate for EBS costs
      analysis += `💰 **${stoppedInstances} Stopped Instances**: These are still incurring EBS storage costs (~$${estimatedMonthlyCost}/month). Consider terminating unused instances.\n\n`;
    }
    
    if (idleInstances > 0) {
      const estimatedWaste = idleInstances * 50; // Rough estimate
      analysis += `⚡ **${idleInstances} Idle Running Instances**: These could be wasting ~$${estimatedWaste}/month. Consider downsizing or implementing auto-scaling.\n\n`;
    }
    
    if (unattachedVolumes > 0) {
      const volumeCost = unattachedVolumes * 10; // Rough estimate
      analysis += `💾 **${unattachedVolumes} Unattached EBS Volumes**: Costing ~$${volumeCost}/month for unused storage. Safe to delete if no longer needed.\n\n`;
    }
    
    if (stoppedInstances === 0 && idleInstances === 0 && unattachedVolumes === 0) {
      analysis += `🎉 **Excellent Cost Management!** Your account shows no obvious waste. Your ${totalInstances} instances appear to be actively used and well-managed.`;
    }
    
    return analysis;
  };

  const generateSecurityAnalysis = () => {
    const iamUsers = summary.iamUsersCount;
    const s3Buckets = summary.s3BucketsCount;
    const loadBalancers = summary.elbCount;
    
    let analysis = `Security assessment for AWS Account ${accountId}:\n\n`;
    
    analysis += `👥 **${iamUsers} IAM Users**: ${iamUsers > 10 ? 'Consider reviewing user access and implementing role-based access instead of individual users.' : 'Good user count management.'}\n\n`;
    
    analysis += `🪣 **${s3Buckets} S3 Buckets**: ${s3Buckets > 20 ? 'Large number of buckets - ensure all have proper access policies and encryption.' : 'Manageable bucket count.'}\n\n`;
    
    analysis += `⚖️ **${loadBalancers} Load Balancers**: ${loadBalancers > 0 ? 'Ensure SSL/TLS termination and security groups are properly configured.' : 'No load balancers detected.'}\n\n`;
    
    analysis += `🔒 **Recommendations**: Enable CloudTrail logging, use AWS Config for compliance monitoring, and implement least-privilege IAM policies.`;
    
    return analysis;
  };

  const generatePerformanceAnalysis = () => {
    const activeInstances = summary.activeInstancesCount;
    const idleInstances = summary.idleRunningInstancesCount;
    const totalInstances = summary.totalInstancesScanned;
    
    let analysis = `Performance analysis for your ${totalInstances} EC2 instances:\n\n`;
    
    const utilizationRate = totalInstances > 0 ? ((activeInstances / totalInstances) * 100).toFixed(1) : 0;
    
    analysis += `📊 **Utilization Rate**: ${utilizationRate}% of your instances are actively utilized.\n\n`;
    
    if (idleInstances > 0) {
      analysis += `⚠️ **${idleInstances} Underutilized Instances**: These may benefit from:\n`;
      analysis += `• Right-sizing to smaller instance types\n`;
      analysis += `• Implementing auto-scaling groups\n`;
      analysis += `• Consolidating workloads\n\n`;
    }
    
    if (activeInstances > 0) {
      analysis += `✅ **${activeInstances} Well-Utilized Instances**: These appear to be properly sized for their workloads.\n\n`;
    }
    
    analysis += `🚀 **Performance Tips**: Monitor CloudWatch metrics, enable detailed monitoring, and consider using AWS Compute Optimizer for instance recommendations.`;
    
    return analysis;
  };

  const generateComplianceAnalysis = () => {
    const totalResources = summary.totalInstancesScanned + summary.s3BucketsCount + summary.elbCount;
    
    let analysis = `Compliance and governance assessment:\n\n`;
    
    analysis += `📋 **Resource Inventory**: ${totalResources} total resources scanned across EC2, S3, and ELB services.\n\n`;
    
    analysis += `🔍 **Compliance Checklist**:\n`;
    analysis += `• ✅ Resource discovery completed\n`;
    analysis += `• ⚠️ Encryption status needs verification\n`;
    analysis += `• ⚠️ Access logging should be enabled\n`;
    analysis += `• ⚠️ Backup policies need review\n\n`;
    
    analysis += `📝 **Next Steps**: Implement AWS Config rules, enable GuardDuty for threat detection, and establish regular compliance audits.`;
    
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
            <p className="text-sm text-white mt-1">{formatTimestamp(timestamp)}</p>
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
          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* EC2 Instances - Active */}
            <ServiceCard
              title="Active Instances"
              icon={<Server className="h-6 w-6" />}
              count={summary.activeInstancesCount}
              status="info"
              description="Currently running and active"
              details={details.activeInstances}
            />

            {/* EC2 Instances - Stopped */}
            <ServiceCard
              title="Stopped Instances"
              icon={<XCircle className="h-6 w-6" />}
              count={summary.stoppedInstancesCount}
              status="info"
              description="Stopped instances (potential cost savings)"
              details={details.stoppedInstances}
            />

            {/* EC2 Instances - Idle */}
            <ServiceCard
              title="Idle Running Instances"
              icon={<Clock className="h-6 w-6" />}
              count={summary.idleRunningInstancesCount}
              status="info"
              description="Running but underutilized"
              details={details.idleRunningInstances}
            />

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
          {/* Interactive AI AWS Analysis Section */}
          <div className="bg-gradient-to-r from-indigo-900/90 to-purple-900/90 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-500/20 p-3 rounded-full">
                <Brain className="h-8 w-8 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-indigo-200 flex items-center space-x-2">
                  <span>🤖 AI AWS Expert Analysis</span>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
                </h3>
                <p className="text-indigo-300 text-sm">Intelligent insights based on your specific AWS account scan</p>
              </div>
            </div>

            {/* AI Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {aiInsights.map((insight) => (
                <button
                  key={insight.id}
                  onClick={() => setActiveInsight(activeInsight === insight.id ? null : insight.id)}
                  className={`bg-gradient-to-br ${insight.color} p-4 rounded-xl border ${insight.borderColor} hover:border-opacity-60 transition-all duration-300 group text-left w-full transform hover:scale-105 active:scale-95`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white">{insight.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <MessageCircle className="h-4 w-4 text-white/60" />
                        <span className="text-sm text-white/80">Click for AI analysis</span>
                      </div>
                    </div>
                    <div className="text-white/60 group-hover:text-white transition-colors">
                      {activeInsight === insight.id ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <BarChart3 className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Active AI Analysis Display */}
            {activeInsight && (
              <div className="animate-slide-down">
                {aiInsights.map((insight) => (
                  activeInsight === insight.id && (
                    <div key={insight.id} className={`bg-gradient-to-br ${insight.color} p-6 rounded-xl border ${insight.borderColor} shadow-xl`}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-white/20 p-2 rounded-lg">
                          {insight.icon}
                        </div>
                        <h4 className="text-xl font-bold text-white">{insight.title}</h4>
                        <div className="flex-1"></div>
                        <TrendingUp className="h-5 w-5 text-white/60 animate-pulse" />
                      </div>
                      <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                        <pre className="whitespace-pre-wrap text-sm text-white font-mono leading-relaxed">
                          {insight.analysis}
                        </pre>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* AI Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl border border-emerald-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-5 w-5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-200 font-semibold">AI Summary</span>
              </div>
              <p className="text-emerald-100 text-sm">
                Your AWS account has been analyzed across {summary.totalInstancesScanned} instances, {summary.s3BucketsCount} S3 buckets, 
                and {summary.iamUsersCount} IAM users. Click the analysis cards above to get detailed AI-powered insights 
                specific to your infrastructure.
              </p>
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