import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-800/95 to-purple-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-300 hover:text-white transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Content */}
        <div className="p-8">
          {mode === 'login' ? (
            <LoginForm 
              onSwitchToRegister={() => setMode('register')}
              onClose={onClose}
            />
          ) : (
            <RegisterForm 
              onSwitchToLogin={() => setMode('login')}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;