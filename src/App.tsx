import { useState, useRef, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import ScanForm from './components/ScanForm';
import ScanResults from './components/ScanResults';
import FloatingAIChat from './components/ai/FloatingAIChat';
import { ScanResult } from './types/scanner';

function AppContent() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const scanningRef = useRef<HTMLDivElement>(null);

  const handleScan = async (roleArn: string) => {
    setIsLoading(true);
    setError(null);
    setScanResult(null);

    // Scroll to scanning graphics immediately when scan starts
    setTimeout(() => {
      if (scanningRef.current) {
        scanningRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100);

    try {
      console.log('Starting scan with roleArn:', roleArn);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // Increased to 2 minutes

      // Use direct Lambda URL for production, proxy for development
      const apiUrl = import.meta.env.DEV 
        ? '/api' 
        : 'https://tczswboifjsccnvhzq2vng2xm40kmrfb.lambda-url.ap-south-1.on.aws/';

      console.log('Using API URL:', apiUrl);
      console.log('Environment mode:', import.meta.env.DEV ? 'development' : 'production');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          roleArn: roleArn,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      if (!response.ok) {
        console.error('API Error Response:', responseText);
        
        // Try to parse error response as JSON
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `HTTP ${response.status}: ${responseText || 'Unknown error'}`;
          }
          
          // Add additional context for common errors
          if (errorData.errorType === 'AWSClientError' && errorData.errorCode) {
            if (errorData.errorCode === 'AccessDenied') {
              errorMessage += '\n\n🔧 This usually means:\n• The Lambda execution role cannot assume the provided IAM role\n• The IAM role ARN is incorrect\n• The IAM role lacks necessary permissions';
            } else if (errorData.errorCode === 'InvalidUserID.NotFound') {
              errorMessage += '\n\n🔧 This usually means:\n• The IAM role ARN format is incorrect\n• The AWS account ID in the ARN is wrong\n• The role name is misspelled';
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response as JSON:', parseError);
          errorMessage = `HTTP ${response.status}: ${responseText || 'Empty response body'}`;
        }
        
        throw new Error(errorMessage);
      }

      let data: ScanResult;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text that failed to parse:', responseText);
        throw new Error(`Invalid JSON response from API. Response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
      }
      
      // Handle different response structures
      if (data.status === 'success' || data.status === 'test-mode') {
        console.log('Setting scan result:', data);
        setScanResult(data);
      } else if (data.status === 'error') {
        throw new Error('Scan failed: ' + (data.message || 'Unknown error'));
      } else {
        console.warn('Unexpected response structure:', data);
        // Try to handle the response anyway
        setScanResult(data);
      }
    } catch (err) {
      let errorMessage = 'An unexpected error occurred';
      
      if (err instanceof Error) {
        console.error('Scan error details:', err);
        
        if (err.name === 'AbortError' || err.message.includes('aborted') || err.message.includes('signal is aborted')) {
          errorMessage = 'Request timed out. The scan is taking longer than expected. This could be due to:\n• Large AWS account with many resources\n• API experiencing high load\n• Network connectivity issues\n\nPlease try again or contact support if the issue persists.';
        } else if (err.message === 'Failed to fetch') {
          errorMessage = `Unable to connect to the API. This could be due to:\n• CORS (Cross-Origin) policy blocking the request\n• AWS Lambda function being unavailable\n• Network connectivity issues\n• Firewall or security restrictions\n\n🔧 Technical Details:\n• Environment: ${import.meta.env.DEV ? 'Development' : 'Production'}\n• API URL: ${import.meta.env.DEV ? '/api (proxied)' : 'Direct Lambda URL'}\n\n💡 If this is a CORS issue, the AWS Lambda function needs to include proper CORS headers in its response.`;
        } else if (err.message.includes('CORS')) {
          errorMessage = `CORS (Cross-Origin Resource Sharing) Error:\n\nThe AWS Lambda function is not configured to allow requests from this domain. To fix this:\n\n1. Update your Lambda function to include these headers in the response:\n   • Access-Control-Allow-Origin: *\n   • Access-Control-Allow-Methods: POST, OPTIONS\n   • Access-Control-Allow-Headers: Content-Type\n\n2. Or configure the Lambda function URL to allow CORS\n\n3. Test the Lambda function directly to ensure it's working`;
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Final scan error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to results when scan completes
  useEffect(() => {
    if (scanResult && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 300);
    }
  }, [scanResult]);

  // Debug logging
  console.log('Current state:', { scanResult, isLoading, error });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Pure Black Background Overlay */}
      <div className="fixed inset-0 bg-black -z-10"></div>
      
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Scan Form */}
          <div className="animate-fade-in">
            <ScanForm onScan={handleScan} isLoading={isLoading} />
          </div>

          {/* CYBERPUNK MATRIX SCANNING INTERFACE */}
          {isLoading && (
            <div ref={scanningRef} className="animate-slide-up scroll-mt-16 sm:scroll-mt-20">
              <div className="cyberpunk-scanner-container relative overflow-hidden">
                
                {/* Matrix Data Streams */}
                <div className="matrix-data-stream"></div>
                <div className="matrix-data-stream"></div>
                <div className="matrix-data-stream"></div>
                <div className="matrix-data-stream"></div>
                
                {/* Matrix Rain Background */}
                <div className="matrix-rain-container">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="matrix-column"
                      style={{
                        left: `${i * 5}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${3 + Math.random() * 2}s`
                      }}
                    >
                      {[...Array(15)].map((_, j) => (
                        <span
                          key={j}
                          className="matrix-char"
                          style={{
                            animationDelay: `${Math.random() * 1}s`
                          }}
                        >
                          {Math.random() > 0.5 ? '1' : '0'}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>



                {/* Main Scanner Interface */}
                <div className="scanner-interface">
                  
                  {/* Holographic Title */}
                  <div className="holo-title-container">
                    <h2 className="holo-title">
                      <span className="holo-word">CLOUDSNIPER</span>
                      <span className="holo-word">AWS</span>
                      <span className="holo-word">SCANNER</span>
                    </h2>
                    <div className="scanning-beam"></div>
                    <div className="holo-subtitle">DEEP INFRASTRUCTURE ANALYSIS IN PROGRESS</div>
                  </div>

                  {/* 3D Radar Scanner */}
                  <div className="radar-scanner">
                    <div className="radar-screen">
                      <div className="radar-rings">
                        <div className="radar-ring"></div>
                        <div className="radar-ring"></div>
                        <div className="radar-ring"></div>
                      </div>
                      <div className="radar-sweep"></div>
                      <div className="radar-crosshair-h"></div>
                      <div className="radar-crosshair-v"></div>
                      
                      {/* AWS Service Blips */}
                      <div className="service-blip blip-ec2" style={{ top: '20%', left: '70%' }}>EC2</div>
                      <div className="service-blip blip-s3" style={{ top: '60%', left: '30%' }}>S3</div>
                      <div className="service-blip blip-iam" style={{ top: '80%', left: '80%' }}>IAM</div>
                      <div className="service-blip blip-vpc" style={{ top: '30%', left: '20%' }}>VPC</div>
                    </div>
                  </div>

                  {/* Orbital Scanner Rings */}
                  <div className="orbital-scanner">
                    <div className="orbital-core"></div>
                  </div>

                  {/* AWS Services Orbit */}
                  <div className="services-orbit">
                    <div className="orbit-service orbit-ec2" style={{ '--angle': '0deg' } as any}>
                      <span>🖥️</span>
                    </div>
                    <div className="orbit-service orbit-s3" style={{ '--angle': '60deg' } as any}>
                      <span>🗄️</span>
                    </div>
                    <div className="orbit-service orbit-iam" style={{ '--angle': '120deg' } as any}>
                      <span>👤</span>
                    </div>
                    <div className="orbit-service orbit-lambda" style={{ '--angle': '180deg' } as any}>
                      <span>⚡</span>
                    </div>
                    <div className="orbit-service orbit-vpc" style={{ '--angle': '240deg' } as any}>
                      <span>🌐</span>
                    </div>
                    <div className="orbit-service orbit-watch" style={{ '--angle': '300deg' } as any}>
                      <span>📊</span>
                    </div>
                  </div>

                </div>

                {/* Cyber Terminal */}
                <div className="cyber-terminal">
                  <div className="terminal-header">
                    <div className="terminal-controls">
                      <span className="control-btn close"></span>
                      <span className="control-btn minimize"></span>
                      <span className="control-btn maximize"></span>
                    </div>
                    <div className="terminal-title">CloudSniper@AWS:~$</div>
                  </div>
                  <div className="terminal-body">
                    <div className="terminal-line">
                      <span className="prompt">root@aws-scanner:~# </span>
                      <span className="command typing-animation">python3 deep_scan.py --target=infrastructure</span>
                    </div>
                    <div className="terminal-line">
                      <span className="output">Initializing AWS security scanners...</span>
                      <span className="spinner">⠋</span>
                    </div>
                    <div className="terminal-line">
                      <span className="output success">✓ Connected to AWS API</span>
                    </div>
                    <div className="terminal-line">
                      <span className="output">Scanning 16 regions...</span>
                      <span className="cursor">_</span>
                    </div>
                  </div>
                </div>

                {/* AWS Analysis Progress */}
                <div className="aws-analysis-section">
                  <div className="progress-title">AWS SECURITY ANALYSIS IN PROGRESS</div>
                  <div className="aws-progress-bar">
                    <div className="progress-track">
                      <div className="progress-fill"></div>
                      <div className="progress-glow-sweep"></div>
                    </div>
                    <div className="progress-particles">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="progress-particle"
                          style={{
                            left: `${i * 12.5}%`,
                            animationDelay: `${i * 0.2}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="progress-percentage">67%</div>
                </div>

                {/* Live Status Panel */}
                <div className="status-panel">
                  <div className="panel-header">
                    <span className="panel-title">SYSTEM STATUS</span>
                    <span className="panel-indicator active"></span>
                  </div>
                  <div className="status-metrics">
                    <div className="metric-row">
                      <span className="metric-label">REGIONS SCANNING</span>
                      <span className="metric-value counting">16</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">SERVICES ANALYZING</span>
                      <span className="metric-value counting">25+</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">SCAN STATUS</span>
                      <span className="metric-value success">ACTIVE</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="animate-slide-up">
              <div className="bg-gradient-to-r from-red-900/90 to-pink-900/90 backdrop-blur-sm border border-red-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-500/20 p-2 rounded-full flex-shrink-0">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-200 text-sm sm:text-base">Scan Failed</h3>
                    <div className="text-red-300 text-xs sm:text-sm mt-1 whitespace-pre-line break-words">{error}</div>
                    
                    {/* Debugging Information */}
                    <div className="mt-4 p-2 sm:p-3 bg-red-800/30 rounded-lg border border-red-500/20">
                      <p className="text-red-200 text-xs font-medium mb-2">Debugging Information:</p>
                      <div className="text-red-300 text-xs space-y-1">
                        <p>• Environment: {import.meta.env.DEV ? 'Development (using proxy)' : 'Production (direct Lambda)'}</p>
                        <p className="break-all">• API URL: {import.meta.env.DEV ? '/api' : 'https://tczswboifjsccnvhzq2vng2xm40kmrfb.lambda-url.ap-south-1.on.aws/'}</p>
                        <p>• Check browser console for detailed logs</p>
                        <p>• Check AWS CloudWatch logs for Lambda function errors</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-2 sm:p-3 bg-red-800/30 rounded-lg border border-red-500/20">
                      <p className="text-red-200 text-xs font-medium mb-2">Quick Test:</p>
                      <div className="text-red-300 text-xs space-y-1">
                        <p>• Try opening this URL directly in a new tab:</p>
                        <a 
                          href="https://tczswboifjsccnvhzq2vng2xm40kmrfb.lambda-url.ap-south-1.on.aws/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-200 underline break-all text-xs"
                        >
                          https://tczswboifjsccnvhzq2vng2xm40kmrfb.lambda-url.ap-south-1.on.aws/
                        </a>
                        <p>• If it shows a CORS error, the Lambda function needs CORS configuration</p>
                        <p>• If it shows "Method not allowed", try a POST request with a tool like Postman</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scan Results */}
          {scanResult && (
            <div ref={resultsRef} className="animate-slide-up">
              <ScanResults scanResult={scanResult} />
            </div>
          )}

          {/* Getting Started Guide */}
          {!scanResult && !isLoading && !error && (
            <div className="animate-fade-in-delay">
              <div className="theme-card p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold theme-text mb-4 sm:mb-6">🚀 Getting Started with CloudSniper</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
                      <span className="text-white font-bold text-base sm:text-lg">1</span>
                    </div>
                    <h3 className="font-semibold theme-text mb-2 text-sm sm:text-base">Create Account or Sign In</h3>
                    <p className="theme-text-secondary text-xs sm:text-sm">Use the Sign Up or Sign In buttons in the header to create your account</p>
                  </div>
                  <div className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                      <span className="text-white font-bold text-base sm:text-lg">2</span>
                    </div>
                    <h3 className="font-semibold theme-text mb-2 text-sm sm:text-base">Download & Deploy IAM Role</h3>
                    <p className="theme-text-secondary text-xs sm:text-sm">Download the CloudFormation YAML template and create the required IAM role in AWS</p>
                  </div>
                  <div className="text-center group hover:scale-105 transition-transform duration-300 sm:col-span-2 lg:col-span-1">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all duration-300 group-hover:scale-110">
                      <span className="text-white font-bold text-base sm:text-lg">3</span>
                    </div>
                    <h3 className="font-semibold theme-text mb-2 text-sm sm:text-base">Start Scanning</h3>
                    <p className="theme-text-secondary text-xs sm:text-sm">Paste your IAM role ARN and begin comprehensive AWS security scanning</p>
                  </div>
                </div>
                
                {/* Step-by-Step Instructions */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl border border-indigo-500/30">
                  <h3 className="text-base sm:text-lg font-semibold text-indigo-200 mb-3 flex items-center space-x-2">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Quick Setup Guide</span>
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm text-indigo-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-400 text-xs font-bold">1</span>
                      </div>
                      <p><strong>Account Setup:</strong> Click "Sign Up" in the header to create your account. Your data is stored securely in your browser's localStorage.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-400 text-xs font-bold">2</span>
                      </div>
                      <p><strong>AWS Setup:</strong> Download the CloudFormation YAML template and deploy it in your AWS account to create the required IAM role.</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-400 text-xs font-bold">3</span>
                      </div>
                      <p><strong>Start Scanning:</strong> Copy the IAM role ARN from CloudFormation outputs and paste it in the scan form above to begin analyzing your AWS infrastructure.</p>
                    </div>
                  </div>
                </div>

                {/* Features Highlight */}
                <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 theme-card-secondary">
                    <h4 className="font-semibold theme-text mb-2 text-sm sm:text-base flex items-center space-x-2">
                      <svg className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Security Features</span>
                    </h4>
                    <ul className="text-xs sm:text-sm theme-text-secondary space-y-1">
                      <li>• Comprehensive security analysis</li>
                      <li>• Secure password encryption</li>
                      <li>• User profile management</li>
                      <li>• Session persistence</li>
                    </ul>
                  </div>
                  <div className="p-3 sm:p-4 theme-card-secondary">
                    <h4 className="font-semibold theme-text mb-2 text-sm sm:text-base flex items-center space-x-2">
                      <svg className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>AWS Scanning Features</span>
                    </h4>
                    <ul className="text-xs sm:text-sm theme-text-secondary space-y-1">
                      <li>• Cost optimization insights</li>
                      <li>• Interactive charts & visualizations</li>
                      <li>• AI-powered recommendations</li>
                      <li>• Real-time resource monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating AI Chat - Always Available */}
      <FloatingAIChat scanResult={scanResult} />

      {/* Footer */}
      <footer className="theme-footer py-6 mt-12 border-t theme-border">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="theme-text-secondary text-sm sm:text-base">
            CloudSniper - Secure, Fast, and Comprehensive AWS Account Scanning
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;