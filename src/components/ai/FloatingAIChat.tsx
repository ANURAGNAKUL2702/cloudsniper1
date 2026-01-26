import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { ScanResult } from '../../types/scanner';
import AIChat from './AIChat';

interface FloatingAIChatProps {
  scanResult?: ScanResult | null;
}

const FloatingAIChat: React.FC<FloatingAIChatProps> = ({ scanResult }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleToggleChat}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${isChatOpen ? 'rotate-180' : 'rotate-0'}`}
        >
          {isChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
          
          {/* Pulse Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-ping opacity-30"></div>
          
          {/* Notification Badge (if there are scan results) */}
          {scanResult && !isChatOpen && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </button>
        
        {/* Tooltip */}
        {isHovered && !isChatOpen && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
            Ask CloudSniper AI
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900"></div>
          </div>
        )}
      </div>

      {/* AI Chat Modal */}
      <AIChat 
        scanResult={scanResult}
        isVisible={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default FloatingAIChat;