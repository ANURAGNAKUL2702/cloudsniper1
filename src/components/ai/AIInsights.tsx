import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Shield, DollarSign, Zap, AlertTriangle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { ScanResult } from '../../types/scanner';
import { AIAnalysisResult } from '../../types/ai-agent';
import { aiService } from '../../lib/ai-agent-service';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface AIInsightsProps {
  scanResult: ScanResult;
  onOpenChat: () => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ scanResult, onOpenChat }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scanResult) {
      generateAnalysis();
    }
  }, [scanResult]);

  const generateAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await aiService.generateInitialAnalysis(scanResult);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <Clock className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
          <h3 className="text-lg font-semibold text-white">AI Analyzing Your AWS Infrastructure...</h3>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-2 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-2 bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-2 bg-gray-700 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">CloudSniper AI Insights</h3>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">AI Analysis Unavailable</span>
          </div>
          <p className="text-yellow-200 mt-1 text-sm">
            {error}
          </p>
          <p className="text-gray-400 mt-2 text-sm">
            Click "Ask AI" to interact with the assistant manually or configure your OpenAI API key.
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">CloudSniper AI Insights</h3>
        </div>
        <button
          onClick={onOpenChat}
          className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask AI</span>
        </button>
      </div>

      {/* Risk Assessment */}
      <div className={`p-4 rounded-lg border mb-6 ${getRiskColor(analysis.riskLevel)}`}>
        <div className="flex items-center space-x-2 mb-2">
          {getRiskIcon(analysis.riskLevel)}
          <h4 className="font-semibold">Risk Assessment: {analysis.riskLevel.toUpperCase()}</h4>
        </div>
        <p className="text-sm opacity-80">
          Based on security vulnerabilities, cost inefficiencies, and compliance gaps in your infrastructure.
        </p>
      </div>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Security Concerns */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-5 h-5 text-red-400" />
            <h4 className="font-semibold text-white">Security Concerns</h4>
          </div>
          <ul className="space-y-1">
            {analysis.securityConcerns.slice(0, 3).map((concern, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start space-x-1">
                <span className="text-red-400 mt-1">•</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
          {analysis.securityConcerns.length > 3 && (
            <p className="text-xs text-gray-400 mt-2">
              +{analysis.securityConcerns.length - 3} more concerns
            </p>
          )}
        </div>

        {/* Cost Optimizations */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-white">Cost Savings</h4>
          </div>
          <ul className="space-y-1">
            {analysis.costOptimizations.slice(0, 3).map((optimization, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start space-x-1">
                <span className="text-green-400 mt-1">•</span>
                <span>{optimization}</span>
              </li>
            ))}
          </ul>
          {analysis.costOptimizations.length > 3 && (
            <p className="text-xs text-gray-400 mt-2">
              +{analysis.costOptimizations.length - 3} more opportunities
            </p>
          )}
        </div>

        {/* Key Recommendations */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-blue-400" />
            <h4 className="font-semibold text-white">Quick Wins</h4>
          </div>
          <ul className="space-y-1">
            {analysis.recommendations.slice(0, 3).map((recommendation, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start space-x-1">
                <span className="text-blue-400 mt-1">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
          {analysis.recommendations.length > 3 && (
            <p className="text-xs text-gray-400 mt-2">
              +{analysis.recommendations.length - 3} more recommendations
            </p>
          )}
        </div>
      </div>

      {/* AI Analysis Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Risk Distribution Pie Chart */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span>Risk Distribution</span>
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Pie
                data={[
                  { name: 'Critical', value: analysis.securityConcerns.length > 5 ? 25 : 10, fill: '#ef4444' },
                  { name: 'High', value: analysis.securityConcerns.length > 3 ? 35 : 20, fill: '#f97316' },
                  { name: 'Medium', value: analysis.costOptimizations.length > 2 ? 30 : 45, fill: '#eab308' },
                  { name: 'Low', value: 10 + (5 - Math.min(analysis.securityConcerns.length, 5)) * 5, fill: '#22c55e' }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {[{ name: 'Critical', fill: '#ef4444' }, { name: 'High', fill: '#f97316' }, { name: 'Medium', fill: '#eab308' }, { name: 'Low', fill: '#22c55e' }].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Optimization Impact Bar Chart */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-4 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span>Optimization Impact</span>
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { category: 'Security', impact: analysis.securityConcerns.length * 15, fill: '#ef4444' },
              { category: 'Cost', impact: analysis.costOptimizations.length * 20, fill: '#22c55e' },
              { category: 'Performance', impact: analysis.recommendations.length * 12, fill: '#3b82f6' },
              { category: 'Compliance', impact: Math.min(analysis.insights.length * 8, 80), fill: '#8b5cf6' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="impact" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Insights */}
      <div className="mb-4">
        <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <span>Key Insights</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {analysis.insights.slice(0, 6).map((insight, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-gray-800/30 rounded border border-gray-700/50">
              <span className="text-purple-400 mt-1">✓</span>
              <span className="text-sm text-gray-300">{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;