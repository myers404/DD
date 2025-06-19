// frontend/src/utils/apiUtils.js
// Robust API response handling utilities

/**
 * Extracts data from standardized API responses
 * @param {Object} response - API response object
 * @param {string} dataKey - The key containing the actual data (e.g., 'options', 'groups')
 * @returns {Array|Object} - The extracted data
 */
export const extractApiData = (response, dataKey = null) => {
  // Handle null/undefined responses
  if (!response) {
    return dataKey ? [] : null;
  }

  // If response has success/data structure
  if (response.success && response.data) {
    const data = response.data;
    
    // If specific dataKey requested, extract it
    if (dataKey && data[dataKey]) {
      return data[dataKey];
    }
    
    // If no dataKey specified, return the data object
    if (!dataKey) {
      return data;
    }
    
    // Fallback: return data as-is if dataKey not found
    return data;
  }

  // If response.data exists but no success flag
  if (response.data) {
    const data = response.data;
    
    if (dataKey && data[dataKey]) {
      return data[dataKey];
    }
    
    return dataKey ? (data[dataKey] || []) : data;
  }

  // Direct response (fallback for legacy APIs)
  if (dataKey && response[dataKey]) {
    return response[dataKey];
  }

  // Return response as-is or empty array for missing data
  return dataKey ? [] : response;
};

/**
 * Specific extractors for common API endpoints
 */
export const apiExtractors = {
  // Extract options array from model options API response
  options: (response) => extractApiData(response, 'options'),
  
  // Extract groups array from model groups API response  
  groups: (response) => extractApiData(response, 'groups'),
  
  // Extract rules array from model rules API response
  rules: (response) => extractApiData(response, 'rules'),
  
  // Extract pricing rules array
  pricingRules: (response) => extractApiData(response, 'pricing_rules') || extractApiData(response, 'price_rules'),
  
  // Extract model data (no specific key)
  model: (response) => extractApiData(response),
  
  // Extract configurations array
  configurations: (response) => extractApiData(response, 'configurations'),
  
  // Extract statistics object
  statistics: (response) => extractApiData(response, 'statistics'),
};

/**
 * Validates API response structure
 * @param {Object} response - API response
 * @returns {boolean} - True if response has expected structure
 */
export const validateApiResponse = (response) => {
  if (!response) return false;
  
  // Check for standard success/data structure
  if (response.success !== undefined) {
    return response.success === true && response.data !== undefined;
  }
  
  // Accept responses without success flag if they have data
  return response.data !== undefined || Array.isArray(response) || typeof response === 'object';
};

/**
 * Gets error message from API response
 * @param {Object} error - Error object from API
 * @returns {string} - User-friendly error message
 */
export const getApiErrorMessage = (error) => {
  // Check for API error structure
  if (error?.response?.data) {
    const data = error.response.data;
    
    // Standard error structure
    if (data.error?.message) {
      return data.error.message;
    }
    
    // Direct message
    if (data.message) {
      return data.message;
    }
    
    // Success false with error
    if (data.success === false && data.data?.message) {
      return data.data.message;
    }
  }
  
  // Check for direct error message
  if (error?.message) {
    return error.message;
  }
  
  // Fallback
  return 'An unexpected error occurred';
};

/**
 * Creates a robust API wrapper function
 * @param {Function} apiCall - The original API function
 * @param {string} dataKey - Key to extract from response (optional)
 * @returns {Function} - Wrapped API function
 */
export const wrapApiCall = (apiCall, dataKey = null) => {
  return async (...args) => {
    try {
      const response = await apiCall(...args);
      
      if (!validateApiResponse(response)) {
        throw new Error('Invalid API response structure');
      }
      
      return dataKey ? extractApiData(response, dataKey) : extractApiData(response);
    } catch (error) {
      // Re-throw with enhanced error message
      const message = getApiErrorMessage(error);
      const enhancedError = new Error(message);
      enhancedError.originalError = error;
      enhancedError.apiCall = apiCall.name;
      throw enhancedError;
    }
  };
};

export default {
  extractApiData,
  apiExtractors,
  validateApiResponse,
  getApiErrorMessage,
  wrapApiCall
};