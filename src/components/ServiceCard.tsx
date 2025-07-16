import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ServiceCardProps } from '../types/scanner';

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  icon,
  count,
  status,
  description,
  details = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusStyles = () => {
    switch (status) {
      case 'healthy':
        return 'bg-gradient-to-r from-green-900/90 to-emerald-900/90 border-green-500/30 text-green-200';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-900/90 to-orange-900/90 border-yellow-500/30 text-yellow-200';
      case 'critical':
        return 'bg-gradient-to-r from-red-900/90 to-pink-900/90 border-red-500/30 text-red-200';
      default:
        return 'theme-service-card';
    }
  };

  const getCountStyles = () => {
    switch (status) {
      case 'healthy':
        return 'text-green-100 bg-green-500/20 border-green-400/30';
      case 'warning':
        return 'text-yellow-100 bg-yellow-500/20 border-yellow-400/30';
      case 'critical':
        return 'text-red-100 bg-red-500/20 border-red-400/30';
      default:
        return 'theme-text bg-blue-500/20 border-blue-400/30';
    }
  };

  const getIconStyles = () => {
    switch (status) {
      case 'healthy':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className={`rounded-xl border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-105 transform shadow-xl ${getStatusStyles()}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getIconStyles()} bg-white/10 backdrop-blur-sm`}>
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{title}</h3>
              <p className="text-sm opacity-75">{description}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full font-bold text-lg border ${getCountStyles()} backdrop-blur-sm`}>
            {count}
          </div>
        </div>

        {details.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/30"
          >
            <span className="text-sm font-medium text-white">
              {isExpanded ? 'Hide Details' : 'View Details'}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-white" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white" />
            )}
          </button>
        )}

        {isExpanded && details.length > 0 && (
          <div className="mt-4 space-y-2 animate-slide-down">
            {details.slice(0, 5).map((detail, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-lg text-sm border border-white/10">
                <pre className="whitespace-pre-wrap font-mono text-xs text-gray-300 overflow-auto">
                  {JSON.stringify(detail, null, 2)}
                </pre>
              </div>
            ))}
            {details.length > 5 && (
              <p className="text-sm opacity-75 text-center text-white">
                ... and {details.length - 5} more items
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;