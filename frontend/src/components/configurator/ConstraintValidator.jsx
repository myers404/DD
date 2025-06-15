// frontend/src/components/configurator/ConstraintValidator.jsx
// Real-time constraint validation display - fully functional implementation

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const ConstraintValidator = ({ 
  model, 
  configuration, 
  selections = [], 
  validationResults, 
  onRevalidate, 
  isValidating = false,
  onSelectionChange
}) => {
  // Local state
  const [expandedViolations, setExpandedViolations] = useState(new Set());
  const [showAllRules, setShowAllRules] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Toggle violation expansion
  const toggleViolationExpansion = (violationId) => {
    const newExpanded = new Set(expandedViolations);
    if (newExpanded.has(violationId)) {
      newExpanded.delete(violationId);
    } else {
      newExpanded.add(violationId);
    }
    setExpandedViolations(newExpanded);
  };

  // Process validation results
  const validationSummary = useMemo(() => {
    if (!validationResults) {
      return {
        isValid: null,
        totalViolations: 0,
        criticalViolations: 0,
        warningViolations: 0,
        infoViolations: 0,
        violationsByType: {},
        suggestions: []
      };
    }

    const violations = validationResults.violations || [];
    const criticalViolations = violations.filter(v => v.severity === 'critical' || v.severity === 'error');
    const warningViolations = violations.filter(v => v.severity === 'warning');
    const infoViolations = violations.filter(v => v.severity === 'info');

    // Group violations by type
    const violationsByType = violations.reduce((acc, violation) => {
      const type = violation.rule_type || 'unknown';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(violation);
      return acc;
    }, {});

    // Generate suggestions based on violations
    const suggestions = generateSuggestions(violations, selections, model);

    return {
      isValid: validationResults.is_valid,
      totalViolations: violations.length,
      criticalViolations: criticalViolations.length,
      warningViolations: warningViolations.length,
      infoViolations: infoViolations.length,
      violationsByType,
      suggestions,
      violations
    };
  }, [validationResults, selections, model]);

  // Filter violations based on severity
  const filteredViolations = useMemo(() => {
    if (!validationSummary.violations) return [];
    
    if (filterSeverity === 'all') {
      return validationSummary.violations;
    }
    
    return validationSummary.violations.filter(v => v.severity === filterSeverity);
  }, [validationSummary.violations, filterSeverity]);

  // Generate suggestions for fixing violations
  function generateSuggestions(violations, selections, model) {
    const suggestions = [];
    
    violations.forEach(violation => {
      switch (violation.rule_type) {
        case 'requires':
          suggestions.push({
            id: `suggestion_${violation.rule_id}`,
            type: 'add_option',
            title: 'Add Required Option',
            description: `Consider adding the required option to satisfy "${violation.rule_name}"`,
            action: 'add',
            targetOptions: violation.suggested_options || []
          });
          break;
          
        case 'excludes':
          suggestions.push({
            id: `suggestion_${violation.rule_id}`,
            type: 'remove_option',
            title: 'Remove Conflicting Option',
            description: `Remove one of the conflicting options for "${violation.rule_name}"`,
            action: 'remove',
            targetOptions: violation.affected_options || []
          });
          break;
          
        case 'group_constraint':
          if (violation.message?.includes('minimum')) {
            suggestions.push({
              id: `suggestion_${violation.rule_id}`,
              type: 'add_group_options',
              title: 'Add More Options',
              description: `Add more options to meet the minimum selection requirement`,
              action: 'add',
              targetGroup: violation.affected_group
            });
          } else if (violation.message?.includes('maximum')) {
            suggestions.push({
              id: `suggestion_${violation.rule_id}`,
              type: 'remove_group_options',
              title: 'Remove Excess Options',
              description: `Remove some options to meet the maximum selection limit`,
              action: 'remove',
              targetGroup: violation.affected_group
            });
          }
          break;
          
        default:
          suggestions.push({
            id: `suggestion_${violation.rule_id}`,
            type: 'general',
            title: 'Review Configuration',
            description: violation.suggestion || 'Review your configuration to resolve this issue',
            action: 'review'
          });
      }
    });
    
    return suggestions;
  }

  // Apply a suggestion
  const applySuggestion = (suggestion) => {
    switch (suggestion.action) {
      case 'add':
        if (suggestion.targetOptions && suggestion.targetOptions.length > 0) {
          // Add the first suggested option
          onSelectionChange(suggestion.targetOptions[0], 1);
        }
        break;
        
      case 'remove':
        if (suggestion.targetOptions && suggestion.targetOptions.length > 0) {
          // Remove the first conflicting option
          onSelectionChange(suggestion.targetOptions[0], 0);
        }
        break;
        
      default:
        // For other actions, just trigger revalidation
        onRevalidate();
    }
  };

  // Get icon for violation severity
  const getViolationIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return XCircleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'info':
        return InformationCircleIcon;
      default:
        return ExclamationCircleIcon;
    }
  };

  // Get color classes for violation severity
  const getViolationColors = (severity) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-500'
        };
    }
  };

  // Render validation status header
  const renderValidationStatus = () => {
    if (validationSummary.isValid === null) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="animate-pulse w-6 h-6 bg-gray-300 rounded-full"></div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Ready to Validate</h3>
              <p className="text-gray-600 text-sm">Click "Validate Configuration" to check for constraint violations</p>
            </div>
          </div>
        </div>
      );
    }

    if (validationSummary.isValid) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Configuration Valid ✨</h3>
              <p className="text-green-700 text-sm mt-1">
                Your configuration meets all constraints and business rules. Ready to proceed!
              </p>
              
              {selections.length > 0 && (
                <div className="mt-3 text-sm text-green-600">
                  ✓ {selections.length} option{selections.length !== 1 ? 's' : ''} selected
                  ✓ All constraints satisfied
                  ✓ No conflicts detected
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <XCircleIcon className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900">Configuration Issues Found</h3>
            <p className="text-red-700 text-sm mt-1">
              Your configuration has {validationSummary.totalViolations} constraint violation{validationSummary.totalViolations !== 1 ? 's' : ''} that need to be resolved.
            </p>
            
            <div className="flex items-center gap-4 mt-3 text-sm">
              {validationSummary.criticalViolations > 0 && (
                <span className="text-red-600">
                  {validationSummary.criticalViolations} Critical
                </span>
              )}
              {validationSummary.warningViolations > 0 && (
                <span className="text-yellow-600">
                  {validationSummary.warningViolations} Warnings
                </span>
              )}
              {validationSummary.infoViolations > 0 && (
                <span className="text-blue-600">
                  {validationSummary.infoViolations} Info
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render individual violation
  const renderViolation = (violation, index) => {
    const isExpanded = expandedViolations.has(violation.rule_id || index);
    const Icon = getViolationIcon(violation.severity);
    const colors = getViolationColors(violation.severity);

    return (
      <motion.div
        key={violation.rule_id || index}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`border rounded-lg ${colors.border} ${colors.bg}`}
      >
        <div
          className="p-4 cursor-pointer"
          onClick={() => toggleViolationExpansion(violation.rule_id || index)}
        >
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${colors.text}`}>
                  {violation.rule_name || 'Constraint Violation'}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {violation.severity || 'error'}
                  </span>
                  {isExpanded ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              
              <p className={`text-sm mt-1 ${colors.text} opacity-90`}>
                {violation.message}
              </p>
              
              {violation.affected_options && violation.affected_options.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {violation.affected_options.map(optionId => {
                    const option = model?.groups
                      ?.flatMap(g => g.options || [])
                      ?.find(opt => opt.id === optionId);
                    
                    return (
                      <span
                        key={optionId}
                        className={`text-xs px-2 py-1 rounded ${colors.text} bg-white border ${colors.border}`}
                      >
                        {option?.name || optionId}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200"
            >
              <div className="p-4 space-y-3">
                {/* Rule Details */}
                {violation.rule_expression && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Rule Expression:</h5>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {violation.rule_expression}
                    </code>
                  </div>
                )}
                
                {/* Context */}
                {violation.context && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Context:</h5>
                    <p className="text-sm text-gray-600">{violation.context}</p>
                  </div>
                )}
                
                {/* Suggestions */}
                {violation.suggestion && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-1">Suggestion:</h5>
                    <p className="text-sm text-gray-600">{violation.suggestion}</p>
                  </div>
                )}

                {/* Quick Actions */}
                {violation.affected_options && violation.affected_options.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Quick Actions:</h5>
                    <div className="flex flex-wrap gap-2">
                      {violation.affected_options.map(optionId => {
                        const option = model?.groups
                          ?.flatMap(g => g.options || [])
                          ?.find(opt => opt.id === optionId);
                        
                        const isSelected = selections.some(s => s.option_id === optionId);
                        
                        return (
                          <button
                            key={optionId}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectionChange(optionId, isSelected ? 0 : 1);
                            }}
                            className={`text-xs px-3 py-1 rounded border transition-colors ${
                              isSelected
                                ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                            }`}
                          >
                            {isSelected ? 'Remove' : 'Add'} {option?.name || optionId}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Render suggestions
  const renderSuggestions = () => {
    if (validationSummary.suggestions.length === 0) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <LightBulbIcon className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-blue-900">Smart Suggestions</h3>
        </div>
        
        <div className="space-y-2">
          {validationSummary.suggestions.slice(0, 3).map(suggestion => (
            <div key={suggestion.id} className="flex items-center justify-between bg-white rounded border border-blue-200 p-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{suggestion.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
              </div>
              
              <button
                onClick={() => applySuggestion(suggestion)}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Constraint Validation</h2>
          <p className="text-gray-600 mt-1">
            Review and resolve configuration constraints
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Issues</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings Only</option>
            <option value="info">Info Only</option>
          </select>

          {/* Revalidate Button */}
          <button
            onClick={onRevalidate}
            disabled={isValidating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheckIcon className="w-4 h-4" />
            )}
            {isValidating ? 'Validating...' : 'Revalidate'}
          </button>
        </div>
      </div>

      {/* Validation Status */}
      {renderValidationStatus()}

      {/* Smart Suggestions */}
      {validationSummary.isValid === false && renderSuggestions()}

      {/* Violations List */}
      {validationSummary.totalViolations > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Issues Found ({filteredViolations.length})
            </h3>
            
            {validationSummary.totalViolations > filteredViolations.length && (
              <p className="text-sm text-gray-500">
                Showing {filteredViolations.length} of {validationSummary.totalViolations} issues
              </p>
            )}
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {filteredViolations.map((violation, index) => 
                renderViolation(violation, index)
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Model Rules Info */}
      {showAllRules && model?.rules && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">All Model Rules</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {model.rules.map(rule => (
              <div key={rule.id} className="bg-white border border-gray-200 rounded p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{rule.name}</h4>
                  <span className="text-xs text-gray-500 capitalize">{rule.type}</span>
                </div>
                {rule.expression && (
                  <code className="text-xs text-gray-600 mt-1 block font-mono">
                    {rule.expression}
                  </code>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <InformationCircleIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Validation Help:</p>
            <ul className="space-y-1 text-xs">
              <li>• <span className="text-red-600">Critical issues</span> must be resolved before proceeding</li>
              <li>• <span className="text-yellow-600">Warnings</span> are recommendations that should be reviewed</li>
              <li>• <span className="text-blue-600">Info items</span> provide additional guidance</li>
              <li>• Click on violations to see detailed information and quick actions</li>
            </ul>
            
            <button
              onClick={() => setShowAllRules(!showAllRules)}
              className="text-blue-600 hover:text-blue-700 text-xs mt-2"
            >
              {showAllRules ? 'Hide' : 'Show'} all model rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstraintValidator;