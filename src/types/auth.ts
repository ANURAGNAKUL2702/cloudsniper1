export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  role?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    autoScan: boolean;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  company?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}