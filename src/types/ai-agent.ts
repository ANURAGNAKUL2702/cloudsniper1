// AI Agent Types for CloudSniper
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: ScanAnalysisContext;
}

export interface ScanAnalysisContext {
  scanResult?: any;
  accountId?: string;
  timestamp?: string;
  focus?: 'security' | 'cost' | 'performance' | 'compliance' | 'general';
  resourceType?: 'ec2' | 's3' | 'ebs' | 'elb' | 'iam' | 'all';
}

export interface AIAgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface ChatSession {
  id: string;
  messages: AIMessage[];
  context: ScanAnalysisContext;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  securityConcerns: string[];
  costOptimizations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface QuickActions {
  title: string;
  description: string;
  category: 'security' | 'cost' | 'performance' | 'compliance';
  action: () => void;
}
