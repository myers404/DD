// frontend/src/pages/ModelBuilder.jsx
// Fixed version - production-ready with proper imports and real API integration

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  UserGroupIcon
} from '@heroicons/react/24/outline';

// API Functions
import { cpqApi, modelBuilderApi } from '../services/api';

// Fixed Components - Now using .jsx versions
import RuleEditor from '../components/model-builder/RuleEditor';
import ConflictDetection from '../components/model-builder/ConflictDetection';
import ImpactAnalysis from '../components/model-builder/ImpactAnalysis';
import ModelValidation from '../components/model-builder/ModelValidation';
import RulePriorityManager from '../components/model-builder/RulePriorityManager';
import OptionsManager from '../components/model-builder/OptionsManager';  // Fixed version
import GroupsManager from '../components/model-builder/GroupsManager';    // Fixed version
import PricingRulesEditor from '../components/model-builder/PricingRulesEditor';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import Modal from '../components/common/Modal';

const ModelBuilder = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [conflictResults, setConflictResults] = useState(null);
  const [impactResults, setImpactResults] = useState(null);

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

  // Fetch all models for navigation
  const {
    data: models = [],
    isLoading: modelsLoading
  } = useQuery({
    queryKey: ['models'],
    queryFn: () => cpqApi.getModels(),
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

  // Mutations for various operations
  const validateModelMutation = useMutation({
    mutationFn: (id) => modelBuilderApi.getModelQuality(id),
    onSuccess: (data) => {
      setValidationResults(data);
      toast.success('Model validation completed!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to validate model');
    }
  });

  const detectConflictsMutation = useMutation({
    mutationFn: (id) => modelBuilderApi.detectConflicts(id),
    onSuccess: (data) => {
      setConflictResults(data);
      if (data.conflicts?.length > 0) {
        toast.warning(`Found ${data.conflicts.length} conflicts`);
      } else {
        toast.success('No conflicts detected!');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to detect conflicts');
    }
  });

  const analyzeImpactMutation = useMutation({
    mutationFn: ({ modelId, changes }) => modelBuilderApi.analyzeImpact(modelId, changes),
    onSuccess: (data) => {
      setImpactResults(data);
      toast.success('Impact analysis completed!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to analyze impact');
    }
  });

  // Auto-run validation when model changes
  useEffect(() => {
    if (modelId && model) {
      // Auto-validate on load
      setTimeout(() => {
        validateModelMutation.mutate(modelId);
        detectConflictsMutation.mutate(modelId);
      }, 1000);
    }
  }, [modelId, model]);

  // Handle rule operations
  const handleRuleCreate = useCallback(() => {
    setSelectedRule(null);
    setShowRuleEditor(true);
  }, []);

  const handleRuleEdit = useCallback((rule) => {
    setSelectedRule(rule);
    setShowRuleEditor(true);
  }, []);

  const handleRuleSave = useCallback(async (ruleData) => {
    try {
      if (selectedRule) {
        // Update existing rule
        await modelBuilderApi.updateRule(modelId, selectedRule.id, ruleData);
        toast.success('Rule updated successfully!');
      } else {
        // Create new rule
        await modelBuilderApi.addRule(modelId, ruleData);
        toast.success('Rule created successfully!');
      }

      // Refresh data
      queryClient.invalidateQueries(['model', modelId]);

      // Re-run analysis
      detectConflictsMutation.mutate(modelId);
      analyzeImpactMutation.mutate({
        modelId,
        changes: [{ type: selectedRule ? 'update' : 'create', rule: ruleData }]
      });

      setShowRuleEditor(false);
      setSelectedRule(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save rule');
    }
  }, [modelId, selectedRule, queryClient, detectConflictsMutation, analyzeImpactMutation]);

  const handleRuleDelete = useCallback(async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) {
      return;
    }

    try {
      await modelBuilderApi.deleteRule(modelId, ruleId);

      // Refresh data
      queryClient.invalidateQueries(['model', modelId]);

      // Re-run analysis
      detectConflictsMutation.mutate(modelId);
      analyzeImpactMutation.mutate({
        modelId,
        changes: [{ type: 'delete', ruleId }]
      });

      toast.success('Rule deleted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete rule');
    }
  }, [modelId, queryClient, detectConflictsMutation, analyzeImpactMutation]);

  // Tab Configuration
  const tabs = [
    { id: 'overview', name: 'Overview', icon: DocumentTextIcon, description: 'Model summary and statistics' },
    { id: 'options', name: 'Options', icon: CogIcon, description: 'Manage configuration options' },
    { id: 'groups', name: 'Groups', icon: UserGroupIcon, description: 'Organize options into groups' },
    { id: 'rules', name: 'Rules', icon: WrenchScrewdriverIcon, description: 'Define business rules' },
    { id: 'pricing', name: 'Pricing', icon: CurrencyDollarIcon, description: 'Configure pricing rules' },
    { id: 'validation', name: 'Validation', icon: CheckCircleIcon, description: 'Model quality analysis' },
    { id: 'conflicts', name: 'Conflicts', icon: ExclamationTriangleIcon, description: 'Detect rule conflicts' },
    { id: 'impact', name: 'Impact', icon: BeakerIcon, description: 'Analyze change impacts' },
  ];

  // Get current tab info
  const currentTab = tabs.find(tab => tab.id === activeTab);

  // Loading States
  if (modelLoading || modelsLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" message="Loading model builder..." />
        </div>
    );
  }

  if (modelError) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Model Not Found</h2>
            <p className="text-gray-600 mb-6">
              {modelError.message || 'The requested model could not be loaded.'}
            </p>
            <div className="space-y-3">
              <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Dashboard
              </button>
              <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
    );
  }

  // Overview Tab Content
  const OverviewTab = () => (
      <div className="space-y-6">
        {/* Model Information */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
            Model Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Model Name</label>
              <p className="text-lg font-medium text-gray-900">{model?.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Version</label>
              <p className="text-lg font-medium text-gray-900">{model?.version || '1.0'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  model?.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
              }`}>
              {model?.active ? 'Active' : 'Inactive'}
            </span>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-sm text-gray-700">
                {model?.createdAt ? new Date(model.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Last Modified</label>
              <p className="text-sm text-gray-700">
                {model?.updatedAt ? new Date(model.updatedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Model ID</label>
              <p className="text-xs text-gray-500 font-mono">{modelId}</p>
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
              <ChartBarIcon className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Configurations</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsLoading ? '-' : modelStats?.configurationsCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
            Model Health
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${
                  validationResults?.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {validationResults?.isValid ? '✓' : '✗'}
              </div>
              <p className="text-sm text-gray-600 mt-1">Validation</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${
                  conflictResults?.conflicts?.length === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {conflictResults?.conflicts?.length || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">Conflicts</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {impactResults?.score?.toFixed(1) || 'N/A'}
              </div>
              <p className="text-sm text-gray-600 mt-1">Quality Score</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
                onClick={() => validateModelMutation.mutate(modelId)}
                disabled={validateModelMutation.isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {validateModelMutation.isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                  <PlayIcon className="w-4 h-4 mr-2" />
              )}
              Run Validation
            </button>

            <button
                onClick={() => detectConflictsMutation.mutate(modelId)}
                disabled={detectConflictsMutation.isLoading}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              {detectConflictsMutation.isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              )}
              Check Conflicts
            </button>

            <button
                onClick={() => analyzeImpactMutation.mutate({ modelId })}
                disabled={analyzeImpactMutation.isLoading}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {analyzeImpactMutation.isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                  <BeakerIcon className="w-4 h-4 mr-2" />
              )}
              Analyze Impact
            </button>
          </div>
        </div>
      </div>
  );

  return (
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                      onClick={() => navigate('/dashboard')}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Back to Dashboard"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>

                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
                      Model Builder
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {model?.name} - Visual editor for CPQ models, rules, and pricing
                    </p>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="flex items-center space-x-4">
                  {validationResults && (
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                          validationResults.isValid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                      }`}>
                        {validationResults.isValid ? (
                            <CheckCircleIcon className="w-4 h-4" />
                        ) : (
                            <ExclamationTriangleIcon className="w-4 h-4" />
                        )}
                        {validationResults.isValid ? 'Valid' : 'Issues Found'}
                      </div>
                  )}

                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Last updated: {model?.updatedAt ? new Date(model.updatedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;

                  return (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                              isActive
                                  ? 'border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.name}
                      </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Current tab description */}
            {currentTab && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <currentTab.icon className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">{currentTab.name}</h3>
                      <p className="text-sm text-blue-700">{currentTab.description}</p>
                    </div>
                  </div>
                </div>
            )}

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
              >
                {/* Overview Tab */}
                {activeTab === 'overview' && <OverviewTab />}

                {/* Options Tab */}
                {activeTab === 'options' && (
                    <OptionsManager
                        modelId={modelId}
                    />
                )}

                {/* Groups Tab */}
                {activeTab === 'groups' && (
                    <GroupsManager
                        modelId={modelId}
                    />
                )}

                {/* Rules Tab */}
                {activeTab === 'rules' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Business Rules</h3>
                        <button
                            onClick={handleRuleCreate}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Add Rule
                        </button>
                      </div>

                      <RuleEditor
                          model={model}
                          onRuleEdit={handleRuleEdit}
                          onRuleDelete={handleRuleDelete}
                      />
                    </div>
                )}

                {/* Pricing Tab */}
                {activeTab === 'pricing' && (
                    <PricingRulesEditor
                        modelId={modelId}
                    />
                )}

                {/* Validation Tab */}
                {activeTab === 'validation' && (
                    <ModelValidation
                        modelId={modelId}
                        results={validationResults}
                        isLoading={validateModelMutation.isLoading}
                        onRevalidate={() => validateModelMutation.mutate(modelId)}
                    />
                )}

                {/* Conflicts Tab */}
                {activeTab === 'conflicts' && (
                    <ConflictDetection
                        modelId={modelId}
                        results={conflictResults}
                        isLoading={detectConflictsMutation.isLoading}
                        onRedetect={() => detectConflictsMutation.mutate(modelId)}
                    />
                )}

                {/* Impact Tab */}
                {activeTab === 'impact' && (
                    <ImpactAnalysis
                        modelId={modelId}
                        results={impactResults}
                        isLoading={analyzeImpactMutation.isLoading}
                        onReanalyze={() => analyzeImpactMutation.mutate({ modelId })}
                    />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Rule Editor Modal */}
          <Modal
              isOpen={showRuleEditor}
              onClose={() => setShowRuleEditor(false)}
              title={selectedRule ? 'Edit Rule' : 'Create Rule'}
              size="large"
          >
            <RuleEditor
                rule={selectedRule}
                model={model}
                onSave={handleRuleSave}
                onCancel={() => setShowRuleEditor(false)}
            />
          </Modal>
        </div>
      </ErrorBoundary>
  );
};

export default ModelBuilder;