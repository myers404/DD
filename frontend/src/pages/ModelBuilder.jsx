// frontend/src/pages/ModelBuilder.jsx
// Complete model builder interface for admins

import React, { useState, useEffect, useCallback } from 'react';
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
import RuleEditor from '../components/model-builder/RuleEditor';
import PricingRulesEditor from '../components/model-builder/PricingRulesEditor';
import ModelValidation from '../components/model-builder/ModelValidation';
import ConflictDetection from '../components/model-builder/ConflictDetection';
import ImpactAnalysis from '../components/model-builder/ImpactAnalysis';
import RulePriorityManager from '../components/model-builder/RulePriorityManager';

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
    data: model,
    isLoading: modelLoading,
    error: modelError
  } = useQuery({
    queryKey: ['model', modelId],
    queryFn: () => cpqApi.getModel(modelId),
    enabled: !!modelId,
    refetchOnWindowFocus: false
  });

  // Model statistics query
  const {
    data: modelStats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['model-stats', modelId],
    queryFn: () => modelBuilderApi.getModelStatistics(modelId),
    enabled: !!modelId,
    refetchOnWindowFocus: false
  });

  // Model mutations
  const updateModelMutation = useMutation({
    mutationFn: (data) => cpqApi.updateModel(modelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['model', modelId]);
      toast.success('Model updated successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update model');
    }
  });

  const deleteModelMutation = useMutation({
    mutationFn: () => cpqApi.deleteModel(modelId),
    onSuccess: () => {
      toast.success('Model deleted successfully');
      navigate('/models');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete model');
    }
  });

  const validateMutation = useMutation({
    mutationFn: () => modelBuilderApi.validateModel(modelId),
    onSuccess: (data) => {
      setValidationResults(data);
      toast.success('Model validation complete');
    },
    onError: (err) => {
      toast.error(err.message || 'Validation failed');
    }
  });

  // Tab definitions
  const tabs = [
    { id: 'overview', name: 'Overview', icon: InformationCircleIcon },
    { id: 'options', name: 'Options', icon: CogIcon },
    { id: 'groups', name: 'Groups', icon: UserGroupIcon },
    { id: 'rules', name: 'Rules', icon: WrenchScrewdriverIcon },
    { id: 'pricing', name: 'Pricing', icon: CurrencyDollarIcon },
    { id: 'validation', name: 'Validation', icon: BeakerIcon },
    { id: 'conflicts', name: 'Conflicts', icon: ShieldExclamationIcon },
    { id: 'impact', name: 'Impact', icon: ChartBarIcon },
    { id: 'priorities', name: 'Priorities', icon: ListBulletIcon }
  ];

  // Handlers
  const handleModelUpdate = useCallback(() => {
    queryClient.invalidateQueries(['model', modelId]);
    queryClient.invalidateQueries(['model-stats', modelId]);
  }, [modelId, queryClient]);

  const handleValidateModel = () => {
    validateMutation.mutate();
  };

  const handleDetectConflicts = () => {
    modelBuilderApi.detectConflicts(modelId)
        .then(data => {
          setConflictResults(data);
          toast.success('Conflict detection complete');
        })
        .catch(err => {
          toast.error(err.message || 'Conflict detection failed');
        });
  };

  const handleAnalyzeImpact = (changes) => {
    modelBuilderApi.analyzeImpact(modelId, changes)
        .then(data => {
          setImpactResults(data);
          toast.success('Impact analysis complete');
        })
        .catch(err => {
          toast.error(err.message || 'Impact analysis failed');
        });
  };

  const handleTestConfiguration = () => {
    window.open(`/test/configure/${modelId}`, '_blank');
  };

  const handleExportModel = () => {
    // Export functionality
    toast.info('Export feature coming soon');
  };

  const handleDeleteModel = () => {
    deleteModelMutation.mutate();
  };

  // Tab content rendering with fixed OverviewTab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
            <div className="space-y-6">
              {/* Model Info Card */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{model?.name || 'Untitled Model'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="text-gray-900">{model?.category || 'Uncategorized'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          model?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {model?.isActive ? 'Active' : 'Inactive'}
                      </span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-gray-900">
                        {model?.createdAt ? new Date(model.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Modified</label>
                      <p className="text-gray-900">
                        {model?.updatedAt ? new Date(model.updatedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Model ID</label>
                      <p className="text-xs text-gray-500 font-mono">{modelId}</p>
                    </div>
                  </div>
                </div>

                {model?.description && (
                    <div className="mt-4 pt-4 border-t">
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-gray-700 mt-1">{model.description}</p>
                    </div>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center">
                    <CogIcon className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Options</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {statsLoading ? '-' : modelStats?.optionsCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Groups</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {statsLoading ? '-' : modelStats?.groupsCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center">
                    <WrenchScrewdriverIcon className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Rules</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {statsLoading ? '-' : modelStats?.rulesCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="w-8 h-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Pricing Rules</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {statsLoading ? '-' : modelStats?.pricingRulesCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                      onClick={handleValidateModel}
                      disabled={validateMutation.isLoading}
                      className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <BeakerIcon className="w-5 h-5 mr-2" />
                    {validateMutation.isLoading ? 'Validating...' : 'Validate Model'}
                  </button>

                  <button
                      onClick={handleTestConfiguration}
                      className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Test Configuration
                  </button>

                  <button
                      onClick={handleExportModel}
                      className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    Export Model
                  </button>
                </div>
              </div>
            </div>
        );

      case 'options':
        return (
            <OptionsManager
                modelId={modelId}
                onUpdate={handleModelUpdate}
            />
        );

      case 'groups':
        return (
            <GroupsManager
                modelId={modelId}
                onUpdate={handleModelUpdate}
            />
        );

      case 'rules':
        return (
            <div className="space-y-6">
              <RuleEditor
                  modelId={modelId}
                  onUpdate={handleModelUpdate}
              />
            </div>
        );

      case 'pricing':
        return (
            <PricingRulesEditor
                modelId={modelId}
                onUpdate={handleModelUpdate}
            />
        );

      case 'validation':
        return (
            <ModelValidation
                modelId={modelId}
                validationResults={validationResults}
                onValidate={handleValidateModel}
            />
        );

      case 'conflicts':
        return (
            <ConflictDetection
                modelId={modelId}
                conflictResults={conflictResults}
                onDetect={handleDetectConflicts}
            />
        );

      case 'impact':
        return (
            <ImpactAnalysis
                modelId={modelId}
                impactResults={impactResults}
                onAnalyze={handleAnalyzeImpact}
            />
        );

      case 'priorities':
        return (
            <RulePriorityManager
                modelId={modelId}
                onUpdate={handleModelUpdate}
            />
        );

      default:
        return null;
    }
  };

  // Loading state
  if (modelLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" message="Loading model..." />
        </div>
    );
  }

  // Error state
  if (modelError) {
    return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load model</h3>
          <p className="mt-1 text-sm text-gray-500">{modelError.message}</p>
          <div className="mt-4">
            <Link
                to="/models"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Models
            </Link>
          </div>
        </div>
    );
  }

  return (
      <ErrorBoundary>
        <div className="p-6 max-w-7xl mx-auto">
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <CogIcon className="h-8 w-8 text-blue-600" />
                  {model?.name || 'Model Builder'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Build and configure your product model with options, rules, and pricing
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                    to={`/models/${modelId}/configurations`}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <RectangleStackIcon className="w-4 h-4 mr-2" />
                  View Configurations
                </Link>

                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Model
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                `}
                  >
                    <tab.icon
                        className={`mr-2 h-5 w-5 ${
                            activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                    />
                    {tab.name}
                  </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>

          {/* Delete Modal */}
          <Modal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              title="Delete Model"
              variant="danger"
          >
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete "{model?.name}"? This action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> All configurations created from this model will also be deleted.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                    onClick={handleDeleteModel}
                    disabled={deleteModelMutation.isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteModelMutation.isLoading ? 'Deleting...' : 'Delete Model'}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </ErrorBoundary>
  );
};

export default ModelBuilder;