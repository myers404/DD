// frontend/src/components/model-builder/OptionsManager.jsx
// Fixed version - converted from .tsx to .jsx and made production-ready

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
  EyeIcon,
  EyeSlashIcon,
  TagIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

import { cpqApi, modelBuilderApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';
import Modal from '../common/Modal';
import { ensureArray } from '../../utils/arrayUtils';

const OptionsManager = ({ modelId }) => {
  const [editingOption, setEditingOption] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  const queryClient = useQueryClient();

  // Fetch model options
  const {
    data: options = [],
    isLoading: optionsLoading,
    error: optionsError
  } = useQuery({
    queryKey: ['model-options', modelId],
    queryFn: () => cpqApi.getModelOptions(modelId),
    enabled: !!modelId,
    refetchOnWindowFocus: false
  });

  // Fetch available groups for the model
  const {
    data: groups = [],
    isLoading: groupsLoading
  } = useQuery({
    queryKey: ['model-groups', modelId],
    queryFn: () => cpqApi.getModelGroups(modelId),
    enabled: !!modelId,
    refetchOnWindowFocus: false
  });

  // Create option mutation
  const createOptionMutation = useMutation({
    mutationFn: (optionData) => {
      // Generate ID for new option
      const optionWithId = {
        ...optionData,
        id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      return cpqApi.createOption(modelId, optionWithId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['model-options', modelId]);
      queryClient.invalidateQueries(['model-groups', modelId]); // Refresh groups with options
      toast.success('Option created successfully!');
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create option');
    }
  });

  // Update option mutation
  const updateOptionMutation = useMutation({
    mutationFn: ({ optionId, ...optionData }) =>
        cpqApi.updateOption(modelId, optionId, optionData),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-options', modelId]);
      queryClient.invalidateQueries(['model-groups', modelId]); // Refresh groups with options
      toast.success('Option updated successfully!');
      setEditingOption(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update option');
    }
  });

  // Delete option mutation
  const deleteOptionMutation = useMutation({
    mutationFn: (optionId) => cpqApi.deleteOption(modelId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-options', modelId]);
      queryClient.invalidateQueries(['model-groups', modelId]); // Refresh groups with options
      toast.success('Option deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete option');
    }
  });

  // Toggle option active status
  const toggleOptionMutation = useMutation({
    mutationFn: ({ optionId, is_active }) =>
        cpqApi.updateOption(modelId, optionId, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-options', modelId]);
      queryClient.invalidateQueries(['model-groups', modelId]); // Refresh groups with options
      toast.success('Option status updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update option status');
    }
  });

  // Filter options based on search and filters
  const filteredOptions = ensureArray(options).filter(option => {
    const matchesSearch = option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || option.group_id === selectedGroup;
    const matchesActive = showInactive || option.is_active;

    return matchesSearch && matchesGroup && matchesActive;
  });

  // Get group name for display
  const getGroupName = (groupId) => {
    const group = ensureArray(groups).find(g => g.id === groupId);
    return group ? group.name : 'Ungrouped';
  };

  // Validate option data
  const validateOption = (option) => {
    const errors = [];
    if (!option.name?.trim()) errors.push('Name is required');
    if (!option.group_id) errors.push('Group selection is required');
    if (option.base_price && isNaN(option.base_price)) errors.push('Price must be a valid number');
    return errors;
  };

  // Option Form Component
  const OptionForm = ({ option, onSave, onCancel, isCreating = false }) => {
    const [formData, setFormData] = useState({
      name: option?.name || '',
      description: option?.description || '',
      group_id: option?.group_id || (ensureArray(groups)[0]?.id || ''),
      base_price: option?.base_price || 0,
      is_active: option?.is_active !== false,
      is_default: option?.is_default || false,
      attributes: option?.attributes || {},
      display_order: option?.display_order || 1,
      price: option?.price || option?.base_price || 0,
      ...option
    });

    const [attributeName, setAttributeName] = useState('');
    const [attributeValue, setAttributeValue] = useState('');
    const [validationErrors, setValidationErrors] = useState([]);

    const handleSave = () => {
      const errors = validateOption(formData);
      setValidationErrors(errors);

      if (errors.length === 0) {
        onSave(formData);
      }
    };

    const addAttribute = () => {
      if (attributeName && attributeValue) {
        setFormData({
          ...formData,
          attributes: { ...formData.attributes, [attributeName]: attributeValue }
        });
        setAttributeName('');
        setAttributeValue('');
      }
    };

    const removeAttribute = (key) => {
      const newAttributes = { ...formData.attributes };
      delete newAttributes[key];
      setFormData({ ...formData, attributes: newAttributes });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {isCreating ? 'Create New Option' : 'Edit Option'}
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
                      Option Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter option name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group *
                    </label>
                    <select
                        value={formData.group_id}
                        onChange={(e) => setFormData({...formData, group_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a group</option>
                      {ensureArray(groups).map(group => (
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe this option..."
                  />
                </div>

                {/* Price and Display Order */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <input
                        type="number"
                        value={formData.base_price}
                        onChange={(e) => setFormData({...formData, base_price: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({...formData, display_order: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="flex items-center space-x-3 pt-2">
                      <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Custom Attributes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Custom Attributes
                  </label>

                  {/* Existing Attributes */}
                  {Object.entries(formData.attributes).length > 0 && (
                      <div className="mb-4 space-y-2">
                        {Object.entries(formData.attributes).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="text-sm">
                          <strong>{key}:</strong> {value}
                        </span>
                              <button
                                  onClick={() => removeAttribute(key)}
                                  className="text-red-500 hover:text-red-700"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                        ))}
                      </div>
                  )}

                  {/* Add New Attribute */}
                  <div className="flex space-x-2">
                    <input
                        type="text"
                        value={attributeName}
                        onChange={(e) => setAttributeName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Attribute name"
                    />
                    <input
                        type="text"
                        value={attributeValue}
                        onChange={(e) => setAttributeValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Attribute value"
                    />
                    <button
                        onClick={addAttribute}
                        disabled={!attributeName || !attributeValue}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
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
                    disabled={createOptionMutation.isLoading || updateOptionMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {(createOptionMutation.isLoading || updateOptionMutation.isLoading) ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                      <CheckIcon className="w-4 h-4 mr-2" />
                  )}
                  {isCreating ? 'Create Option' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
    );
  };

  // Option Card Component
  const OptionCard = ({ option }) => {
    const groupName = getGroupName(option.group_id);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all ${
                !option.is_active ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-blue-300'
            }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className={`font-medium ${option.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                  {option.name}
                </h4>
                {!option.is_active && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <EyeSlashIcon className="w-3 h-3 mr-1" />
                  Inactive
                </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center">
                <TagIcon className="w-3 h-3 mr-1" />
                {groupName}
              </span>
                <span>${option.base_price?.toFixed(2) || '0.00'}</span>
                <span>Order: {option.display_order}</span>
              </div>

              {option.description && (
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
              )}

              {Object.keys(option.attributes || {}).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(option.attributes).map(([key, value]) => (
                        <span key={key} className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                    {key}: {value}
                  </span>
                    ))}
                  </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                  onClick={() => toggleOptionMutation.mutate({
                    optionId: option.id,
                    is_active: !option.is_active
                  })}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={option.is_active ? 'Deactivate' : 'Activate'}
              >
                {option.is_active ? (
                    <EyeIcon className="w-4 h-4" />
                ) : (
                    <EyeSlashIcon className="w-4 h-4" />
                )}
              </button>

              <button
                  onClick={() => setEditingOption(option)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit Option"
              >
                <PencilIcon className="w-4 h-4" />
              </button>

              <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this option?')) {
                      deleteOptionMutation.mutate(option.id);
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Option"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
    );
  };

  if (optionsLoading || groupsLoading) {
    return <LoadingSpinner message="Loading options..." />;
  }

  if (optionsError) {
    return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Options</h3>
          <p className="text-gray-600">{optionsError.message}</p>
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
                <CogIcon className="w-5 h-5 mr-2" />
                Options Management
              </h3>
              <p className="text-gray-600">Manage configuration options and their properties</p>
            </div>

            <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Option
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg border space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Group Filter */}
              <div className="sm:w-48">
                <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Groups</option>
                  {ensureArray(groups).map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
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
              Showing {filteredOptions.length} of {options.length} options
            </span>
              <div className="flex items-center space-x-4">
                <span>Active: {ensureArray(options).filter(o => o.is_active).length}</span>
                <span>Inactive: {ensureArray(options).filter(o => !o.is_active).length}</span>
              </div>
            </div>
          </div>

          {/* Options Grid */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredOptions.length > 0 ? (
                  filteredOptions
                      .sort((a, b) => a.display_order - b.display_order)
                      .map(option => (
                          <OptionCard key={option.id} option={option} />
                      ))
              ) : (
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 bg-white rounded-lg border"
                  >
                    <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Options Found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || selectedGroup !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Get started by creating your first option'
                      }
                    </p>
                    {!searchTerm && selectedGroup === 'all' && (
                        <button
                            onClick={() => setShowCreateDialog(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Create First Option
                        </button>
                    )}
                  </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Create/Edit Dialog */}
          <AnimatePresence>
            {showCreateDialog && (
                <OptionForm
                    isCreating={true}
                    onSave={(data) => createOptionMutation.mutate(data)}
                    onCancel={() => setShowCreateDialog(false)}
                />
            )}

            {editingOption && (
                <OptionForm
                    option={editingOption}
                    isCreating={false}
                    onSave={(data) => updateOptionMutation.mutate({
                      optionId: editingOption.id,
                      ...data
                    })}
                    onCancel={() => setEditingOption(null)}
                />
            )}
          </AnimatePresence>
        </div>
      </ErrorBoundary>
  );
};

export default OptionsManager;