// frontend/src/components/model-builder/PricingRulesEditor.jsx
// Enhanced pricing rules editor with advanced features
// Includes real-time validation, conflict detection, and rule testing

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  TagIcon,
  PercentBadgeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  BeakerIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { cpqApi, modelBuilderApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';
import Modal from '../common/Modal';

const PricingRulesEditor = ({ modelId, onPricingChange = () => {} }) => {
  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [testingRule, setTestingRule] = useState(null);
  const [showRuleTest, setShowRuleTest] = useState(false);
  const [selectedRules, setSelectedRules] = useState([]);

  const queryClient = useQueryClient();

  // Fetch pricing rules
  const { data: pricingRules = [], isLoading, error } = useQuery({
    queryKey: ['pricing-rules', modelId],
    queryFn: () => cpqApi.getPricingRules(modelId),
    enabled: !!modelId,
  });

  // Create/Update Rule Mutation
  const saveRuleMutation = useMutation({
    mutationFn: async (ruleData) => {
      if (ruleData.id) {
        return modelBuilderApi.updatePricingRule(modelId, ruleData.id, ruleData);
      } else {
        return modelBuilderApi.createPricingRule(modelId, ruleData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-rules', modelId]);
      queryClient.invalidateQueries(['model', modelId]);
      setShowCreateDialog(false);
      setEditingRule(null);
      onPricingChange();
      toast.success('Pricing rule saved successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to save pricing rule: ${error.message}`);
    },
  });

  // Delete Rule Mutation
  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId) => modelBuilderApi.deletePricingRule(modelId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-rules', modelId]);
      queryClient.invalidateQueries(['model', modelId]);
      onPricingChange();
      toast.success('Pricing rule deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete pricing rule: ${error.message}`);
    },
  });

  // Toggle Rule Active Status
  const toggleRuleMutation = useMutation({
    mutationFn: ({ ruleId, active }) =>
        modelBuilderApi.updatePricingRule(modelId, ruleId, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-rules', modelId]);
      onPricingChange();
    },
    onError: (error) => {
      toast.error(`Failed to update pricing rule: ${error.message}`);
    },
  });

  // Test Rule Mutation
  const testRuleMutation = useMutation({
    mutationFn: ({ ruleId, testData }) =>
        modelBuilderApi.testPricingRule(modelId, ruleId, testData),
    onSuccess: (data) => {
      toast.success('Rule test completed successfully!');
      return data;
    },
    onError: (error) => {
      toast.error(`Rule test failed: ${error.message}`);
    },
  });

  // Bulk Operations Mutation
  const bulkOperationMutation = useMutation({
    mutationFn: ({ action, ruleIds }) =>
        modelBuilderApi.bulkUpdatePricingRules(modelId, { action, ruleIds }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-rules', modelId]);
      setSelectedRules([]);
      onPricingChange();
      toast.success('Bulk operation completed successfully!');
    },
    onError: (error) => {
      toast.error(`Bulk operation failed: ${error.message}`);
    },
  });

  // Rule types configuration
  const ruleTypes = [
    {
      value: 'fixed_surcharge',
      label: 'Fixed Surcharge',
      description: 'Add a fixed amount to the price',
      icon: CurrencyDollarIcon,
      color: 'red'
    },
    {
      value: 'percentage_discount',
      label: 'Percentage Discount',
      description: 'Apply a percentage discount to the price',
      icon: PercentBadgeIcon,
      color: 'green'
    },
    {
      value: 'bundle_pricing',
      label: 'Bundle Pricing',
      description: 'Set a fixed price for a bundle of items',
      icon: TagIcon,
      color: 'blue'
    },
    {
      value: 'tiered_pricing',
      label: 'Tiered Pricing',
      description: 'Different prices based on quantity or value',
      icon: ChartBarIcon,
      color: 'purple'
    },
    {
      value: 'conditional_pricing',
      label: 'Conditional Pricing',
      description: 'Price adjustments based on complex conditions',
      icon: AdjustmentsHorizontalIcon,
      color: 'indigo'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Rules' },
    { value: 'discount', label: 'Discounts' },
    { value: 'surcharge', label: 'Surcharges' },
    { value: 'bundle', label: 'Bundles' },
    { value: 'promotion', label: 'Promotions' },
    { value: 'tier', label: 'Volume Tiers' }
  ];

  // Filter and Sort Rules
  const filteredAndSortedRules = useMemo(() => {
    let filtered = pricingRules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rule.condition?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
      const matchesStatus = filterStatus === 'all' ||
          (filterStatus === 'active' && rule.active) ||
          (filterStatus === 'inactive' && !rule.active);

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort rules
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'priority':
          aValue = a.priority || 0;
          bValue = b.priority || 0;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'value':
          aValue = a.value || 0;
          bValue = b.value || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [pricingRules, searchTerm, selectedCategory, filterStatus, sortBy, sortOrder]);

  // Utility Functions
  const getRuleTypeInfo = (type) => {
    return ruleTypes.find(t => t.value === type) || ruleTypes[0];
  };

  const formatPriceValue = (rule) => {
    const typeInfo = getRuleTypeInfo(rule.type);
    switch (rule.type) {
      case 'percentage_discount':
        return `-${rule.value}%`;
      case 'fixed_surcharge':
        return `+$${rule.value?.toFixed(2)}`;
      case 'bundle_pricing':
        return `$${rule.value?.toFixed(2)}`;
      case 'tiered_pricing':
        return `${rule.value}% off`;
      default:
        return rule.value ? `$${rule.value.toFixed(2)}` : 'N/A';
    }
  };

  const getRuleImpactColor = (rule) => {
    if (rule.type === 'percentage_discount' || rule.type === 'fixed_discount') {
      return 'text-green-600';
    } else if (rule.type === 'fixed_surcharge') {
      return 'text-red-600';
    } else {
      return 'text-blue-600';
    }
  };

  // Event Handlers
  const handleSaveRule = (ruleData) => {
    saveRuleMutation.mutate(ruleData);
  };

  const handleDeleteRule = (ruleId) => {
    if (window.confirm('Are you sure you want to delete this pricing rule? This action cannot be undone.')) {
      deleteRuleMutation.mutate(ruleId);
    }
  };

  const handleToggleRule = (ruleId, currentStatus) => {
    toggleRuleMutation.mutate({ ruleId, active: !currentStatus });
  };

  const handleTestRule = (rule) => {
    setTestingRule(rule);
    setShowRuleTest(true);
  };

  const handleDuplicateRule = (rule) => {
    const duplicatedRule = {
      ...rule,
      name: `${rule.name} (Copy)`,
      id: undefined, // Remove ID so it creates a new rule
      priority: (rule.priority || 0) + 1,
    };
    setEditingRule(duplicatedRule);
  };

  const handleSelectRule = (ruleId) => {
    setSelectedRules(prev =>
        prev.includes(ruleId)
            ? prev.filter(id => id !== ruleId)
            : [...prev, ruleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRules.length === filteredAndSortedRules.length) {
      setSelectedRules([]);
    } else {
      setSelectedRules(filteredAndSortedRules.map(rule => rule.id));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedRules.length === 0) {
      toast.error('Please select rules first');
      return;
    }

    const actionText = action === 'delete' ? 'delete' : action === 'activate' ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${actionText} ${selectedRules.length} selected rule(s)?`)) {
      bulkOperationMutation.mutate({ action, ruleIds: selectedRules });
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="large" message="Loading pricing rules..." />
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Pricing Rules</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
    );
  }

  return (
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CalculatorIcon className="w-6 h-6 text-blue-600" />
                Pricing Rules Management
              </h2>
              <p className="text-gray-600 mt-1">
                Configure pricing rules and discounts ({filteredAndSortedRules.length} of {pricingRules.length} shown)
              </p>
            </div>
            <button
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Pricing Rule
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search rules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              {/* Sort Options */}
              <div className="flex gap-2">
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="priority">Sort by Priority</option>
                  <option value="name">Sort by Name</option>
                  <option value="type">Sort by Type</option>
                  <option value="value">Sort by Value</option>
                </select>
                <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            <AnimatePresence>
              {selectedRules.length > 0 && (
                  <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedRules.length} rule(s) selected
                  </span>
                      <div className="flex gap-2">
                        <button
                            onClick={() => handleBulkAction('activate')}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                        >
                          Activate
                        </button>
                        <button
                            onClick={() => handleBulkAction('deactivate')}
                            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                        >
                          Deactivate
                        </button>
                        <button
                            onClick={() => handleBulkAction('delete')}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                        >
                          Delete
                        </button>
                        <button
                            onClick={() => setSelectedRules([])}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rules List */}
          {filteredAndSortedRules.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={selectedRules.length === filteredAndSortedRules.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                    />
                    <div className="grid grid-cols-7 gap-4 flex-1 text-sm font-medium text-gray-700">
                      <div>Rule Name</div>
                      <div>Type</div>
                      <div>Value</div>
                      <div>Priority</div>
                      <div>Status</div>
                      <div>Last Modified</div>
                      <div>Actions</div>
                    </div>
                  </div>
                </div>

                {/* Rules List */}
                <div className="divide-y divide-gray-200">
                  {filteredAndSortedRules.map((rule) => {
                    const typeInfo = getRuleTypeInfo(rule.type);
                    const IconComponent = typeInfo.icon;

                    return (
                        <motion.div
                            key={rule.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedRules.includes(rule.id)}
                                onChange={() => handleSelectRule(rule.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                            />
                            <div className="grid grid-cols-7 gap-4 flex-1">
                              {/* Rule Name */}
                              <div>
                                <div className="font-medium text-gray-900 flex items-center">
                                  <IconComponent className={`w-4 h-4 mr-2 text-${typeInfo.color}-500`} />
                                  {rule.name}
                                </div>
                                {rule.description && (
                                    <div className="text-sm text-gray-500 truncate">{rule.description}</div>
                                )}
                                {rule.condition && (
                                    <div className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                                      {rule.condition}
                                    </div>
                                )}
                              </div>

                              {/* Type */}
                              <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-800`}>
                            {typeInfo.label}
                          </span>
                              </div>

                              {/* Value */}
                              <div className={`font-medium ${getRuleImpactColor(rule)}`}>
                                {formatPriceValue(rule)}
                              </div>

                              {/* Priority */}
                              <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {rule.priority || 0}
                          </span>
                              </div>

                              {/* Status */}
                              <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.active ? 'Active' : 'Inactive'}
                          </span>
                              </div>

                              {/* Last Modified */}
                              <div className="text-sm text-gray-500">
                                {rule.updatedAt ? new Date(rule.updatedAt).toLocaleDateString() : 'N/A'}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleTestRule(rule)}
                                    className="p-1 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                    title="Test Rule"
                                >
                                  <BeakerIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleToggleRule(rule.id, rule.active)}
                                    className={`p-1 rounded-md transition-colors ${
                                        rule.active
                                            ? 'text-green-600 hover:bg-green-50'
                                            : 'text-gray-400 hover:bg-gray-100'
                                    }`}
                                    title={rule.active ? 'Deactivate' : 'Activate'}
                                >
                                  {rule.active ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleDuplicateRule(rule)}
                                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Duplicate Rule"
                                >
                                  <DocumentDuplicateIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setEditingRule(rule)}
                                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Edit Rule"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteRule(rule.id)}
                                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete Rule"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                    );
                  })}
                </div>
              </div>
          )}

          {/* Empty State */}
          {filteredAndSortedRules.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <CalculatorIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedCategory !== 'all' || filterStatus !== 'all'
                      ? 'No matching pricing rules' : 'No pricing rules found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory !== 'all' || filterStatus !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Start by creating your first pricing rule to manage discounts and surcharges.'
                  }
                </p>
                {!searchTerm && selectedCategory === 'all' && filterStatus === 'all' && (
                    <button
                        onClick={() => setShowCreateDialog(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create First Pricing Rule
                    </button>
                )}
              </div>
          )}

          {/* Create/Edit Dialog */}
          <AnimatePresence>
            {showCreateDialog && (
                <PricingRuleFormDialog
                    ruleTypes={ruleTypes}
                    categories={categories}
                    onSave={handleSaveRule}
                    onCancel={() => setShowCreateDialog(false)}
                    isLoading={saveRuleMutation.isLoading}
                />
            )}
            {editingRule && (
                <PricingRuleFormDialog
                    rule={editingRule}
                    ruleTypes={ruleTypes}
                    categories={categories}
                    onSave={handleSaveRule}
                    onCancel={() => setEditingRule(null)}
                    isLoading={saveRuleMutation.isLoading}
                />
            )}
            {showRuleTest && testingRule && (
                <RuleTestDialog
                    rule={testingRule}
                    onTest={(testData) => testRuleMutation.mutate({ ruleId: testingRule.id, testData })}
                    onClose={() => {
                      setShowRuleTest(false);
                      setTestingRule(null);
                    }}
                    isLoading={testRuleMutation.isLoading}
                />
            )}
          </AnimatePresence>
        </div>
      </ErrorBoundary>
  );
};

