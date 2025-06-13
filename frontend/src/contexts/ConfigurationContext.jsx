import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cpqApi } from '../services/api';
import { toast } from 'react-hot-toast';

// Configuration Context
const ConfigurationContext = createContext(null);

// Configuration actions
const CONFIG_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Model actions
  SET_MODELS: 'SET_MODELS',
  ADD_MODEL: 'ADD_MODEL',
  UPDATE_MODEL: 'UPDATE_MODEL',
  DELETE_MODEL: 'DELETE_MODEL',
  SET_CURRENT_MODEL: 'SET_CURRENT_MODEL',
  
  // Configuration actions
  SET_CONFIGURATIONS: 'SET_CONFIGURATIONS',
  ADD_CONFIGURATION: 'ADD_CONFIGURATION',
  UPDATE_CONFIGURATION: 'UPDATE_CONFIGURATION',
  DELETE_CONFIGURATION: 'DELETE_CONFIGURATION',
  SET_CURRENT_CONFIGURATION: 'SET_CURRENT_CONFIGURATION',
  
  // Selection actions
  ADD_SELECTION: 'ADD_SELECTION',
  UPDATE_SELECTION: 'UPDATE_SELECTION',
  REMOVE_SELECTION: 'REMOVE_SELECTION',
  CLEAR_SELECTIONS: 'CLEAR_SELECTIONS',
  
  // Validation and pricing
  SET_VALIDATION: 'SET_VALIDATION',
  SET_PRICING: 'SET_PRICING',
  SET_AVAILABLE_OPTIONS: 'SET_AVAILABLE_OPTIONS',
  
  // Cache management
  INVALIDATE_CACHE: 'INVALIDATE_CACHE',
  SET_CACHE: 'SET_CACHE',
};

// Initial state
const initialState = {
  // Loading and error states
  isLoading: false,
  error: null,
  
  // Models
  models: [],
  currentModel: null,
  
  // Configurations
  configurations: [],
  currentConfiguration: null,
  
  // Current session data
  selections: [],
  validation: { isValid: true, violations: [] },
  pricing: { totalPrice: 0, breakdown: [] },
  availableOptions: [],
  
  // Performance and caching
  cache: new Map(),
  lastUpdate: null,
};

