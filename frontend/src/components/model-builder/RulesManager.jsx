// frontend/src/components/model-builder/RulesManager.jsx
// Rules management component with listing, create, update, delete functionality

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  WrenchScrewdriverIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

import { cpqApi, modelBuilderApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';
import RuleEditor from './RuleEditor';
import { ensureArray } from '../../utils/arrayUtils';

const RulesManager = ({ modelId }) => {
  const [editingRule, setEditingRule] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedRules, setExpandedRules] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showInactive, setShowInactive] = useState(false);

  const queryClient = useQueryClient();

  // Fetch model with options for rule building
  const {
    data: modelResponse,
    isLoading: modelLoading
  } = useQuery({
    queryKey: ['model', modelId],
    queryFn: () => cpqApi.getModel(modelId),
    enabled: !!modelId
  });

  // Extract model data from response
  const model = React.useMemo(() => {
    if (!modelResponse) return null;
    
    // Handle API response structure
    if (modelResponse.data) {
      console.log('Model data from response:', modelResponse.data);
      return modelResponse.data;
    }
    
    // Fallback: direct model data
    console.log('Model data (direct):', modelResponse);
    return modelResponse;
  }, [modelResponse]);

  // Fetch model rules
  const {
    data: rules = [],
    isLoading: rulesLoading,
    error: rulesError
  } = useQuery({
    queryKey: ['model-rules', modelId],
    queryFn: () => modelBuilderApi.getModelRules(modelId),
    enabled: !!modelId,
    refetchOnWindowFocus: false
  });

  // Create rule mutation
  const createRuleMutation = useMutation({
    mutationFn: (ruleData) => {
      // Generate ID for new rule
      const ruleWithId = {
        ...ruleData,
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      return modelBuilderApi.addRule(modelId, ruleWithId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['model-rules', modelId]);
      queryClient.invalidateQueries(['model', modelId]);
      toast.success('Rule created successfully!');
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create rule');
    }
  });

  // Update rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: ({ ruleId, ...ruleData }) => {
        console.log('Updating rule:', ruleId, 'with data:', ruleData);
        return modelBuilderApi.updateRule(modelId, ruleId, ruleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['model-rules', modelId]);
      queryClient.invalidateQueries(['model', modelId]);
      toast.success('Rule updated successfully!');
      setEditingRule(null);
    },
    onError: (error) => {
      console.error('Error updating rule:', error);
      toast.error(error.message || 'Failed to update rule');
    }
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId) => modelBuilderApi.deleteRule(modelId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-rules', modelId]);
      queryClient.invalidateQueries(['model', modelId]);
      toast.success('Rule deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete rule');
    }
  });

  // Toggle rule active status
  const toggleRuleMutation = useMutation({
    mutationFn: ({ rule, is_active }) => {
      // Send complete rule data with updated is_active status
      const updatedRule = {
        ...rule,
        is_active: is_active
      };
      return modelBuilderApi.updateRule(modelId, rule.id, updatedRule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['model-rules', modelId]);
      toast.success('Rule status updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update rule status');
    }
  });

  // Toggle rule expansion
  const toggleRuleExpansion = (ruleId) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId);
    } else {
      newExpanded.add(ruleId);
    }
    setExpandedRules(newExpanded);
  };

  // Map backend rule types to frontend rule types for display
  const mapBackendRuleType = (backendType) => {
    const typeMap = {
      'validation_rule': 'constraint',
      'requires': 'dependency',
      'excludes': 'exclusion',
      'mutual_exclusive': 'exclusion',
      'group_limit': 'constraint',
      'pricing_rule': 'constraint'
    };
    return typeMap[backendType] || backendType;
  };

  // Filter rules based on search and filters
  const filteredRules = ensureArray(rules).filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rule.expression || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rule.message || '').toLowerCase().includes(searchTerm.toLowerCase());
    // Map backend rule type to frontend type for filtering
    const mappedType = mapBackendRuleType(rule.type);
    const matchesType = filterType === 'all' || mappedType === filterType;
    const matchesActive = showInactive || rule.is_active !== false;

    return matchesSearch && matchesType && matchesActive;
  });

  // Get rule type information
  const getRuleTypeInfo = (type) => {
    // Map backend types to frontend types if needed
    const mappedType = mapBackendRuleType(type);
    
    const types = {
      constraint: {
        name: 'Constraint',
        description: 'Defines what combinations are allowed',
        icon: '🔒',
        color: 'blue'
      },
      dependency: {
        name: 'Dependency',
        description: 'One option requires another',
        icon: '🔗',
        color: 'green'
      },
      exclusion: {
        name: 'Exclusion',
        description: 'Mutually exclusive options',
        icon: '⚡',
        color: 'red'
      },
      requirement: {
        name: 'Requirement',
        description: 'Mandatory options under conditions',
        icon: '✓',
        color: 'purple'
      }
    };

    return types[mappedType] || types.constraint;
  };

  // Rule Card Component
  const RuleCard = ({ rule }) => {
    const isExpanded = expandedRules.has(rule.id);
    const typeInfo = getRuleTypeInfo(rule.type);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-white border rounded-lg overflow-hidden ${
                rule.is_active !== false ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
            }`}
        >
          {/* Rule Header */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg bg-${typeInfo.color}-100`}>
                    <span className="text-lg">{typeInfo.icon}</span>
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                        rule.is_active !== false ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {rule.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-800`}>
                        {typeInfo.name}
                      </span>
                      {rule.is_active === false && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <EyeSlashIcon className="w-3 h-3 mr-1" />
                            Inactive
                          </span>
                      )}
                      <span className="text-xs text-gray-500">
                        Priority: {rule.priority || 50}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expression */}
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <code className="text-sm text-gray-800 font-mono break-all">
                    {rule.expression}
                  </code>
                </div>

                {/* Message */}
                {rule.message && (
                    <div className="mt-3 flex items-start">
                      <InformationCircleIcon className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{rule.message}</p>
                    </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                    onClick={() => toggleRuleMutation.mutate({
                      rule: rule,
                      is_active: rule.is_active === false
                    })}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title={rule.is_active !== false ? 'Deactivate' : 'Activate'}
                >
                  {rule.is_active !== false ? (
                      <EyeIcon className="w-4 h-4" />
                  ) : (
                      <EyeSlashIcon className="w-4 h-4" />
                  )}
                </button>

                <button
                    onClick={() => setEditingRule(rule)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit Rule"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>

                <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this rule?')) {
                        deleteRuleMutation.mutate(rule.id);
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Rule"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>

                <button
                    onClick={() => toggleRuleExpansion(rule.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Rule Details</h5>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Type:</dt>
                            <dd className="font-medium">{typeInfo.name}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Priority:</dt>
                            <dd className="font-medium">{rule.priority || 50}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600">Status:</dt>
                            <dd className={`font-medium ${rule.is_active !== false ? 'text-green-600' : 'text-red-600'}`}>
                              {rule.is_active !== false ? 'Active' : 'Inactive'}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Description</h5>
                        <p className="text-sm text-gray-600">{typeInfo.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
    );
  };

  if (rulesLoading || modelLoading) {
    return <LoadingSpinner message="Loading rules..." />;
  }

  if (rulesError) {
    return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Rules</h3>
          <p className="text-gray-600">{rulesError.message}</p>
        </div>
    );
  }

  return (
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                Rules Management
              </h3>
              <p className="text-gray-600">Define constraints and business logic for your model</p>
            </div>

            <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Rule
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg border space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                    type="text"
                    placeholder="Search rules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Type Filter */}
              <div className="sm:w-48">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="constraint">Constraint</option>
                  <option value="dependency">Dependency</option>
                  <option value="exclusion">Exclusion</option>
                  <option value="requirement">Requirement</option>
                </select>
              </div>

              {/* View Controls */}
              <div className="flex items-center space-x-3">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                      type="checkbox"
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2"
                  />
                  Show Inactive
                </label>

                <div className="flex items-center space-x-1">
                  <button
                      onClick={() => setExpandedRules(new Set(filteredRules.map(r => r.id)))}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    Expand All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                      onClick={() => setExpandedRules(new Set())}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    Collapse All
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
              <span>
                Showing {filteredRules.length} of {rules.length} rules
              </span>
              <div className="flex items-center space-x-4">
                <span>Active: {ensureArray(rules).filter(r => r.is_active !== false).length}</span>
                <span>Inactive: {ensureArray(rules).filter(r => r.is_active === false).length}</span>
              </div>
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRules.length > 0 ? (
                  filteredRules
                      .sort((a, b) => (a.priority || 50) - (b.priority || 50))
                      .map(rule => (
                          <RuleCard key={rule.id} rule={rule} />
                      ))
              ) : (
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 bg-white rounded-lg border"
                  >
                    <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Rules Found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || filterType !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Get started by creating your first rule'
                      }
                    </p>
                    {!searchTerm && filterType === 'all' && (
                        <button
                            onClick={() => setShowCreateDialog(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Create First Rule
                        </button>
                    )}
                  </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Create/Edit Dialog */}
          <AnimatePresence>
            {(showCreateDialog || editingRule) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
                  >
                    <RuleEditor
                        rule={editingRule}
                        model={model}
                        onSave={(ruleData) => {
                          if (editingRule) {
                            updateRuleMutation.mutate({
                              ruleId: editingRule.id,
                              ...ruleData
                            });
                          } else {
                            createRuleMutation.mutate(ruleData);
                          }
                        }}
                        onCancel={() => {
                          setShowCreateDialog(false);
                          setEditingRule(null);
                        }}
                        isLoading={createRuleMutation.isLoading || updateRuleMutation.isLoading}
                    />
                  </motion.div>
                </div>
            )}
          </AnimatePresence>
        </div>
      </ErrorBoundary>
  );
};

export default RulesManager;