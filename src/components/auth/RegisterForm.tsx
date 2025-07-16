import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Building, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onClose }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await register(formData);
      onClose();
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-purple-200">Join CloudSniper to secure your AWS infrastructure</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-3 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <span className="text-red-200 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-purple-200 mb-2">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 text-white placeholder-purple-300/60"
                placeholder="First name"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-purple-200 mb-2">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 text-white placeholder-purple-300/60"
                placeholder="Last name"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 text-white placeholder-purple-300/60"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-purple-200 mb-2">
            Company <span className="text-purple-400">(Optional)</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 text-white placeholder-purple-300/60"
              placeholder="Your company name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 text-white placeholder-purple-300/60"
              placeholder="Create a password (min 6 characters)"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 text-white placeholder-purple-300/60"
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-purple-200 text-sm">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Sign in here
          </button>
        </p>
      </div>

      {/* Browser Storage Info */}
      <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-3">
        <p className="text-slate-300 text-xs font-medium mb-1">🌐 Browser Storage Registration:</p>
        <p className="text-slate-400 text-xs mb-1">• Account created in browser localStorage</p>
        <p className="text-slate-400 text-xs mb-1">• Password securely hashed with bcrypt</p>
        <p className="text-slate-400 text-xs">• Session persisted in localStorage</p>
      </div>
    </div>
  );
};

export default RegisterForm;