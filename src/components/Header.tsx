import React, { useState, useEffect } from 'react';
import { Shield, Zap, LogIn, UserPlus, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AuthModal from './auth/AuthModal';
import UserProfile from './profile/UserProfile';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showProfile, setShowProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleViewProfile = () => {
    setShowProfile(true);
    setShowUserMenu(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        const target = event.target as Element;
        if (!target.closest('[data-user-menu]')) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <>
      <header className="bg-black/90 backdrop-blur-xl border-b border-white/10 relative z-40 shadow-2xl">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              <div className="relative overflow-visible">
                {/* Animated particles */}
                <div className="absolute inset-0 animate-pulse opacity-20">
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-0 left-0 w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute -top-2 left-2 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                </div>
                
                {/* Main shield container */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 sm:p-3 rounded-xl backdrop-blur-sm shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110 relative shield-container">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
                  
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white relative z-10" />
                  
                  {/* Scanning lines effect */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent animate-scan-line"></div>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  CloudSniper
                </h1>
                <p className="theme-text-secondary text-xs sm:text-sm hidden sm:block">AWS Security & Optimization Scanner</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-1 sm:space-x-2 theme-button px-2 sm:px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>

              {/* Fast & Secure Badge */}
              <div className="hidden lg:flex items-center space-x-2 theme-badge px-4 py-2 rounded-full backdrop-blur-sm border transition-all duration-300">
                <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
                <span className="text-sm font-medium">Fast & Secure</span>
              </div>

              {/* Authentication Section */}
              {!isAuthenticated ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="flex items-center space-x-1 sm:space-x-2 theme-button-secondary px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-sm sm:text-base">Sign In</span>
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="flex items-center space-x-1 sm:space-x-2 theme-button-primary px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-sm sm:text-base">Sign Up</span>
                  </button>
                </div>
              ) : (
                <div className="relative" data-user-menu>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 sm:space-x-3 theme-user-button px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm max-w-xs border"
                  >
                    <img
                      src={user?.avatar}
                      alt="Profile"
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-purple-400/50 flex-shrink-0"
                    />
                    <div className="text-left hidden md:block min-w-0 flex-1">
                      <p className="theme-text font-medium text-xs sm:text-sm truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="theme-text-secondary text-xs truncate">{user?.email}</p>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-64 sm:w-72 theme-dropdown rounded-xl shadow-2xl border"
                      style={{ zIndex: 1000 }}
                    >
                      <div className="p-4 border-b theme-border">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <img
                            src={user?.avatar}
                            alt="Profile"
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-purple-400/50 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="theme-text font-semibold text-sm sm:text-base truncate">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="theme-text-secondary text-xs sm:text-sm truncate">{user?.email}</p>
                            <p className="theme-text-secondary text-xs">{user?.role}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button
                          onClick={handleViewProfile}
                          className="w-full flex items-center space-x-2 sm:space-x-3 px-3 py-2 text-left theme-text-secondary hover:theme-text theme-hover rounded-lg transition-all duration-200"
                        >
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-sm sm:text-base">View Profile</span>
                        </button>
                        
                        <button
                          onClick={handleViewProfile}
                          className="w-full flex items-center space-x-2 sm:space-x-3 px-3 py-2 text-left theme-text-secondary hover:theme-text theme-hover rounded-lg transition-all duration-200"
                        >
                          <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-sm sm:text-base">Settings</span>
                        </button>
                        
                        <hr className="my-2 theme-border" />
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 sm:space-x-3 px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-all duration-200"
                        >
                          <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-sm sm:text-base">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      {/* User Profile Modal */}
      <UserProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
};

export default Header;