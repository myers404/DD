import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  CubeIcon,
  TagIcon,
  CurrencyDollarIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const OptionsManager = ({ modelId, onOptionChange = () => {} }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');

  // Sample options data
  const sampleOptions = [
    {
      id: 'opt_cpu_basic',
      name: 'Basic CPU',
      description: 'Entry-level processor for basic computing tasks',
      group: 'grp_cpu',
      groupName: 'Processor',
      basePrice: 199,
      active: true,
      attributes: { cores: 4, ghz: 2.5, tdp: 65 },
      displayOrder: 1
    },
    {
      id: 'opt_cpu_mid',
      name: 'Mid-Range CPU',
      description: 'Balanced processor for general use and light gaming',
      group: 'grp_cpu',
      groupName: 'Processor',
      basePrice: 349,
      active: true,
      attributes: { cores: 6, ghz: 3.2, tdp: 95 },
      displayOrder: 2
    },
    {
      id: 'opt_cpu_high',
      name: 'High-Performance CPU',
      description: 'Premium processor for demanding applications',
      group: 'grp_cpu',
      groupName: 'Processor',
      basePrice: 599,
      active: true,
      attributes: { cores: 8, ghz: 3.8, tdp: 125 },
      displayOrder: 3
    },
    {
      id: 'opt_ram_8gb',
      name: '8GB RAM',
      description: 'Standard memory configuration',
      group: 'grp_memory',
      groupName: 'Memory',
      basePrice: 79,
      active: true,
      attributes: { capacity: 8, speed: 3200, type: 'DDR4' },
      displayOrder: 1
    },
    {
      id: 'opt_ram_16gb',
      name: '16GB RAM',
      description: 'Enhanced memory for better multitasking',
      group: 'grp_memory',
      groupName: 'Memory',
      basePrice: 149,
      active: true,
      attributes: { capacity: 16, speed: 3200, type: 'DDR4' },
      displayOrder: 2
    },
    {
      id: 'opt_storage_ssd',
      name: 'SSD Storage',
      description: 'Fast solid-state drive storage',
      group: 'grp_storage',
      groupName: 'Storage',
      basePrice: 129,
      active: true,
      attributes: { capacity: 512, type: 'NVMe', speed: 3500 },
      displayOrder: 1
    },
    {
      id: 'opt_storage_hdd',
      name: 'HDD Storage',
      description: 'Traditional hard drive storage',
      group: 'grp_storage',
      groupName: 'Storage',
      basePrice: 59,
      active: false,
      attributes: { capacity: 1000, type: 'SATA', speed: 7200 },
      displayOrder: 2
    }
  ];

  const availableGroups = [...new Set(sampleOptions.map(opt => ({ id: opt.group, name: opt.groupName })))];

  useEffect(() => {
    loadOptions();
  }, [modelId]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setOptions(sampleOptions);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load options:', error);
      setLoading(false);
    }
  };

  const saveOption = (option) => {
    if (option.id) {
      setOptions(prev => prev.map(opt => opt.id === option.id ? option : opt));
    } else {
      const newOption = {
        ...option,
        id: `opt_${Date.now()}`,
        active: true,
        displayOrder: options.filter(opt => opt.group === option.group).length + 1
      };
      setOptions(prev => [...prev, newOption]);
    }
    
    setEditingOption(null);
    setShowCreateDialog(false);
    onOptionChange();
  };

  const deleteOption = (optionId) => {
    if (window.confirm('Are you sure you want to delete this option?')) {
      setOptions(prev => prev.filter(opt => opt.id !== optionId));
      onOptionChange();
    }
  };

  const toggleOptionActive = (optionId) => {
    setOptions(prev => prev.map(opt => 
      opt.id === optionId ? { ...opt, active: !opt.active } : opt
    ));
    onOptionChange();
  };

  const filteredOptions = options.filter(option => {
    const matchesSearch = option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         option.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === 'all' || option.group === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const OptionFormDialog = ({ option, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: option?.name || '',
      description: option?.description || '',
      group: option?.group || 'grp_cpu',
      basePrice: option?.basePrice || 0,
      active: option?.active !== false,
      attributes: option?.attributes || {},
      displayOrder: option?.displayOrder || 1
    });

    const [attributeKey, setAttributeKey] = useState('');
    const [attributeValue, setAttributeValue] = useState('');

    const handleSave = () => {
      if (!formData.name.trim()) return;
      onSave({ ...option, ...formData });
    };

    const addAttribute = () => {
      if (attributeKey && attributeValue) {
        setFormData({
          ...formData,
          attributes: {
            ...formData.attributes,
            [attributeKey]: isNaN(attributeValue) ? attributeValue : Number(attributeValue)
          }
        });
        setAttributeKey('');
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
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {option ? 'Edit Option' : 'Create New Option'}
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
                    Option Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter option name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group
                  </label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({...formData, group: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {availableGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
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
                  placeholder="Enter option description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({...formData, basePrice: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>

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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Active Option
                </label>
              </div>

              {/* Attributes Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attributes
                </label>
                
                {/* Existing Attributes */}
                {Object.entries(formData.attributes).length > 0 && (
                  <div className="space-y-2 mb-3">
                    {Object.entries(formData.attributes).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                        <span className="text-sm">
                          <span className="font-medium">{key}:</span> {value}
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
                    value={attributeKey}
                    onChange={(e) => setAttributeKey(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Attribute name"
                  />
                  <input
                    type="text"
                    value={attributeValue}
                    onChange={(e) => setAttributeValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Attribute value"
                  />
                  <button
                    onClick={addAttribute}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
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
                Save Option
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
          <h3 className="text-lg font-semibold text-gray-900">Options Management</h3>
          <p className="text-gray-600">Manage configuration options and their properties</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Option
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search options..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Groups</option>
                {availableGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {filteredOptions.length} of {options.length} options
          </div>
        </div>
      </div>

      {/* Options List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOptions.map(option => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
                option.active ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    option.active ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <CubeIcon className={`w-5 h-5 ${
                      option.active ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      option.active ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {option.name}
                    </h4>
                    <p className="text-sm text-gray-500">{option.groupName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleOptionActive(option.id)}
                    className={`p-1 rounded-md ${
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
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteOption(option.id)}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{option.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-900">${option.basePrice}</span>
                </div>
                <span className="text-sm text-gray-500">Order: {option.displayOrder}</span>
              </div>

              {/* Attributes */}
              {Object.keys(option.attributes).length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <TagIcon className="w-4 h-4 mr-1" />
                    Attributes
                  </h5>
                  <div className="space-y-1">
                    {Object.entries(option.attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!option.active && (
                <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  This option is inactive and won't appear in configurations
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOptions.length === 0 && (
        <div className="text-center py-12">
          <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterGroup !== 'all' ? 'No matching options' : 'No options found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterGroup !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Start by creating your first configuration option.'
            }
          </p>
          {!searchTerm && filterGroup === 'all' && (
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
            onSave={saveOption}
            onCancel={() => setShowCreateDialog(false)}
          />
        )}
        {editingOption && (
          <OptionFormDialog
            option={editingOption}
            onSave={saveOption}
            onCancel={() => setEditingOption(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OptionsManager;