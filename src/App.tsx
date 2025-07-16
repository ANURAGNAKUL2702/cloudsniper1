import React, { useState, useRef, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import ScanForm from './components/ScanForm';
import ScanResults from './components/ScanResults';
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
    <div className="min-h-screen theme-bg">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Scan Form */}
          <div className="animate-fade-in">
            <ScanForm onScan={handleScan} isLoading={isLoading} />
          </div>

          {/* Enhanced Loading Animation with Graphics */}
          {isLoading && (
            <div ref={scanningRef} className="animate-slide-up scroll-mt-16 sm:scroll-mt-20">
              <div className="theme-card p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                {/* Animated Particles Background */}
                <div className="scanning-particles">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="scanning-particle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${3 + Math.random() * 2}s`
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10">
                  {/* Main Scanning Graphics */}
                  <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
                    {/* Radar Scanner */}
                    <div className="relative">
                      <div className="scanning-radar">
                        <div className="scanning-waves">
                          <div className="scanning-wave"></div>
                          <div className="scanning-wave"></div>
                          <div className="scanning-wave"></div>
                        </div>
                      </div>
                    </div>

                    {/* Scanning Text */}
                    <div className="text-center">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold theme-text mb-2 flex items-center justify-center space-x-2">
                        <span>🔍 Scanning Your AWS Account</span>
                      </h3>
                      <p className="theme-text-secondary mb-4 text-sm sm:text-base">Analyzing resources and security configurations...</p>
                      
                      {/* Animated Status Messages */}
                      <div className="space-y-2 text-xs sm:text-sm theme-text-secondary">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Connecting to AWS services...</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <span>Scanning EC2 instances across regions...</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                          <span>Analyzing S3 buckets and security policies...</span>
                        </div>
                      </div>
                    </div>

                    {/* Bouncing Dots */}
                    <div className="scanning-dots">
                      <div className="scanning-dot"></div>
                      <div className="scanning-dot"></div>
                      <div className="scanning-dot"></div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-xs sm:max-w-md">
                      <div className="scanning-progress">
                        <div className="scanning-progress-bar"></div>
                      </div>
                      <div className="flex justify-between text-xs theme-text-secondary mt-2 px-2">
                        <span>Initializing...</span>
                        <span className="hidden sm:inline">Scanning in progress</span>
                        <span className="sm:hidden">Progress</span>
                        <span>Almost done</span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-blue-500/20 rounded-xl p-3 sm:p-4 max-w-xs sm:max-w-md">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-blue-200 font-medium text-xs sm:text-sm">Real-time Analysis</span>
                      </div>
                      <p className="text-blue-300 text-xs sm:text-sm">
                        Comprehensive security scan in progress. This may take 30-60 seconds.
                      </p>
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