// frontend/src/services/api.js - Updated for Real JWT Authentication
// Integrates with the new CPQ backend authentication endpoints

import axios from 'axios';
import { toast } from 'react-hot-toast';

// Get backend URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for tracking
      config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Performance tracking
      config.metadata = { startTime: Date.now() };
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// Response interceptor for error handling and performance tracking
apiClient.interceptors.response.use(
    (response) => {
      // Track performance
      const duration = Date.now() - response.config.metadata.startTime;
      performanceMonitor.trackApiCall(response.config.url, duration);

      return response;
    },
    async (error) => {
      const { response, request, config } = error;

      if (response) {
        const { status, data } = response;

        // Handle authentication errors
        if (status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');

          // Only show error if not on login page
          if (!window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }

          const apiError = new Error('Authentication required');
          apiError.status = status;
          apiError.code = 'UNAUTHORIZED';
          return Promise.reject(apiError);
        }

        // Handle other HTTP errors
        switch (status) {
          case 400:
            toast.error(data.error?.message || 'Invalid request');
            break;
          case 403:
            toast.error('Access denied');
            break;
          case 404:
            toast.error('Resource not found');
            break;
          case 422:
            // Validation errors - don't show toast, let component handle
            break;
          case 429:
            toast.error('Too many requests. Please try again later.');
            break;
          case 500:
            toast.error('Server error. Please try again later.');
            break;
          default:
            toast.error(data.error?.message || 'An error occurred');
        }

        // Return structured error
        const apiError = new Error(data.error?.message || 'API Error');
        apiError.status = status;
        apiError.code = data.error?.code;
        apiError.details = data.error?.details;
        return Promise.reject(apiError);
      } else if (request) {
        // Network error
        toast.error('Network error. Please check your connection.');
        return Promise.reject(new Error('Network error'));
      } else {
        // Other errors
        toast.error('An unexpected error occurred');
        return Promise.reject(error);
      }
    }
);

