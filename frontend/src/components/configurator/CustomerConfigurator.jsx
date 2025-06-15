// frontend/src/components/configurator/CustomerConfigurator.jsx
// Main customer-facing configuration component - fully functional implementation

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ClockIcon,
  XMarkIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

// API integration
import { cpqApi, pricingApi } from '../../services/api';

// Import configurator sub-components
import ProductSelector from './ProductSelector';
import ConstraintValidator from './ConstraintValidator';
import PricingSummary from './PricingSummary';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';

const CustomerConfigurator = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Configuration state
  const [currentStep, setCurrentStep] = useState(0);
  const [configuration, setConfiguration] = useState(null);
  const [selections, setSelections] = useState([]);
  const [validationResults, setValidationResults] = useState(null);
  const [pricingResults, setPricingResults] = useState(null);
  const [showValidationDetails, setShowValidationDetails] = useState(false);

  // UI state
  const [isValidating, setIsValidating] = useState(false);
  const [isPricing, setIsPricing] = useState(false);
  const [autoValidate, setAutoValidate] = useState(true);

  // Configuration steps
  const steps = [
    { id: 0, name: 'Select Options', icon: TagIcon, description: 'Choose your product options' },
    { id: 1, name: 'Validate Configuration', icon: CheckCircleIcon, description: 'Review constraints and conflicts' },
    { id: 2, name: 'Review Pricing', icon: CurrencyDollarIcon, description: 'See pricing breakdown and totals' },
    { id: 3, name: 'Complete', icon: ShoppingCartIcon, description: 'Finalize your configuration' }
  ];

  // Fetch model data
  const { data: model, isLoading: modelLoading, error: modelError } = useQuery({
    queryKey: ['model', modelId],
    queryFn: () => cpqApi.getModel(modelId),
    enabled: !!modelId,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create configuration mutation
  const createConfigMutation = useMutation({
    mutationFn: cpqApi.createConfiguration,
    onSuccess: (data) => {
      setConfiguration(data.data);
      toast.success('Configuration created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create configuration: ${error.message}`);
    },
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: ({ configId, configData }) => cpqApi.updateConfiguration(configId, configData),
    onSuccess: (data) => {
      setConfiguration(data.data);
      queryClient.invalidateQueries(['configuration', configuration?.id]);
    },
    onError: (error) => {
      toast.error(`Failed to update configuration: ${error.message}`);
    },
  });

  // Validation mutation
  const validateMutation = useMutation({
    mutationFn: ({ configId, modelId }) => cpqApi.validateConfiguration(configId, modelId),
    onSuccess: (data) => {
      setValidationResults(data.data);
      if (data.data.is_valid) {
        toast.success('Configuration is valid!');
      } else {
        toast.warning(`Configuration has ${data.data.violations?.length || 0} constraint violations`);
      }
    },
    onError: (error) => {
      toast.error(`Validation failed: ${error.message}`);
    },
  });

  // Pricing mutation
  const pricingMutation = useMutation({
    mutationFn: pricingApi.calculatePrice,
    onSuccess: (data) => {
      setPricingResults(data.data);
      toast.success('Pricing calculated successfully!');
    },
    onError: (error) => {
      toast.error(`Pricing calculation failed: ${error.message}`);
    },
  });

  // Initialize configuration when model loads
  useEffect(() => {
    if (model && !configuration) {
      createConfigMutation.mutate({
        model_id: modelId,
        name: `Configuration for ${model.name}`,
        description: `Customer configuration created ${new Date().toLocaleDateString()}`,
        selections: []
      });
    }
  }, [model, configuration, modelId]);

  // Auto-validate when selections change
  useEffect(() => {
    if (autoValidate && configuration && selections.length > 0) {
      const timer = setTimeout(() => {
        handleValidation();
      }, 500); // Debounce validation

      return () => clearTimeout(timer);
    }
  }, [selections, autoValidate, configuration]);

  // Handle option selection
  const handleOptionSelect = useCallback(async (optionId, quantity = 1) => {
    if (!configuration) return;

    // Update local selections state
    const newSelections = [...selections];
    const existingIndex = newSelections.findIndex(s => s.option_id === optionId);

    if (existingIndex >= 0) {
      if (quantity === 0) {
        newSelections.splice(existingIndex, 1);
      } else {
        newSelections[existingIndex].quantity = quantity;
      }
    } else if (quantity > 0) {
      newSelections.push({ option_id: optionId, quantity });
    }

    setSelections(newSelections);

    // Update configuration on backend
    try {
      await updateConfigMutation.mutateAsync({
        configId: configuration.id,
        configData: {
          ...configuration,
          selections: newSelections
        }
      });
    } catch (error) {
      console.error('Failed to update configuration:', error);
    }
  }, [configuration, selections, updateConfigMutation]);

  // Handle validation
  const handleValidation = useCallback(async () => {
    if (!configuration || !modelId) return;

    setIsValidating(true);
    try {
      await validateMutation.mutateAsync({
        configId: configuration.id,
        modelId: modelId
      });
    } finally {
      setIsValidating(false);
    }
  }, [configuration, modelId, validateMutation]);

  // Handle pricing calculation
  const handlePricing = useCallback(async () => {
    if (!configuration || selections.length === 0) return;

    setIsPricing(true);
    try {
      await pricingMutation.mutateAsync({
        model_id: modelId,
        selections: selections,
        customer_id: null, // Could be set for customer-specific pricing
        context: {}
      });
    } finally {
      setIsPricing(false);
    }
  }, [configuration, selections, modelId, pricingMutation]);

  // Step navigation
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Trigger validation when moving to validation step
      if (currentStep === 0) {
        handleValidation();
      }
      
      // Trigger pricing when moving to pricing step
      if (currentStep === 1) {
        handlePricing();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Complete configuration
  const handleComplete = () => {
    if (!configuration || !validationResults?.is_valid) {
      toast.error('Please resolve all validation issues before completing');
      return;
    }

    toast.success('Configuration completed successfully!');
    navigate(`/configurations/${configuration.id}/summary`);
  };

  // Loading and error states
  if (modelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading product model..." />
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
            onClick={() => navigate('/configure')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Models
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <CogIcon className="h-6 w-6 text-blue-600" />
                  Configure {model?.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  Build your perfect configuration step by step
                </p>
              </div>
              
              {/* Configuration Status */}
              <div className="flex items-center gap-4">
                {validationResults && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    validationResults.is_valid
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {validationResults.is_valid ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <ExclamationTriangleIcon className="h-4 w-4" />
                    )}
                    {validationResults.is_valid ? 'Valid' : 'Issues Found'}
                  </div>
                )}
                
                {configuration && (
                  <div className="text-sm text-gray-500">
                    Config ID: {configuration.id.slice(0, 8)}...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step Progress */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isAccessible = index <= currentStep || (validationResults?.is_valid && index <= currentStep + 1);

                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => isAccessible && goToStep(index)}
                      disabled={!isAccessible}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : isCompleted
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : isAccessible
                          ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">{step.name}</div>
                        <div className="text-xs opacity-75">{step.description}</div>
                      </div>
                    </button>
                    
                    {index < steps.length - 1 && (
                      <ArrowRightIcon className="h-4 w-4 text-gray-400 mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {/* Step 0: Product Selection */}
              {currentStep === 0 && (
                <ProductSelector
                  model={model}
                  selections={selections}
                  onSelectionChange={handleOptionSelect}
                  validationResults={validationResults}
                  isValidating={isValidating}
                />
              )}

              {/* Step 1: Constraint Validation */}
              {currentStep === 1 && (
                <ConstraintValidator
                  model={model}
                  configuration={configuration}
                  selections={selections}
                  validationResults={validationResults}
                  onRevalidate={handleValidation}
                  isValidating={isValidating}
                  onSelectionChange={handleOptionSelect}
                />
              )}

              {/* Step 2: Pricing Review */}
              {currentStep === 2 && (
                <PricingSummary
                  model={model}
                  configuration={configuration}
                  selections={selections}
                  pricingResults={pricingResults}
                  onRecalculate={handlePricing}
                  isPricing={isPricing}
                />
              )}

              {/* Step 3: Complete */}
              {currentStep === 3 && (
                <div className="text-center py-12">
                  <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Configuration Complete!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your configuration is ready. Review the details below and finalize your order.
                  </p>
                  
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900">Selected Options</h3>
                      <p className="text-2xl font-bold text-blue-600">{selections.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-900">Validation Status</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {validationResults?.is_valid ? 'Valid' : 'Issues'}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-900">Total Price</h3>
                      <p className="text-2xl font-bold text-purple-600">
                        ${pricingResults?.total_price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleComplete}
                    disabled={!validationResults?.is_valid}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-medium"
                  >
                    Complete Configuration
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-4">
            {/* Auto-validate toggle */}
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoValidate}
                onChange={(e) => setAutoValidate(e.target.checked)}
                className="rounded border-gray-300"
              />
              Auto-validate
            </label>

            {/* Manual validation button */}
            <button
              onClick={handleValidation}
              disabled={!configuration || isValidating}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              {isValidating ? (
                <ClockIcon className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircleIcon className="h-4 w-4" />
              )}
              Validate Now
            </button>
          </div>

          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Validation Details Modal */}
        <AnimatePresence>
          {showValidationDetails && validationResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowValidationDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Validation Details</h3>
                    <button
                      onClick={() => setShowValidationDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {validationResults.violations?.map((violation, index) => (
                    <div key={index} className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-900">{violation.rule_name}</h4>
                      <p className="text-red-700 text-sm mt-1">{violation.message}</p>
                      {violation.affected_options && (
                        <p className="text-red-600 text-xs mt-2">
                          Affects: {violation.affected_options.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default CustomerConfigurator;