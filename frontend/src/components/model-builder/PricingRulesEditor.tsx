import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  TagIcon,
  PercentBadgeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const PricingRulesEditor = ({ modelId, onPricingChange = () => {} }) => {
  const [pricingRules, setPricingRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample pricing rules data
  const samplePricingRules = [
    {
      id: 'price_rule_1',
      name: 'Volume Discount - Bulk Purchase',
      description: 'Discount for orders over $2000',
      type: 'percentage_discount',
      condition: 'total_price > 2000',
      value: 10,
      priority: 100,
      active: true,
      category: 'discount',
      attributes: {
        minOrder: 2000,
        maxDiscount: 500
      }
    },
    {
      id: 'price_rule_2',
      name: 'Premium CPU Surcharge',
      description: 'Additional cost for high-performance CPU',
      type: 'fixed_surcharge',
      condition: 'opt_cpu_high',
      value: 200,
      priority: 200,
      active: true,
      category: 'surcharge',
      attributes: {
        reason: 'Premium component cost'
      }
    },
    {
      id: 'price_rule_3',
      name: 'Gaming Package Bundle',
      description: 'Special pricing for gaming configuration',
      type: 'bundle_pricing',
      condition: 'opt_tier_gaming && opt_gpu_dedicated',
      value: 1899,
      priority: 50,
      active: true,
      category: 'bundle',
      attributes: {
        originalPrice: 2299,
        savings: 400
      }
    },
    {
      id: 'price_rule_4',
      name: 'Student Discount',
      description: 'Educational discount for verified students',
      type: 'percentage_discount',
      condition: 'customer_type = "student"',
      value: 15,
      priority: 150,
      active: true,
      category: 'discount',
      attributes: {
        verificationRequired: true,
        maxDiscount: 300
      }
    },
    {
      id: 'price_rule_5',
      name: 'Seasonal Promotion',
      description: 'Limited time promotional pricing',
      type: 'percentage_discount',
      condition: 'promo_code = "SUMMER2025"',
      value: 20,
      priority: 75,
      active: false,
      category: 'promotion',
      attributes: {
        startDate: '2025-06-01',
        endDate: '2025-08-31',
        maxUses: 1000
      }
    }
  ];

  const ruleTypes = [
    { 
      value: 'fixed_surcharge', 
      label: 'Fixed Surcharge', 
      description: 'Add a fixed amount to the price',
      icon: CurrencyDollarIcon
    },
    { 
      value: 'percentage_discount', 
      label: 'Percentage Discount', 
      description: 'Apply a percentage discount to the price',
      icon: PercentBadgeIcon
    },
    { 
      value: 'bundle_pricing', 
      label: 'Bundle Pricing', 
      description: 'Set a fixed price for a bundle of items',
      icon: TagIcon
    },
    { 
      value: 'tiered_pricing', 
      label: 'Tiered Pricing', 
      description: 'Different prices based on quantity or value',
      icon: ChartBarIcon
    }
  ];

  const categories = [
    { value: 'all', label: 'All Rules' },
    { value: 'discount', label: 'Discounts' },
    { value: 'surcharge', label: 'Surcharges' },
    { value: 'bundle', label: 'Bundles' },
    { value: 'promotion', label: 'Promotions' }
  ];

  useEffect(() => {
    loadPricingRules();
  }, [modelId]);

  const loadPricingRules = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setPricingRules(samplePricingRules);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load pricing rules:', error);
      setLoading(false);
    }
  };

  const savePricingRule = (rule) => {
    if (rule.id) {
      setPricingRules(prev => prev.map(r => r.id === rule.id ? rule : r));
    } else {
      const newRule = {
        ...rule,
        id: `price_rule_${Date.now()}`,
        active: true,
        priority: pricingRules.length * 10 + 100
      };
      setPricingRules(prev => [...prev, newRule]);
    }
    
    setEditingRule(null);
    setShowCreateDialog(false);
    onPricingChange();
  };

  const deletePricingRule = (ruleId) => {
    if (window.confirm('Are you sure you want to delete this pricing rule?')) {
      setPricingRules(prev => prev.filter(rule => rule.id !== ruleId));
      onPricingChange();
    }
  };

  const toggleRuleActive = (ruleId) => {
    setPricingRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, active: !rule.active } : rule
    ));
    onPricingChange();
  };

  const filteredRules = pricingRules.filter(rule => 
    selectedCategory === 'all' || rule.category === selectedCategory
  );

  const getRuleTypeInfo = (type) => {
    return ruleTypes.find(t => t.value === type) || ruleTypes[0];
  };

  const getRuleIcon = (rule) => {
    const typeInfo = getRuleTypeInfo(rule.type);
    const Icon = typeInfo.icon;
    
    if (rule.type === 'percentage_discount' || rule.category === 'discount') {
      return <ArrowTrendingDownIcon className="w-5 h-5 text-green-500" />;
    } else if (rule.type === 'fixed_surcharge' || rule.category === 'surcharge') {
      return <ArrowTrendingUpIcon className="w-5 h-5 text-red-500" />;
    }
    return <Icon className="w-5 h-5 text-blue-500" />;
  };

  const formatPriceValue = (rule) => {
    if (rule.type === 'percentage_discount') {
      return `${rule.value}% off`;
    } else if (rule.type === 'fixed_surcharge') {
      return `+$${rule.value}`;
    } else if (rule.type === 'bundle_pricing') {
      return `$${rule.value}`;
    }
    return `$${rule.value}`;
  };

  const PricingRuleFormDialog = ({ rule, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: rule?.name || '',
      description: rule?.description || '',
      type: rule?.type || 'percentage_discount',
      condition: rule?.condition || '',
      value: rule?.value || 0,
      priority: rule?.priority || 100,
      category: rule?.category || 'discount',
      attributes: rule?.attributes || {}
    });

    const [attributeKey, setAttributeKey] = useState('');
    const [attributeValue, setAttributeValue] = useState('');

    const handleSave = () => {
      if (!formData.name.trim() || !formData.condition.trim()) return;
      onSave({ ...rule, ...formData });
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
                {rule ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
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
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter rule name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  placeholder="Enter rule description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition *
                </label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., opt_cpu_high or total_price > 1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use option IDs, total_price, customer_type, or promo_code
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === 'percentage_discount' ? 'Percentage (%)' : 'Dollar amount ($)'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attributes Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Attributes
                </label>
                
                {/* Existing Attributes */}
                {Object.entries(formData.attributes).length > 0 && (
                  <div className="space-y-2 mb-3">
                    {Object.entries(formData.attributes).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                        <span className="text-sm">
                          <span className="font-medium">{key}:</span> {value.toString()}
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
                Save Rule
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
          <h3 className="text-lg font-semibold text-gray-900">Pricing Rules</h3>
          <p className="text-gray-600">Manage discounts, surcharges, and special pricing</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Pricing Rule
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-4">
        {categories.map(category => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              selectedCategory === category.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
            {category.value !== 'all' && (
              <span className="ml-2 text-xs">
                ({pricingRules.filter(rule => rule.category === category.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pricing Rules List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRules
            .sort((a, b) => a.priority - b.priority)
            .map(rule => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
                  rule.active ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${
                      rule.active ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getRuleIcon(rule)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className={`font-medium ${
                          rule.active ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {rule.name}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rule.category === 'discount' ? 'bg-green-100 text-green-800' :
                          rule.category === 'surcharge' ? 'bg-red-100 text-red-800' :
                          rule.category === 'bundle' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {categories.find(c => c.value === rule.category)?.label}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatPriceValue(rule)}
                        </span>
                        {!rule.active && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-3">{rule.description}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {rule.condition}
                        </span>
                        <span>Priority: {rule.priority}</span>
                        <span>Type: {getRuleTypeInfo(rule.type).label}</span>
                      </div>

                      {/* Attributes */}
                      {Object.keys(rule.attributes).length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Attributes:</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(rule.attributes).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-600">{key}:</span>
                                <span className="font-medium text-gray-900">{value.toString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleRuleActive(rule.id)}
                      className={`p-2 rounded-md ${
                        rule.active 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={rule.active ? 'Deactivate' : 'Activate'}
                    >
                      {rule.active ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Edit Rule"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePricingRule(rule.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete Rule"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRules.length === 0 && (
        <div className="text-center py-12">
          <CalculatorIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedCategory === 'all' ? 'No Pricing Rules Found' : `No ${categories.find(c => c.value === selectedCategory)?.label} Rules`}
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedCategory === 'all' 
              ? 'Start by creating your first pricing rule to manage discounts and surcharges.'
              : `Create a pricing rule in the ${categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} category.`
            }
          </p>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create First Pricing Rule
          </button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <PricingRuleFormDialog
            onSave={savePricingRule}
            onCancel={() => setShowCreateDialog(false)}
          />
        )}
        {editingRule && (
          <PricingRuleFormDialog
            rule={editingRule}
            onSave={savePricingRule}
            onCancel={() => setEditingRule(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingRulesEditor;