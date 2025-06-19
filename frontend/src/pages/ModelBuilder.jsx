// frontend/src/pages/ModelBuilder.jsx
// Model builder interface with proper error handling and real API integration

import React, { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  CogIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BeakerIcon,
  DocumentTextIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  TrashIcon,
  PencilIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  PlayIcon,
  ClockIcon,
  UserGroupIcon,
  RectangleStackIcon,
  ShieldExclamationIcon,
  LightBulbIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

// API Functions
import { cpqApi, modelBuilderApi } from '../services/api';

// Model Builder Components
import OptionsManager from '../components/model-builder/OptionsManager';
import GroupsManager from '../components/model-builder/GroupsManager';
import RulesManager from '../components/model-builder/RulesManager';
import PricingRulesEditor from '../components/model-builder/PricingRulesEditor';
import ModelValidation from '../components/model-builder/ModelValidation';
import ConflictDetection from '../components/model-builder/ConflictDetection';
import ImpactAnalysis from '../components/model-builder/ImpactAnalysis';
import RulePriorityManager from '../components/model-builder/RulePriorityManager';
import ConstraintTester from '../components/model-builder/ConstraintTester';
import ConstraintApiTester from '../components/model-builder/ConstraintApiTester';

// Common Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import Modal from '../components/common/Modal';

const ModelBuilder = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [validationResults, setValidationResults] = useState(null);
  const [conflictResults, setConflictResults] = useState(null);
  const [impactResults, setImpactResults] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch current model
  const {
    data: modelResponse,
    isLoading: modelLoading,
    error: modelError
  } = useQuery({
    queryKey: ['model', modelId],
    queryFn: () => cpqApi.getModel(modelId),
    enabled: !!modelId,
    refetchOnWindowFocus: false
  });

  // Extract model data from API response
  const model = React.useMemo(() => {
    if (!modelResponse) return null;

    // Handle API response structure: { success: true, data: ModelResponse }
    if (modelResponse.data) {
      return modelResponse.data;
    }

    // Fallback: direct model data
    return modelResponse;
  }, [modelResponse]);

  // Model statistics query
  const {
    data: modelStatsResponse,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['model-stats', modelId],
    queryFn: () => modelBuilderApi.getModelStatistics(modelId),
    enabled: !!modelId,
    refetchOnWindowFocus: false
  });

  // Extract stats from response
  const modelStats = React.useMemo(() => {
    if (!modelStatsResponse) return null;

    if (modelStatsResponse.data) {
      return modelStatsResponse.data;
    }

    return modelStatsResponse;
  }, [modelStatsResponse]);

  // Delete model mutation
  const deleteMutation = useMutation({
    mutationFn: () => cpqApi.deleteModel(modelId),
    onSuccess: () => {
      toast.success('Model deleted successfully');
      navigate('/models');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete model');
    }
  });

  // Validation mutation
  const validateMutation = useMutation({
    mutationFn: () => modelBuilderApi.validateModel(modelId),
    onSuccess: (data) => {
      const results = data.data || data;
      setValidationResults(results);
      toast.success('Model validation completed');
    },
    onError: (error) => {
      toast.error(error.message || 'Validation failed');
    }
  });

  // Conflict detection mutation
  const conflictMutation = useMutation({
    mutationFn: () => modelBuilderApi.detectConflicts(modelId),
    onSuccess: (data) => {
      const results = data.data || data;
      setConflictResults(results);
      toast.success('Conflict detection completed');
    },
    onError: (error) => {
      toast.error(error.message || 'Conflict detection failed');
    }
  });

  // Handlers
  const handleModelUpdate = useCallback(() => {
    queryClient.invalidateQueries(['model', modelId]);
    queryClient.invalidateQueries(['model-stats', modelId]);
  }, [modelId, queryClient]);

  const handleRunValidation = useCallback(() => {
    validateMutation.mutate();
  }, [validateMutation]);

  const handleDetectConflicts = useCallback(() => {
    conflictMutation.mutate();
  }, [conflictMutation]);

  const handleDeleteModel = useCallback(() => {
    deleteMutation.mutate();
  }, [deleteMutation]);

  const tabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: InformationCircleIcon,
      description: 'Model summary and statistics'
    },
    {
      id: 'options',
      name: 'Options',
      icon: ListBulletIcon,
      description: 'Manage configuration options'
    },
    {
      id: 'groups',
      name: 'Groups',
      icon: UserGroupIcon,
      description: 'Organize options into groups'
    },
    {
      id: 'rules',
      name: 'Rules',
      icon: WrenchScrewdriverIcon,
      description: 'Configure business rules'
    },
    {
      id: 'pricing',
      name: 'Pricing',
      icon: CurrencyDollarIcon,
      description: 'Set up pricing rules'
    },
    {
      id: 'validation',
      name: 'Validation',
      icon: CheckCircleIcon,
      description: 'Validate model integrity'
    },
    {
      id: 'constraint-test',
      name: 'Constraint Test',
      icon: BeakerIcon,
      description: 'Test constraint rules interactively'
    },
    {
      id: 'api-test',
      name: 'API Test',
      icon: PlayIcon,
      description: 'Test backend constraint validation'
    }
  ];

  if (modelLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" message="Loading model..." />
        </div>
    );
  }

  if (modelError) {
    return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load model</h3>
          <p className="mt-1 text-sm text-gray-500">{modelError.message}</p>
          <div className="mt-4 space-x-3">
            <button
                onClick={() => queryClient.invalidateQueries(['model', modelId])}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
            <Link
                to="/models"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Models
            </Link>
          </div>
        </div>
    );
  }

  if (!model) {
    return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Model not found</h3>
          <p className="mt-1 text-sm text-gray-500">The requested model could not be found.</p>
          <Link
              to="/models"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Models
          </Link>
        </div>
    );
  }

  return (
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                  to="/models"
                  className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Models
              </Link>
            </div>

            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <CogIcon className="h-8 w-8" />
                  {model.name || 'Unnamed Model'}
                </h1>
                {model.description && (
                    <p className="text-gray-600 mt-1">{model.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>Version: {model.version || '1.0.0'}</span>
                  <span>•</span>
                  <span>Updated: {new Date(model.updated_at || model.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                    onClick={handleRunValidation}
                    disabled={validateMutation.isLoading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {validateMutation.isLoading ? (
                      <LoadingSpinner size="small" color="white" showMessage={false} />
                  ) : (
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                  )}
                  Validate
                </button>

                <button
                    onClick={handleDetectConflicts}
                    disabled={conflictMutation.isLoading}
                    className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  {conflictMutation.isLoading ? (
                      <LoadingSpinner size="small" color="white" showMessage={false} />
                  ) : (
                      <ShieldExclamationIcon className="h-4 w-4 mr-2" />
                  )}
                  Check Conflicts
                </button>

                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Model Stats Cards */}
          {modelStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center">
                    <ListBulletIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Options</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {model.options?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Groups</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {model.groups?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center">
                    <WrenchScrewdriverIcon className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Rules</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {model.rules?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/models/${modelId}/configurations`}
                  className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow block"
                >
                  <div className="flex items-center">
                    <RectangleStackIcon className="h-8 w-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Configurations</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {modelStats.configurations_count || 0}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg border">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                  `}
                    >
                      <tab.icon className="h-5 w-5 mr-2" />
                      {tab.name}
                    </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                >
                  {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Model Overview</h3>

                          {/* Validation Results */}
                          {validationResults && (
                              <div className="mb-6 p-4 border rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Validation Results</h4>
                                <div className={`p-3 rounded ${validationResults.is_valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                  {validationResults.is_valid ? 'Model is valid' : 'Model has validation errors'}
                                </div>
                              </div>
                          )}

                          {/* Conflict Results */}
                          {conflictResults && (
                              <div className="mb-6 p-4 border rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Conflict Detection</h4>
                                <div className={`p-3 rounded ${conflictResults.conflict_count === 0 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                                  {conflictResults.conflict_count === 0 ? 'No conflicts detected' : `${conflictResults.conflict_count} conflicts found`}
                                </div>
                              </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Model Info */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-900">Model Information</h4>
                              <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">ID:</dt>
                                  <dd className="text-gray-900 font-mono">{model.id}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Version:</dt>
                                  <dd className="text-gray-900">{model.version || '1.0.0'}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Created:</dt>
                                  <dd className="text-gray-900">{new Date(model.created_at).toLocaleDateString()}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Updated:</dt>
                                  <dd className="text-gray-900">{new Date(model.updated_at).toLocaleDateString()}</dd>
                                </div>
                              </dl>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-900">Quick Actions</h4>
                              <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('options')}
                                    className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                >
                                  <div className="flex items-center">
                                    <ListBulletIcon className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-sm font-medium">Manage Options</span>
                                  </div>
                                  <span className="text-sm text-gray-500">{model.options?.length || 0} items</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('groups')}
                                    className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                >
                                  <div className="flex items-center">
                                    <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-sm font-medium">Manage Groups</span>
                                  </div>
                                  <span className="text-sm text-gray-500">{model.groups?.length || 0} items</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('rules')}
                                    className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                >
                                  <div className="flex items-center">
                                    <WrenchScrewdriverIcon className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-sm font-medium">Configure Rules</span>
                                  </div>
                                  <span className="text-sm text-gray-500">{model.rules?.length || 0} items</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  )}

                  {activeTab === 'options' && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration Options</h3>
                        <OptionsManager
                            modelId={modelId}
                            onUpdate={handleModelUpdate}
                        />
                      </div>
                  )}

                  {activeTab === 'groups' && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Option Groups</h3>
                        <GroupsManager
                            modelId={modelId}
                            onUpdate={handleModelUpdate}
                        />
                      </div>
                  )}

                  {activeTab === 'rules' && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Rules</h3>
                        <RulesManager
                            modelId={modelId}
                            onUpdate={handleModelUpdate}
                        />
                      </div>
                  )}

                  {activeTab === 'pricing' && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Rules</h3>
                        <PricingRulesEditor
                            modelId={modelId}
                            onUpdate={handleModelUpdate}
                        />
                      </div>
                  )}

                  {activeTab === 'validation' && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Model Validation</h3>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <button
                                onClick={handleRunValidation}
                                disabled={validateMutation.isLoading}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              {validateMutation.isLoading ? (
                                  <LoadingSpinner size="small" color="white" showMessage={false} />
                              ) : (
                                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                              )}
                              Run Validation
                            </button>

                            <button
                                onClick={handleDetectConflicts}
                                disabled={conflictMutation.isLoading}
                                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                            >
                              {conflictMutation.isLoading ? (
                                  <LoadingSpinner size="small" color="white" showMessage={false} />
                              ) : (
                                  <ShieldExclamationIcon className="h-4 w-4 mr-2" />
                              )}
                              Detect Conflicts
                            </button>
                          </div>

                          {/* Display results */}
                          {validationResults && (
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">Validation Results</h4>
                                <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
                            {JSON.stringify(validationResults, null, 2)}
                          </pre>
                              </div>
                          )}

                          {conflictResults && (
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">Conflict Detection Results</h4>
                                <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
                            {JSON.stringify(conflictResults, null, 2)}
                          </pre>
                              </div>
                          )}
                        </div>
                      </div>
                  )}

                  {activeTab === 'constraint-test' && (
                      <ConstraintTester 
                        model={model} 
                        rules={model.rules || []} 
                      />
                  )}

                  {activeTab === 'api-test' && (
                      <ConstraintApiTester />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <Modal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              title="Delete Model"
          >
            <div className="space-y-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
                <p className="text-sm text-gray-900">
                  Are you sure you want to delete "{model.name}"? This action cannot be undone.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This will permanently delete the model and all its configurations.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                    onClick={handleDeleteModel}
                    disabled={deleteMutation.isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteMutation.isLoading ? 'Deleting...' : 'Delete Model'}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </ErrorBoundary>
  );
};

export default ModelBuilder;