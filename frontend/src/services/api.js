// frontend/src/services/api.js - Enhanced version with complete endpoint coverage
// Integrates with the CPQ backend and includes ALL endpoints needed by components

import axios from 'axios';
import { toast } from 'react-hot-toast';
import { apiExtractors, extractApiData } from '../utils/apiUtils';

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

// Performance monitoring utility
const performanceMonitor = {
  trackApiCall: (url, duration) => {
    if (duration > 1000) {
      console.warn(`Slow API call: ${url} took ${duration}ms`);
    }

    // Store performance data
    const perfData = JSON.parse(localStorage.getItem('api_performance') || '[]');
    perfData.push({ url, duration, timestamp: Date.now() });

    // Keep only last 100 entries
    if (perfData.length > 100) {
      perfData.splice(0, perfData.length - 100);
    }

    localStorage.setItem('api_performance', JSON.stringify(perfData));
  }
};

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
            // Don't show toast for validation errors, let components handle them
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
            toast.error(`Request failed with status ${status}`);
        }

        // Create standardized error object
        const apiError = new Error(data?.error?.message || data?.message || `HTTP ${status} Error`);
        apiError.status = status;
        apiError.code = data?.error?.code || 'API_ERROR';
        apiError.details = data?.error?.details || {};
        apiError.validationErrors = data?.validationErrors || [];

        return Promise.reject(apiError);
      } else if (request) {
        // Network error
        toast.error('Network error. Please check your connection.');
        const networkError = new Error('Network error - no response received');
        networkError.code = 'NETWORK_ERROR';
        return Promise.reject(networkError);
      } else {
        // Request setup error
        const setupError = new Error('Request configuration error');
        setupError.code = 'CONFIG_ERROR';
        return Promise.reject(setupError);
      }
    }
);

// Authentication API
export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);

    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }
};

// Core CPQ API
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
    // Transform basic form data into proper cpq.Model structure
    const modelPayload = {
      name: modelData.name,
      description: modelData.description || '',
      version: modelData.version || '1.0.0',
      groups: [],
      options: [],
      rules: [],
      price_rules: [],
      is_active: true
    };
    
    const response = await apiClient.post('/models', modelPayload);
    return response.data;
  },

  updateModel: async (modelId, modelData) => {
    // Transform basic form data into proper update payload
    const updatePayload = {
      name: modelData.name,
      description: modelData.description || '',
      version: modelData.version || '1.0.0'
    };
    
    const response = await apiClient.put(`/models/${modelId}`, updatePayload);
    return response.data;
  },

  deleteModel: async (modelId) => {
    const response = await apiClient.delete(`/models/${modelId}`);
    return response.data;
  },

  cloneModel: async (modelId) => {
    const response = await apiClient.post(`/models/${modelId}/clone`);
    return response.data;
  },

  // Model Groups
  getModelGroups: async (modelId) => {
    const response = await apiClient.get(`/models/${modelId}/groups`);
    return apiExtractors.groups(response.data);
  },

  getModelGroupsWithOptions: async (modelId) => {
    const response = await apiClient.get(`/models/${modelId}/groups?include=options`);
    return apiExtractors.groups(response.data);
  },

  createGroup: async (modelId, groupData) => {
    console.log(`API: Creating group for model ${modelId}:`, groupData);
    const response = await apiClient.post(`/models/${modelId}/groups`, groupData);
    console.log('API: Create group response:', response.data);
    return extractApiData(response.data);
  },

  updateGroup: async (modelId, groupId, groupData) => {
    console.log(`API: Updating group ${groupId} for model ${modelId}:`, groupData);
    const response = await apiClient.put(`/models/${modelId}/groups/${groupId}`, groupData);
    console.log('API: Update group response:', response.data);
    return extractApiData(response.data);
  },

  deleteGroup: async (modelId, groupId) => {
    const response = await apiClient.delete(`/models/${modelId}/groups/${groupId}`);
    return extractApiData(response.data);
  },

  // Model Options
  getModelOptions: async (modelId) => {
    const response = await apiClient.get(`/models/${modelId}/options`);
    return apiExtractors.options(response.data);
  },

  createOption: async (modelId, optionData) => {
    const response = await apiClient.post(`/models/${modelId}/options`, optionData);
    return extractApiData(response.data);
  },

  updateOption: async (modelId, optionId, optionData) => {
    const response = await apiClient.put(`/models/${modelId}/options/${optionId}`, optionData);
    return extractApiData(response.data);
  },

  deleteOption: async (modelId, optionId) => {
    const response = await apiClient.delete(`/models/${modelId}/options/${optionId}`);
    return extractApiData(response.data);
  },

  // Configurations
  getConfigurations: async (params = {}) => {
    const response = await apiClient.get('/configurations', { params });
    return response.data;
  },

  getConfiguration: async (configId) => {
    const response = await apiClient.get(`/configurations/${configId}`);
    return response.data;
  },

  createConfiguration: async (configData) => {
    const response = await apiClient.post('/configurations', configData);
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

  // Configuration Validation
  validateConfiguration: async (configId, modelId) => {
    const response = await apiClient.post(`/configurations/${configId}/validate`, {
      modelId
    });
    return response.data;
  },

  // Configuration Pricing
  priceConfiguration: async (configId, modelId) => {
    const response = await apiClient.post(`/configurations/${configId}/price`, {
      modelId
    });
    return response.data;
  },

  // Quick validation without saving
  validateSelections: async (modelId, selections) => {
    const response = await apiClient.post(`/models/${modelId}/validate`, {
      selections
    });
    return response.data;
  },

  // Quick pricing without saving
  calculatePrice: async (modelId, selections, context = {}) => {
    const response = await apiClient.post(`/models/${modelId}/price`, {
      selections,
      context
    });
    return response.data;
  }
};

