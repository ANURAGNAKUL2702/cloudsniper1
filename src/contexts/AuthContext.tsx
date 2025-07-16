import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, AuthContextType, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authDatabase } from '../lib/database';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app start
  useEffect(() => {
    const checkSession = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Check if user is stored in localStorage
        const storedUserId = localStorage.getItem('cloudsniper_user_id');
        if (storedUserId) {
          const user = await authDatabase.getUserById(storedUserId);
          if (user) {
            dispatch({ type: 'SET_USER', payload: user });
            return;
          } else {
            // Remove invalid user ID from localStorage
            localStorage.removeItem('cloudsniper_user_id');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    checkSession();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const user = await authDatabase.login(credentials.email, credentials.password);
      
      // Store user ID in localStorage for session persistence
      localStorage.setItem('cloudsniper_user_id', user.id);
      
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error: any) {
      let errorMessage = 'Login failed';
      
      if (error.message === 'Invalid email or password') {
        errorMessage = 'Invalid email or password';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (credentials.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const user = await authDatabase.register({
        email: credentials.email,
        password: credentials.password,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        company: credentials.company,
      });

      // Store user ID in localStorage for session persistence
      localStorage.setItem('cloudsniper_user_id', user.id);
      
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      
      if (error.message === 'User already exists with this email') {
        errorMessage = 'An account with this email already exists';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const logout = async () => {
    try {
      // Remove user ID from localStorage
      localStorage.removeItem('cloudsniper_user_id');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      localStorage.removeItem('cloudsniper_user_id');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!state.user) {
      dispatch({ type: 'SET_ERROR', payload: 'No user logged in' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const updatedUser = await authDatabase.updateUser(state.user.id, updates);
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to update profile' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};