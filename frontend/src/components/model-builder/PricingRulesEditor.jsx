// frontend/src/components/model-builder/PricingRulesEditor.jsx
// Complete production-ready pricing rules editor with real API integration

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  CalculatorIcon,
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

import { modelBuilderApi, pricingApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';
import Modal from '../common/Modal';

const PricingRulesEditor = ({ modelId }) => {
  const [editingRule, setEditingRule] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRuleType, setSelectedRuleType] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testRule, setTestRule] = useState(null);

  const queryClient = useQueryClient();

  // Fetch pricing rules
  const {
    data: pricingRules = [],
    isLoading: rulesLoading,
    error: rulesError
  } = useQuery({
    queryKey: ['pricing-rules', modelId],
    queryFn: () => modelBuilderApi.getPricingRules(modelId),
    enabled: !!modelId,
    refetchOnWindowFocus: false
  });

  // Fetch volume tiers for the model
  const {
    data: volumeTiers = [],
    isLoading: tiersLoading
  } = useQuery({
    queryKey: ['volume-tiers', modelId],
    queryFn: () => pricingApi.getModelVolumeTiers(modelId),
    enabled: !!modelId,
    refetchOnWindowFocus: false
  });

  // Create pricing rule mutation
  const createRuleMutation = useMutation({
    mutationFn: (ruleData) => modelBuilderApi.createPricingRule(modelId, ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-rules', modelId]);
      toast.success('Pricing rule created successfully!');
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create pricing rule');
    }
  });

  // Update pricing rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: ({ ruleId, ...ruleData }) =>
        modelBuilderApi.updatePricingRule(modelId, ruleId, ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-rules', modelId]);
      toast.success('Pricing rule updated successfully!');
      setEditingRule(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update pricing rule');
    }
  });

  // Delete pricing rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId) => modelBuilderApi.deletePricingRule(modelId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-rules', modelId]);
      toast.success('Pricing rule deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete pricing rule');
    }
  });

  // Test pricing calculation
  const testPricingMutation = useMutation({
    mutationFn: (testData) => pricingApi.simulatePricing(testData),
    onError: (error) => {
      toast.error(error.message || 'Failed to test pricing');
    }
  });

  // Rule types configuration
  const ruleTypes = {
    'base_price': {
      name: 'Base Price',
      description: 'Set base pricing for options',
      icon: CurrencyDollarIcon,
      color: 'blue'
    },
    'volume_discount': {
      name: 'Volume Discount',
      description: 'Quantity-based pricing adjustments',
      icon: ChartBarIcon,
      color: 'green'
    },
    'bundle_discount': {
      name: 'Bundle Discount',
      description: 'Discount for option combinations',
      icon: TagIcon,
      color: 'purple'
    },
    'conditional': {
      name: 'Conditional Pricing',
      description: 'Context-based pricing rules',
      icon: UserGroupIcon,
      color: 'orange'
    },
    'temporal': {
      name: 'Temporal Pricing',
      description: 'Time-based pricing adjustments',
      icon: CalendarIcon,
      color: 'red'
    }
  };

  // Filter rules based on search and filters
  const filteredRules = pricingRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rule.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedRuleType === 'all' || rule.type === selectedRuleType;
    const matchesActive = showInactive || rule.active;

    return matchesSearch && matchesType && matchesActive;
  });

  // Validate pricing rule
  const validateRule = (rule) => {
    const errors = [];
    if (!rule.name?.trim()) errors.push('Name is required');
    if (!rule.type) errors.push('Rule type is required');
    if (!rule.expression?.trim()) errors.push('Pricing expression is required');
    if (rule.priority && (rule.priority < 1 || rule.priority > 100)) {
      errors.push('Priority must be between 1 and 100');
    }
    return errors;
  };

  // Get rule type info
  const getRuleTypeInfo = (type) => {
    return ruleTypes[type] || ruleTypes.base_price;
  };

  // Pricing Rule Form Component
  const PricingRuleForm = ({ rule, onSave, onCancel, isCreating = false }) => {
    const [formData, setFormData] = useState({
      name: rule?.name || '',
      description: rule?.description || '',
      type: rule?.type || 'base_price',
      expression: rule?.expression || '',
      conditions: rule?.conditions || [],
      priority: rule?.priority || 50,
      active: rule?.active !== false,
      validFrom: rule?.validFrom || '',
      validTo: rule?.validTo || '',
      ...rule
    });

    const [validationErrors, setValidationErrors] = useState([]);
    const [previewResult, setPreviewResult] = useState(null);

    const handleSave = () => {
      const errors = validateRule(formData);
      setValidationErrors(errors);

      if (errors.length === 0) {
        onSave(formData);
      }
    };

    const handlePreview = async () => {
      try {
        const result = await pricingApi.simulatePricing({
          modelId,
          rules: [formData],
          testData: { quantity: 1, options: [] }
        });
        setPreviewResult(result);
      } catch (error) {
        toast.error('Failed to preview pricing rule');
      }
    };

    const addCondition = () => {
      setFormData({
        ...formData,
        conditions: [
          ...formData.conditions,
          { field: '', operator: 'equals', value: '', type: 'string' }
        ]
      });
    };

    const updateCondition = (index, updates) => {
      const newConditions = [...formData.conditions];
      newConditions[index] = { ...newConditions[index], ...updates };
      setFormData({ ...formData, conditions: newConditions });
    };

    const removeCondition = (index) => {
      const newConditions = formData.conditions.filter((_, i) => i !== index);
      setFormData({ ...formData, conditions: newConditions });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {isCreating ? 'Create Pricing Rule' : 'Edit Pricing Rule'}
                </h3>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center mb-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-red-800">Please fix the following errors:</span>
                    </div>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
              )}

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rule Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter rule name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rule Type *
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.entries(ruleTypes).map(([key, type]) => (
                          <option key={key} value={key}>
                            {type.name}
                          </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe this pricing rule..."
                  />
                </div>

                {/* Pricing Expression */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Expression *
                  </label>
                  <div className="space-y-2">
                  <textarea
                      value={formData.expression}
                      onChange={(e) => setFormData({...formData, expression: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="base_price * (1 - min(0.1, quantity * 0.01))"
                  />
                    <div className="text-xs text-gray-500">
                      Use variables: base_price, quantity, customer_tier, option_count
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Conditions
                    </label>
                    <button
                        onClick={addCondition}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Condition
                    </button>
                  </div>

                  {formData.conditions.length > 0 ? (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-md">
                        {formData.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded border">
                              <select
                                  value={condition.field}
                                  onChange={(e) => updateCondition(index, { field: e.target.value })}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="">Select Field</option>
                                <option value="quantity">Quantity</option>
                                <option value="customer_tier">Customer Tier</option>
                                <option value="option_count">Option Count</option>
                                <option value="total_value">Total Value</option>
                              </select>

                              <select
                                  value={condition.operator}
                                  onChange={(e) => updateCondition(index, { operator: e.target.value })}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="equals">Equals</option>
                                <option value="greater_than">Greater Than</option>
                                <option value="less_than">Less Than</option>
                                <option value="contains">Contains</option>
                              </select>

                              <input
                                  type="text"
                                  value={condition.value}
                                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Value"
                              />

                              <button
                                  onClick={() => removeCondition(index)}
                                  className="text-red-500 hover:text-red-700 p-1"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                        ))}
                      </div>
                  ) : (
                      <div className="text-sm text-gray-500 italic">No conditions set - rule applies to all scenarios</div>
                  )}
                </div>

                {/* Priority and Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority (1-100)
                    </label>
                    <input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid From
                    </label>
                    <input
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valid To
                    </label>
                    <input
                        type="date"
                        value={formData.validTo}
                        onChange={(e) => setFormData({...formData, validTo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({...formData, active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>

                  <button
                      onClick={handlePreview}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
                  >
                    <CalculatorIcon className="w-4 h-4 mr-1" />
                    Preview Result
                  </button>
                </div>

                {/* Preview Result */}
                {previewResult && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
                      <h4 className="text-sm font-medium text-purple-900 mb-2">Preview Result</h4>
                      <div className="text-sm text-purple-700">
                    <pre className="whitespace-pre-wrap font-mono">
                      {JSON.stringify(previewResult, null, 2)}
                    </pre>
                      </div>
                    </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={createRuleMutation.isLoading || updateRuleMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {(createRuleMutation.isLoading || updateRuleMutation.isLoading) ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                      <CheckIcon className="w-4 h-4 mr-2" />
                  )}
                  {isCreating ? 'Create Rule' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
    );
  };

  // Pricing Rule Card Component
  const PricingRuleCard = ({ rule }) => {
    const typeInfo = getRuleTypeInfo(rule.type);
    const Icon = typeInfo.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-white border rounded-lg p-6 hover:shadow-md transition-all ${
                !rule.active ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-blue-300'
            }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`p-2 rounded-lg bg-${typeInfo.color}-100`}>
                <Icon className={`w-5 h-5 text-${typeInfo.color}-600`} />
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className={`font-medium ${rule.active ? 'text-gray-900' : 'text-gray-500'}`}>
                    {rule.name}
                  </h4>

                  {!rule.active && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <EyeSlashIcon className="w-3 h-3 mr-1" />
                    Inactive
                  </span>
                  )}

                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-800`}>
                  {typeInfo.name}
                </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span>Priority: {rule.priority}</span>
                  {rule.conditions?.length > 0 && (
                      <span>{rule.conditions.length} conditions</span>
                  )}
                  {rule.validFrom && rule.validTo && (
                      <span>
                    Valid: {new Date(rule.validFrom).toLocaleDateString()} - {new Date(rule.validTo).toLocaleDateString()}
                  </span>
                  )}
                </div>

                {rule.description && (
                    <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                )}

                {/* Expression preview */}
                <div className="bg-gray-50 p-3 rounded border">
                  <code className="text-xs text-gray-700">{rule.expression}</code>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                  onClick={() => {
                    setTestRule(rule);
                    setShowTestDialog(true);
                  }}
                  className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                  title="Test Rule"
              >
                <CalculatorIcon className="w-4 h-4" />
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
                    if (window.confirm('Are you sure you want to delete this pricing rule?')) {
                      deleteRuleMutation.mutate(rule.id);
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Rule"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
    );
  };

  if (rulesLoading || tiersLoading) {
    return <LoadingSpinner message="Loading pricing rules..." />;
  }

  if (rulesError) {
    return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Pricing Rules</h3>
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
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Pricing Rules Management
              </h3>
              <p className="text-gray-600">Configure dynamic pricing rules and volume discounts</p>
            </div>

            <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Pricing Rule
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg border space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                    type="text"
                    placeholder="Search pricing rules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Rule Type Filter */}
              <div className="sm:w-48">
                <select
                    value={selectedRuleType}
                    onChange={(e) => setSelectedRuleType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  {Object.entries(ruleTypes).map(([key, type]) => (
                      <option key={key} value={key}>
                        {type.name}
                      </option>
                  ))}
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
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
            <span>
              Showing {filteredRules.length} of {pricingRules.length} pricing rules
            </span>
              <div className="flex items-center space-x-4">
                <span>Active: {pricingRules.filter(r => r.active).length}</span>
                <span>Inactive: {pricingRules.filter(r => !r.active).length}</span>
              </div>
            </div>
          </div>

          {/* Rule Type Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(ruleTypes).map(([key, type]) => {
              const count = pricingRules.filter(r => r.type === key).length;
              const Icon = type.icon;

              return (
                  <div key={key} className="bg-white border rounded-lg p-4 text-center">
                    <Icon className={`w-8 h-8 mx-auto mb-2 text-${type.color}-600`} />
                    <h4 className="font-medium text-gray-900 text-sm">{type.name}</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
              );
            })}
          </div>

          {/* Pricing Rules List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRules.length > 0 ? (
                  filteredRules
                      .sort((a, b) => b.priority - a.priority)
                      .map(rule => (
                          <PricingRuleCard key={rule.id} rule={rule} />
                      ))
              ) : (
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 bg-white rounded-lg border"
                  >
                    <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pricing Rules Found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || selectedRuleType !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Get started by creating your first pricing rule'
                      }
                    </p>
                    {!searchTerm && selectedRuleType === 'all' && (
                        <button
                            onClick={() => setShowCreateDialog(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Create First Pricing Rule
                        </button>
                    )}
                  </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Create/Edit Dialog */}
          <AnimatePresence>
            {showCreateDialog && (
                <PricingRuleForm
                    isCreating={true}
                    onSave={(data) => createRuleMutation.mutate(data)}
                    onCancel={() => setShowCreateDialog(false)}
                />
            )}

            {editingRule && (
                <PricingRuleForm
                    rule={editingRule}
                    isCreating={false}
                    onSave={(data) => updateRuleMutation.mutate({
                      ruleId: editingRule.id,
                      ...data
                    })}
                    onCancel={() => setEditingRule(null)}
                />
            )}
          </AnimatePresence>

          {/* Test Dialog */}
          <Modal
              isOpen={showTestDialog}
              onClose={() => setShowTestDialog(false)}
              title="Test Pricing Rule"
              size="medium"
          >
            {testRule && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Testing: {testRule.name}</h4>
                    <p className="text-sm text-gray-600">{testRule.description}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded border">
                    <code className="text-sm text-gray-700">{testRule.expression}</code>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => setShowTestDialog(false)}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                        onClick={() => {
                          testPricingMutation.mutate({
                            modelId,
                            rules: [testRule],
                            testData: { quantity: 1, options: [] }
                          });
                        }}
                        disabled={testPricingMutation.isLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                    >
                      {testPricingMutation.isLoading ? (
                          <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                          <CalculatorIcon className="w-4 h-4 mr-2" />
                      )}
                      Run Test
                    </button>
                  </div>
                </div>
            )}
          </Modal>
        </div>
      </ErrorBoundary>
  );
};

export default PricingRulesEditor;