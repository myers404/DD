import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ShoppingCartIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// API Functions
import { cpqApi } from '../services/api';

// Components
import OptionSelector from '../components/configurator/OptionSelector';
import PricingDisplay from '../components/configurator/PricingDisplay';
import ValidationDisplay from '../components/configurator/ValidationDisplay';
import ConfigurationSummary from '../components/configurator/ConfigurationSummary.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';

const CustomerConfigurator = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State Management
  const [configurationId, setConfigurationId] = useState(null);
  const [selections, setSelections] = useState([]);
  const [realTimeValidation, setRealTimeValidation] = useState({ isValid: true, violations: [] });
  const [pricing, setPricing] = useState({ totalPrice: 0, breakdown: [] });
  const [availableOptions, setAvailableOptions] = useState([]);

  // Fetch Model Data
  const { data: model, isLoading: modelLoading, error: modelError } = useQuery({
    queryKey: ['model', modelId],
    queryFn: () => cpqApi.getModel(modelId),
    enabled: !!modelId,
    retry: false,
  });

  // Create Configuration Mutation
  const createConfigMutation = useMutation({
    mutationFn: cpqApi.createConfiguration,
    onSuccess: (data) => {
      setConfigurationId(data.id);
      toast.success('Configuration started!');
    },
    onError: (error) => {
      toast.error(`Failed to create configuration: ${error.message}`);
    },
  });

  // Add Selection Mutation
  const addSelectionMutation = useMutation({
    mutationFn: ({ configId, selections }) => 
      cpqApi.addSelections(configId, { model_id: modelId, selections }),
    onSuccess: (data) => {
      setSelections(data.configuration.selections);
      setRealTimeValidation(data.validation);
      setPricing(data.pricing);
      setAvailableOptions(data.available_options || []);
      
      queryClient.invalidateQueries(['configuration', configurationId]);
      
      if (data.validation.isValid) {
        toast.success('Selection added successfully!');
      } else {
        toast.warning('Selection added with constraints');
      }
    },
    onError: (error) => {
      toast.error(`Failed to add selection: ${error.message}`);
    },
  });

  // Remove Selection Mutation  
  const removeSelectionMutation = useMutation({
    mutationFn: ({ configId, optionId }) => 
      cpqApi.removeSelection(configId, optionId),
    onSuccess: () => {
      toast.success('Selection removed');
      refetchConfiguration();
    },
    onError: (error) => {
      toast.error(`Failed to remove selection: ${error.message}`);
    },
  });

  // Real-time Validation
  const validateSelectionMutation = useMutation({
    mutationFn: cpqApi.validateSelection,
    onSuccess: (data) => {
      setRealTimeValidation(data);
    },
  });

  // Initialize Configuration
  useEffect(() => {
    if (model && !configurationId) {
      createConfigMutation.mutate({
        model_id: modelId,
        name: `${model.name} Configuration`,
        description: 'Customer configuration session',
      });
    }
  }, [model, modelId, configurationId]);

  // Real-time validation on selection changes
  const handleSelectionChange = useCallback(
    async (optionId, quantity, action = 'add') => {
      if (!configurationId) return;

      // Optimistic update for UI responsiveness
      const newSelection = { optionId, quantity };
      
      if (action === 'add') {
        // Real-time validation first
        validateSelectionMutation.mutate({
          model_id: modelId,
          option_id: optionId,
          quantity,
        });

        // Then add selection
        addSelectionMutation.mutate({
          configId: configurationId,
          selections: [newSelection],
        });
      } else if (action === 'remove') {
        removeSelectionMutation.mutate({
          configId: configurationId,
          optionId,
        });
      }
    },
    [configurationId, modelId]
  );

  // Refetch configuration data
  const refetchConfiguration = useCallback(() => {
    if (configurationId) {
      queryClient.invalidateQueries(['configuration', configurationId]);
    }
  }, [configurationId, queryClient]);

  // Handle model selection change
  const handleModelChange = (newModelId) => {
    navigate(`/configure/${newModelId}`);
  };

  // Loading States
  if (modelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading configuration..." />
      </div>
    );
  }

  if (modelError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-4">{modelError.message}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!modelId) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <CogIcon className="mx-auto h-12 w-12 text-blue-500 mb-4"/>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Select a Model to Configure
            </h2>
            <p className="text-gray-600 mb-6">
              Choose a product model to start your configuration.
            </p>
            <div className="space-y-3">
              <button
                  onClick={() => navigate('/configure/sample-laptop')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Configure Business Laptop
              </button>
              <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <CogIcon className="h-6 w-6 text-blue-600" />
                  Configure {model?.name}
                </h1>
                <p className="text-gray-600 mt-1">{model?.description}</p>
              </div>
              
              {/* Real-time Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Real-time validation</span>
                </div>
                
                {realTimeValidation.isValid ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Valid Configuration</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {realTimeValidation.violations?.length || 0} Constraints
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-sm">
                <span className="text-gray-500">Selections: </span>
                <span className="font-medium">{selections.length}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Available Options: </span>
                <span className="font-medium">{availableOptions.length}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-green-600">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span className="text-lg font-bold">
                ${pricing.totalPrice?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Configuration Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Validation Display */}
            <AnimatePresence>
              {!realTimeValidation.isValid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <ValidationDisplay validation={realTimeValidation} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Option Groups */}
            {model?.groups?.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <OptionSelector
                  group={group}
                  selections={selections}
                  availableOptions={availableOptions}
                  onSelectionChange={handleSelectionChange}
                  isLoading={addSelectionMutation.isLoading || removeSelectionMutation.isLoading}
                />
              </motion.div>
            ))}
          </div>

          {/* Right Column - Summary & Pricing */}
          <div className="space-y-6">
            {/* Configuration Summary */}
            <ConfigurationSummary
              model={model}
              selections={selections}
              validation={realTimeValidation}
              onRemoveSelection={(optionId) => 
                handleSelectionChange(optionId, 0, 'remove')
              }
            />

            {/* Pricing Display */}
            <PricingDisplay
              pricing={pricing}
              isValid={realTimeValidation.isValid}
              isLoading={addSelectionMutation.isLoading}
            />

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <button
                  disabled={!realTimeValidation.isValid || selections.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  Add to Quote
                </button>
                
                <button
                  onClick={() => {
                    // Save configuration logic
                    toast.success('Configuration saved!');
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CustomerConfigurator;
