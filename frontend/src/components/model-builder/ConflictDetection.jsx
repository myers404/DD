import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { ensureArray } from '../../utils/arrayUtils';

const ConflictDetection = ({ modelId, onConflictResolved = () => {} }) => {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState(null);

  // Sample conflict data for demo
  const sampleConflicts = [
    {
      id: 'conflict-1',
      conflictType: 'direct_contradiction',
      severity: 'critical',
      conflictingRules: ['Premium CPU Rule', 'Budget Package Rule'],
      affectedScenarios: ['opt_cpu_high && opt_tier_budget'],
      description: 'Premium CPU rule conflicts with budget package restrictions',
      suggestedResolution: 'Modify budget package to exclude premium CPU options or create exception rule',
      details: {
        rule1: { name: 'Premium CPU Rule', expression: 'opt_cpu_high -> opt_cooling_liquid' },
        rule2: { name: 'Budget Package Rule', expression: 'opt_tier_budget -> !opt_cpu_high' },
        conflictCondition: 'opt_cpu_high && opt_tier_budget'
      }
    },
    {
      id: 'conflict-2',
      conflictType: 'mutual_exclusion_violation',
      severity: 'warning',
      conflictingRules: ['SSD Storage Rule', 'HDD Storage Rule'],
      affectedScenarios: ['opt_storage_ssd && opt_storage_hdd'],
      description: 'Both SSD and HDD storage options can be selected simultaneously',
      suggestedResolution: 'Add mutual exclusion rule between SSD and HDD options',
      details: {
        rule1: { name: 'SSD Storage Rule', expression: 'opt_storage_ssd -> opt_performance_boost' },
        rule2: { name: 'HDD Storage Rule', expression: 'opt_storage_hdd -> opt_storage_large' },
        conflictCondition: 'Missing mutual exclusion constraint'
      }
    },
    {
      id: 'conflict-3',
      conflictType: 'circular_dependency',
      severity: 'critical',
      conflictingRules: ['Gaming Package Rule', 'GPU Requirement Rule', 'Performance Rule'],
      affectedScenarios: ['Circular dependency chain'],
      description: 'Circular dependency detected in gaming package rules',
      suggestedResolution: 'Break circular dependency by removing one of the requirement links',
      details: {
        rule1: { name: 'Gaming Package Rule', expression: 'opt_tier_gaming -> opt_gpu_dedicated' },
        rule2: { name: 'GPU Requirement Rule', expression: 'opt_gpu_dedicated -> opt_tier_performance' },
        rule3: { name: 'Performance Rule', expression: 'opt_tier_performance -> opt_tier_gaming' },
        conflictCondition: 'A -> B -> C -> A'
      }
    }
  ];

  // Load conflicts from API
  const loadConflicts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setConflicts(sampleConflicts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load conflicts:', error);
      setLoading(false);
    }
  };

  const analyzeConflicts = async () => {
    setAnalyzing(true);
    try {
      // Simulate conflict analysis
      setTimeout(() => {
        setConflicts(sampleConflicts);
        setAnalyzing(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to analyze conflicts:', error);
      setAnalyzing(false);
    }
  };

  const resolveConflict = async (conflictId, resolution) => {
    // Simulate conflict resolution
    setConflicts(prev => ensureArray(prev).filter(c => c.id !== conflictId));
    onConflictResolved(conflictId, resolution);
  };

  useEffect(() => {
    if (modelId) {
      loadConflicts();
    }
  }, [modelId]);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[severity] || styles.info}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const ConflictDetailModal = ({ conflict, onClose, onResolve }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                {getSeverityIcon(conflict.severity)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Conflict Details
                  </h3>
                  <p className="text-gray-600">{conflict.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Conflict Type and Severity */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Conflict Information</h4>
                  {getSeverityBadge(conflict.severity)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-600">{conflict.conflictType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Affected Rules:</span>
                    <span className="ml-2 text-gray-600">{conflict.conflictingRules.length}</span>
                  </div>
                </div>
              </div>

              {/* Conflicting Rules */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Conflicting Rules</h4>
                <div className="space-y-3">
                  {Object.entries(conflict.details).filter(([key]) => key.startsWith('rule')).map(([key, rule]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-800">{rule.name}</h5>
                        <span className="text-xs text-gray-500">{key.toUpperCase()}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded font-mono text-sm text-gray-700">
                        {rule.expression}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Affected Scenarios */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Affected Scenarios</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm font-medium text-red-800">Conflict Condition</span>
                  </div>
                  <p className="text-sm text-red-700 font-mono">
                    {conflict.details.conflictCondition}
                  </p>
                </div>
              </div>

              {/* Resolution Suggestion */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Suggested Resolution</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{conflict.suggestedResolution}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => onResolve(conflict.id, 'manual')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Mark as Resolved
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
          <h3 className="text-lg font-semibold text-gray-900">Conflict Detection</h3>
          <p className="text-gray-600">Analyze and resolve rule conflicts in your model</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadConflicts}
            disabled={loading}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={analyzeConflicts}
            disabled={analyzing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
            {analyzing ? 'Analyzing...' : 'Analyze Conflicts'}
          </button>
        </div>
      </div>

      {/* Analysis Status */}
      {analyzing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-800">Analyzing Model for Conflicts</p>
              <p className="text-sm text-blue-600">This may take a few moments...</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Conflicts Summary */}
      {!loading && !analyzing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircleIcon className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {ensureArray(conflicts).filter(c => c.severity === 'critical').length}
                </p>
                <p className="text-sm text-gray-600">Critical Conflicts</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {ensureArray(conflicts).filter(c => c.severity === 'warning').length}
                </p>
                <p className="text-sm text-gray-600">Warning Conflicts</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {ensureArray(conflicts).length === 0 ? '✓' : ensureArray(conflicts).filter(c => c.severity === 'info').length}
                </p>
                <p className="text-sm text-gray-600">
                  {ensureArray(conflicts).length === 0 ? 'No Conflicts' : 'Info Conflicts'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Conflicts List */}
      {!loading && !analyzing && ensureArray(conflicts).length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Detected Conflicts</h4>
          {ensureArray(conflicts).map(conflict => (
            <motion.div
              key={conflict.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                conflict.severity === 'critical' ? 'border-red-200 bg-red-50' :
                conflict.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}
              onClick={() => setSelectedConflict(conflict)}
            >
              <div className="flex items-start space-x-3">
                {getSeverityIcon(conflict.severity)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{conflict.description}</h5>
                    {getSeverityBadge(conflict.severity)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Conflicting Rules:</span> {conflict.conflictingRules.join(', ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Type:</span> {conflict.conflictType.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* No Conflicts State */}
      {!loading && !analyzing && ensureArray(conflicts).length === 0 && (
        <div className="text-center py-12">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Conflicts Detected</h3>
          <p className="text-gray-600 mb-4">Your model rules are consistent and conflict-free.</p>
          <button
            onClick={analyzeConflicts}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
            Run Analysis Again
          </button>
        </div>
      )}

      {/* Conflict Detail Modal */}
      <AnimatePresence>
        {selectedConflict && (
          <ConflictDetailModal
            conflict={selectedConflict}
            onClose={() => setSelectedConflict(null)}
            onResolve={resolveConflict}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConflictDetection;