import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Settings, Sparkles, Shield, DollarSign, Zap, AlertTriangle } from 'lucide-react';
import { AIMessage, ScanAnalysisContext } from '../../types/ai-agent';
import { ScanResult } from '../../types/scanner';
import { aiService } from '../../lib/ai-agent-service';
import { QUICK_ACTION_PROMPTS, CONVERSATION_PROMPTS } from '../../lib/ai-agent-prompts';

interface AIChatProps {
  scanResult?: ScanResult | null;
  isVisible: boolean;
  onClose: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ scanResult, isVisible, onClose }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<'security' | 'cost' | 'performance' | 'compliance' | 'general'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible && messages.length === 0) {
      initializeChat();
    }
  }, [isVisible, scanResult]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (apiKey) {
      aiService.setApiKey(apiKey);
      setShowApiKeyInput(false);
    }
  }, [apiKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = () => {
    const welcomeMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: scanResult ? CONVERSATION_PROMPTS.WELCOME : CONVERSATION_PROMPTS.NO_SCAN_DATA,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const getContext = (): ScanAnalysisContext => ({
    scanResult,
    accountId: scanResult?.accountId || scanResult?.result?.accountId,
    timestamp: scanResult?.timestamp || scanResult?.result?.timestamp,
    focus: currentFocus,
    resourceType: 'all'
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = getContext();
      const allMessages = [...messages, userMessage];
      const response = await aiService.generateResponse(allMessages, context);

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputMessage(prompt);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: AIMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500 ml-2' : 'bg-gray-600 mr-2'
          }`}>
            {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
          </div>
          <div className={`rounded-lg p-3 ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-700 text-gray-100 border border-gray-600'
          }`}>
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
            <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
              {formatTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl h-[70vh] max-h-[600px] min-h-[400px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">CloudSniper AI Assistant</h2>
            <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Powered by Groq</span>
            {scanResult && (
              <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">
                Account: {scanResult.accountId || scanResult.result?.accountId || 'Unknown'}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Focus Selector */}
            <select
              value={currentFocus}
              onChange={(e) => setCurrentFocus(e.target.value as any)}
              className="px-2 py-1 text-xs bg-gray-700 text-white rounded border border-gray-600"
            >
              <option value="general">General</option>
              <option value="security">Security</option>
              <option value="cost">Cost</option>
              <option value="performance">Performance</option>
              <option value="compliance">Compliance</option>
            </select>
            
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="p-1 text-gray-400 hover:text-white"
              title="API Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* API Key Input */}
        {showApiKeyInput && (
          <div className="p-4 bg-gray-750 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="password"
                placeholder="Enter Groq API Key (gsk_...)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              />
              <button
                onClick={() => setShowApiKeyInput(false)}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Groq API key is stored locally in your browser session only
            </p>
          </div>
        )}

        {/* Quick Actions */}
        {messages.length <= 1 && scanResult && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Quick Actions:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => handleQuickAction(QUICK_ACTION_PROMPTS.SECURITY_SUMMARY)}
                className="flex items-center space-x-1 p-2 text-xs bg-red-900 hover:bg-red-800 text-red-200 rounded"
              >
                <Shield className="w-3 h-3" />
                <span>Security</span>
              </button>
              <button
                onClick={() => handleQuickAction(QUICK_ACTION_PROMPTS.COST_ANALYSIS)}
                className="flex items-center space-x-1 p-2 text-xs bg-green-900 hover:bg-green-800 text-green-200 rounded"
              >
                <DollarSign className="w-3 h-3" />
                <span>Cost Savings</span>
              </button>
              <button
                onClick={() => handleQuickAction(QUICK_ACTION_PROMPTS.CRITICAL_ISSUES)}
                className="flex items-center space-x-1 p-2 text-xs bg-orange-900 hover:bg-orange-800 text-orange-200 rounded"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Critical Issues</span>
              </button>
              <button
                onClick={() => handleQuickAction(QUICK_ACTION_PROMPTS.RESOURCE_RECOMMENDATIONS)}
                className="flex items-center space-x-1 p-2 text-xs bg-blue-900 hover:bg-blue-800 text-blue-200 rounded"
              >
                <Zap className="w-3 h-3" />
                <span>Optimize</span>
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map(renderMessage)}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about your AWS resources, security, costs, or optimizations..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;