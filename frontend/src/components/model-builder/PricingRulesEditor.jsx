// frontend/src/components/model-builder/PricingRulesEditor.jsx
// Pricing rules management component for model builder

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  BeakerIcon,
  TagIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { modelBuilderApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import { ensureArray } from '../../utils/arrayUtils';

const PricingRulesEditor = ({ modelId, onUpdate }) => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'volume_tier',
    expression: '',
    priority: 50,
    is_active: true
  });

  // Fetch pricing rules
  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['pricing-rules', modelId],
    queryFn: () => modelBuilderApi.getPricingRules(modelId),
    enabled: !!modelId
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => modelBuilderApi.createPricingRule(modelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-rules', modelId]);
      toast.success('Pricing rule created successfully');
      setShowCreateModal(false);
      resetForm();
      onUpdate?.();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create pricing rule');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ ruleId, data }) => modelBuilderApi.updatePricingRule(modelId, ruleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-rules', modelId]);
      toast.success('Pricing rule updated successfully');
      setShowEditModal(false);
      setSelectedRule(null);
      resetForm();
      onUpdate?.();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update pricing rule');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (ruleId) => modelBuilderApi.deletePricingRule(modelId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-rules', modelId]);
      toast.success('Pricing rule deleted successfully');
      onUpdate?.();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete pricing rule');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'volume_tier',
      expression: '',
      priority: 50,
      is_active: true
    });
  };

  const handleCreateRule = () => {
    if (!formData.name.trim()) {
      toast.error('Rule name is required');
      return;
    }
    if (!formData.expression.trim()) {
      toast.error('Rule expression is required');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdateRule = () => {
    if (!formData.name.trim()) {
      toast.error('Rule name is required');
      return;
    }
    if (!formData.expression.trim()) {
      toast.error('Rule expression is required');
      return;
    }
    updateMutation.mutate({ ruleId: selectedRule.id, data: formData });
  };

  const handleEditRule = (rule) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      type: rule.type || 'volume_tier',
      expression: rule.expression || '',
      priority: rule.priority || 50,
      is_active: rule.is_active !== false
    });
    setShowEditModal(true);
  };

  const handleDeleteRule = (ruleId) => {
    if (window.confirm('Are you sure you want to delete this pricing rule?')) {
      deleteMutation.mutate(ruleId);
    }
  };

  const getRuleTypeInfo = (type) => {
    const types = {
      volume_tier: { label: 'Volume Tier', icon: ChartBarIcon, color: 'purple' },
      fixed_discount: { label: 'Fixed Discount', icon: CurrencyDollarIcon, color: 'blue' },
      percent_discount: { label: 'Percent Discount', icon: TagIcon, color: 'green' },
      surcharge: { label: 'Surcharge', icon: CalculatorIcon, color: 'orange' },
      bundle: { label: 'Bundle', icon: BeakerIcon, color: 'indigo' }
    };
    return types[type] || types.volume_tier;
  };

  const formatExpression = (rule) => {
    if (!rule || !rule.expression) {
      return 'No expression';
    }
    return rule.expression;
  };

  // Rule Form Component
  const RuleForm = ({ isEdit = false }) => (
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rule Name *
          </label>
          <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Volume Discount Tier 1"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="volume_tier">Volume Tier</option>
            <option value="fixed_discount">Fixed Discount</option>
            <option value="percent_discount">Percent Discount</option>
            <option value="surcharge">Surcharge</option>
            <option value="bundle">Bundle</option>
          </select>
        </div>

        {/* Expression */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expression *
          </label>
          <input
              type="text"
              value={formData.expression}
              onChange={(e) => setFormData({ ...formData, expression: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., accessory_count >= 5 or discount_percent = 10"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the pricing rule expression (e.g., "quantity &gt;= 10" or "discount_percent = 15")
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe when this pricing rule applies..."
          />
        </div>

        {/* Priority and Active */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 50 })}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Higher priority rules apply first</p>
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>
      </div>
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading pricing rules..." />;
  }

  if (error) {
    return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Pricing Rules</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pricing Rules</h3>
            <p className="text-sm text-gray-600 mt-1">
              Configure dynamic pricing rules and discounts
            </p>
          </div>
          <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Pricing Rule
          </button>
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {ensureArray(rules).map((rule) => {
              const typeInfo = getRuleTypeInfo(rule.type);

              return (
                  <motion.div
                      key={rule.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <typeInfo.icon className={`w-5 h-5 text-${typeInfo.color}-600`} />
                          <h4 className="font-medium text-gray-900">{rule.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${typeInfo.color}-100 text-${typeInfo.color}-800`}>
                        {typeInfo.label}
                      </span>
                          <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {formatExpression(rule)}
                      </span>
                          {!rule.is_active && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                          )}
                        </div>

                        {rule.description && (
                            <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Priority: {rule.priority}</span>
                          <span>Type: {rule.type}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                            onClick={() => handleEditRule(rule)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit Rule"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Rule"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {ensureArray(rules).length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No Pricing Rules</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create pricing rules to define dynamic pricing for your model
              </p>
              <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add First Rule
              </button>
            </div>
        )}

        {/* Create Modal */}
        <Modal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            title="Create Pricing Rule"
        >
          <RuleForm />
          <div className="flex justify-end gap-3 mt-6">
            <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
                onClick={handleCreateRule}
                disabled={createMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isLoading ? 'Creating...' : 'Create Rule'}
            </button>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedRule(null);
              resetForm();
            }}
            title="Edit Pricing Rule"
        >
          <RuleForm isEdit />
          <div className="flex justify-end gap-3 mt-6">
            <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRule(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
                onClick={handleUpdateRule}
                disabled={updateMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isLoading ? 'Updating...' : 'Update Rule'}
            </button>
          </div>
        </Modal>
      </div>
  );
};

export default PricingRulesEditor;