// Configuration reducer
function configurationReducer(state, action) {
  switch (action.type) {
    case CONFIG_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case CONFIG_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case CONFIG_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    // Model actions
    case CONFIG_ACTIONS.SET_MODELS:
      return {
        ...state,
        models: action.payload,
        lastUpdate: Date.now(),
      };

    case CONFIG_ACTIONS.ADD_MODEL:
      return {
        ...state,
        models: [...state.models, action.payload],
        lastUpdate: Date.now(),
      };

    case CONFIG_ACTIONS.UPDATE_MODEL:
      return {
        ...state,
        models: state.models.map(model =>
          model.id === action.payload.id ? { ...model, ...action.payload } : model
        ),
        currentModel: state.currentModel?.id === action.payload.id 
          ? { ...state.currentModel, ...action.payload }
          : state.currentModel,
        lastUpdate: Date.now(),
      };

    case CONFIG_ACTIONS.DELETE_MODEL:
      return {
        ...state,
        models: state.models.filter(model => model.id !== action.payload),
        currentModel: state.currentModel?.id === action.payload ? null : state.currentModel,
        lastUpdate: Date.now(),
      };

    case CONFIG_ACTIONS.SET_CURRENT_MODEL:
      return {
        ...state,
        currentModel: action.payload,
        // Clear configuration data when model changes
        selections: [],
        validation: { isValid: true, violations: [] },
        pricing: { totalPrice: 0, breakdown: [] },
        availableOptions: [],
      };

    // Configuration actions
    case CONFIG_ACTIONS.SET_CONFIGURATIONS:
      return {
        ...state,
        configurations: action.payload,
      };

    case CONFIG_ACTIONS.ADD_CONFIGURATION:
      return {
        ...state,
        configurations: [...state.configurations, action.payload],
      };

    case CONFIG_ACTIONS.UPDATE_CONFIGURATION:
      return {
        ...state,
        configurations: state.configurations.map(config =>
          config.id === action.payload.id ? { ...config, ...action.payload } : config
        ),
        currentConfiguration: state.currentConfiguration?.id === action.payload.id
          ? { ...state.currentConfiguration, ...action.payload }
          : state.currentConfiguration,
      };

    case CONFIG_ACTIONS.DELETE_CONFIGURATION:
      return {
        ...state,
        configurations: state.configurations.filter(config => config.id !== action.payload),
        currentConfiguration: state.currentConfiguration?.id === action.payload 
          ? null 
          : state.currentConfiguration,
      };

    case CONFIG_ACTIONS.SET_CURRENT_CONFIGURATION:
      return {
        ...state,
        currentConfiguration: action.payload,
        selections: action.payload?.selections || [],
      };

    // Selection actions
    case CONFIG_ACTIONS.ADD_SELECTION:
      const existingSelectionIndex = state.selections.findIndex(
        sel => sel.optionId === action.payload.optionId
      );
      
      let newSelections;
      if (existingSelectionIndex >= 0) {
        // Update existing selection
        newSelections = state.selections.map((sel, index) =>
          index === existingSelectionIndex
            ? { ...sel, quantity: sel.quantity + action.payload.quantity }
            : sel
        );
      } else {
        // Add new selection
        newSelections = [...state.selections, action.payload];
      }

      return {
        ...state,
        selections: newSelections,
      };

    case CONFIG_ACTIONS.UPDATE_SELECTION:
      return {
        ...state,
        selections: state.selections.map(sel =>
          sel.optionId === action.payload.optionId
            ? { ...sel, ...action.payload }
            : sel
        ),
      };

    case CONFIG_ACTIONS.REMOVE_SELECTION:
      return {
        ...state,
        selections: state.selections.filter(sel => sel.optionId !== action.payload),
      };

    case CONFIG_ACTIONS.CLEAR_SELECTIONS:
      return {
        ...state,
        selections: [],
        validation: { isValid: true, violations: [] },
        pricing: { totalPrice: 0, breakdown: [] },
      };

    // Validation and pricing
    case CONFIG_ACTIONS.SET_VALIDATION:
      return {
        ...state,
        validation: action.payload,
      };

    case CONFIG_ACTIONS.SET_PRICING:
      return {
        ...state,
        pricing: action.payload,
      };

    case CONFIG_ACTIONS.SET_AVAILABLE_OPTIONS:
      return {
        ...state,
        availableOptions: action.payload,
      };

    // Cache management
    case CONFIG_ACTIONS.SET_CACHE:
      const newCache = new Map(state.cache);
      newCache.set(action.payload.key, {
        data: action.payload.data,
        timestamp: Date.now(),
        ttl: action.payload.ttl || 300000, // 5 minutes default
      });
      return {
        ...state,
        cache: newCache,
      };

    case CONFIG_ACTIONS.INVALIDATE_CACHE:
      const clearedCache = new Map(state.cache);
      if (action.payload) {
        clearedCache.delete(action.payload);
      } else {
        clearedCache.clear();
      }
      return {
        ...state,
        cache: clearedCache,
      };

    default:
      return state;
  }
}

