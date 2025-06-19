// frontend/src/contexts/AuthContext.jsx
// Authentication context with proper error handling

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

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
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          try {
            // For development, trust stored credentials without backend validation
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (parseError) {
            // Clear invalid data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        // Clear potentially corrupted data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      
      // Temporary development authentication - accepts any email/password
      if (!email || !password) {
        return {
          success: false,
          error: 'Please enter both email and password'
        };
      }

      // Create mock user data based on email
      const userData = {
        id: `user_${Date.now()}`,
        email: email,
        username: email.split('@')[0], // Use part before @ as username
        role: email.includes('admin') ? 'admin' : 'user',
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        login_time: new Date().toISOString()
      };

      // Create a development token
      const devToken = btoa(JSON.stringify({
        user_id: userData.id,
        email: userData.email,
        role: userData.role,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }));

      // Store authentication data
      localStorage.setItem('auth_token', devToken);
      localStorage.setItem('user_data', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: 'Login failed due to an error. Please try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    // Reset state
    setUser(null);
    setIsAuthenticated(false);

    // Redirect to login
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