import bcrypt from 'bcryptjs';
import { User } from '../types/auth';

// Browser-compatible storage using localStorage
const STORAGE_KEYS = {
  USERS: 'cloudsniper_users',
  CURRENT_USER: 'cloudsniper_current_user'
};

// Helper function to generate user ID
const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Helper functions for localStorage operations
const getStoredUsers = (): Record<string, any> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
    return {};
  }
};

const saveStoredUsers = (users: Record<string, any>) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
    throw new Error('Failed to save user data');
  }
};

const findUserByEmail = (email: string): any | null => {
  const users = getStoredUsers();
  return Object.values(users).find((user: any) => user.email === email) || null;
};

const findUserById = (id: string): any | null => {
  const users = getStoredUsers();
  return users[id] || null;
};

// Helper function to convert stored user to User object
const storageUserToUser = (user: any): User => {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    company: user.company,
    role: user.role || 'User',
    avatar: user.avatar,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    preferences: user.preferences || {
      theme: 'dark',
      notifications: true,
      autoScan: false
    },
  };
};

export const authDatabase = {
  // Register a new user
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
  }): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = findUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Generate user ID and avatar
      const userId = generateUserId();
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`;

      // Create user object
      const newUser = {
        id: userId,
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        company: userData.company || null,
        role: 'User',
        avatar: avatarUrl,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        preferences: {
          theme: 'dark',
          notifications: true,
          autoScan: false,
        }
      };

      // Save to localStorage
      const users = getStoredUsers();
      users[userId] = newUser;
      saveStoredUsers(users);

      // Return user object (without password)
      return storageUserToUser(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  async login(email: string, password: string): Promise<User> {
    try {
      // Get user by email
      const user = findUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      const users = getStoredUsers();
      users[user.id].lastLogin = new Date().toISOString();
      saveStoredUsers(users);

      // Return user object (without password)
      return storageUserToUser(users[user.id]);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const user = findUserById(id);
      return user ? storageUserToUser(user) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // Update user profile
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const users = getStoredUsers();
      const user = users[id];
      
      if (!user) {
        throw new Error('User not found');
      }

      // Update user data
      const updatedUser = {
        ...user,
        firstName: updates.firstName || user.firstName,
        lastName: updates.lastName || user.lastName,
        company: updates.company !== undefined ? updates.company : user.company,
        role: updates.role || user.role,
        preferences: updates.preferences || user.preferences,
        lastLogin: new Date().toISOString(),
      };

      users[id] = updatedUser;
      saveStoredUsers(users);

      // Return updated user
      return storageUserToUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // Get all users (for admin purposes)
  async getAllUsers(): Promise<User[]> {
    try {
      const users = getStoredUsers();
      return Object.values(users)
        .map(storageUserToUser)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  },

  // Delete user
  async deleteUser(id: string): Promise<boolean> {
    try {
      const users = getStoredUsers();
      if (users[id]) {
        delete users[id];
        saveStoredUsers(users);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  },

  // Clear all data (for development/testing)
  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (error) {
      console.error('Clear data error:', error);
    }
  }
};