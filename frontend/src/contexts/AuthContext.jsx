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

    default:
      return state;
  }
}

// Demo users for development
const DEMO_USERS = {
  admin: {
    id: 'admin_001',
    email: 'admin@cpq.com',
    password: 'admin123',
    name: 'CPQ Administrator',
    role: 'admin',
    avatar: null,
    permissions: ['model_builder', 'configurations', 'users', 'analytics'],
  },
  user: {
    id: 'user_001',
    email: 'user@cpq.com',
    password: 'user123',
    name: 'CPQ User',
    role: 'user',
    avatar: null,
    permissions: ['configurations'],
  },
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
          const user = JSON.parse(userData);
          
          // Validate token (in real app, you'd verify with server)
          if (isTokenValid(token)) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: { user, token },
            });
          } else {
            // Token expired, clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
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

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      // Demo authentication - replace with real API call
      const demoUser = Object.values(DEMO_USERS).find(
        user => user.email === email && user.password === password
      );

      if (demoUser) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const token = generateDemoToken(demoUser);
        const { password: _, ...userWithoutPassword } = demoUser;

        // Store in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(userWithoutPassword));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: userWithoutPassword,
            token,
          },
        });

        toast.success(`Welcome back, ${userWithoutPassword.name}!`);
        return { success: true };
      } else {
        throw new Error('Invalid email or password');
      }

      // Real API implementation (commented for demo)
      /*
      const response = await authApi.login({ email, password });
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response,
      });

      toast.success(`Welcome back, ${response.user.name}!`);
      return { success: true };
      */
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
      // Call logout API (optional)
      // await authApi.logout();
      
      // Clear storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken();
      
      localStorage.setItem('auth_token', response.token);
      
      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN,
        payload: { token: response.token },
      });

      return response.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout(); // Force logout if refresh fails
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = { ...state.user, ...profileData };
      
      // Update localStorage
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: profileData,
      });

      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!state.user) return false;
    if (state.user.role === 'admin') return true;
    return state.user.permissions?.includes(permission) || false;
  };

  // Check if user has role
  const hasRole = (role) => {
    if (!state.user) return false;
    return state.user.role === role;
  };

  // Context value
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

// Utility functions
function generateDemoToken(user) {
  // Demo token generation - replace with real JWT
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  };
  
  return btoa(JSON.stringify(payload));
}

function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token));
    return payload.exp > Date.now();
  } catch (error) {
    return false;
  }
}

// Export demo credentials for development
export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@cpq.com', password: 'admin123' },
  user: { email: 'user@cpq.com', password: 'user123' },
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

export default AuthContext;
