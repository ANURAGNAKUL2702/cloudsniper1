import React, { useState } from 'react';
import { Play, Download, AlertCircle, Info } from 'lucide-react';

interface ScanFormProps {
  onScan: (roleArn: string) => void;
  isLoading: boolean;
}

const ScanForm: React.FC<ScanFormProps> = ({ onScan, isLoading }) => {
  const [roleArn, setRoleArn] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleArn.trim()) {
      onScan(roleArn.trim());
    }
  };

  const handleDownloadYaml = () => {
    // Use the S3 URL for the IAM YAML template
    const s3YamlUrl = 'https://cloudshield-templates-yourname.s3.ap-south-1.amazonaws.com/iam.yaml';
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = s3YamlUrl;
    link.download = 'iam.yaml';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-inner hover:border-purple-400/40 transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Start Your AWS Scan</h2>
        <p className="text-white/70 text-sm sm:text-base">Enter your IAM role ARN to begin comprehensive security scanning</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="roleArn" className="block text-sm font-semibold theme-text-secondary mb-2">
            IAM Role ARN
          </label>
          <input
            type="text"
            id="roleArn"
            value={roleArn}
            onChange={(e) => setRoleArn(e.target.value)}
            placeholder="arn:aws:iam::123456789012:role/CloudSniperRole"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 theme-input rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 text-xs sm:text-sm font-mono backdrop-blur-sm"
            required
          />
          <p className="mt-2 text-xs sm:text-sm theme-text-secondary flex items-center">
            <Info className="h-3 w-3 mr-1 flex-shrink-0" />
            Ensure the role has ReadOnlyAccess and SecurityAudit permissions
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            type="submit"
            disabled={isLoading || !roleArn.trim()}
            className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="text-sm sm:text-base">Scanning...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span className="text-sm sm:text-base">Start Scan</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadYaml}
            className="w-full sm:w-auto theme-button-secondary px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 active:scale-95"
            title="Download CloudFormation template for IAM role setup"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm sm:text-base">Download CloudFormation</span>
          </button>
        </div>
      </form>

      <div className="mt-6 p-3 sm:p-4 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-xl backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-amber-200 mb-1 text-sm sm:text-base">Quick Setup</p>
            <p className="text-amber-300 text-xs sm:text-sm">
              Download the CloudFormation template to quickly create the required IAM role in your AWS account.
              This ensures proper permissions for comprehensive scanning.
            </p>
            <div className="mt-2 p-2 bg-amber-800/20 rounded border border-amber-500/20 overflow-hidden">
              <p className="text-amber-200 text-xs">
                <strong>CloudFormation Template:</strong> <span className="font-mono text-amber-100 break-all">iam.yaml</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanForm;