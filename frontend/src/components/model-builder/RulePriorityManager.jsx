import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AdjustmentsVerticalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  EyeIcon,
  DocumentTextIcon,
  Bars3Icon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const RulePriorityManager = ({ modelId, onPriorityChange = () => {} }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [priorities, setPriorities] = useState(null);
  const [draggedRule, setDraggedRule] = useState(null);
  const [showConflicts, setShowConflicts] = useState(false);

  // Sample rules data with priorities
  const sampleRules = [
    {
      id: 'rule-1',
      name: 'Critical System Validation',
      type: 'validation',
      expression: 'opt_cpu_high && !opt_cooling_liquid',
      priority: 50,
      status: 'active',
      basePriority: 50,
      conflicts: []
    },
    {
      id: 'rule-2', 
      name: 'Premium CPU Requires Liquid Cooling',
      type: 'requires',
      expression: 'opt_cpu_high -> opt_cooling_liquid',
      priority: 100,
      status: 'active',
      basePriority: 100,
      conflicts: []
    },
    {
      id: 'rule-3',
      name: 'Budget Tier Restrictions',
      type: 'excludes',
      expression: 'opt_tier_budget -> !opt_cpu_high',
      priority: 150,
      status: 'active',
      basePriority: 150,
      conflicts: ['rule-2']
    },
    {
      id: 'rule-4',
      name: 'Gaming Package Pricing',
      type: 'pricing',
      expression: 'opt_tier_gaming',
      priority: 200,
      status: 'active',
      basePriority: 200,
      conflicts: []
    },
    {
      id: 'rule-5',
      name: 'Storage Mutual Exclusion',
      type: 'excludes', 
      expression: 'opt_storage_ssd && opt_storage_hdd',
      priority: 100,
      status: 'active',
      basePriority: 150,
      conflicts: ['rule-2'] // Same priority conflict
    }
  ];

  const samplePriorityAnalysis = {
    conflicts: [
      {
        type: 'duplicate_priority',
        priority: 100,
        affectedRules: ['rule-2', 'rule-5'],
        severity: 'warning',
        description: 'Multiple rules have the same priority',
        suggestion: 'Assign unique priorities to ensure predictable execution order'
      }
    ],
    recommendations: [
      'Validation rules should have higher priority (lower numbers) than business rules',
      'Consider grouping related rules with similar priorities',
      'Leave gaps between priorities for future rule insertion',
      'Review rule dependencies when adjusting priorities'
    ],
    stats: {
      totalRules: 5,
      uniquePriorities: 4,
      averageGap: 35,
      maxGap: 50,
      duplicates: 1
    }
  };

  const ruleTypeInfo = {
    validation: { 
      color: 'bg-red-100 text-red-800 border-red-200',
      basePriority: 50,
      description: 'Critical validation rules (highest priority)'
    },
    requires: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      basePriority: 100,
      description: 'Requirement rules (high priority)'
    },
    excludes: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      basePriority: 150,
      description: 'Exclusion rules (medium priority)'
    },
    pricing: { 
      color: 'bg-green-100 text-green-800 border-green-200',
      basePriority: 200,
      description: 'Pricing rules (lower priority)'
    }
  };

  useEffect(() => {
    loadRules();
    analyzePriorities();
  }, [modelId]);

  const loadRules = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setRules(sampleRules.sort((a, b) => a.priority - b.priority));
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load rules:', error);
      setLoading(false);
    }
  };

  const analyzePriorities = async () => {
    try {
      // Simulate priority analysis
      setTimeout(() => {
        setPriorities(samplePriorityAnalysis);
      }, 500);
    } catch (error) {
      console.error('Failed to analyze priorities:', error);
    }
  };

  const updateRulePriority = async (ruleId, newPriority) => {
    try {
      const updatedRules = rules.map(rule => 
        rule.id === ruleId ? { ...rule, priority: newPriority } : rule
      ).sort((a, b) => a.priority - b.priority);
      
      setRules(updatedRules);
      onPriorityChange(ruleId, newPriority);
      
      // Re-analyze after update
      setTimeout(analyzePriorities, 100);
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const autoAssignPriorities = async () => {
    try {
      const updatedRules = rules.map((rule, index) => {
        const baseType = ruleTypeInfo[rule.type] || ruleTypeInfo.requires;
        const priority = baseType.basePriority + (index * 10);
        return { ...rule, priority };
      }).sort((a, b) => a.priority - b.priority);
      
      setRules(updatedRules);
      onPriorityChange('auto', updatedRules);
      
      // Re-analyze after auto-assignment
      setTimeout(analyzePriorities, 100);
    } catch (error) {
      console.error('Failed to auto-assign priorities:', error);
    }
  };

  const moveRule = (fromIndex, toIndex) => {
    const newRules = [...rules];
    const [movedRule] = newRules.splice(fromIndex, 1);
    newRules.splice(toIndex, 0, movedRule);
    
    // Recalculate priorities based on new order
    const updatedRules = newRules.map((rule, index) => ({
      ...rule,
      priority: (index + 1) * 10 + 50
    }));
    
    setRules(updatedRules);
    onPriorityChange('reorder', updatedRules);
  };

  const PriorityInput = ({ rule, onUpdate }) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(rule.priority);

    const handleSave = () => {
      onUpdate(rule.id, parseInt(value));
      setEditing(false);
    };

    const handleCancel = () => {
      setValue(rule.priority);
      setEditing(false);
    };

    if (editing) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            min="1"
            max="1000"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <CheckCircleIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
          >
            ×
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-sm font-medium rounded ${
          rule.conflicts?.length > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
        }`}>
          {rule.priority}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Rule Priority Management</h3>
          <p className="text-gray-600">Manage rule execution order and resolve priority conflicts</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadRules}
            disabled={loading}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <AdjustmentsVerticalIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={autoAssignPriorities}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            Auto-Assign
          </button>
        </div>
      </div>

      {/* Priority Analysis Summary */}
      {priorities && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <Bars3Icon className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{priorities.stats.totalRules}</p>
                <p className="text-sm text-gray-600">Total Rules</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-600">{priorities.stats.uniquePriorities}</p>
                <p className="text-sm text-gray-600">Unique Priorities</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{priorities.stats.duplicates}</p>
                <p className="text-sm text-gray-600">Conflicts</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <AdjustmentsVerticalIcon className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{priorities.stats.averageGap}</p>
                <p className="text-sm text-gray-600">Avg Gap</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Priority Conflicts */}
      {priorities?.conflicts.length > 0 && showConflicts && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <h4 className="font-medium text-yellow-800 mb-3 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            Priority Conflicts
          </h4>
          <div className="space-y-3">
            {priorities.conflicts.map((conflict, index) => (
              <div key={index} className="bg-white border border-yellow-200 rounded p-3">
                <p className="text-sm font-medium text-gray-900 mb-1">{conflict.description}</p>
                <p className="text-sm text-gray-600 mb-2">
                  Priority {conflict.priority}: {conflict.affectedRules.join(', ')}
                </p>
                <p className="text-sm text-yellow-700">{conflict.suggestion}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Rule Type Guide */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center">
          <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-500" />
          Rule Type Priority Guide
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(ruleTypeInfo).map(([type, info]) => (
            <div key={type} className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${info.color}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
              <div className="flex-1">
                <p className="text-sm text-gray-600">{info.description}</p>
                <p className="text-xs text-gray-500">Base priority: {info.basePriority}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Rules by Priority</h4>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowConflicts(!showConflicts)}
                  className={`text-sm px-3 py-1 rounded-md transition-colors ${
                    showConflicts ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <EyeIcon className="w-4 h-4 inline mr-1" />
                  {showConflicts ? 'Hide' : 'Show'} Conflicts
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  rule.conflicts?.length > 0 ? 'bg-red-50 border-l-4 border-red-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </span>
                      <PriorityInput rule={rule} onUpdate={updateRulePriority} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h5 className="font-medium text-gray-900">{rule.name}</h5>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                          ruleTypeInfo[rule.type]?.color || 'bg-gray-100 text-gray-700'
                        }`}>
                          {rule.type}
                        </span>
                        {rule.status !== 'active' && (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            {rule.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                        {rule.expression}
                      </p>
                      {rule.conflicts?.length > 0 && (
                        <p className="text-sm text-red-600 mt-1 flex items-center">
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                          Priority conflict with: {rule.conflicts.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateRulePriority(rule.id, Math.max(1, rule.priority - 10))}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Increase Priority (Lower Number)"
                    >
                      <ArrowUpIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateRulePriority(rule.id, rule.priority + 10)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Decrease Priority (Higher Number)"
                    >
                      <ArrowDownIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {priorities?.recommendations && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />
            Priority Management Best Practices
          </h4>
          <ul className="space-y-2">
            {priorities.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3"></span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {rules.length === 0 && !loading && (
        <div className="text-center py-12">
          <AdjustmentsVerticalIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Rules Found</h3>
          <p className="text-gray-600">Create some rules first to manage their priorities.</p>
        </div>
      )}
    </div>
  );
};

export default RulePriorityManager;