// Authentication API - Updated for real JWT endpoints
export const authApi = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);

      // Store token and user data
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      // Re-throw with additional context
      throw error;
    }
  },

  validateToken: async (token) => {
    try {
      const response = await apiClient.post('/auth/validate', { token });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await apiClient.post('/auth/refresh');

      // Update stored token
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('auth_token', response.data.data.token);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserInfo: async () => {
    try {
      const response = await apiClient.get('/auth/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      // Clear local storage first
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');

      // Optional: call logout endpoint if you add one
      // const response = await apiClient.post('/auth/logout');
      // return response.data;

      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      throw error;
    }
  },
};

// CPQ Configuration API
export const cpqApi = {
  // Models
  getModels: async () => {
    const response = await apiClient.get('/models');
    return response.data;
  },

  getModel: async (modelId) => {
    const response = await apiClient.get(`/models/${modelId}`);
    return response.data;
  },

  createModel: async (modelData) => {
    const response = await apiClient.post('/models', modelData);
    return response.data;
  },

  updateModel: async (modelId, modelData) => {
    const response = await apiClient.put(`/models/${modelId}`, modelData);
    return response.data;
  },

  deleteModel: async (modelId) => {
    const response = await apiClient.delete(`/models/${modelId}`);
    return response.data;
  },

  validateModel: async (modelId) => {
    const response = await apiClient.post(`/models/${modelId}/validate`);
    return response.data;
  },

  // Configurations
  createConfiguration: async (configData) => {
    const response = await apiClient.post('/configurations', configData);
    return response.data;
  },

  getConfiguration: async (configId) => {
    const response = await apiClient.get(`/configurations/${configId}`);
    return response.data;
  },

  updateConfiguration: async (configId, configData) => {
    const response = await apiClient.put(`/configurations/${configId}`, configData);
    return response.data;
  },

  deleteConfiguration: async (configId) => {
    const response = await apiClient.delete(`/configurations/${configId}`);
    return response.data;
  },

  validateConfiguration: async (configId, modelId) => {
    const response = await apiClient.post(`/configurations/${configId}/validate?model_id=${modelId}`);
    return response.data;
  },

  calculatePrice: async (configId, modelId) => {
    const response = await apiClient.post(`/configurations/${configId}/price?model_id=${modelId}`);
    return response.data;
  },
};

// Model Builder API
export const modelBuilderApi = {
  validateModel: async (modelId) => {
    const response = await apiClient.post(`/models/${modelId}/validate`);
    return response.data;
  },

  getModelStatistics: async (modelId) => {
    const response = await apiClient.get(`/models/${modelId}/statistics`);
    return response.data;
  },

  detectConflicts: async (modelId) => {
    const response = await apiClient.post(`/models/${modelId}/conflicts`);
    return response.data;
  },

  analyzeImpact: async (modelId, changeData) => {
    const response = await apiClient.post(`/models/${modelId}/impact`, changeData);
    return response.data;
  },

  getModelQuality: async (modelId) => {
    const response = await apiClient.post(`/models/${modelId}/quality`);
    return response.data;
  },

  getOptimizationRecommendations: async (modelId) => {
    const response = await apiClient.post(`/models/${modelId}/optimize`);
    return response.data;
  },

  addRule: async (modelId, ruleData) => {
    const response = await apiClient.post(`/models/${modelId}/rules`, ruleData);
    return response.data;
  },

  updateRule: async (modelId, ruleId, ruleData) => {
    const response = await apiClient.put(`/models/${modelId}/rules/${ruleId}`, ruleData);
    return response.data;
  },

  deleteRule: async (modelId, ruleId) => {
    const response = await apiClient.delete(`/models/${modelId}/rules/${ruleId}`);
    return response.data;
  },

  validateRule: async (modelId, ruleData) => {
    const response = await apiClient.post(`/models/${modelId}/rules/validate`, ruleData);
    return response.data;
  },
};

// Pricing API
export const pricingApi = {
  calculatePrice: async (pricingData) => {
    const response = await apiClient.post('/pricing/calculate', pricingData);
    return response.data;
  },

  simulatePricing: async (simulationData) => {
    const response = await apiClient.post('/pricing/simulate', simulationData);
    return response.data;
  },

  getVolumeTiers: async () => {
    const response = await apiClient.get('/pricing/volume-tiers');
    return response.data;
  },

  getModelVolumeTiers: async (modelId) => {
    const response = await apiClient.get(`/pricing/volume-tiers/${modelId}`);
    return response.data;
  },

  bulkCalculate: async (bulkData) => {
    const response = await apiClient.post('/pricing/bulk-calculate', bulkData);
    return response.data;
  },
};

// System API
export const systemApi = {
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  getStatus: async () => {
    const response = await apiClient.get('/status');
    return response.data;
  },

  getVersion: async () => {
    const response = await apiClient.get('/version');
    return response.data;
  },
};

// Search API
export const searchApi = {
  searchAll: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    const response = await apiClient.get(`/search?${params}`);
    return response.data;
  },

  searchModels: async (query) => {
    const response = await apiClient.get(`/search/models?q=${query}`);
    return response.data;
  },

  searchConfigurations: async (query) => {
    const response = await apiClient.get(`/search/configurations?q=${query}`);
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Check if error is network related
  isNetworkError: (error) => {
    return !error.response && error.request;
  },

  // Check if error is authentication related
  isAuthError: (error) => {
    return error.status === 401 || error.status === 403;
  },

  // Check if error is validation related
  isValidationError: (error) => {
    return error.status === 422;
  },

  // Format error message for display
  formatErrorMessage: (error) => {
    if (error.details) {
      return `${error.message}: ${error.details}`;
    }
    return error.message || 'An unknown error occurred';
  },

  // Extract validation errors for form display
  extractValidationErrors: (error) => {
    if (error.status === 422 && error.details) {
      return error.details;
    }
    return {};
  },

  // Create request timeout promise
  withTimeout: (promise, timeoutMs = 10000) => {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    );
    return Promise.race([promise, timeout]);
  },
};

// Performance monitoring
export const performanceMonitor = {
  // Track API call performance
  trackApiCall: (url, duration) => {
    if (duration > 200) {
      console.warn(`API Performance Warning: ${url} took ${duration}ms (target: <200ms)`);
    }

    // Store metrics for dashboard
    const metrics = JSON.parse(localStorage.getItem('api_metrics') || '{}');
    if (!metrics[url]) {
      metrics[url] = { calls: 0, totalTime: 0, avgTime: 0, slowCalls: 0 };
    }

    metrics[url].calls++;
    metrics[url].totalTime += duration;
    metrics[url].avgTime = metrics[url].totalTime / metrics[url].calls;

    if (duration > 200) {
      metrics[url].slowCalls++;
    }

    localStorage.setItem('api_metrics', JSON.stringify(metrics));
  },

  // Get performance metrics
  getMetrics: () => {
    return JSON.parse(localStorage.getItem('api_metrics') || '{}');
  },

  // Clear metrics
  clearMetrics: () => {
    localStorage.removeItem('api_metrics');
  },
};

export default {
  authApi,
  cpqApi,
  modelBuilderApi,
  pricingApi,
  searchApi,
  systemApi,
  apiUtils,
  performanceMonitor,
};