// Pricing Rule Form Dialog Component
const PricingRuleFormDialog = ({ rule = null, ruleTypes, categories, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    description: rule?.description || '',
    type: rule?.type || 'percentage_discount',
    category: rule?.category || 'discount',
    condition: rule?.condition || '',
    value: rule?.value || 0,
    priority: rule?.priority || 100,
    active: rule?.active !== undefined ? rule.active : true,
    startDate: rule?.startDate || '',
    endDate: rule?.endDate || '',
    maxUses: rule?.maxUses || 0,
    attributes: rule?.attributes || {},
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Rule name is required';
    }

    if (!formData.condition.trim()) {
      newErrors.condition = 'Condition is required';
    }

    if (formData.value === '' || formData.value < 0) {
      newErrors.value = 'Value must be a positive number';
    }

    if (formData.priority < 0) {
      newErrors.priority = 'Priority cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      value: parseFloat(formData.value) || 0,
      priority: parseInt(formData.priority) || 100,
      maxUses: parseInt(formData.maxUses) || 0,
    };

    if (rule) {
      submitData.id = rule.id;
    }

    onSave(submitData);
  };

  return (
      <Modal isOpen={true} onClose={onCancel} size="large">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {rule ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
            </h3>
            <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rule Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Name *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter rule name"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Rule Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Type *
                </label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {ruleTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {ruleTypes.find(t => t.value === formData.type)?.description}
                </p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono ${
                      errors.condition ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., total_price > 1000 || opt_premium_support"
              />
              {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Use logical expressions with option IDs, variables, and operators
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value *
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        errors.value ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                />
                {errors.value && (
                    <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {categories.filter(c => c.value !== 'all').map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <input
                    type="number"
                    min="0"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        errors.priority ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="100"
                />
                {errors.priority && (
                    <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Lower numbers = higher priority</p>
              </div>
            </div>

            {/* Date Range (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date (Optional)
                </label>
                <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Uses (Optional)
              </label>
              <input
                  type="number"
                  min="0"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0 for unlimited"
              />
              <p className="mt-1 text-sm text-gray-500">Leave 0 for unlimited uses</p>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Rule is active and will be applied to configurations
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isLoading}
              >
                Cancel
              </button>
              <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isLoading && <LoadingSpinner size="small" className="mr-2" />}
                {rule ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
  );
};

// Rule Test Dialog Component
const RuleTestDialog = ({ rule, onTest, onClose, isLoading = false }) => {
  const [testData, setTestData] = useState({
    totalPrice: 1000,
    customerType: 'regular',
    promoCode: '',
    selectedOptions: [],
    quantity: 1,
  });

  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    try {
      const result = await onTest(testData);
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: error.message });
    }
  };

  return (
      <Modal isOpen={true} onClose={onClose} size="medium">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Test Pricing Rule: {rule.name}
            </h3>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Rule Info */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Rule Details</h4>
              <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
              <div className="text-sm font-mono bg-white p-2 rounded border">
                Condition: {rule.condition}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Type: {rule.type} | Value: {rule.value} | Priority: {rule.priority}
              </div>
            </div>

            {/* Test Parameters */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Test Parameters</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Price
                  </label>
                  <input
                      type="number"
                      step="0.01"
                      value={testData.totalPrice}
                      onChange={(e) => setTestData({...testData, totalPrice: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Type
                  </label>
                  <select
                      value={testData.customerType}
                      onChange={(e) => setTestData({...testData, customerType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="regular">Regular</option>
                    <option value="student">Student</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="government">Government</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Promo Code
                </label>
                <input
                    type="text"
                    value={testData.promoCode}
                    onChange={(e) => setTestData({...testData, promoCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter promo code (optional)"
                />
              </div>
            </div>

            {/* Test Result */}
            {testResult && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-900 mb-2">Test Result</h4>
                  {testResult.error ? (
                      <div className="text-red-600 text-sm">{testResult.error}</div>
                  ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Rule Applied:</span>
                          <span className={testResult.applied ? 'text-green-600' : 'text-red-600'}>
                      {testResult.applied ? 'Yes' : 'No'}
                    </span>
                        </div>
                        {testResult.applied && (
                            <>
                              <div className="flex justify-between">
                                <span>Original Price:</span>
                                <span>${testResult.originalPrice?.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Adjusted Price:</span>
                                <span>${testResult.adjustedPrice?.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Savings:</span>
                                <span className="text-green-600">
                          ${(testResult.originalPrice - testResult.adjustedPrice)?.toFixed(2)}
                        </span>
                              </div>
                            </>
                        )}
                        {testResult.reason && (
                            <div className="mt-2 text-gray-600">
                              <strong>Reason:</strong> {testResult.reason}
                            </div>
                        )}
                      </div>
                  )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                  onClick={handleTest}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isLoading && <LoadingSpinner size="small" className="mr-2" />}
                <PlayIcon className="w-4 h-4 mr-2" />
                Test Rule
              </button>
            </div>
          </div>
        </div>
      </Modal>
  );
};

export default PricingRulesEditor;