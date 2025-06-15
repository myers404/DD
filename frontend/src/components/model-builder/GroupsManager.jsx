// frontend/src/components/model-builder/GroupsManager.jsx
// Fixed version - converted from .tsx to .jsx and made production-ready

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
  UserGroupIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CogIcon
} from '@heroicons/react/24/outline';

import { cpqApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';

const GroupsManager = ({ modelId }) => {
  const [editingGroup, setEditingGroup] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const queryClient = useQueryClient();

  // Fetch model groups with options
  const {
    data: groups = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['model-groups', modelId],
    queryFn: () => cpqApi.getModelGroupsWithOptions(modelId),
    enabled: !!modelId,
    refetchOnWindowFocus: false
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: (groupData) => cpqApi.createGroup(modelId, groupData),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-groups', modelId]);
      toast.success('Group created successfully!');
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create group');
    }
  });

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: ({ groupId, ...groupData }) =>
        cpqApi.updateGroup(modelId, groupId, groupData),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-groups', modelId]);
      toast.success('Group updated successfully!');
      setEditingGroup(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update group');
    }
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId) => cpqApi.deleteGroup(modelId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-groups', modelId]);
      toast.success('Group deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete group');
    }
  });

  // Toggle group active status
  const toggleGroupMutation = useMutation({
    mutationFn: ({ groupId, active }) =>
        cpqApi.updateGroup(modelId, groupId, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-groups', modelId]);
      toast.success('Group status updated!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update group status');
    }
  });

  // Toggle group expansion
  const toggleGroupExpansion = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Filter groups based on search and filters
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = showInactive || group.active;

    return matchesSearch && matchesActive;
  });

  // Validate group constraints
  const validateGroupConstraints = (group) => {
    const issues = [];

    if (group.type === 'multi_select') {
      if (group.minSelections > group.maxSelections) {
        issues.push('Minimum selections cannot exceed maximum selections');
      }
      if (group.maxSelections > group.options.length) {
        issues.push('Maximum selections exceeds available options');
      }
    }

    if (group.options.length === 0) {
      issues.push('Group has no options');
    }

    const activeOptions = group.options.filter(opt => opt.active);
    if (activeOptions.length === 0) {
      issues.push('Group has no active options');
    }

    return issues;
  };

  // Get group type information
  const getGroupTypeInfo = (type) => {
    const types = {
      single_select: {
        name: 'Single Select',
        description: 'User can select exactly one option',
        icon: '◯',
        color: 'blue'
      },
      multi_select: {
        name: 'Multi Select',
        description: 'User can select multiple options',
        icon: '☐',
        color: 'green'
      },
      optional: {
        name: 'Optional',
        description: 'User can optionally select one option',
        icon: '⊘',
        color: 'purple'
      }
    };

    return types[type] || types.single_select;
  };

  // Group Form Component
  const GroupForm = ({ group, onSave, onCancel, isCreating = false }) => {
    const [formData, setFormData] = useState({
      name: group?.name || '',
      description: group?.description || '',
      type: group?.type || 'single_select',
      active: group?.active !== false,
      displayOrder: group?.displayOrder || 1,
      minSelections: group?.minSelections || 0,
      maxSelections: group?.maxSelections || 1,
      ...group
    });

    const [validationErrors, setValidationErrors] = useState([]);

    const validateGroup = (groupData) => {
      const errors = [];
      if (!groupData.name?.trim()) errors.push('Name is required');
      if (groupData.type === 'multi_select') {
        if (groupData.minSelections > groupData.maxSelections) {
          errors.push('Minimum selections cannot exceed maximum selections');
        }
        if (groupData.minSelections < 0) errors.push('Minimum selections cannot be negative');
        if (groupData.maxSelections < 1) errors.push('Maximum selections must be at least 1');
      }
      return errors;
    };

    const handleSave = () => {
      const errors = validateGroup(formData);
      setValidationErrors(errors);

      if (errors.length === 0) {
        onSave(formData);
      }
    };

    const handleTypeChange = (newType) => {
      let updates = { type: newType };

      if (newType === 'single_select' || newType === 'optional') {
        updates.minSelections = newType === 'optional' ? 0 : 1;
        updates.maxSelections = 1;
      } else if (newType === 'multi_select') {
        updates.minSelections = 0;
        updates.maxSelections = 5;
      }

      setFormData({ ...formData, ...updates });
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
                  {isCreating ? 'Create New Group' : 'Edit Group'}
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
                      Group Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter group name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Type *
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="single_select">Single Select</option>
                      <option value="multi_select">Multi Select</option>
                      <option value="optional">Optional</option>
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
                      placeholder="Describe this group..."
                  />
                </div>

                {/* Selection Constraints for Multi Select */}
                {formData.type === 'multi_select' && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-blue-900 mb-3">Selection Constraints</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-800 mb-1">
                            Minimum Selections
                          </label>
                          <input
                              type="number"
                              value={formData.minSelections}
                              onChange={(e) => setFormData({...formData, minSelections: Number(e.target.value)})}
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-800 mb-1">
                            Maximum Selections
                          </label>
                          <input
                              type="number"
                              value={formData.maxSelections}
                              onChange={(e) => setFormData({...formData, maxSelections: Number(e.target.value)})}
                              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              min="1"
                          />
                        </div>
                      </div>
                    </div>
                )}

                {/* Display Order and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({...formData, displayOrder: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="flex items-center pt-2">
                      <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={(e) => setFormData({...formData, active: e.target.checked})}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                    </div>
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
                    disabled={createGroupMutation.isLoading || updateGroupMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {(createGroupMutation.isLoading || updateGroupMutation.isLoading) ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                      <CheckIcon className="w-4 h-4 mr-2" />
                  )}
                  {isCreating ? 'Create Group' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading groups..." />;
  }

  if (error) {
    return (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Groups</h3>
          <p className="text-gray-600">{error.message}</p>
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
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Groups Management
              </h3>
              <p className="text-gray-600">Organize options into logical groups with constraints</p>
            </div>

            <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Group
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg border space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
                      onClick={() => setExpandedGroups(new Set(filteredGroups.map(g => g.id)))}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    Expand All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                      onClick={() => setExpandedGroups(new Set())}
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
              Showing {filteredGroups.length} of {groups.length} groups
            </span>
              <div className="flex items-center space-x-4">
                <span>Active: {groups.filter(g => g.active).length}</span>
                <span>Inactive: {groups.filter(g => !g.active).length}</span>
              </div>
            </div>
          </div>

          {/* Groups List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredGroups.length > 0 ? (
                  filteredGroups
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((group) => {
                        const isExpanded = expandedGroups.has(group.id);
                        const issues = validateGroupConstraints(group);
                        const typeInfo = getGroupTypeInfo(group.type);

                        return (
                            <motion.div
                                key={group.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`bg-white border rounded-lg overflow-hidden ${
                                    group.active ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
                                } ${issues.length > 0 ? 'border-l-4 border-l-red-500' : ''}`}
                            >
                              {/* Group Header */}
                              <div className="p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 flex-1">
                                    <div className="flex items-center space-x-3">
                                      <div className={`p-2 rounded-lg ${
                                          group.active ? `bg-${typeInfo.color}-100` : 'bg-gray-100'
                                      }`}>
                                <span className={`text-lg ${
                                    group.active ? `text-${typeInfo.color}-600` : 'text-gray-400'
                                }`}>
                                  {typeInfo.icon}
                                </span>
                                      </div>

                                      <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                          <h4 className={`font-medium ${
                                              group.active ? 'text-gray-900' : 'text-gray-500'
                                          }`}>
                                            {group.name}
                                          </h4>

                                          {!group.active && (
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      <EyeSlashIcon className="w-3 h-3 mr-1" />
                                      Inactive
                                    </span>
                                          )}

                                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-800`}>
                                    {typeInfo.name}
                                  </span>
                                        </div>

                                        {group.description && (
                                            <p className="text-sm text-gray-600">{group.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => toggleGroupMutation.mutate({
                                          groupId: group.id,
                                          active: !group.active
                                        })}
                                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                        title={group.active ? 'Deactivate' : 'Activate'}
                                    >
                                      {group.active ? (
                                          <EyeIcon className="w-4 h-4" />
                                      ) : (
                                          <EyeSlashIcon className="w-4 h-4" />
                                      )}
                                    </button>

                                    <button
                                        onClick={() => setEditingGroup(group)}
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Edit Group"
                                    >
                                      <PencilIcon className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => {
                                          if (window.confirm('Are you sure you want to delete this group? This will also remove all options in the group.')) {
                                            deleteGroupMutation.mutate(group.id);
                                          }
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete Group"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => toggleGroupExpansion(group.id)}
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

                                {/* Constraint Summary */}
                                <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                                  {group.type === 'multi_select' && (
                                      <span>
                              Selections: {group.minSelections} - {group.maxSelections}
                            </span>
                                  )}
                                  <span>Order: {group.displayOrder}</span>
                                  <span>Active Options: {group.options?.filter(opt => opt.active).length || 0}</span>
                                  <span>Total Options: {group.options?.length || 0}</span>
                                </div>

                                {/* Issues */}
                                {issues.length > 0 && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                      <div className="flex items-center mb-2">
                                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2" />
                                        <span className="text-sm font-medium text-red-800">Configuration Issues</span>
                                      </div>
                                      <ul className="text-sm text-red-700 space-y-1">
                                        {issues.map((issue, i) => (
                                            <li key={i}>• {issue}</li>
                                        ))}
                                      </ul>
                                    </div>
                                )}
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
                                          {/* Options */}
                                          <div>
                                            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                              <CogIcon className="w-4 h-4 mr-2" />
                                              Options ({group.options?.length || 0})
                                            </h5>
                                            {group.options && group.options.length > 0 ? (
                                                <div className="space-y-2">
                                                  {group.options.map(option => (
                                                      <div key={option.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                          <span className={`text-sm ${option.active ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {option.name}
                                          </span>
                                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                          <span>${option.price?.toFixed(2) || '0.00'}</span>
                                                          {!option.active && (
                                                              <span className="text-red-500">Inactive</span>
                                                          )}
                                                        </div>
                                                      </div>
                                                  ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No options in this group</p>
                                            )}
                                          </div>

                                          {/* Constraints & Rules */}
                                          <div>
                                            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                              <ListBulletIcon className="w-4 h-4 mr-2" />
                                              Constraints
                                            </h5>
                                            <div className="space-y-2 text-sm">
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Type:</span>
                                                <span className="font-medium">{typeInfo.name}</span>
                                              </div>
                                              {group.type === 'multi_select' && (
                                                  <>
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-600">Min Selections:</span>
                                                      <span className="font-medium">{group.minSelections}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-600">Max Selections:</span>
                                                      <span className="font-medium">{group.maxSelections}</span>
                                                    </div>
                                                  </>
                                              )}
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Display Order:</span>
                                                <span className="font-medium">{group.displayOrder}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className={`font-medium ${group.active ? 'text-green-600' : 'text-red-600'}`}>
                                        {group.active ? 'Active' : 'Inactive'}
                                      </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                        );
                      })
              ) : (
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 bg-white rounded-lg border"
                  >
                    <Squares2X2Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm
                          ? 'Try adjusting your search term'
                          : 'Get started by creating your first group'
                      }
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setShowCreateDialog(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Create First Group
                        </button>
                    )}
                  </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Create/Edit Dialog */}
          <AnimatePresence>
            {showCreateDialog && (
                <GroupForm
                    isCreating={true}
                    onSave={(data) => createGroupMutation.mutate(data)}
                    onCancel={() => setShowCreateDialog(false)}
                />
            )}

            {editingGroup && (
                <GroupForm
                    group={editingGroup}
                    isCreating={false}
                    onSave={(data) => updateGroupMutation.mutate({
                      groupId: editingGroup.id,
                      ...data
                    })}
                    onCancel={() => setEditingGroup(null)}
                />
            )}
          </AnimatePresence>
        </div>
      </ErrorBoundary>
  );
};

export default GroupsManager;