// frontend/src/contexts/AuthContext.jsx - Updated for Real JWT Authentication
// Integrates with the CPQ backend JWT authentication system

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { toast } from 'react-hot-toast';

// Auth Context
const AuthContext = createContext(null);

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_LOADING: 'SET_LOADING',
  VALIDATE_TOKEN_SUCCESS: 'VALIDATE_TOKEN_SUCCESS',
  VALIDATE_TOKEN_FAILURE: 'VALIDATE_TOKEN_FAILURE',
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.VALIDATE_TOKEN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };

    case AUTH_ACTIONS.VALIDATE_TOKEN_FAILURE:
      return {
        ...initialState,
        isLoading: false,
      };

    default:
      return state;
  }
}

// Demo credentials that match the backend
export const DEMO_CREDENTIALS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin' },
  user: { username: 'user', password: 'user123', role: 'user' },
  demo: { username: 'demo', password: 'demo123', role: 'demo' },
  test: { username: 'test', password: 'test123', role: 'tester' },
};

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
          try {
            // Validate token with backend
            const response = await authApi.validateToken(token);

            if (response.success && response.data.valid) {
              const user = JSON.parse(userData);
              dispatch({
                type: AUTH_ACTIONS.VALIDATE_TOKEN_SUCCESS,
                payload: { user },
              });
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              dispatch({ type: AUTH_ACTIONS.VALIDATE_TOKEN_FAILURE });
            }
          } catch (error) {
            // Token validation failed, clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            dispatch({ type: AUTH_ACTIONS.VALIDATE_TOKEN_FAILURE });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function - Updated for real JWT authentication
  const login = async (username, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authApi.login({ username, password });

      if (response.success && response.data.token) {
        const { token, user } = response.data;

        // Store token and user data
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });

        toast.success(`Welcome back, ${user.username}! (Role: ${user.role})`);
        return { success: true };
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';

      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if logout API fails, clear local state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      console.error('Logout error:', error);
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken();

      if (response.success && response.data.token) {
        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN,
          payload: { token: response.data.token },
        });
        return response.data.token;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      // In a real app, you'd call an API to update profile
      // For now, just update local state
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: profileData,
      });

      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
      const updatedUser = { ...currentUser, ...profileData };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));

      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!state.user) return false;

    // Role-based permissions
    const rolePermissions = {
      admin: ['model_builder', 'configurations', 'users', 'analytics', 'system'],
      user: ['configurations', 'pricing'],
      demo: ['configurations'],
      tester: ['configurations', 'testing'],
    };

    const userPermissions = rolePermissions[state.user.role] || [];
    return userPermissions.includes(permission);
  };

  // Check if user has role
  const hasRole = (role) => {
    if (!state.user) return false;
    return state.user.role === role;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!state.user || !state.user.username) return 'U';
    return state.user.username.substring(0, 2).toUpperCase();
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!state.user) return 'Unknown User';
    return `${state.user.username} (${state.user.role})`;
  };

  // Check if token is close to expiring (within 5 minutes)
  const isTokenExpiring = () => {
    if (!state.token) return false;

    try {
      // In a real app, you'd decode the JWT to check expiration
      // For demo purposes, assume tokens expire in 24 hours
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const loginTime = userData.loginTime || Date.now();
      const expirationTime = loginTime + (24 * 60 * 60 * 1000); // 24 hours
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes

      return (expirationTime - Date.now()) < fiveMinutes;
    } catch (error) {
      return false;
    }
  };

  // Auto-refresh token if expiring
  useEffect(() => {
    const checkTokenExpiration = async () => {
      if (state.isAuthenticated && isTokenExpiring()) {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Auto token refresh failed:', error);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.token]);

  const value = {
    // State
    ...state,

    // Actions
    login,
    logout,
    refreshToken,
    updateProfile,

    // Utilities
    hasPermission,
    hasRole,
    getUserInitials,
    getUserDisplayName,
    isTokenExpiring,
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Higher-order component for route protection
export const withAuth = (Component, requiredRole = null) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Component {...props} />;
  };
};

// Protected Route wrapper component
export const ProtectedRoute = ({ children, requiredRole = null, requiredPermission = null }) => {
  const { isAuthenticated, user, isLoading, hasRole, hasPermission } = useAuth();

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    toast.error('Access denied: Insufficient role permissions');
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    toast.error('Access denied: Insufficient permissions');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthContext;