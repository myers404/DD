import axios from 'axios';
import { toast } from 'react-hot-toast';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';
const API_VERSION = 'v1';
const BASE_URL = `${API_BASE_URL}/${API_VERSION}`;

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Performance timing
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
    // Track response time
    const duration = Date.now() - response.config.metadata.startTime;
    
    // Log slow requests (>200ms target)
    if (duration > 200) {
      console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
    }
    
    // Extract data from standardized API response
    if (response.data && typeof response.data === 'object') {
      if (response.data.data !== undefined) {
        return { ...response, data: response.data.data };
      }
    }
    
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Access denied');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 422:
          // Validation error
          if (data.error && data.error.details) {
            toast.error(`Validation error: ${data.error.details}`);
          } else {
            toast.error('Invalid data provided');
          }
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
    } else if (error.request) {
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

// Authentication API
export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    localStorage.removeItem('auth_token');
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
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
  
  updateModel: async (modelData) => {
    const response = await apiClient.put(`/models/${modelData.id}`, modelData);
    return response.data;
  },
  
  deleteModel: async (modelId) => {
    const response = await apiClient.delete(`/models/${modelId}`);
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
    const response = await apiClient.post(`/configurations/${configId}/validate`, {
      model_id: modelId,
    });
    return response.data;
  },
  
  priceConfiguration: async (configId, modelId) => {
    const response = await apiClient.post(`/configurations/${configId}/price`, {
      model_id: modelId,
    });
    return response.data;
  },

  // Selections
  addSelections: async (configId, selectionsData) => {
    const response = await apiClient.post(`/configurations/${configId}/selections`, selectionsData);
    return response.data;
  },
  
  updateSelection: async (configId, optionId, selectionData) => {
    const response = await apiClient.put(`/configurations/${configId}/selections/${optionId}`, selectionData);
    return response.data;
  },
  
  removeSelection: async (configId, optionId) => {
    const response = await apiClient.delete(`/configurations/${configId}/selections/${optionId}`);
    return response.data;
  },
  
  getAvailableOptions: async (configId, modelId) => {
    const response = await apiClient.get(`/configurations/${configId}/available-options`, {
      params: { model_id: modelId },
    });
    return response.data;
  },
  
  validateSelection: async (selectionData) => {
    const response = await apiClient.post('/validate-selection', selectionData);
    return response.data;
  },

  // Bulk Operations
  bulkSelections: async (configId, bulkData) => {
    const response = await apiClient.post(`/configurations/${configId}/bulk-selections`, bulkData);
    return response.data;
  },
};

// Model Builder API (Phase 2A Integration)
export const modelBuilderApi = {
  // Model Validation
  validateModel: async (modelId) => {
    const response = await apiClient.post(`/models/${modelId}/validate`);
    return response.data;
  },
  
  // Rule Conflict Detection
  detectConflicts: async (modelId) => {
    const response = await apiClient.post(`/models/${modelId}/conflicts`);
    return response.data;
  },
  
  // Impact Analysis
  analyzeImpact: async ({ modelId, changes = [] }) => {
    const response = await apiClient.post(`/models/${modelId}/impact`, { changes });
    return response.data;
  },
  
  // Rule Priority Management
  getPriorities: async (modelId) => {
    const response = await apiClient.get(`/models/${modelId}/priorities`);
    return response.data;
  },
  
  updatePriorities: async (modelId, priorities) => {
    const response = await apiClient.post(`/models/${modelId}/priorities`, { priorities });
    return response.data;
  },
  
  // Quality Assessment
  getQualityScore: async (modelId) => {
    const response = await apiClient.get(`/models/${modelId}/quality`);
    return response.data;
  },
  
  getOptimizationSuggestions: async (modelId) => {
    const response = await apiClient.get(`/models/${modelId}/optimize`);
    return response.data;
  },
};

// Pricing API
export const pricingApi = {
  // Pricing Operations
  calculatePrice: async (pricingData) => {
    const response = await apiClient.post('/pricing/calculate', pricingData);
    return response.data;
  },
  
  getVolumeBreakdown: async (pricingData) => {
    const response = await apiClient.post('/pricing/volume-breakdown', pricingData);
    return response.data;
  },
  
  analyzePricing: async (modelId, scenarios) => {
    const response = await apiClient.post(`/pricing/analyze/${modelId}`, { scenarios });
    return response.data;
  },
  
  // Pricing Rules
  getPricingRules: async (modelId) => {
    const response = await apiClient.get(`/models/${modelId}/pricing-rules`);
    return response.data;
  },
  
  createPricingRule: async (modelId, ruleData) => {
    const response = await apiClient.post(`/models/${modelId}/pricing-rules`, ruleData);
    return response.data;
  },
  
  updatePricingRule: async (modelId, ruleId, ruleData) => {
    const response = await apiClient.put(`/models/${modelId}/pricing-rules/${ruleId}`, ruleData);
    return response.data;
  },
  
  deletePricingRule: async (modelId, ruleId) => {
    const response = await apiClient.delete(`/models/${modelId}/pricing-rules/${ruleId}`);
    return response.data;
  },
};

// Search & Batch API
export const searchApi = {
  // Universal Search
  universalSearch: async (query, filters = {}) => {
    const response = await apiClient.get('/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  },
  
  // Filtered Search
  searchConfigurations: async (filters) => {
    const response = await apiClient.get('/search/configurations', {
      params: filters,
    });
    return response.data;
  },
  
  searchModels: async (filters) => {
    const response = await apiClient.get('/search/models', {
      params: filters,
    });
    return response.data;
  },
  
  // Batch Operations
  batchCreateConfigurations: async (configurationsData) => {
    const response = await apiClient.post('/batch/configurations', configurationsData);
    return response.data;
  },
  
  batchUpdateConfigurations: async (updatesData) => {
    const response = await apiClient.put('/batch/configurations', updatesData);
    return response.data;
  },
  
  batchDeleteConfigurations: async (configIds) => {
    const response = await apiClient.delete('/batch/configurations', {
      data: { configuration_ids: configIds },
    });
    return response.data;
  },
};

// System API
export const systemApi = {
  // Health & Status
  health: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
  
  status: async () => {
    const response = await apiClient.get('/status');
    return response.data;
  },
  
  // Performance Metrics
  metrics: async () => {
    const response = await apiClient.get('/metrics');
    return response.data;
  },
  
  // System Information
  info: async () => {
    const response = await apiClient.get('/info');
    return response.data;
  },
};

// Export API client for custom requests
export { apiClient };

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
