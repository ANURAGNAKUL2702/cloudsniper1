import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar, Legend } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity, Zap, DollarSign } from 'lucide-react';
import { ScanResult } from '../types/scanner';

interface ChartsSectionProps {
  scanResult: ScanResult;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ scanResult }) => {
  const { summary, details } = scanResult;

  if (!summary || !details) return null;

  // Prepare data for different charts
  const instanceStatusData = [
    { name: 'Active', value: summary.activeInstancesCount, color: '#10B981', icon: '🟢' },
    { name: 'Stopped', value: summary.stoppedInstancesCount, color: '#F59E0B', icon: '🟡' },
    { name: 'Idle', value: summary.idleRunningInstancesCount, color: '#EF4444', icon: '🔴' },
  ].filter(item => item.value > 0);

  const servicesOverviewData = [
    { name: 'EC2 Instances', value: summary.totalInstancesScanned, color: '#8B5CF6', category: 'Compute' },
    { name: 'S3 Buckets', value: summary.s3BucketsCount, color: '#06B6D4', category: 'Storage' },
    { name: 'Load Balancers', value: summary.elbCount, color: '#F59E0B', category: 'Network' },
    { name: 'IAM Users', value: summary.iamUsersCount, color: '#EF4444', category: 'Security' },
    { name: 'EBS Volumes', value: summary.unattachedEBSVolumes, color: '#84CC16', category: 'Storage' },
  ].filter(item => item.value > 0);

  // Cost optimization potential data
  const costOptimizationData = [
    { 
      name: 'Stopped Instances', 
      potential: summary.stoppedInstancesCount * 8, 
      current: summary.stoppedInstancesCount * 2,
      savings: summary.stoppedInstancesCount * 6
    },
    { 
      name: 'Idle Instances', 
      potential: summary.idleRunningInstancesCount * 50, 
      current: summary.idleRunningInstancesCount * 50,
      savings: summary.idleRunningInstancesCount * 35
    },
    { 
      name: 'Unused Volumes', 
      potential: summary.unattachedEBSVolumes * 10, 
      current: summary.unattachedEBSVolumes * 10,
      savings: summary.unattachedEBSVolumes * 10
    },
  ].filter(item => item.potential > 0);

  // Regional distribution (mock data based on details)
  const regionalData = React.useMemo(() => {
    const regions: { [key: string]: number } = {};
    
    // Count instances by region
    [...(details.activeInstances || []), ...(details.stoppedInstances || []), ...(details.idleRunningInstances || [])]
      .forEach(instance => {
        const region = instance.region || 'us-east-1';
        regions[region] = (regions[region] || 0) + 1;
      });

    return Object.entries(regions).map(([region, count]) => ({
      region: region.replace('us-', 'US ').replace('eu-', 'EU ').replace('ap-', 'AP ').toUpperCase(),
      instances: count,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    }));
  }, [details]);

  // Security metrics
  const securityData = [
    { 
      metric: 'Public S3 Buckets', 
      value: details.s3Buckets?.filter(bucket => bucket.isPublic).length || 0,
      total: summary.s3BucketsCount,
      risk: 'High'
    },
    { 
      metric: 'Unencrypted S3 Buckets', 
      value: details.s3Buckets?.filter(bucket => !bucket.isEncrypted).length || 0,
      total: summary.s3BucketsCount,
      risk: 'Medium'
    },
    { 
      metric: 'IAM Users', 
      value: summary.iamUsersCount,
      total: summary.iamUsersCount,
      risk: summary.iamUsersCount > 10 ? 'Medium' : 'Low'
    },
  ];

  const COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#EC4899', '#84CC16'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30 shadow-xl">
          <p className="text-white font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Charts Header - Centered */}
      <div className="flex justify-center">
        <div className="bg-gradient-to-r from-indigo-900/90 to-purple-900/90 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-6 shadow-2xl max-w-2xl w-full">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-indigo-500/20 p-3 rounded-full">
              <BarChart3 className="h-8 w-8 text-indigo-400" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-indigo-200 flex items-center justify-center space-x-2">
                <span>📊 Interactive Analytics Dashboard</span>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
              </h2>
              <p className="text-indigo-300 text-sm">Visual insights into your AWS infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* EC2 Instance Status Pie Chart */}
        {instanceStatusData.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800/90 to-purple-800/90 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center space-x-2 mb-4">
              <PieChartIcon className="h-6 w-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">EC2 Instance Status</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={instanceStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {instanceStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value, entry: any) => (
                      <span className="text-white text-sm">
                        {entry.payload.icon} {value} ({entry.payload.value})
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Services Overview Bar Chart - Centered */}
        <div className="lg:col-span-2 flex justify-center">
          <div className="bg-gradient-to-br from-slate-800/90 to-blue-800/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 w-full max-w-4xl">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">AWS Services Overview</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servicesOverviewData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                    animationBegin={200}
                  >
                    {servicesOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cost Optimization Potential */}
        {costOptimizationData.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800/90 to-green-800/90 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Cost Optimization Potential</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costOptimizationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-800/95 backdrop-blur-sm p-3 rounded-lg border border-green-500/30 shadow-xl">
                            <p className="text-white font-semibold">{label}</p>
                            <p className="text-red-400 text-sm">Current Cost: ${payload[0]?.payload?.current}/month</p>
                            <p className="text-green-400 text-sm">Potential Savings: ${payload[0]?.payload?.savings}/month</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="current" stackId="a" fill="#EF4444" name="Current Cost" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="savings" stackId="a" fill="#10B981" name="Potential Savings" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Regional Distribution */}
        {regionalData.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800/90 to-orange-800/90 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="h-6 w-6 text-orange-400" />
              <h3 className="text-xl font-bold text-white">Regional Distribution</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={regionalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="region" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="instances" 
                    stroke="#F59E0B" 
                    fill="url(#colorGradient)" 
                    strokeWidth={2}
                    animationDuration={1500}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Security Metrics Radial Chart */}
      <div className="bg-gradient-to-br from-slate-800/90 to-red-800/90 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-red-500/20 transition-all duration-300">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-6 w-6 text-red-400" />
          <h3 className="text-xl font-bold text-white">Security Risk Assessment</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {securityData.map((item, index) => {
            const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
            const riskColor = item.risk === 'High' ? '#EF4444' : item.risk === 'Medium' ? '#F59E0B' : '#10B981';
            
            return (
              <div key={index} className="bg-slate-700/50 backdrop-blur-sm p-4 rounded-xl border border-slate-600/30">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#374151"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={riskColor}
                        strokeWidth="2"
                        strokeDasharray={`${percentage}, 100`}
                        className="animate-pulse"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{item.value}</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1">{item.metric}</h4>
                  <div className="flex items-center justify-center space-x-2">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${riskColor}20`, 
                        color: riskColor,
                        border: `1px solid ${riskColor}40`
                      }}
                    >
                      {item.risk} Risk
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
          <div className="text-2xl font-bold text-white">{summary.totalInstancesScanned}</div>
          <div className="text-purple-200 text-sm">Total Instances</div>
          <div className="w-full bg-purple-800/30 rounded-full h-2 mt-2">
            <div className="bg-purple-400 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/90 to-cyan-900/90 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
          <div className="text-2xl font-bold text-white">{summary.s3BucketsCount}</div>
          <div className="text-blue-200 text-sm">S3 Buckets</div>
          <div className="w-full bg-blue-800/30 rounded-full h-2 mt-2">
            <div className="bg-blue-400 h-2 rounded-full animate-pulse" style={{ width: '85%' }}></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-900/90 to-emerald-900/90 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
          <div className="text-2xl font-bold text-white">${(summary.stoppedInstancesCount * 6 + summary.idleRunningInstancesCount * 35 + summary.unattachedEBSVolumes * 10)}</div>
          <div className="text-green-200 text-sm">Potential Savings</div>
          <div className="w-full bg-green-800/30 rounded-full h-2 mt-2">
            <div className="bg-green-400 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-900/90 to-red-900/90 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300">
          <div className="text-2xl font-bold text-white">{summary.iamUsersCount}</div>
          <div className="text-orange-200 text-sm">IAM Users</div>
          <div className="w-full bg-orange-800/30 rounded-full h-2 mt-2">
            <div className="bg-orange-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;