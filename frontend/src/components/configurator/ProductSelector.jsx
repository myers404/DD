// frontend/src/components/configurator/ProductSelector.jsx
// Product option selection interface - fully functional implementation

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MinusIcon,
  TagIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const ProductSelector = ({ 
  model, 
  selections = [], 
  onSelectionChange, 
  validationResults = null, 
  isValidating = false 
}) => {
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState(new Set(['all']));
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'list'

  // Helper function to get selection quantity for an option
  const getSelectionQuantity = (optionId) => {
    const selection = selections.find(s => s.option_id === optionId);
    return selection ? selection.quantity : 0;
  };

  // Helper function to check if option has validation issues
  const getOptionValidationStatus = (optionId) => {
    if (!validationResults || !validationResults.violations) return null;
    
    const violation = validationResults.violations.find(v => 
      v.affected_options && v.affected_options.includes(optionId)
    );
    
    return violation ? { hasIssue: true, message: violation.message } : null;
  };

  // Helper function to get group validation status
  const getGroupValidationStatus = (groupId) => {
    if (!validationResults || !validationResults.violations) return null;
    
    const groupViolations = validationResults.violations.filter(v => 
      v.rule_type === 'group_constraint' && v.context?.includes(groupId)
    );
    
    return groupViolations.length > 0 ? {
      hasIssue: true,
      count: groupViolations.length,
      messages: groupViolations.map(v => v.message)
    } : null;
  };

  // Filter and search logic
  const filteredGroups = useMemo(() => {
    if (!model?.groups) return [];

    let groups = model.groups;

    // Filter by selected group
    if (selectedGroup !== 'all') {
      groups = groups.filter(group => group.id === selectedGroup);
    }

    // Search within groups and options
    if (searchTerm) {
      groups = groups.map(group => {
        const filteredOptions = group.options?.filter(option =>
          option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.id.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

        const groupMatches = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           group.description?.toLowerCase().includes(searchTerm.toLowerCase());

        if (groupMatches || filteredOptions.length > 0) {
          return { ...group, options: groupMatches ? group.options : filteredOptions };
        }
        return null;
      }).filter(Boolean);
    }

    return groups;
  }, [model?.groups, selectedGroup, searchTerm]);

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

  // Handle quantity change
  const handleQuantityChange = (optionId, change) => {
    const currentQuantity = getSelectionQuantity(optionId);
    const newQuantity = Math.max(0, currentQuantity + change);
    onSelectionChange(optionId, newQuantity);
  };

  // Handle direct quantity input
  const handleQuantityInput = (optionId, value) => {
    const quantity = Math.max(0, parseInt(value) || 0);
    onSelectionChange(optionId, quantity);
  };

  // Get group summary statistics
  const getGroupStats = (group) => {
    const groupOptions = group.options || [];
    const selectedOptions = groupOptions.filter(option => getSelectionQuantity(option.id) > 0);
    const totalQuantity = groupOptions.reduce((sum, option) => sum + getSelectionQuantity(option.id), 0);
    
    return {
      totalOptions: groupOptions.length,
      selectedOptions: selectedOptions.length,
      totalQuantity,
      minSelections: group.min_selections || 0,
      maxSelections: group.max_selections || Infinity
    };
  };

  // Render option card
  const renderOptionCard = (option, groupType = 'multi_select') => {
    const quantity = getSelectionQuantity(option.id);
    const isSelected = quantity > 0;
    const validationStatus = getOptionValidationStatus(option.id);

    return (
      <motion.div
        key={option.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`border rounded-lg p-4 transition-all ${
          isSelected 
            ? 'border-blue-300 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        } ${validationStatus?.hasIssue ? 'border-red-300 bg-red-50' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate">{option.name}</h4>
              {isSelected && (
                <CheckCircleIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
              )}
              {validationStatus?.hasIssue && (
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
              )}
            </div>
            
            {option.description && (
              <p className="text-sm text-gray-600 mt-1">{option.description}</p>
            )}
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <CurrencyDollarIcon className="h-4 w-4" />
                ${option.base_price?.toFixed(2) || '0.00'}
              </div>
              
              {option.sku && (
                <div className="text-xs text-gray-400">
                  SKU: {option.sku}
                </div>
              )}
            </div>

            {validationStatus?.hasIssue && (
              <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                <ExclamationTriangleIcon className="h-3 w-3 inline mr-1" />
                {validationStatus.message}
              </div>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2 ml-4">
            {groupType === 'single_select' ? (
              // Radio button for single select
              <input
                type="radio"
                name={`group_${option.group_id}`}
                checked={isSelected}
                onChange={() => onSelectionChange(option.id, isSelected ? 0 : 1)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
            ) : (
              // Quantity controls for multi-select
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleQuantityChange(option.id, -1)}
                  disabled={quantity === 0}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MinusIcon className="h-3 w-3" />
                </button>
                
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => handleQuantityInput(option.id, e.target.value)}
                  className="w-12 h-8 text-center border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                
                <button
                  onClick={() => handleQuantityChange(option.id, 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400"
                >
                  <PlusIcon className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Render group section
  const renderGroup = (group) => {
    const isExpanded = expandedGroups.has(group.id);
    const stats = getGroupStats(group);
    const validationStatus = getGroupValidationStatus(group.id);

    return (
      <motion.div
        key={group.id}
        layout
        className="border border-gray-200 rounded-lg overflow-hidden"
      >
        {/* Group Header */}
        <div
          className={`px-6 py-4 cursor-pointer transition-colors ${
            isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
          } ${validationStatus?.hasIssue ? 'bg-red-50 border-red-200' : ''}`}
          onClick={() => toggleGroupExpansion(group.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="flex items-center justify-center">
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  {group.name}
                  {validationStatus?.hasIssue && (
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                  )}
                </h3>
                {group.description && (
                  <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                )}
              </div>
            </div>

            {/* Group Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="text-gray-500">
                {stats.selectedOptions}/{stats.totalOptions} selected
              </div>
              
              {stats.totalQuantity > 0 && (
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Qty: {stats.totalQuantity}
                </div>
              )}
              
              {group.selection_type && (
                <div className="text-xs text-gray-400 capitalize">
                  {group.selection_type.replace('_', ' ')}
                </div>
              )}
            </div>
          </div>

          {/* Group Constraints Info */}
          {(group.min_selections > 0 || group.max_selections < Infinity) && (
            <div className="mt-2 text-xs text-gray-500">
              {group.min_selections > 0 && `Min: ${group.min_selections}`}
              {group.min_selections > 0 && group.max_selections < Infinity && ' | '}
              {group.max_selections < Infinity && `Max: ${group.max_selections}`}
            </div>
          )}

          {/* Group Validation Issues */}
          {validationStatus?.hasIssue && (
            <div className="mt-2 space-y-1">
              {validationStatus.messages.map((message, index) => (
                <div key={index} className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                  {message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Group Options */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-6 py-4 space-y-3 border-t border-gray-200">
                {group.options && group.options.length > 0 ? (
                  group.options.map(option => renderOptionCard(option, group.selection_type))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TagIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No options available in this group</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (!model) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Select Your Options</h2>
          <p className="text-gray-600 mt-1">
            Choose from {model.groups?.reduce((sum, group) => sum + (group.options?.length || 0), 0) || 0} available options
          </p>
        </div>

        {/* Validation Status */}
        {isValidating && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            Validating...
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Group Filter */}
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-4 w-4 text-gray-400" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Groups</option>
            {model.groups?.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              viewMode === 'grouped' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Grouped
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Selection Summary */}
      {selections.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Current Selection Summary</h3>
          <div className="flex flex-wrap gap-2">
            {selections.map(selection => {
              const option = model.groups
                ?.flatMap(g => g.options || [])
                ?.find(opt => opt.id === selection.option_id);
              
              if (!option) return null;
              
              return (
                <span
                  key={selection.option_id}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                >
                  {option.name}
                  {selection.quantity > 1 && (
                    <span className="text-blue-600">×{selection.quantity}</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Options Content */}
      <div className="space-y-4">
        {viewMode === 'grouped' ? (
          // Grouped View
          <AnimatePresence>
            {filteredGroups.length > 0 ? (
              filteredGroups.map(group => renderGroup(group))
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Options Found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No options match your search "${searchTerm}"`
                    : 'No options available in the selected group'
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-blue-600 hover:text-blue-700"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </AnimatePresence>
        ) : (
          // List View
          <div className="space-y-3">
            <AnimatePresence>
              {filteredGroups.flatMap(group => group.options || []).map(option => 
                renderOptionCard(option, 'multi_select')
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <InformationCircleIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Selection Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Use the search bar to quickly find specific options</li>
              <li>• Group filters help you focus on specific categories</li>
              <li>• Red highlighting indicates constraint violations that need attention</li>
              <li>• Auto-validation will check your selections automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;