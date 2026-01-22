import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
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



  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl p-4 rounded-xl border border-purple-500/50 shadow-2xl animate-premium-slide">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-premium-pulse"></div>
            <p className="text-white font-semibold text-sm">{label}</p>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4 mt-1">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-300">{entry.name}:</span>
              </div>
              <span className="text-sm font-bold text-white">{entry.value}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-purple-500/30">
            <div className="text-xs text-purple-300 text-center">
              ✨ Premium Analytics
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Premium Charts Header */}
      <div className="flex justify-center">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-900/80 to-indigo-900/90 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl max-w-4xl w-full group hover:border-purple-400/50 transition-all duration-500">
          {/* Premium Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-premium-float"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-premium-glow"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-full backdrop-blur-sm border border-purple-400/30 shadow-lg">
                <BarChart3 className="h-10 w-10 text-purple-300 group-hover:text-purple-200 transition-colors duration-300" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent flex items-center justify-center space-x-3">
                  <span>📊 Premium Analytics Dashboard</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </h2>
                <p className="text-purple-300 text-lg mt-2 font-medium">Advanced Visual Intelligence for AWS Infrastructure</p>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-purple-800/30 to-transparent p-3 rounded-xl border border-purple-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <span className="text-purple-200 font-semibold">Live Data</span>
                </div>
                <p className="text-purple-300 text-sm mt-1">Real-time AWS metrics</p>
              </div>
              <div className="bg-gradient-to-r from-pink-800/30 to-transparent p-3 rounded-xl border border-pink-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-pink-400" />
                  <span className="text-pink-200 font-semibold">Interactive</span>
                </div>
                <p className="text-pink-300 text-sm mt-1">Hover for detailed insights</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-800/30 to-transparent p-3 rounded-xl border border-indigo-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-indigo-400" />
                  <span className="text-indigo-200 font-semibold">AI-Powered</span>
                </div>
                <p className="text-indigo-300 text-sm mt-1">Intelligent analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
      {/* EC2 Instance Status - Centered */}
      {instanceStatusData.length > 0 && (
        <div className="lg:col-span-2 flex justify-center mb-12 mt-8">
          <div className="relative group max-w-md w-full">
            {/* Premium Card Container */}
            <div className="bg-gradient-to-br from-black/90 via-blue-900/80 to-black/90 backdrop-blur-xl border border-blue-500/40 rounded-3xl p-6 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-[1.02] overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5 animate-premium-float"></div>
              
              {/* Header */}
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 p-2 rounded-xl backdrop-blur-sm border border-blue-400/40 shadow-lg">
                    <PieChartIcon className="h-5 w-5 text-blue-200 group-hover:text-blue-100 transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-100 to-cyan-100 bg-clip-text text-transparent">EC2 Instance Status</h3>
                    <p className="text-blue-300 text-xs">Instance distribution</p>
                  </div>
                </div>
                
                {/* Enhanced Chart */}
                <div className="h-64 relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="premiumShadowSmall">
                          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(59, 130, 246, 0.3)"/>
                        </filter>
                      </defs>
                      <Pie
                        data={instanceStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={35}
                        paddingAngle={4}
                        dataKey="value"
                        animationBegin={300}
                        animationDuration={1500}
                        filter="url(#premiumShadowSmall)"
                      >
                        {instanceStatusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={entry.color}
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        formatter={(value, entry: any) => (
                          <span className="text-blue-200 text-xs font-medium flex items-center space-x-1">
                            <span className="text-sm">{entry.payload.icon}</span>
                            <span>{value}</span>
                            <span className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-1 py-0.5 rounded text-xs border border-blue-400/30">
                              {entry.payload.value}
                            </span>
                          </span>
                        )}
                        wrapperStyle={{
                          paddingTop: '10px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
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

        {/* Premium Cost Optimization Analysis */}
        {costOptimizationData.length > 0 && (
          <div className="relative group">
            <div className="bg-gradient-to-br from-slate-900/95 via-emerald-900/85 to-slate-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-3xl p-8 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 transform hover:scale-[1.02] overflow-hidden">
              {/* Premium Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-green-500/5 animate-premium-float"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 animate-premium-glow"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-emerald-500/30 to-green-500/30 p-3 rounded-xl backdrop-blur-sm border border-emerald-400/40 shadow-lg">
                    <DollarSign className="h-7 w-7 text-emerald-200 group-hover:text-emerald-100 transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-100 to-green-100 bg-clip-text text-transparent">Cost Optimization Potential</h3>
                    <p className="text-emerald-300 text-sm">Monthly savings opportunities</p>
                  </div>
                </div>
                
                <div className="h-80 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-2xl"></div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costOptimizationData} margin={{ top: 30, right: 40, left: 20, bottom: 60 }}>
                      <defs>
                        <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#EF4444" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.2)" strokeWidth={1} />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(148, 163, 184, 0.8)" 
                        fontSize={12}
                        fontWeight={500}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fill: 'rgba(203, 213, 225, 0.9)' }}
                      />
                      <YAxis 
                        stroke="rgba(148, 163, 184, 0.8)" 
                        fontSize={12}
                        fontWeight={500}
                        tick={{ fill: 'rgba(203, 213, 225, 0.9)' }}
                        label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#10B981' } }}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-gradient-to-br from-slate-900/95 to-emerald-900/95 backdrop-blur-xl p-4 rounded-xl border border-emerald-500/50 shadow-2xl">
                                <div className="flex items-center space-x-2 mb-2">
                                  <DollarSign className="h-4 w-4 text-emerald-400" />
                                  <p className="text-white font-semibold text-sm">{label}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-red-400 text-sm flex items-center justify-between">
                                    <span>Current Monthly Cost:</span>
                                    <span className="font-bold">${payload[0]?.payload?.current}</span>
                                  </p>
                                  <p className="text-emerald-400 text-sm flex items-center justify-between">
                                    <span>Potential Savings:</span>
                                    <span className="font-bold">${payload[0]?.payload?.savings}</span>
                                  </p>
                                  <div className="mt-2 pt-2 border-t border-emerald-500/30">
                                    <p className="text-emerald-300 text-xs text-center">💰 Optimization Potential</p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="current" stackId="a" fill="url(#costGradient)" name="Current Cost" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="savings" stackId="a" fill="url(#savingsGradient)" name="Potential Savings" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Cost Summary */}
                <div className="mt-4 p-4 bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-xl border border-emerald-500/20 backdrop-blur-sm">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-bold text-red-300">${costOptimizationData.reduce((sum, item) => sum + item.current, 0)}</div>
                      <div className="text-red-400 text-xs">Monthly Waste</div>
                    </div>
                    <div>
                      <div className="font-bold text-emerald-300">${costOptimizationData.reduce((sum, item) => sum + item.savings, 0)}</div>
                      <div className="text-emerald-400 text-xs">Potential Savings</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-300">
                        {((costOptimizationData.reduce((sum, item) => sum + item.savings, 0) / costOptimizationData.reduce((sum, item) => sum + item.current, 0)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-green-400 text-xs">Efficiency Gain</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

{/* Premium Security Risk Assessment - Modern 3D */}
        <div className="relative group">
          <div className="bg-gradient-to-br from-black/90 via-red-900/80 to-black/90 backdrop-blur-xl border border-red-500/40 rounded-3xl p-8 shadow-2xl hover:shadow-red-500/25 transition-all duration-500 transform hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-orange-500/5 animate-premium-float"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 animate-premium-glow"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-red-500/30 to-orange-500/30 p-3 rounded-xl backdrop-blur-sm border border-red-400/40 shadow-lg">
                  <Activity className="h-7 w-7 text-red-200 group-hover:text-red-100 transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-red-100 to-orange-100 bg-clip-text text-transparent">Security Risk Assessment</h3>
                  <p className="text-red-300 text-sm">Advanced threat detection</p>
                </div>
              </div>
              
              {/* 3D Security Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {securityData.map((item, index) => {
                  const percentage = item.total > 0 ? (item.value / item.total) * 100 : 0;
                  const riskColor = item.risk === 'High' ? '#EF4444' : item.risk === 'Medium' ? '#F59E0B' : '#10B981';
                  
                  return (
                    <div key={index} className="relative group/card">
                      <div className="bg-gradient-to-br from-black/60 to-gray-900/40 backdrop-blur-sm p-6 rounded-2xl border border-red-500/20 hover:border-red-400/40 transition-all duration-300 transform hover:scale-105">
                        <div className="text-center">
                          {/* 3D Circular Progress */}
                          <div className="relative w-28 h-28 mx-auto mb-4">
                            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                              <defs>
                                <linearGradient id={`riskGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor={riskColor} stopOpacity={0.8} />
                                  <stop offset="100%" stopColor={riskColor} stopOpacity={0.3} />
                                </linearGradient>
                                <filter id={`glow${index}`}>
                                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                  <feMerge> 
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/> 
                                  </feMerge>
                                </filter>
                              </defs>
                              
                              {/* Background circle */}
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.1)"
                                strokeWidth="2"
                              />
                              
                              {/* Progress circle with 3D effect */}
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={`url(#riskGradient${index})`}
                                strokeWidth="3"
                                strokeDasharray={`${percentage}, 100`}
                                strokeLinecap="round"
                                filter={`url(#glow${index})`}
                                className="animate-pulse"
                              />
                            </svg>
                            
                            {/* Center content with 3D effect */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center transform group-hover/card:scale-110 transition-transform duration-300">
                                <div className={`text-2xl font-bold mb-1`} style={{color: riskColor}}>
                                  {item.value}
                                </div>
                                <div className="text-white/60 text-xs font-medium">
                                  Issues
                                </div>
                              </div>
                            </div>
                            
                            {/* 3D floating risk indicator */}
                            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-bounce`}
                                 style={{backgroundColor: riskColor, color: 'white', boxShadow: `0 0 20px ${riskColor}50`}}>
                              {item.risk === 'High' ? '⚠' : item.risk === 'Medium' ? '⚡' : '✓'}
                            </div>
                          </div>
                          
                          {/* Modern metric info */}
                          <div className="space-y-2">
                            <h4 className="text-white font-semibold text-sm">{item.metric}</h4>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border`}
                                 style={{
                                   backgroundColor: `${riskColor}20`,
                                   borderColor: `${riskColor}40`,
                                   color: riskColor
                                 }}>
                              {item.risk} Risk
                            </div>
                            <div className="text-white/50 text-xs">
                              {percentage.toFixed(1)}% affected
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Modern Security Summary */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-red-600/20 to-red-500/10 p-4 rounded-xl border border-red-500/30 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-red-400 font-bold text-lg">
                      {securityData.filter(item => item.risk === 'High').reduce((sum, item) => sum + item.value, 0)}
                    </div>
                    <div className="text-red-300 text-xs mt-1">🔴 High Risk</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/10 p-4 rounded-xl border border-yellow-500/30 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-yellow-400 font-bold text-lg">
                      {securityData.filter(item => item.risk === 'Medium').reduce((sum, item) => sum + item.value, 0)}
                    </div>
                    <div className="text-yellow-300 text-xs mt-1">🟡 Medium Risk</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-600/20 to-green-500/10 p-4 rounded-xl border border-green-500/30 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-green-400 font-bold text-lg">
                      {securityData.filter(item => item.risk === 'Low').reduce((sum, item) => sum + item.value, 0)}
                    </div>
                    <div className="text-green-300 text-xs mt-1">🟢 Low Risk</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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