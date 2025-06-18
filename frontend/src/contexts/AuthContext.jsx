// frontend/src/contexts/AuthContext.jsx
// Simplified authentication context for admin interface

import React, { createContext, useContext, useState, useEffect } from 'react';
import { cpqApi } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // In a real app, validate token with backend
          const userData = localStorage.getItem('user_data');
          if (userData) {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // For demo purposes, check against hardcoded credentials
      const validCredentials = {
        admin: { username: 'admin', password: 'admin123', role: 'admin' },
        user: { username: 'user', password: 'user123', role: 'user' }
      };

      const userCreds = Object.values(validCredentials).find(
          cred => cred.username === username && cred.password === password
      );

      if (userCreds) {
        // Simulate successful login
        const userData = {
          username: userCreds.username,
          role: userCreds.role,
          id: Math.random().toString(36).substr(2, 9)
        };

        const fakeToken = btoa(JSON.stringify(userData));

        localStorage.setItem('auth_token', fakeToken);
        localStorage.setItem('user_data', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
};

export default AuthContext;