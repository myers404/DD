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
} from '@heroicons/react/24/outline';

// API Functions
import { cpqApi, modelBuilderApi } from '../services/api';

// Components
import RuleEditor from '../components/model-builder/RuleEditor';
import ConflictDetection from '../components/model-builder/ConflictDetection';
import ImpactAnalysis from '../components/model-builder/ImpactAnalysis.jsx';
import ModelValidation from '../components/model-builder/ModelValidation';
import RulePriorityManager from '../components/model-builder/RulePriorityManager';
import OptionsManager from '../components/model-builder/OptionsManager';
import GroupsManager from '../components/model-builder/GroupsManager';
import PricingRulesEditor from '../components/model-builder/PricingRulesEditor';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import Modal from '../components/common/Modal';

const ModelBuilder = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [conflictResults, setConflictResults] = useState(null);
  const [impactResults, setImpactResults] = useState(null);

  // Fetch Model Data
  const { data: model, isLoading: modelLoading, error: modelError } = useQuery({
    queryKey: ['model', modelId],
    queryFn: () => cpqApi.getModel(modelId),
    enabled: !!modelId,
  });

  // Model Validation Mutation
  const validateModelMutation = useMutation({
    mutationFn: modelBuilderApi.validateModel,
    onSuccess: (data) => {
      setValidationResults(data);
      if (data.isValid) {
        toast.success('Model validation passed!');
      } else {
        toast.warning(`Model has ${data.issues.length} validation issues`);
      }
    },
    onError: (error) => {
      toast.error(`Validation failed: ${error.message}`);
    },
  });

  // Conflict Detection Mutation
  const detectConflictsMutation = useMutation({
    mutationFn: modelBuilderApi.detectConflicts,
    onSuccess: (data) => {
      setConflictResults(data);
      if (data.conflicts.length === 0) {
        toast.success('No rule conflicts detected!');
      } else {
        toast.warning(`Found ${data.conflicts.length} rule conflicts`);
      }
    },
    onError: (error) => {
      toast.error(`Conflict detection failed: ${error.message}`);
    },
  });

  // Impact Analysis Mutation
  const analyzeImpactMutation = useMutation({
    mutationFn: modelBuilderApi.analyzeImpact,
    onSuccess: (data) => {
      setImpactResults(data);
      toast.success('Impact analysis completed');
    },
    onError: (error) => {
      toast.error(`Impact analysis failed: ${error.message}`);
    },
  });

  // Save Model Mutation
  const saveModelMutation = useMutation({
    mutationFn: cpqApi.updateModel,
    onSuccess: () => {
      toast.success('Model saved successfully!');
      queryClient.invalidateQueries(['model', modelId]);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(`Failed to save model: ${error.message}`);
    },
  });

  // Auto-run validation on model changes
  useEffect(() => {
    if (model && modelId) {
      validateModelMutation.mutate(modelId);
    }
  }, [model]);

  // Handle rule creation/editing
  const handleRuleEdit = useCallback((rule = null) => {
    setSelectedRule(rule);
    setShowRuleEditor(true);
  }, []);

  // Handle rule save
  const handleRuleSave = useCallback((ruleData) => {
    // Update model with new/edited rule
    const updatedRules = selectedRule
        ? model.rules.map(r => r.id === selectedRule.id ? { ...r, ...ruleData } : r)
        : [...model.rules, { ...ruleData, id: `rule_${Date.now()}` }];

    // Trigger conflict detection and impact analysis
    detectConflictsMutation.mutate(modelId);
    analyzeImpactMutation.mutate({ modelId, changes: [ruleData] });

    setShowRuleEditor(false);
    setSelectedRule(null);
    toast.success('Rule updated successfully!');
  }, [model, selectedRule, modelId]);

  // Handle rule deletion
  const handleRuleDelete = useCallback((ruleId) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      // Remove rule from model
      const updatedRules = model.rules.filter(r => r.id !== ruleId);

      // Re-run analysis
      detectConflictsMutation.mutate(modelId);
      analyzeImpactMutation.mutate({
        modelId,
        changes: [{ type: 'delete', ruleId }]
      });

      toast.success('Rule deleted successfully!');
    }
  }, [model, modelId]);

  // Tab Configuration
  const tabs = [
    { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
    { id: 'options', name: 'Options', icon: CogIcon },
    { id: 'groups', name: 'Groups', icon: ChartBarIcon },
    { id: 'rules', name: 'Rules', icon: WrenchScrewdriverIcon },
    { id: 'pricing', name: 'Pricing', icon: CurrencyDollarIcon },
    { id: 'validation', name: 'Validation', icon: CheckCircleIcon },
    { id: 'conflicts', name: 'Conflicts', icon: ExclamationTriangleIcon },
    { id: 'impact', name: 'Impact', icon: BeakerIcon },
  ];

  // Loading States
  if (modelLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="large" message="Loading model builder..." />
        </div>
    );
  }

  if (modelError) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Model Builder Error</h2>
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

  return (
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
                    Model Builder - {model?.name}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Visual editor for CPQ models, rules, and pricing
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {/* Validation Status */}
                  {validationResults && (
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                          validationResults.isValid
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                      }`}>
                        {validationResults.isValid ? (
                            <CheckCircleIcon className="h-4 w-4" />
                        ) : (
                            <ExclamationTriangleIcon className="h-4 w-4" />
                        )}
                        {validationResults.isValid ? 'Valid' : `${validationResults.issues.length} Issues`}
                      </div>
                  )}

                  {/* Edit Toggle */}
                  <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                          isEditing
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Model'}
                  </button>

                  {/* Save Button */}
                  {isEditing && (
                      <button
                          onClick={() => saveModelMutation.mutate({ id: modelId, ...model })}
                          disabled={saveModelMutation.isLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {saveModelMutation.isLoading ? 'Saving...' : 'Save Model'}
                      </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 py-0">
              <nav className="flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`${
                              isActive
                                  ? 'border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.name}

                        {/* Notification badges */}
                        {tab.id === 'conflicts' && conflictResults?.conflicts.length > 0 && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                        {conflictResults.conflicts.length}
                      </span>
                        )}
                        {tab.id === 'validation' && validationResults && !validationResults.isValid && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                        {validationResults.issues.length}
                      </span>
                        )}
                      </button>
                  );
                })}
              </nav>
            </div>
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
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Model Stats */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Statistics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Options:</span>
                          <span className="font-medium">{model.options?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Groups:</span>
                          <span className="font-medium">{model.groups?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rules:</span>
                          <span className="font-medium">{model.rules?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pricing Rules:</span>
                          <span className="font-medium">{model.pricing_rules?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button
                            onClick={() => validateModelMutation.mutate(modelId)}
                            disabled={validateModelMutation.isLoading}
                            className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                        >
                          {validateModelMutation.isLoading ? 'Validating...' : 'Validate Model'}
                        </button>
                        <button
                            onClick={() => detectConflictsMutation.mutate(modelId)}
                            disabled={detectConflictsMutation.isLoading}
                            className="w-full bg-amber-50 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-100 disabled:opacity-50"
                        >
                          {detectConflictsMutation.isLoading ? 'Detecting...' : 'Detect Conflicts'}
                        </button>
                        <button
                            onClick={() => analyzeImpactMutation.mutate({ modelId })}
                            disabled={analyzeImpactMutation.isLoading}
                            className="w-full bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 disabled:opacity-50"
                        >
                          {analyzeImpactMutation.isLoading ? 'Analyzing...' : 'Analyze Impact'}
                        </button>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="text-sm text-gray-600">
                        <p>Model last modified: {new Date(model.updated_at).toLocaleDateString()}</p>
                        <p className="mt-2">Last validation: {validationResults ? 'Just now' : 'Never'}</p>
                      </div>
                    </div>
                  </div>
              )}

              {/* Options Tab */}
              {activeTab === 'options' && (
                  <OptionsManager
                      model={model}
                      isEditing={isEditing}
                      onUpdate={(updatedOptions) => {
                        // Update model with new options
                        console.log('Options updated:', updatedOptions);
                      }}
                  />
              )}

              {/* Groups Tab */}
              {activeTab === 'groups' && (
                  <GroupsManager
                      model={model}
                      isEditing={isEditing}
                      onUpdate={(updatedGroups) => {
                        console.log('Groups updated:', updatedGroups);
                      }}
                  />
              )}

              {/* Rules Tab */}
              {activeTab === 'rules' && (
                  <div className="space-y-6">
                    {/* Rules Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Constraint Rules</h3>
                          <p className="text-gray-600 mt-1">Define product configuration constraints</p>
                        </div>
                        {isEditing && (
                            <button
                                onClick={() => handleRuleEdit()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                              <PlusIcon className="h-4 w-4" />
                              Add Rule
                            </button>
                        )}
                      </div>
                    </div>

                    {/* Rules List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="divide-y divide-gray-200">
                        {model.rules?.map((rule) => (
                            <div key={rule.id} className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900">{rule.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{rule.expression}</p>
                                  <div className="flex items-center gap-4 mt-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                  rule.type === 'constraint'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-green-100 text-green-700'
                              }`}>
                                {rule.type}
                              </span>
                                    <span className="text-xs text-gray-500">
                                Priority: {rule.priority || 'Auto'}
                              </span>
                                  </div>
                                </div>

                                {isEditing && (
                                    <div className="flex items-center gap-2">
                                      <button
                                          onClick={() => handleRuleEdit(rule)}
                                          className="text-gray-400 hover:text-blue-600"
                                      >
                                        <PencilIcon className="h-4 w-4" />
                                      </button>
                                      <button
                                          onClick={() => handleRuleDelete(rule.id)}
                                          className="text-gray-400 hover:text-red-600"
                                      >
                                        <TrashIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                )}
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
              )}

              {/* Pricing Tab */}
              {activeTab === 'pricing' && (
                  <PricingRulesEditor
                      model={model}
                      isEditing={isEditing}
                      onUpdate={(updatedPricingRules) => {
                        console.log('Pricing rules updated:', updatedPricingRules);
                      }}
                  />
              )}

              {/* Validation Tab */}
              {activeTab === 'validation' && (
                  <ModelValidation
                      results={validationResults}
                      isLoading={validateModelMutation.isLoading}
                      onRevalidate={() => validateModelMutation.mutate(modelId)}
                  />
              )}

              {/* Conflicts Tab */}
              {activeTab === 'conflicts' && (
                  <ConflictDetection
                      results={conflictResults}
                      isLoading={detectConflictsMutation.isLoading}
                      onRedetect={() => detectConflictsMutation.mutate(modelId)}
                  />
              )}

              {/* Impact Tab */}
              {activeTab === 'impact' && (
                  <ImpactAnalysis
                      results={impactResults}
                      isLoading={analyzeImpactMutation.isLoading}
                      onReanalyze={() => analyzeImpactMutation.mutate({ modelId })}
                  />
              )}
            </motion.div>
          </AnimatePresence>

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