// Configuration Provider
export const ConfigurationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(configurationReducer, initialState);

  // Cache helper functions
  const getCachedData = (key) => {
    const cached = state.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      dispatch({ type: CONFIG_ACTIONS.INVALIDATE_CACHE, payload: key });
      return null;
    }
    
    return cached.data;
  };

  const setCachedData = (key, data, ttl) => {
    dispatch({
      type: CONFIG_ACTIONS.SET_CACHE,
      payload: { key, data, ttl },
    });
  };

  // Model management functions
  const loadModels = async () => {
    const cacheKey = 'models';
    const cached = getCachedData(cacheKey);
    if (cached) {
      dispatch({ type: CONFIG_ACTIONS.SET_MODELS, payload: cached });
      return cached;
    }

    dispatch({ type: CONFIG_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const models = await cpqApi.getModels();
      dispatch({ type: CONFIG_ACTIONS.SET_MODELS, payload: models });
      setCachedData(cacheKey, models, 600000); // Cache for 10 minutes
      return models;
    } catch (error) {
      dispatch({ type: CONFIG_ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to load models');
      throw error;
    } finally {
      dispatch({ type: CONFIG_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const loadModel = async (modelId) => {
    const cacheKey = `model_${modelId}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      dispatch({ type: CONFIG_ACTIONS.SET_CURRENT_MODEL, payload: cached });
      return cached;
    }

    dispatch({ type: CONFIG_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const model = await cpqApi.getModel(modelId);
      dispatch({ type: CONFIG_ACTIONS.SET_CURRENT_MODEL, payload: model });
      setCachedData(cacheKey, model, 300000); // Cache for 5 minutes
      return model;
    } catch (error) {
      dispatch({ type: CONFIG_ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to load model');
      throw error;
    } finally {
      dispatch({ type: CONFIG_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const createModel = async (modelData) => {
    dispatch({ type: CONFIG_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const newModel = await cpqApi.createModel(modelData);
      dispatch({ type: CONFIG_ACTIONS.ADD_MODEL, payload: newModel });
      dispatch({ type: CONFIG_ACTIONS.INVALIDATE_CACHE, payload: 'models' });
      toast.success('Model created successfully');
      return newModel;
    } catch (error) {
      dispatch({ type: CONFIG_ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to create model');
      throw error;
    } finally {
      dispatch({ type: CONFIG_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const updateModel = async (modelId, modelData) => {
    dispatch({ type: CONFIG_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const updatedModel = await cpqApi.updateModel({ id: modelId, ...modelData });
      dispatch({ type: CONFIG_ACTIONS.UPDATE_MODEL, payload: updatedModel });
      dispatch({ type: CONFIG_ACTIONS.INVALIDATE_CACHE, payload: `model_${modelId}` });
      toast.success('Model updated successfully');
      return updatedModel;
    } catch (error) {
      dispatch({ type: CONFIG_ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to update model');
      throw error;
    } finally {
      dispatch({ type: CONFIG_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const deleteModel = async (modelId) => {
    if (!window.confirm('Are you sure you want to delete this model?')) {
      return;
    }

    dispatch({ type: CONFIG_ACTIONS.SET_LOADING, payload: true });
    
    try {
      await cpqApi.deleteModel(modelId);
      dispatch({ type: CONFIG_ACTIONS.DELETE_MODEL, payload: modelId });
      dispatch({ type: CONFIG_ACTIONS.INVALIDATE_CACHE, payload: 'models' });
      dispatch({ type: CONFIG_ACTIONS.INVALIDATE_CACHE, payload: `model_${modelId}` });
      toast.success('Model deleted successfully');
    } catch (error) {
      dispatch({ type: CONFIG_ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to delete model');
      throw error;
    } finally {
      dispatch({ type: CONFIG_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Configuration management functions
  const createConfiguration = async (configData) => {
    try {
      const configuration = await cpqApi.createConfiguration(configData);
      dispatch({ type: CONFIG_ACTIONS.ADD_CONFIGURATION, payload: configuration });
      dispatch({ type: CONFIG_ACTIONS.SET_CURRENT_CONFIGURATION, payload: configuration });
      return configuration;
    } catch (error) {
      dispatch({ type: CONFIG_ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to create configuration');
      throw error;
    }
  };

  const updateConfiguration = async (configId, configData) => {
    try {
      const updatedConfig = await cpqApi.updateConfiguration(configId, configData);
      dispatch({ type: CONFIG_ACTIONS.UPDATE_CONFIGURATION, payload: updatedConfig });
      return updatedConfig;
    } catch (error) {
      dispatch({ type: CONFIG_ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to update configuration');
      throw error;
    }
  };

  // Selection management functions
  const addSelection = async (optionId, quantity = 1) => {
    if (!state.currentConfiguration || !state.currentModel) {
      toast.error('No active configuration');
      return;
    }

    try {
      const result = await cpqApi.addSelections(state.currentConfiguration.id, {
        model_id: state.currentModel.id,
        selections: [{ optionId, quantity }],
      });

      dispatch({ type: CONFIG_ACTIONS.ADD_SELECTION, payload: { optionId, quantity } });
      dispatch({ type: CONFIG_ACTIONS.SET_VALIDATION, payload: result.validation });
      dispatch({ type: CONFIG_ACTIONS.SET_PRICING, payload: result.pricing });
      dispatch({ type: CONFIG_ACTIONS.SET_AVAILABLE_OPTIONS, payload: result.available_options || [] });

      return result;
    } catch (error) {
      dispatch({ type: CONFIG_ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to add selection');
      throw error;
    }
  };

  const removeSelection = async (optionId) => {
    if (!state.currentConfiguration) {
      toast.error('No active configuration');
      return;
    }

    try {
      await cpqApi.removeSelection(state.currentConfiguration.id, optionId);
      dispatch({ type: CONFIG_ACTIONS.REMOVE_SELECTION, payload: optionId });
      
      // Re-validate configuration after removal
      await validateConfiguration();
      
      toast.success('Selection removed');
    } catch (error) {
      dispatch({ type: CONFIG_ACTIONS.SET_ERROR, payload: error.message });
      toast.error('Failed to remove selection');
      throw error;
    }
  };

  const clearSelections = () => {
    dispatch({ type: CONFIG_ACTIONS.CLEAR_SELECTIONS });
    toast.success('All selections cleared');
  };

  // Validation and pricing functions
  const validateConfiguration = async () => {
    if (!state.currentConfiguration || !state.currentModel) {
      return { isValid: true, violations: [] };
    }

    try {
      const validation = await cpqApi.validateConfiguration(
        state.currentConfiguration.id,
        state.currentModel.id
      );
      
      dispatch({ type: CONFIG_ACTIONS.SET_VALIDATION, payload: validation });
      return validation;
    } catch (error) {
      dispatch({ type: CONFIG_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const calculatePricing = async () => {
    if (!state.currentConfiguration || !state.currentModel) {
      return { totalPrice: 0, breakdown: [] };
    }

    try {
      const pricing = await cpqApi.priceConfiguration(
        state.currentConfiguration.id,
        state.currentModel.id
      );
      
      dispatch({ type: CONFIG_ACTIONS.SET_PRICING, payload: pricing });
      return pricing;
    } catch (error) {
      dispatch({ type: CONFIG_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Utility functions
  const clearError = () => {
    dispatch({ type: CONFIG_ACTIONS.CLEAR_ERROR });
  };

  const getModelById = (modelId) => {
    return state.models.find(model => model.id === modelId);
  };

  const getConfigurationById = (configId) => {
    return state.configurations.find(config => config.id === configId);
  };

  const isOptionSelected = (optionId) => {
    return state.selections.some(sel => sel.optionId === optionId);
  };

  const getSelectionQuantity = (optionId) => {
    const selection = state.selections.find(sel => sel.optionId === optionId);
    return selection?.quantity || 0;
  };

  // Performance monitoring
  const getPerformanceMetrics = () => {
    return {
      cacheSize: state.cache.size,
      lastUpdate: state.lastUpdate,
      modelsCount: state.models.length,
      selectionsCount: state.selections.length,
      validationStatus: state.validation.isValid,
      totalPrice: state.pricing.totalPrice,
    };
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Model management
    loadModels,
    loadModel,
    createModel,
    updateModel,
    deleteModel,
    
    // Configuration management
    createConfiguration,
    updateConfiguration,
    
    // Selection management
    addSelection,
    removeSelection,
    clearSelections,
    
    // Validation and pricing
    validateConfiguration,
    calculatePricing,
    
    // Utilities
    clearError,
    getModelById,
    getConfigurationById,
    isOptionSelected,
    getSelectionQuantity,
    getPerformanceMetrics,
  };

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};

// Custom hook to use configuration context
export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  
  return context;
};

// Higher-order component for configuration requirements
export const withConfiguration = (Component, requiresModel = false) => {
  return function ConfiguredComponent(props) {
    const { currentModel, isLoading } = useConfiguration();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (requiresModel && !currentModel) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Model Selected</h2>
            <p className="text-gray-600">Please select a model to continue.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default ConfigurationContext;
