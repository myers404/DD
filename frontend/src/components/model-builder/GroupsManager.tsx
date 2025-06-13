import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  RectangleGroupIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const GroupsManager = ({ modelId, onGroupChange = () => {} }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Sample groups data
  const sampleGroups = [
    {
      id: 'grp_cpu',
      name: 'Processor',
      description: 'CPU selection for the system',
      type: 'single_select',
      required: true,
      minSelections: 1,
      maxSelections: 1,
      displayOrder: 1,
      active: true,
      options: [
        { id: 'opt_cpu_basic', name: 'Basic CPU', active: true },
        { id: 'opt_cpu_mid', name: 'Mid-Range CPU', active: true },
        { id: 'opt_cpu_high', name: 'High-Performance CPU', active: true }
      ],
      validationRules: [
        'At least one CPU must be selected',
        'Only one CPU can be selected at a time'
      ]
    },
    {
      id: 'grp_memory',
      name: 'Memory',
      description: 'RAM configuration options',
      type: 'single_select',
      required: true,
      minSelections: 1,
      maxSelections: 1,
      displayOrder: 2,
      active: true,
      options: [
        { id: 'opt_ram_8gb', name: '8GB RAM', active: true },
        { id: 'opt_ram_16gb', name: '16GB RAM', active: true },
        { id: 'opt_ram_32gb', name: '32GB RAM', active: false }
      ],
      validationRules: [
        'Memory selection is required'
      ]
    },
    {
      id: 'grp_storage',
      name: 'Storage',
      description: 'Primary storage options',
      type: 'single_select',
      required: true,
      minSelections: 1,
      maxSelections: 1,
      displayOrder: 3,
      active: true,
      options: [
        { id: 'opt_storage_ssd', name: 'SSD Storage', active: true },
        { id: 'opt_storage_hdd', name: 'HDD Storage', active: false }
      ],
      validationRules: [
        'Storage selection is required'
      ]
    },
    {
      id: 'grp_accessories',
      name: 'Accessories',
      description: 'Optional accessories and add-ons',
      type: 'multi_select',
      required: false,
      minSelections: 0,
      maxSelections: 5,
      displayOrder: 4,
      active: true,
      options: [
        { id: 'opt_mouse', name: 'Wireless Mouse', active: true },
        { id: 'opt_keyboard', name: 'Mechanical Keyboard', active: true },
        { id: 'opt_monitor', name: 'External Monitor', active: true },
        { id: 'opt_speakers', name: 'Desktop Speakers', active: true }
      ],
      validationRules: [
        'Maximum 5 accessories can be selected'
      ]
    }
  ];

  const groupTypes = [
    { 
      value: 'single_select', 
      label: 'Single Select', 
      description: 'User must select exactly one option' 
    },
    { 
      value: 'multi_select', 
      label: 'Multi Select', 
      description: 'User can select multiple options within limits' 
    },
    { 
      value: 'optional', 
      label: 'Optional', 
      description: 'User can optionally select one or more options' 
    }
  ];

  useEffect(() => {
    loadGroups();
  }, [modelId]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setGroups(sampleGroups);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load groups:', error);
      setLoading(false);
    }
  };

  const saveGroup = (group) => {
    if (group.id) {
      setGroups(prev => prev.map(grp => grp.id === group.id ? group : grp));
    } else {
      const newGroup = {
        ...group,
        id: `grp_${Date.now()}`,
        active: true,
        options: [],
        validationRules: [],
        displayOrder: groups.length + 1
      };
      setGroups(prev => [...prev, newGroup]);
    }
    
    setEditingGroup(null);
    setShowCreateDialog(false);
    onGroupChange();
  };

  const deleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      setGroups(prev => prev.filter(grp => grp.id !== groupId));
      onGroupChange();
    }
  };

  const toggleGroupActive = (groupId) => {
    setGroups(prev => prev.map(grp => 
      grp.id === groupId ? { ...grp, active: !grp.active } : grp
    ));
    onGroupChange();
  };

  const moveGroup = (groupId, direction) => {
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;

    const newGroups = [...groups];
    const targetIndex = direction === 'up' ? groupIndex - 1 : groupIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < groups.length) {
      [newGroups[groupIndex], newGroups[targetIndex]] = [newGroups[targetIndex], newGroups[groupIndex]];
      
      // Update display orders
      newGroups.forEach((group, index) => {
        group.displayOrder = index + 1;
      });
      
      setGroups(newGroups);
      onGroupChange();
    }
  };

  const toggleGroupExpanded = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getGroupTypeInfo = (type) => {
    return groupTypes.find(t => t.value === type) || groupTypes[0];
  };

  const validateGroupConstraints = (group) => {
    const issues = [];
    
    if (group.type === 'single_select' && group.options.filter(opt => opt.active).length === 0) {
      issues.push('Single-select group has no active options');
    }
    
    if (group.required && group.minSelections === 0) {
      issues.push('Required group should have minSelections > 0');
    }
    
    if (group.maxSelections > 0 && group.minSelections > group.maxSelections) {
      issues.push('Minimum selections cannot exceed maximum selections');
    }
    
    const activeOptions = group.options.filter(opt => opt.active).length;
    if (group.minSelections > activeOptions) {
      issues.push(`Minimum selections (${group.minSelections}) exceeds active options (${activeOptions})`);
    }
    
    return issues;
  };

  const GroupFormDialog = ({ group, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: group?.name || '',
      description: group?.description || '',
      type: group?.type || 'single_select',
      required: group?.required !== false,
      minSelections: group?.minSelections || 0,
      maxSelections: group?.maxSelections || 1,
      displayOrder: group?.displayOrder || 1
    });

    const handleSave = () => {
      if (!formData.name.trim()) return;
      
      // Adjust selections based on type
      let adjustedData = { ...formData };
      if (formData.type === 'single_select') {
        adjustedData.minSelections = 1;
        adjustedData.maxSelections = 1;
      } else if (formData.type === 'optional') {
        adjustedData.required = false;
        adjustedData.minSelections = 0;
      }
      
      onSave({ ...group, ...adjustedData });
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {group ? 'Edit Group' : 'Create New Group'}
              </h3>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <p className="text-xs text-gray-500 mt-1">
                    {getGroupTypeInfo(formData.type).description}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter group description"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.required}
                    onChange={(e) => setFormData({...formData, required: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={formData.type === 'single_select'}
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Required Group
                  </label>
                </div>
              </div>

              {formData.type === 'multi_select' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Selections
                    </label>
                    <input
                      type="number"
                      value={formData.minSelections}
                      onChange={(e) => setFormData({...formData, minSelections: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Selections
                    </label>
                    <input
                      type="number"
                      value={formData.maxSelections}
                      onChange={(e) => setFormData({...formData, maxSelections: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({...formData, displayOrder: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <CheckIcon className="w-4 h-4 inline mr-2" />
                Save Group
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Groups Management</h3>
          <p className="text-gray-600">Organize options into logical groups with constraints</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Group
        </button>
      </div>

      {/* Groups List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {groups
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((group, index) => {
              const isExpanded = expandedGroups.has(group.id);
              const issues = validateGroupConstraints(group);
              const typeInfo = getGroupTypeInfo(group.type);

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
                            group.active ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <RectangleGroupIcon className={`w-5 h-5 ${
                              group.active ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-3">
                              <h4 className={`font-medium ${
                                group.active ? 'text-gray-900' : 'text-gray-500'
                              }`}>
                                {group.name}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                group.type === 'single_select' ? 'bg-blue-100 text-blue-800' :
                                group.type === 'multi_select' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {typeInfo.label}
                              </span>
                              {group.required && (
                                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                  Required
                                </span>
                              )}
                              {!group.active && (
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{group.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {group.options.filter(opt => opt.active).length} options
                        </span>
                        
                        <button
                          onClick={() => moveGroup(group.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move Up"
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => moveGroup(group.id, 'down')}
                          disabled={index === groups.length - 1}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move Down"
                        >
                          <ArrowDownIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleGroupActive(group.id)}
                          className={`p-1 rounded-md ${
                            group.active 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={group.active ? 'Deactivate' : 'Activate'}
                        >
                          {group.active ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => setEditingGroup(group)}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Edit Group"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteGroup(group.id)}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete Group"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleGroupExpanded(group.id)}
                          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          <AdjustmentsHorizontalIcon className={`w-4 h-4 transform transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`} />
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
                      <span>Active Options: {group.options.filter(opt => opt.active).length}</span>
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
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        option.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {option.active ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No options assigned to this group</p>
                              )}
                            </div>

                            {/* Validation Rules */}
                            <div>
                              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                                <InformationCircleIcon className="w-4 h-4 mr-2" />
                                Validation Rules
                              </h5>
                              {group.validationRules.length > 0 ? (
                                <ul className="space-y-1 text-sm text-gray-600">
                                  {group.validationRules.map((rule, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                      {rule}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No custom validation rules</p>
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
      {!loading && groups.length === 0 && (
        <div className="text-center py-12">
          <RectangleGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Found</h3>
          <p className="text-gray-600 mb-4">Start by creating your first option group to organize your configuration options.</p>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create First Group
          </button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <GroupFormDialog
            onSave={saveGroup}
            onCancel={() => setShowCreateDialog(false)}
          />
        )}
        {editingGroup && (
          <GroupFormDialog
            group={editingGroup}
            onSave={saveGroup}
            onCancel={() => setEditingGroup(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupsManager;