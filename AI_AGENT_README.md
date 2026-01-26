# CloudSniper AI Agent Integration - Powered by Groq

## Overview
CloudSniper now includes a comprehensive AI agent system powered by **Groq's ultra-fast inference** that provides intelligent analysis and recommendations for your AWS infrastructure. The AI agent can interpret scan results and answer questions about your AWS resources with lightning-fast responses.

## 🚀 Key Features

### 1. **Automated AI Insights**
- Real-time analysis of scan results
- Risk assessment and scoring
- Detailed security recommendations
- Cost optimization opportunities
- Performance insights

### 2. **Interactive AI Chat**
- Ask questions about your AWS resources
- Get specific recommendations
- Contextual analysis based on scan data
- Multiple expertise areas: security, cost, performance, compliance

### 3. **Floating AI Assistant**
- Always-available chat button
- Persistent across the entire application
- Notification badges when new scan data is available

### 4. **Production-Grade AI Service**
- Groq's Lightning-Fast LLM inference
- Llama-3.1-70B model for expert AWS knowledge
- Structured prompts for AWS expertise
- Fallback responses when API is unavailable
- Rate limiting and error handling

## 🎯 Where to Find the AI Agent

### 1. **Insights Tab** (Main Feature)
- Navigate to scan results → Click "AI Insights" tab
- View automated analysis at the top
- Traditional detailed analysis cards below
- Click "Ask AI" button to open chat

### 2. **Floating Chat Button** (Always Available)
- Purple chat button in bottom-right corner
- Pulse animation indicates scan data available
- Click to open full chat interface

### 3. **AI Insights Component** (Scan Results)
- Automatic analysis when scan completes
- Risk level assessment
- Quick action categories

## 🔧 Setup Instructions

### 1. **Configure Groq API Key**
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file and add your Groq API key
VITE_GROQ_API_KEY=your_actual_groq_api_key_here
```

### 2. **Get Groq API Key**
1. Visit [Groq Console](https://console.groq.com/keys)
2. Create a new API key
3. Copy the key to your `.env` file

### 3. **Restart Development Server**
```bash
npm run dev
```

## 💡 Usage Examples

### Security Analysis
```
"Analyze the security vulnerabilities in my AWS account"
"What are the critical security issues I should address first?"
"Check my S3 buckets for public access risks"
```

### Cost Optimization
```
"Show me the biggest cost savings opportunities"
"How much money can I save by optimizing my EC2 instances?"
"What are my idle resources costing me?"
```

### Performance Tuning
```
"Recommend right-sizing for my underutilized instances"
"How can I improve the performance of my infrastructure?"
"What storage optimizations do you recommend?"
```

### Compliance
```
"Check my infrastructure against SOC 2 requirements"
"What compliance gaps exist in my AWS account?"
"Help me prepare for a security audit"
```

## 🎨 AI Agent Features

### Smart Contextual Analysis
- Understands your specific scan results
- References actual resource IDs and data
- Provides actionable recommendations
- Explains technical concepts clearly

### Multiple Focus Areas
- **Security**: Vulnerabilities, compliance, best practices
- **Cost**: Optimization, savings, right-sizing
- **Performance**: Efficiency, speed, resource utilization
- **Compliance**: Regulatory frameworks, audit preparation

### Interactive Features
- **Quick Actions**: Pre-defined analysis prompts
- **Focus Selector**: Choose analysis emphasis
- **Message History**: Persistent conversation
- **Settings Panel**: API key configuration

### Production Features
- **Error Handling**: Graceful fallbacks when API unavailable
- **Rate Limiting**: Prevents quota exhaustion
- **Security**: API keys stored locally only
- **Performance**: Optimized API calls and caching

## 🔒 Security & Privacy

- **API Keys**: Stored locally in browser session only
- **Data**: Scan results processed client-side
- **Privacy**: No data stored on external servers
- **Secure**: HTTPS-only communication

## 🛠️ Customization

### Modify AI Prompts
Edit `src/lib/ai-agent-prompts.ts` to customize:
- System prompts for different expertise areas
- Quick action prompts
- Conversation templates

### Extend AI Service
Modify `src/lib/ai-agent-service.ts` to:
- Add new AI models
- Implement custom analysis logic
- Add new response formats

### UI Customization
Update components in `src/components/ai/`:
- `AIChat.tsx` - Main chat interface
- `AIInsights.tsx` - Automated insights display
- `FloatingAIChat.tsx` - Floating chat button

## 🚨 Troubleshooting

### AI Not Working
1. Check if Groq API key is configured
2. Verify API key format (starts with `gsk_`)
3. Check browser console for errors
4. Ensure sufficient API quota

### Chat Not Opening
1. Check for JavaScript errors
2. Verify all AI components are imported
3. Ensure proper TypeScript types

### Missing Analysis
1. Verify scan data is present
2. Check network connectivity
3. Verify API key permissions

## 📊 Performance Tips

- **API Calls**: Limited to prevent quota issues
- **Caching**: Analysis results cached temporarily
- **Optimization**: Efficient prompt engineering
- **Fallbacks**: Graceful degradation when AI unavailable

## 🔮 Future Enhancements

- Voice interface for AI chat
- Custom AI model fine-tuning
- Integration with AWS CLI
- Automated remediation scripts
- Real-time monitoring integration

## 📝 Notes

- The AI agent is designed specifically for AWS infrastructure analysis
- All recommendations are based on AWS best practices
- The agent has extensive knowledge of AWS services and security frameworks
- Responses are tailored to your specific infrastructure configuration