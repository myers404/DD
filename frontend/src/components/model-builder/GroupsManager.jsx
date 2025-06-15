// frontend/src/components/model-builder/GroupsManager.jsx
// Complete groups management for CPQ model builder
// Handles CRUD operations for option groups with constraint validation

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
  RectangleGroupIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';
import { cpqApi, modelBuilderApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from '../common/ErrorBoundary';
import Modal from '../common/Modal';

const GroupsManager = ({ modelId, onGroupsChange = () => {} }) => {
  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState([]);

  const queryClient = useQueryClient();

  // Fetch model groups
  const { data: groups = [], isLoading, error } = useQuery({
    queryKey: ['model-groups', modelId],
    queryFn: () => cpqApi.getModelGroups(modelId),
    enabled: !!modelId,
  });

  // Fetch options for each group (for display purposes)
  const { data: options = [] } = useQuery({
    queryKey: ['model-options', modelId],
    queryFn: () => cpqApi.getModelOptions(modelId),
    enabled: !!modelId,
  });

  // Create/Update Group Mutation
  const saveGroupMutation = useMutation({
    mutationFn: async (groupData) => {
      if (groupData.id) {
        return modelBuilderApi.updateGroup(modelId, groupData.id, groupData);
      } else {
        return modelBuilderApi.createGroup(modelId, groupData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['model-groups', modelId]);
      queryClient.invalidateQueries(['model', modelId]);
      setShowCreateDialog(false);
      setEditingGroup(null);
      onGroupsChange();
      toast.success('Group saved successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to save group: ${error.message}`);
    },
  });

  // Delete Group Mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId) => modelBuilderApi.deleteGroup(modelId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-groups', modelId]);
      queryClient.invalidateQueries(['model', modelId]);
      onGroupsChange();
      toast.success('Group deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete group: ${error.message}`);
    },
  });

  // Toggle Group Active Status
  const toggleGroupMutation = useMutation({
    mutationFn: ({ groupId, active }) =>
        modelBuilderApi.updateGroup(modelId, groupId, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-groups', modelId]);
      onGroupsChange();
    },
    onError: (error) => {
      toast.error(`Failed to update group: ${error.message}`);
    },
  });

  // Group Reorder Mutation
  const reorderGroupsMutation = useMutation({
    mutationFn: (newOrder) =>
        modelBuilderApi.reorderGroups(modelId, newOrder),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-groups', modelId]);
      onGroupsChange();
      toast.success('Groups reordered successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to reorder groups: ${error.message}`);
    },
  });

  // Enhanced groups with options and validation
  const enhancedGroups = useMemo(() => {
    return groups.map(group => {
      const groupOptions = options.filter(option => option.groupId === group.id);
      const activeOptions = groupOptions.filter(option => option.active);

      // Validate group constraints
      const issues = [];

      if (group.type === 'single_select' && groupOptions.length === 0) {
        issues.push('Single-select group has no options');
      }

      if (group.type === 'multi_select') {
        if (group.minSelections > 0 && activeOptions.length < group.minSelections) {
          issues.push(`Requires ${group.minSelections} selections but only has ${activeOptions.length} active options`);
        }
        if (group.maxSelections > 0 && group.minSelections > group.maxSelections) {
          issues.push(`Minimum selections (${group.minSelections}) exceeds maximum (${group.maxSelections})`);
        }
      }

      if (group.required && activeOptions.length === 0) {
        issues.push('Required group has no active options');
      }

      return {
        ...group,
        options: groupOptions,
        activeOptions,
        issues,
        isValid: issues.length === 0,
      };
    });
  }, [groups, options]);

  // Filter and Sort Groups
  const filteredAndSortedGroups = useMemo(() => {
    let filtered = enhancedGroups.filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || group.type === filterType;
      const matchesStatus = filterStatus === 'all' ||
          (filterStatus === 'active' && group.active) ||
          (filterStatus === 'inactive' && !group.active) ||
          (filterStatus === 'issues' && !group.isValid);

      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort groups
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'order':
          aValue = a.displayOrder || 0;
          bValue = b.displayOrder || 0;
          break;
        case 'options':
          aValue = a.options.length;
          bValue = b.options.length;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [enhancedGroups, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  // Event Handlers
  const handleSaveGroup = (groupData) => {
    saveGroupMutation.mutate(groupData);
  };

  const handleDeleteGroup = (groupId) => {
    const group = enhancedGroups.find(g => g.id === groupId);
    if (group && group.options.length > 0) {
      toast.error(`Cannot delete group "${group.name}" because it contains ${group.options.length} option(s). Please remove or reassign the options first.`);
      return;
    }

    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      deleteGroupMutation.mutate(groupId);
    }
  };

  const handleToggleGroup = (groupId, currentStatus) => {
    toggleGroupMutation.mutate({ groupId, active: !currentStatus });
  };

  const handleToggleExpand = (groupId) => {
    setExpandedGroups(prev =>
        prev.includes(groupId)
            ? prev.filter(id => id !== groupId)
            : [...prev, groupId]
    );
  };

  const handleDuplicateGroup = (group) => {
    const duplicatedGroup = {
      ...group,
      name: `${group.name} (Copy)`,
      id: undefined, // Remove ID so it creates a new group
    };
    setEditingGroup(duplicatedGroup);
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="large" message="Loading groups..." />
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Groups</h3>
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
                <RectangleGroupIcon className="w-6 h-6 text-blue-600" />
                Groups Management
              </h2>
              <p className="text-gray-600 mt-1">
                Organize configuration options into logical groups ({filteredAndSortedGroups.length} of {groups.length} shown)
              </p>
            </div>
            <button
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Group
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
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="single_select">Single Select</option>
                <option value="multi_select">Multi Select</option>
                <option value="display">Display Only</option>
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
                <option value="issues">With Issues</option>
              </select>

              {/* Sort Options */}
              <div className="flex gap-2">
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="order">Sort by Order</option>
                  <option value="name">Sort by Name</option>
                  <option value="type">Sort by Type</option>
                  <option value="options">Sort by Options Count</option>
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
          </div>

          {/* Groups List */}
          {filteredAndSortedGroups.length > 0 && (
              <div className="space-y-4">
                {filteredAndSortedGroups.map((group) => {
                  const isExpanded = expandedGroups.includes(group.id);

                  return (
                      <motion.div
                          key={group.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                      >
                        {/* Group Header */}
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button
                                  onClick={() => handleToggleExpand(group.id)}
                                  className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                              >
                                {isExpanded ? (
                                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                                )}
                              </button>

                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>

                                  {/* Group Type Badge */}
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      group.type === 'single_select' ? 'bg-blue-100 text-blue-800' :
                                          group.type === 'multi_select' ? 'bg-green-100 text-green-800' :
                                              'bg-gray-100 text-gray-800'
                                  }`}>
                              {group.type === 'single_select' ? 'Single Select' :
                                  group.type === 'multi_select' ? 'Multi Select' :
                                      'Display Only'}
                            </span>

                                  {/* Required Badge */}
                                  {group.required && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Required
                              </span>
                                  )}

                                  {/* Status Badge */}
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      group.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                              {group.active ? 'Active' : 'Inactive'}
                            </span>

                                  {/* Issues Indicator */}
                                  {!group.isValid && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                                Issues
                              </span>
                                  )}
                                </div>

                                {group.description && (
                                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              <button
                                  onClick={() => handleToggleGroup(group.id, group.active)}
                                  className={`p-2 rounded-md transition-colors ${
                                      group.active
                                          ? 'text-green-600 hover:bg-green-50'
                                          : 'text-gray-400 hover:bg-gray-100'
                                  }`}
                                  title={group.active ? 'Deactivate' : 'Activate'}
                              >
                                {group.active ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                              </button>
                              <button
                                  onClick={() => handleDuplicateGroup(group)}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                  title="Duplicate Group"
                              >
                                <DocumentDuplicateIcon className="w-4 h-4" />
                              </button>
                              <button
                                  onClick={() => setEditingGroup(group)}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                  title="Edit Group"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Delete Group"
                                  disabled={group.options.length > 0}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Constraint Summary */}
                          <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                            {group.type === 'multi_select' && (
                                <span className="flex items-center">
                          <HashtagIcon className="w-4 h-4 mr-1" />
                          Selections: {group.minSelections || 0} - {group.maxSelections || 'unlimited'}
                        </span>
                            )}
                            <span className="flex items-center">
                        <Cog6ToothIcon className="w-4 h-4 mr-1" />
                        Order: {group.displayOrder || 0}
                      </span>
                            <span className="flex items-center">
                        <UserGroupIcon className="w-4 h-4 mr-1" />
                        Options: {group.activeOptions.length} active, {group.options.length} total
                      </span>
                          </div>

                          {/* Issues */}
                          {group.issues.length > 0 && (
                              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <div className="flex items-center mb-2">
                                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2" />
                                  <span className="text-sm font-medium text-red-800">Configuration Issues</span>
                                </div>
                                <ul className="text-sm text-red-700 space-y-1">
                                  {group.issues.map((issue, i) => (
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
                                        <UserGroupIcon className="w-4 h-4 mr-2" />
                                        Options ({group.options.length})
                                      </h5>
                                      {group.options.length > 0 ? (
                                          <div className="space-y-2">
                                            {group.options.map(option => (
                                                <div key={option.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                      <span className={`text-sm ${option.active ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {option.name}
                                      </span>
                                                  <div className="flex items-center space-x-2">
                                                    {option.basePrice > 0 && (
                                                        <span className="text-xs text-gray-500">
                                            ${option.basePrice.toFixed(2)}
                                          </span>
                                                    )}
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${
                                                        option.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                          {option.active ? 'Active' : 'Inactive'}
                                        </span>
                                                  </div>
                                                </div>
                                            ))}
                                          </div>
                                      ) : (
                                          <p className="text-sm text-gray-500 italic">No options assigned to this group</p>
                                      )}
                                    </div>

                                    {/* Constraints and Rules */}
                                    <div>
                                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                        <InformationCircleIcon className="w-4 h-4 mr-2" />
                                        Constraints & Rules
                                      </h5>
                                      <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Type:</span>
                                          <span className="font-medium">{group.type?.replace('_', ' ') || 'Not specified'}</span>
                                        </div>

                                        {group.type === 'multi_select' && (
                                            <>
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Min Selections:</span>
                                                <span className="font-medium">{group.minSelections || 0}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">Max Selections:</span>
                                                <span className="font-medium">{group.maxSelections || 'Unlimited'}</span>
                                              </div>
                                            </>
                                        )}

                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Required:</span>
                                          <span className="font-medium">{group.required ? 'Yes' : 'No'}</span>
                                        </div>

                                        <div className="flex justify-between">
                                          <span className="text-gray-600">Display Order:</span>
                                          <span className="font-medium">{group.displayOrder || 0}</span>
                                        </div>
                                      </div>

                                      {/* Validation Rules */}
                                      {group.validationRules && group.validationRules.length > 0 && (
                                          <div className="mt-4">
                                            <h6 className="text-sm font-medium text-gray-900 mb-2">Custom Validation Rules</h6>
                                            <ul className="space-y-1 text-sm text-gray-600">
                                              {group.validationRules.map((rule, i) => (
                                                  <li key={i} className="flex items-start">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                    {rule}
                                                  </li>
                                              ))}
                                            </ul>
                                          </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                  );
                })}
              </div>
          )}

          {/* Empty State */}
          {filteredAndSortedGroups.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <RectangleGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                      ? 'No matching groups' : 'No groups found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Start by creating your first option group to organize your configuration options.'
                  }
                </p>
                {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
                    <button
                        onClick={() => setShowCreateDialog(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create First Group
                    </button>
                )}
              </div>
          )}

          {/* Create/Edit Dialog */}
          <AnimatePresence>
            {showCreateDialog && (
                <GroupFormDialog
                    onSave={handleSaveGroup}
                    onCancel={() => setShowCreateDialog(false)}
                    isLoading={saveGroupMutation.isLoading}
                />
            )}
            {editingGroup && (
                <GroupFormDialog
                    group={editingGroup}
                    onSave={handleSaveGroup}
                    onCancel={() => setEditingGroup(null)}
                    isLoading={saveGroupMutation.isLoading}
                />
            )}
          </AnimatePresence>
        </div>
      </ErrorBoundary>
  );
};

// Group Form Dialog Component
const GroupFormDialog = ({ group = null, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    type: group?.type || 'multi_select',
    required: group?.required || false,
    active: group?.active !== undefined ? group.active : true,
    displayOrder: group?.displayOrder || 0,
    minSelections: group?.minSelections || 0,
    maxSelections: group?.maxSelections || 0,
    allowCustomizations: group?.allowCustomizations || false,
    validationRules: group?.validationRules || [],
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }

    if (formData.type === 'multi_select') {
      if (formData.minSelections < 0) {
        newErrors.minSelections = 'Minimum selections cannot be negative';
      }

      if (formData.maxSelections > 0 && formData.minSelections > formData.maxSelections) {
        newErrors.maxSelections = 'Maximum selections must be greater than minimum';
      }
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
      displayOrder: parseInt(formData.displayOrder) || 0,
      minSelections: parseInt(formData.minSelections) || 0,
      maxSelections: parseInt(formData.maxSelections) || 0,
    };

    if (group) {
      submitData.id = group.id;
    }

    onSave(submitData);
  };

  const groupTypes = [
    {
      value: 'single_select',
      label: 'Single Select',
      description: 'User can select only one option from this group'
    },
    {
      value: 'multi_select',
      label: 'Multi Select',
      description: 'User can select multiple options with constraints'
    },
    {
      value: 'display',
      label: 'Display Only',
      description: 'Options are displayed but cannot be selected'
    },
  ];

  return (
      <Modal isOpen={true} onClose={onCancel} size="large">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {group ? 'Edit Group' : 'Create New Group'}
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
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter group name"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Group Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Type *
                </label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {groupTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {groupTypes.find(t => t.value === formData.type)?.description}
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

            {/* Multi-Select Constraints */}
            {formData.type === 'multi_select' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Selections
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.minSelections}
                        onChange={(e) => setFormData({...formData, minSelections: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                            errors.minSelections ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0"
                    />
                    {errors.minSelections && (
                        <p className="mt-1 text-sm text-red-600">{errors.minSelections}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Selections
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={formData.maxSelections}
                        onChange={(e) => setFormData({...formData, maxSelections: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                            errors.maxSelections ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0 for unlimited"
                    />
                    {errors.maxSelections && (
                        <p className="mt-1 text-sm text-red-600">{errors.maxSelections}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">Leave 0 for unlimited selections</p>
                  </div>
                </div>
            )}

            {/* Display Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <p className="mt-1 text-sm text-gray-500">Lower numbers appear first</p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                    type="checkbox"
                    id="required"
                    checked={formData.required}
                    onChange={(e) => setFormData({...formData, required: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
                  This group is required (user must make at least one selection)
                </label>
              </div>

              <div className="flex items-center">
                <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Group is active and visible to users
                </label>
              </div>

              <div className="flex items-center">
                <input
                    type="checkbox"
                    id="allowCustomizations"
                    checked={formData.allowCustomizations}
                    onChange={(e) => setFormData({...formData, allowCustomizations: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowCustomizations" className="ml-2 block text-sm text-gray-900">
                  Allow customizations for options in this group
                </label>
              </div>
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
                {group ? 'Update Group' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
  );
};

export default GroupsManager;