// Model Builder API
export const modelBuilderApi = {
  // Model Statistics
  getModelStatistics: async (modelId) => {
    const response = await apiClient.get(`/models/${modelId}/statistics`);
    return response.data;
  },

  // Conflict Detection
  detectConflicts: async (modelId) => {
    const response = await apiClient.post(`/models/${modelId}/conflicts`);
    return response.data;
  },

  // Impact Analysis
  analyzeImpact: async (modelId, changeData) => {
    const response = await apiClient.post(`/models/${modelId}/impact`, changeData);
    return response.data;
  },

  // Model Quality
  getModelQuality: async (modelId) => {
    const response = await apiClient.post(`/models/${modelId}/quality`);
    return response.data;
  },

  // Optimization Recommendations
  getOptimizationRecommendations: async (modelId) => {
    const response = await apiClient.post(`/models/${modelId}/optimize`);
    return response.data;
  },

  // Rules Management
  getModelRules: async (modelId) => {
    const response = await apiClient.get(`/models/${modelId}/rules`);
    return apiExtractors.rules(response.data);
  },

  addRule: async (modelId, ruleData) => {
    const response = await apiClient.post(`/models/${modelId}/rules`, ruleData);
    return extractApiData(response.data);
  },

  updateRule: async (modelId, ruleId, ruleData) => {
    try {
      const response = await apiClient.put(`/models/${modelId}/rules/${ruleId}`, ruleData);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error updating rule:', error.response?.data || error);
      throw error;
    }
  },

  deleteRule: async (modelId, ruleId) => {
    const response = await apiClient.delete(`/models/${modelId}/rules/${ruleId}`);
    return extractApiData(response.data);
  },

  validateRule: async (modelId, ruleData) => {
    const response = await apiClient.post(`/models/${modelId}/rules/validate`, ruleData);
    return response.data;
  },

  // Pricing Rules
  getPricingRules: async (modelId) => {
    const response = await apiClient.get(`/models/${modelId}/pricing-rules`);
    return apiExtractors.pricingRules(response.data);
  },

  createPricingRule: async (modelId, ruleData) => {
    const response = await apiClient.post(`/models/${modelId}/pricing-rules`, ruleData);
    return extractApiData(response.data);
  },

  updatePricingRule: async (modelId, ruleId, ruleData) => {
    const response = await apiClient.put(`/models/${modelId}/pricing-rules/${ruleId}`, ruleData);
    return extractApiData(response.data);
  },

  deletePricingRule: async (modelId, ruleId) => {
    const response = await apiClient.delete(`/models/${modelId}/pricing-rules/${ruleId}`);
    return extractApiData(response.data);
  },

  // Rule Priority Management
  updateRulePriorities: async (modelId, priorities) => {
    const response = await apiClient.put(`/models/${modelId}/rules/priorities`, { priorities });
    return response.data;
  }
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

  // Pricing analysis
  analyzePricingImpact: async (modelId, changes) => {
    const response = await apiClient.post(`/pricing/analyze-impact/${modelId}`, changes);
    return response.data;
  }
};

// Analytics API
export const analyticsApi = {
  getModelAnalytics: async (modelId, timeRange = '30d') => {
    const response = await apiClient.get(`/analytics/models/${modelId}?range=${timeRange}`);
    return response.data;
  },

  getConfigurationAnalytics: async (timeRange = '30d') => {
    const response = await apiClient.get(`/analytics/configurations?range=${timeRange}`);
    return response.data;
  },

  getPricingAnalytics: async (timeRange = '30d') => {
    const response = await apiClient.get(`/analytics/pricing?range=${timeRange}`);
    return response.data;
  },

  getPerformanceMetrics: async () => {
    const response = await apiClient.get('/analytics/performance');
    return response.data;
  }
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
  }
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
  }
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
    return error.status === 422 || error.status === 400;
  },

  // Get validation errors from API response
  getValidationErrors: (error) => {
    return error.validationErrors || [];
  },

  // Format error for display
  formatErrorMessage: (error) => {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.status) return `Request failed with status ${error.status}`;
    return 'An unexpected error occurred';
  },

  // Performance utilities
  getPerformanceData: () => {
    return JSON.parse(localStorage.getItem('api_performance') || '[]');
  },

  clearPerformanceData: () => {
    localStorage.removeItem('api_performance');
  },

  getAverageResponseTime: () => {
    const data = JSON.parse(localStorage.getItem('api_performance') || '[]');
    if (data.length === 0) return 0;

    const total = data.reduce((sum, entry) => sum + entry.duration, 0);
    return Math.round(total / data.length);
  }
};

// Request queue for batch operations
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.batchSize = 5;
    this.batchDelay = 100;
  }

  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);

      const promises = batch.map(async ({ request, resolve, reject }) => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      await Promise.allSettled(promises);

      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.batchDelay));
      }
    }

    this.processing = false;
  }
}

// Export request queue instance
export const requestQueue = new RequestQueue();

// Export everything
export default {
  authApi,
  cpqApi,
  modelBuilderApi,
  pricingApi,
  analyticsApi,
  systemApi,
  searchApi,
  apiUtils,
  requestQueue,
  performanceMonitor
};