// AI Agent Service for CloudSniper - Groq Integration
import { AIMessage, ScanAnalysisContext, AIAnalysisResult } from '../types/ai-agent';
import { ScanResult } from '../types/scanner';
import { SYSTEM_PROMPTS } from './ai-agent-prompts';

class CloudSniperAIService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.groq.com/openai/v1';
  private model: string = 'llama-3.1-8b-instant'; // Updated to supported model
  private maxTokens: number = 2000;
  private temperature: number = 0.7;

  constructor() {
    // In production, use environment variables or secure configuration
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || null;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  private formatScanDataForAI(scanResult: ScanResult): string {
    if (!scanResult) return 'No scan data available.';

    const data = scanResult.result || scanResult;
    const summary = data.summary || {};
    const details = data.details || {};

    return `
# AWS Account Scan Results
**Account ID:** ${data.accountId || 'Unknown'}
**Scan Time:** ${data.timestamp || 'Unknown'}
**Status:** ${data.status}

## Summary
- Total EC2 Instances: ${(summary as any).totalInstancesScanned || 0}
- Stopped Instances: ${(summary as any).stoppedInstancesCount || 0}
- Idle Running Instances: ${(summary as any).idleRunningInstancesCount || 0}
- Active Instances: ${(summary as any).activeInstancesCount || 0}
- Unattached EBS Volumes: ${(summary as any).unattachedEBSVolumes || 0}
- S3 Buckets: ${(summary as any).s3BucketsCount || 0}
- Load Balancers: ${(summary as any).elbCount || 0}
- IAM Users: ${(summary as any).iamUsersCount || 0}

## Detailed Resources

### Stopped Instances
${JSON.stringify((details as any).stoppedInstances || [], null, 2)}

### Idle Running Instances
${JSON.stringify((details as any).idleRunningInstances || [], null, 2)}

### Active Instances
${JSON.stringify((details as any).activeInstances || [], null, 2)}

### Unattached EBS Volumes
${JSON.stringify((details as any).unusedEBSVolumes || [], null, 2)}

### S3 Buckets
${JSON.stringify((details as any).s3Buckets || [], null, 2)}

### Load Balancers
${JSON.stringify((details as any).elbs || [], null, 2)}

### IAM Users
${JSON.stringify((details as any).iamUsers || [], null, 2)}
`;
  }

  private getSystemPrompt(context?: ScanAnalysisContext): string {
    const focus = context?.focus || 'general';
    
    switch (focus) {
      case 'security':
        return SYSTEM_PROMPTS.MAIN + '\n\n' + SYSTEM_PROMPTS.SECURITY_FOCUSED;
      case 'cost':
        return SYSTEM_PROMPTS.MAIN + '\n\n' + SYSTEM_PROMPTS.COST_FOCUSED;
      case 'performance':
        return SYSTEM_PROMPTS.MAIN + '\n\n' + SYSTEM_PROMPTS.PERFORMANCE_FOCUSED;
      case 'compliance':
        return SYSTEM_PROMPTS.MAIN + '\n\n' + SYSTEM_PROMPTS.COMPLIANCE_FOCUSED;
      default:
        return SYSTEM_PROMPTS.MAIN;
    }
  }

  async generateResponse(
    messages: AIMessage[], 
    context?: ScanAnalysisContext
  ): Promise<string> {
    if (!this.apiKey) {
      return `⚠️ **Groq API Key Required**

To enable CloudSniper AI assistant, please:
1. Get an API key from Groq Console
2. Add it to your environment variables as VITE_GROQ_API_KEY
3. Or contact your administrator for access

*For now, you can still use the CloudSniper scan results to manually analyze your AWS resources.*`;
    }

    try {
      const systemPrompt = this.getSystemPrompt(context);
      const scanData = context?.scanResult ? this.formatScanDataForAI(context.scanResult) : '';
      
      const conversationMessages = [
        {
          role: 'system' as const,
          content: systemPrompt + (scanData ? `\n\n# Current Scan Data\n${scanData}` : '')
        },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: conversationMessages,
          max_tokens: this.maxTokens,
          temperature: this.temperature
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Groq API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    } catch (error: any) {
      console.error('AI Service Error:', error);
      
      if (error.message.includes('API key')) {
        return '❌ **Invalid API Key** - Please check your Groq API key configuration.';
      } else if (error.message.includes('quota')) {
        return '⚠️ **API Quota Exceeded** - Groq usage limit reached. Please try again later.';
      } else {
        return `❌ **AI Service Error** - ${error.message}. The scan results are still available for manual analysis.`;
      }
    }
  }

  async generateInitialAnalysis(scanResult: ScanResult): Promise<AIAnalysisResult> {
    const context: ScanAnalysisContext = {
      scanResult,
      focus: 'general'
    };

    const analysisPrompt = `Based on the scan results, provide a comprehensive analysis with:
1. Executive Summary
2. Top 5 Critical Issues
3. Security Recommendations
4. Cost Optimization Opportunities
5. Risk Assessment

Format your response as a structured analysis.`;

    const messages: AIMessage[] = [{
      id: '1',
      role: 'user',
      content: analysisPrompt,
      timestamp: new Date()
    }];

    try {
      const response = await this.generateResponse(messages, context);
      
      // Parse the response into structured format
      // This is a simplified parser - in production, use more robust parsing
      const insights = this.extractInsights(response);
      const recommendations = this.extractRecommendations(response);
      const securityConcerns = this.extractSecurityConcerns(response);
      const costOptimizations = this.extractCostOptimizations(response);
      const riskLevel = this.assessRiskLevel(scanResult);

      return {
        summary: response,
        insights,
        recommendations,
        securityConcerns,
        costOptimizations,
        riskLevel
      };
    } catch (error) {
      console.error('Analysis generation error:', error);
      return this.getFallbackAnalysis(scanResult);
    }
  }

  private extractInsights(response: string): string[] {
    // Extract bullet points and insights from AI response
    const insights: string[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      if (line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•')) {
        insights.push(line.trim().substring(1).trim());
      }
    }
    
    return insights.slice(0, 10); // Limit to top 10 insights
  }

  private extractRecommendations(response: string): string[] {
    const recommendations: string[] = [];
    const lines = response.split('\n');
    let inRecommendationSection = false;
    
    for (const line of lines) {
      if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest')) {
        inRecommendationSection = true;
      }
      
      if (inRecommendationSection && (line.trim().startsWith('-') || line.trim().startsWith('*'))) {
        recommendations.push(line.trim().substring(1).trim());
      }
    }
    
    return recommendations.slice(0, 8);
  }

  private extractSecurityConcerns(response: string): string[] {
    const concerns: string[] = [];
    const lines = response.split('\n');
    let inSecuritySection = false;
    
    for (const line of lines) {
      if (line.toLowerCase().includes('security') || line.toLowerCase().includes('risk')) {
        inSecuritySection = true;
      }
      
      if (inSecuritySection && (line.trim().startsWith('-') || line.trim().startsWith('*'))) {
        concerns.push(line.trim().substring(1).trim());
      }
    }
    
    return concerns.slice(0, 6);
  }

  private extractCostOptimizations(response: string): string[] {
    const optimizations: string[] = [];
    const lines = response.split('\n');
    let inCostSection = false;
    
    for (const line of lines) {
      if (line.toLowerCase().includes('cost') || line.toLowerCase().includes('saving')) {
        inCostSection = true;
      }
      
      if (inCostSection && (line.trim().startsWith('-') || line.trim().startsWith('*'))) {
        optimizations.push(line.trim().substring(1).trim());
      }
    }
    
    return optimizations.slice(0, 6);
  }

  private assessRiskLevel(scanResult: ScanResult): 'low' | 'medium' | 'high' | 'critical' {
    const data = scanResult.result || scanResult;
    const summary = data.summary || {};
    const details = data.details || {};
    
    let riskScore = 0;
    
    // Risk factors
    const publicS3Buckets = ((details as any).s3Buckets || []).filter((b: any) => b.isPublic).length;
    const unencryptedS3Buckets = ((details as any).s3Buckets || []).filter((b: any) => !b.isEncrypted).length;
    const stoppedInstances = (summary as any).stoppedInstancesCount || 0;
    const idleInstances = (summary as any).idleRunningInstancesCount || 0;
    const unusedVolumes = (summary as any).unattachedEBSVolumes || 0;
    
    // Calculate risk score
    riskScore += publicS3Buckets * 10; // High risk
    riskScore += unencryptedS3Buckets * 5; // Medium risk
    riskScore += stoppedInstances * 2; // Low risk
    riskScore += idleInstances * 3; // Medium risk
    riskScore += unusedVolumes * 1; // Low risk
    
    if (riskScore >= 30) return 'critical';
    if (riskScore >= 15) return 'high';
    if (riskScore >= 5) return 'medium';
    return 'low';
  }

  private getFallbackAnalysis(scanResult: ScanResult): AIAnalysisResult {
    const data = scanResult.result || scanResult;
    const summary = data.summary || {};
    
    return {
      summary: 'AI analysis unavailable. Manual review recommended.',
      insights: [
        `Scanned ${(summary as any).totalInstancesScanned || 0} EC2 instances`,
        `Found ${(summary as any).stoppedInstancesCount || 0} stopped instances`,
        `Identified ${(summary as any).s3BucketsCount || 0} S3 buckets`,
        `Detected ${(summary as any).unattachedEBSVolumes || 0} unattached volumes`
      ],
      recommendations: [
        'Review stopped instances for termination',
        'Analyze S3 bucket security settings',
        'Optimize idle running instances',
        'Clean up unattached EBS volumes'
      ],
      securityConcerns: [
        'Review IAM user permissions',
        'Check S3 bucket public access',
        'Verify encryption settings'
      ],
      costOptimizations: [
        'Terminate unused stopped instances',
        'Right-size running instances',
        'Remove unattached storage volumes'
      ],
      riskLevel: this.assessRiskLevel(scanResult)
    };
  }
}

export const aiService = new CloudSniperAIService();
export default CloudSniperAIService;
