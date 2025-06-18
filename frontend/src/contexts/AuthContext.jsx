// frontend/src/contexts/AuthContext.jsx
// Authentication context with proper error handling

import React, { createContext, useContext, useState, useEffect } from 'react';

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
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
            console.log('✅ Restored authentication for user:', parsedUser.username);
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
            // Clear invalid data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        } else {
          console.log('ℹ️ No stored authentication found');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      console.log('🔐 Attempting login for user:', username);

      // Demo authentication - use actual backend in production
      const validCredentials = {
        'admin': { username: 'admin', password: 'admin123', role: 'admin' },
        'user': { username: 'user', password: 'user123', role: 'user' },
        'demo': { username: 'demo', password: 'demo', role: 'admin' }
      };

      const userCreds = validCredentials[username.toLowerCase()];

      if (userCreds && userCreds.password === password) {
        // Simulate successful login
        const userData = {
          username: userCreds.username,
          role: userCreds.role,
          id: `user_${Date.now()}`,
          login_time: new Date().toISOString()
        };

        // Create a demo token
        const fakeToken = btoa(JSON.stringify({
          user_id: userData.id,
          username: userData.username,
          role: userData.role,
          exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));

        // Store authentication data
        localStorage.setItem('auth_token', fakeToken);
        localStorage.setItem('user_data', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        console.log('✅ Login successful for user:', userData.username);
        return { success: true, user: userData };
      } else {
        console.warn('❌ Invalid credentials for user:', username);
        return {
          success: false,
          error: 'Invalid username or password. Try: admin/admin123'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed due to an error. Please try again.'
      };
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user:', user?.username);

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