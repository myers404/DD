// frontend/src/components/model-builder/OptionsManager.jsx
// Complete options management for CPQ model builder
// Handles CRUD operations for configuration options with real-time API integration

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  TagIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  FunnelIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { cpqApi, modelBuilderApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';
import Modal from '../common/Modal';

const OptionsManager = ({ modelId, onOptionsChange = () => {} }) => {
  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const queryClient = useQueryClient();

  // Fetch model options
  const { data: options = [], isLoading, error } = useQuery({
    queryKey: ['model-options', modelId],
    queryFn: () => cpqApi.getModelOptions(modelId),
    enabled: !!modelId,
  });

  // Fetch available groups for filtering
  const { data: groups = [] } = useQuery({
    queryKey: ['model-groups', modelId],
    queryFn: () => cpqApi.getModelGroups(modelId),
    enabled: !!modelId,
  });

  // Create/Update Option Mutation
  const saveOptionMutation = useMutation({
    mutationFn: async (optionData) => {
      if (optionData.id) {
        return modelBuilderApi.updateOption(modelId, optionData.id, optionData);
      } else {
        return modelBuilderApi.createOption(modelId, optionData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['model-options', modelId]);
      queryClient.invalidateQueries(['model', modelId]);
      setShowCreateDialog(false);
      setEditingOption(null);
      onOptionsChange();
      toast.success('Option saved successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to save option: ${error.message}`);
    },
  });

  // Delete Option Mutation
  const deleteOptionMutation = useMutation({
    mutationFn: (optionId) => modelBuilderApi.deleteOption(modelId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-options', modelId]);
      queryClient.invalidateQueries(['model', modelId]);
      onOptionsChange();
      toast.success('Option deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete option: ${error.message}`);
    },
  });

  // Toggle Option Active Status
  const toggleOptionMutation = useMutation({
    mutationFn: ({ optionId, active }) =>
        modelBuilderApi.updateOption(modelId, optionId, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-options', modelId]);
      onOptionsChange();
    },
    onError: (error) => {
      toast.error(`Failed to update option: ${error.message}`);
    },
  });

  // Bulk Operations Mutation
  const bulkOperationMutation = useMutation({
    mutationFn: ({ action, optionIds }) =>
        modelBuilderApi.bulkUpdateOptions(modelId, { action, optionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-options', modelId]);
      setSelectedOptions([]);
      setShowBulkActions(false);
      onOptionsChange();
      toast.success('Bulk operation completed successfully!');
    },
    onError: (error) => {
      toast.error(`Bulk operation failed: ${error.message}`);
    },
  });

  // Filter and Sort Options
  const filteredAndSortedOptions = useMemo(() => {
    let filtered = options.filter(option => {
      const matchesSearch = option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = filterGroup === 'all' || option.groupId === filterGroup;
      const matchesStatus = filterStatus === 'all' ||
          (filterStatus === 'active' && option.active) ||
          (filterStatus === 'inactive' && !option.active);

      return matchesSearch && matchesGroup && matchesStatus;
    });

    // Sort options
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.basePrice || 0;
          bValue = b.basePrice || 0;
          break;
        case 'group':
          aValue = a.groupName || '';
          bValue = b.groupName || '';
          break;
        case 'status':
          aValue = a.active ? 1 : 0;
          bValue = b.active ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [options, searchTerm, filterGroup, filterStatus, sortBy, sortOrder]);

  // Event Handlers
  const handleSaveOption = (optionData) => {
    saveOptionMutation.mutate(optionData);
  };

  const handleDeleteOption = (optionId) => {
    if (window.confirm('Are you sure you want to delete this option? This action cannot be undone.')) {
      deleteOptionMutation.mutate(optionId);
    }
  };

  const handleToggleOption = (optionId, currentStatus) => {
    toggleOptionMutation.mutate({ optionId, active: !currentStatus });
  };

  const handleBulkAction = (action) => {
    if (selectedOptions.length === 0) {
      toast.error('Please select options first');
      return;
    }

    const actionText = action === 'delete' ? 'delete' : action === 'activate' ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${actionText} ${selectedOptions.length} selected option(s)?`)) {
      bulkOperationMutation.mutate({ action, optionIds: selectedOptions });
    }
  };

  const handleSelectOption = (optionId) => {
    setSelectedOptions(prev =>
        prev.includes(optionId)
            ? prev.filter(id => id !== optionId)
            : [...prev, optionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOptions.length === filteredAndSortedOptions.length) {
      setSelectedOptions([]);
    } else {
      setSelectedOptions(filteredAndSortedOptions.map(option => option.id));
    }
  };

  // Show bulk actions when options are selected
  useEffect(() => {
    setShowBulkActions(selectedOptions.length > 0);
  }, [selectedOptions]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="large" message="Loading options..." />
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Options</h3>
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
                <Cog6ToothIcon className="w-6 h-6 text-blue-600" />
                Options Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage configuration options for this model ({filteredAndSortedOptions.length} of {options.length} shown)
              </p>
            </div>
            <button
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Option
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
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Group Filter */}
              <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Groups</option>
                {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
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
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="group">Sort by Group</option>
                  <option value="status">Sort by Status</option>
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
              {showBulkActions && (
                  <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedOptions.length} option(s) selected
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
                            onClick={() => setSelectedOptions([])}
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

          {/* Options List */}
          {filteredAndSortedOptions.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={selectedOptions.length === filteredAndSortedOptions.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                    />
                    <div className="grid grid-cols-6 gap-4 flex-1 text-sm font-medium text-gray-700">
                      <div>Option Name</div>
                      <div>Group</div>
                      <div>Price</div>
                      <div>Type</div>
                      <div>Status</div>
                      <div>Actions</div>
                    </div>
                  </div>
                </div>

                {/* Options List */}
                <div className="divide-y divide-gray-200">
                  {filteredAndSortedOptions.map((option) => (
                      <motion.div
                          key={option.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <input
                              type="checkbox"
                              checked={selectedOptions.includes(option.id)}
                              onChange={() => handleSelectOption(option.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                          />
                          <div className="grid grid-cols-6 gap-4 flex-1">
                            {/* Option Name */}
                            <div>
                              <div className="font-medium text-gray-900">{option.name}</div>
                              {option.description && (
                                  <div className="text-sm text-gray-500 truncate">{option.description}</div>
                              )}
                            </div>

                            {/* Group */}
                            <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {option.groupName || 'No Group'}
                        </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-sm font-medium">
                          {option.basePrice ? `$${option.basePrice.toFixed(2)}` : 'Free'}
                        </span>
                            </div>

                            {/* Type */}
                            <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            option.type === 'required' ? 'bg-red-100 text-red-800' :
                                option.type === 'optional' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                          {option.type || 'Optional'}
                        </span>
                            </div>

                            {/* Status */}
                            <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            option.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {option.active ? 'Active' : 'Inactive'}
                        </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              <button
                                  onClick={() => handleToggleOption(option.id, option.active)}
                                  className={`p-1 rounded-md transition-colors ${
                                      option.active
                                          ? 'text-green-600 hover:bg-green-50'
                                          : 'text-gray-400 hover:bg-gray-100'
                                  }`}
                                  title={option.active ? 'Deactivate' : 'Activate'}
                              >
                                {option.active ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                              </button>
                              <button
                                  onClick={() => setEditingOption(option)}
                                  className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                  title="Edit Option"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                  onClick={() => handleDeleteOption(option.id)}
                                  className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Delete Option"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                  ))}
                </div>
              </div>
          )}

          {/* Empty State */}
          {filteredAndSortedOptions.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Cog6ToothIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterGroup !== 'all' || filterStatus !== 'all'
                      ? 'No matching options' : 'No options found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterGroup !== 'all' || filterStatus !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Start by creating your first configuration option.'
                  }
                </p>
                {!searchTerm && filterGroup === 'all' && filterStatus === 'all' && (
                    <button
                        onClick={() => setShowCreateDialog(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create First Option
                    </button>
                )}
              </div>
          )}

          {/* Create/Edit Dialog */}
          <AnimatePresence>
            {showCreateDialog && (
                <OptionFormDialog
                    groups={groups}
                    onSave={handleSaveOption}
                    onCancel={() => setShowCreateDialog(false)}
                    isLoading={saveOptionMutation.isLoading}
                />
            )}
            {editingOption && (
                <OptionFormDialog
                    option={editingOption}
                    groups={groups}
                    onSave={handleSaveOption}
                    onCancel={() => setEditingOption(null)}
                    isLoading={saveOptionMutation.isLoading}
                />
            )}
          </AnimatePresence>
        </div>
      </ErrorBoundary>
  );
};

// Option Form Dialog Component
const OptionFormDialog = ({ option = null, groups = [], onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: option?.name || '',
    description: option?.description || '',
    groupId: option?.groupId || (groups[0]?.id || ''),
    basePrice: option?.basePrice || 0,
    type: option?.type || 'optional',
    active: option?.active !== undefined ? option.active : true,
    displayOrder: option?.displayOrder || 0,
    metadata: option?.metadata || {},
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Option name is required';
    }

    if (formData.basePrice < 0) {
      newErrors.basePrice = 'Price cannot be negative';
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
      basePrice: parseFloat(formData.basePrice) || 0,
      displayOrder: parseInt(formData.displayOrder) || 0,
    };

    if (option) {
      submitData.id = option.id;
    }

    onSave(submitData);
  };

  const optionTypes = [
    { value: 'required', label: 'Required', description: 'Must be selected' },
    { value: 'optional', label: 'Optional', description: 'Can be selected' },
    { value: 'default', label: 'Default', description: 'Selected by default' },
  ];

  return (
      <Modal isOpen={true} onClose={onCancel} size="large">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {option ? 'Edit Option' : 'Create New Option'}
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
              {/* Option Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option Name *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter option name"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group
                </label>
                <select
                    value={formData.groupId}
                    onChange={(e) => setFormData({...formData, groupId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Group</option>
                  {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price ($)
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        errors.basePrice ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                />
                {errors.basePrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>
                )}
              </div>

              {/* Option Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {optionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                  ))}
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({...formData, displayOrder: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                />
              </div>
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
                Option is active and available for selection
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
                {option ? 'Update Option' : 'Create Option'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
  );
};

export default OptionsManager;