import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BugAntIcon,
  ShieldExclamationIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const ConflictDetection = ({
  results = null,
  isLoading = false,
  onRedetect,
  onResolveConflict,
  onIgnoreConflict,
}) => {
  const [expandedConflicts, setExpandedConflicts] = useState(new Set());
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [sortBy, setSortBy] = useState('severity');

  // Process and categorize conflicts
  const processedConflicts = useMemo(() => {
    if (!results?.conflicts) return { critical: [], warning: [], info: [] };

    const conflicts = results.conflicts.reduce((acc, conflict) => {
      const severity = conflict.severity || 'warning';
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(conflict);
      return acc;
    }, { critical: [], warning: [], info: [] });

    // Sort conflicts within each category
    Object.keys(conflicts).forEach(severity => {
      conflicts[severity].sort((a, b) => {
        switch (sortBy) {
          case 'severity':
            return getSeverityWeight(b.severity) - getSeverityWeight(a.severity);
          case 'name':
            return a.name?.localeCompare(b.name) || 0;
          case 'impact':
            return (b.impact || 0) - (a.impact || 0);
          default:
            return 0;
        }
      });
    });

    return conflicts;
  }, [results?.conflicts, sortBy]);

  // Get severity weight for sorting
  const getSeverityWeight = (severity) => {
    const weights = { critical: 3, warning: 2, info: 1 };
    return weights[severity] || 0;
  };

  // Get severity configuration
  const getSeverityConfig = (severity) => {
    const configs = {
      critical: {
        icon: XCircleIcon,
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        label: 'Critical',
      },
      warning: {
        icon: ExclamationTriangleIcon,
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        label: 'Warning',
      },
      info: {
        icon: InformationCircleIcon,
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        label: 'Info',
      },
    };
    return configs[severity] || configs.warning;
  };

  // Toggle conflict expansion
  const toggleConflictExpansion = (conflictId) => {
    const newExpanded = new Set(expandedConflicts);
    if (newExpanded.has(conflictId)) {
      newExpanded.delete(conflictId);
    } else {
      newExpanded.add(conflictId);
    }
    setExpandedConflicts(newExpanded);
  };

  // Get total conflict count
  const totalConflicts = processedConflicts.critical.length + 
                        processedConflicts.warning.length + 
                        processedConflicts.info.length;

  // Filter conflicts based on selected severity
  const getFilteredConflicts = () => {
    if (filterSeverity === 'all') {
      return [
        ...processedConflicts.critical,
        ...processedConflicts.warning,
        ...processedConflicts.info,
      ];
    }
    return processedConflicts[filterSeverity] || [];
  };

  const filteredConflicts = getFilteredConflicts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ShieldExclamationIcon className="h-6 w-6 text-gray-500 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Conflict Detection
              </h2>
              <p className="text-gray-600 mt-1">
                Analyze and resolve rule conflicts in your model
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Redetect Button */}
            <button
              onClick={onRedetect}
              disabled={isLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Detecting...' : 'Re-detect'}
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {results && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{totalConflicts}</div>
              <div className="text-sm text-gray-600">Total Conflicts</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {processedConflicts.critical.length}
              </div>
              <div className="text-sm text-red-600">Critical</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {processedConflicts.warning.length}
              </div>
              <div className="text-sm text-yellow-600">Warnings</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {processedConflicts.info.length}
              </div>
              <div className="text-sm text-blue-600">Info</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Controls */}
      {results && totalConflicts > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Severity
                </label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical Only</option>
                  <option value="warning">Warnings Only</option>
                  <option value="info">Info Only</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="severity">Severity</option>
                  <option value="name">Name</option>
                  <option value="impact">Impact</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredConflicts.length} of {totalConflicts} conflicts
            </div>
          </div>
        </div>
      )}

      {/* Conflicts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <ArrowPathIcon className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Analyzing rules for conflicts...</p>
            </div>
          </div>
        ) : !results ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <BugAntIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Analysis Results
              </h3>
              <p className="text-gray-600 mb-4">
                Click "Re-detect" to analyze your model for rule conflicts.
              </p>
              <button
                onClick={onRedetect}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Start Analysis
              </button>
            </div>
          </div>
        ) : totalConflicts === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Conflicts Found
              </h3>
              <p className="text-gray-600">
                Your model rules are consistent and don't have any conflicts.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {filteredConflicts.map((conflict, index) => (
              <ConflictCard
                key={conflict.id || index}
                conflict={conflict}
                isExpanded={expandedConflicts.has(conflict.id)}
                onToggleExpand={() => toggleConflictExpansion(conflict.id)}
                onResolve={onResolveConflict}
                onIgnore={onIgnoreConflict}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Analysis Metadata */}
      {results && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              <span>
                Analysis completed on {new Date(results.timestamp || Date.now()).toLocaleString()}
              </span>
            </div>
            <div>
              Rules analyzed: {results.rulesAnalyzed || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual Conflict Card Component
const ConflictCard = ({ 
  conflict, 
  isExpanded, 
  onToggleExpand, 
  onResolve, 
  onIgnore 
}) => {
  const config = getSeverityConfig(conflict.severity || 'warning');
  const Icon = config.icon;

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: {
        icon: XCircleIcon,
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        label: 'Critical',
      },
      warning: {
        icon: ExclamationTriangleIcon,
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        label: 'Warning',
      },
      info: {
        icon: InformationCircleIcon,
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        label: 'Info',
      },
    };
    return configs[severity] || configs.warning;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg shadow-sm border ${config.borderColor}`}
    >
      {/* Conflict Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <Icon className={`h-6 w-6 ${config.iconColor} mr-3 flex-shrink-0 mt-1`} />
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {conflict.name || 'Unnamed Conflict'}
                </h3>
                <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor}`}>
                  {config.label}
                </span>
              </div>
              
              <p className="text-gray-600 mt-1">
                {conflict.description || 'No description available'}
              </p>

              {/* Conflicting Rules */}
              {conflict.rules && conflict.rules.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700">Conflicting Rules:</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {conflict.rules.map((rule, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                      >
                        {rule.name || rule.id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={onToggleExpand}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Conflict Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Conflict Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-600">
                      {conflict.type || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Impact:</span>
                    <span className="ml-2 text-gray-600">
                      {conflict.impact || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Affected Options:</span>
                    <span className="ml-2 text-gray-600">
                      {conflict.affectedOptions?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Resolution:</span>
                    <span className="ml-2 text-gray-600">
                      {conflict.canAutoResolve ? 'Auto-resolvable' : 'Manual required'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Suggested Resolution */}
              {conflict.suggestedResolution && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Suggested Resolution
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      {conflict.suggestedResolution}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onIgnore && onIgnore(conflict)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Ignore
                </button>
                <button
                  onClick={() => onResolve && onResolve(conflict)}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg bg-${config.color}-600 hover:bg-${config.color}-700`}
                >
                  Resolve Conflict
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConflictDetection;
