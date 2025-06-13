import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const ValidationDisplay = ({
  validation = { isValid: true, violations: [] },
  onFixSuggestion = null,
  showSuggestions = true,
  showDetails = true,
  autoExpand = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [dismissedViolations, setDismissedViolations] = useState(new Set());

  // Process violations by severity
  const processedViolations = useMemo(() => {
    if (!validation.violations) return { critical: [], warning: [], info: [] };

    const active = validation.violations.filter(v => !dismissedViolations.has(v.id));
    
    return active.reduce((acc, violation) => {
      const severity = violation.severity || 'warning';
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(violation);
      return acc;
    }, { critical: [], warning: [], info: [] });
  }, [validation.violations, dismissedViolations]);

  // Get severity configuration
  const getSeverityConfig = (severity) => {
    const configs = {
      critical: {
        icon: XCircleIcon,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-500',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        label: 'Critical Error',
      },
      warning: {
        icon: ExclamationTriangleIcon,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200', 
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-500',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        label: 'Warning',
      },
      info: {
        icon: InformationCircleIcon,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-500',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        label: 'Information',
      },
    };
    return configs[severity] || configs.warning;
  };

  // Generate suggestions for violations
  const generateSuggestions = (violation) => {
    const suggestions = [];
    
    switch (violation.type) {
      case 'required_missing':
        suggestions.push({
          id: 'add_required',
          text: `Add required ${violation.requiredOption}`,
          action: 'add_option',
          optionId: violation.requiredOptionId,
        });
        break;
        
      case 'mutual_exclusion':
        suggestions.push({
          id: 'remove_conflicting',
          text: `Remove ${violation.conflictingOption}`,
          action: 'remove_option',
          optionId: violation.conflictingOptionId,
        });
        break;
        
      case 'dependency_missing':
        suggestions.push({
          id: 'add_dependency',
          text: `Add required dependency: ${violation.dependencyOption}`,
          action: 'add_option',
          optionId: violation.dependencyOptionId,
        });
        break;
        
      case 'quantity_limit':
        suggestions.push({
          id: 'adjust_quantity',
          text: `Adjust quantity to maximum of ${violation.maxQuantity}`,
          action: 'set_quantity',
          optionId: violation.optionId,
          quantity: violation.maxQuantity,
        });
        break;
        
      default:
        // Generic suggestions
        if (violation.suggestedActions) {
          suggestions.push(...violation.suggestedActions);
        }
    }
    
    return suggestions;
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion, violation) => {
    if (onFixSuggestion) {
      onFixSuggestion(suggestion, violation);
    }
  };

  // Dismiss violation
  const dismissViolation = (violationId) => {
    setDismissedViolations(prev => new Set([...prev, violationId]));
  };

  // Get total violation count
  const totalViolations = processedViolations.critical.length + 
                         processedViolations.warning.length + 
                         processedViolations.info.length;

  // If valid and no violations, show success state
  if (validation.isValid && totalViolations === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-green-800">
              Configuration Valid
            </h3>
            <p className="text-sm text-green-600 mt-1">
              All constraints satisfied. Ready to proceed.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Summary Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-gray-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Validation Results
              </h3>
              <p className="text-sm text-gray-600">
                {totalViolations === 0 
                  ? 'All constraints satisfied'
                  : `${totalViolations} issue${totalViolations !== 1 ? 's' : ''} found`
                }
              </p>
            </div>
          </div>
          
          {totalViolations > 0 && showDetails && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <span className="mr-1">
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </span>
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Quick Stats */}
        {totalViolations > 0 && (
          <div className="mt-3 flex items-center space-x-4 text-xs">
            {processedViolations.critical.length > 0 && (
              <div className="flex items-center text-red-600">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                {processedViolations.critical.length} Critical
              </div>
            )}
            {processedViolations.warning.length > 0 && (
              <div className="flex items-center text-yellow-600">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
                {processedViolations.warning.length} Warning
              </div>
            )}
            {processedViolations.info.length > 0 && (
              <div className="flex items-center text-blue-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                {processedViolations.info.length} Info
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detailed Violations */}
      <AnimatePresence>
        {isExpanded && totalViolations > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Critical Violations */}
            {processedViolations.critical.map((violation, index) => (
              <ViolationCard
                key={violation.id || index}
                violation={violation}
                severity="critical"
                onSuggestionClick={handleSuggestionClick}
                onDismiss={dismissViolation}
                showSuggestions={showSuggestions}
                generateSuggestions={generateSuggestions}
              />
            ))}

            {/* Warning Violations */}
            {processedViolations.warning.map((violation, index) => (
              <ViolationCard
                key={violation.id || index}
                violation={violation}
                severity="warning"
                onSuggestionClick={handleSuggestionClick}
                onDismiss={dismissViolation}
                showSuggestions={showSuggestions}
                generateSuggestions={generateSuggestions}
              />
            ))}

            {/* Info Violations */}
            {processedViolations.info.map((violation, index) => (
              <ViolationCard
                key={violation.id || index}
                violation={violation}
                severity="info"
                onSuggestionClick={handleSuggestionClick}
                onDismiss={dismissViolation}
                showSuggestions={showSuggestions}
                generateSuggestions={generateSuggestions}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Individual Violation Card Component
const ViolationCard = ({
  violation,
  severity,
  onSuggestionClick,
  onDismiss,
  showSuggestions,
  generateSuggestions,
}) => {
  const config = getSeverityConfig(severity);
  const Icon = config.icon;
  const suggestions = showSuggestions ? generateSuggestions(violation) : [];

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: {
        icon: XCircleIcon,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-500',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        label: 'Critical Error',
      },
      warning: {
        icon: ExclamationTriangleIcon,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200', 
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-500',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        label: 'Warning',
      },
      info: {
        icon: InformationCircleIcon,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-500',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        label: 'Information',
      },
    };
    return configs[severity] || configs.warning;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}
    >
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${config.iconColor} mr-3 flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${config.textColor}`}>
                {violation.title || violation.message}
              </h4>
              
              {violation.description && (
                <p className={`text-sm ${config.textColor} mt-1 opacity-90`}>
                  {violation.description}
                </p>
              )}

              {/* Affected Options */}
              {violation.affectedOptions && violation.affectedOptions.length > 0 && (
                <div className="mt-2">
                  <p className={`text-xs ${config.textColor} opacity-75 mb-1`}>
                    Affected options:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {violation.affectedOptions.map((option, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.borderColor} border`}
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              {violation.timestamp && (
                <div className="mt-2 flex items-center text-xs opacity-60">
                  <ClockIcon className="h-3 w-3 mr-1" />
                  <span>
                    {new Date(violation.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            {onDismiss && (
              <button
                onClick={() => onDismiss(violation.id)}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Dismiss"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
              <div className="flex items-center mb-2">
                <LightBulbIcon className={`h-4 w-4 ${config.iconColor} mr-1`} />
                <span className={`text-xs font-medium ${config.textColor}`}>
                  Suggested fixes:
                </span>
              </div>
              
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={suggestion.id || idx}
                    onClick={() => onSuggestionClick(suggestion, violation)}
                    className={`w-full text-left px-3 py-2 rounded text-xs ${config.buttonColor} text-white hover:shadow-sm transition-all`}
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ValidationDisplay;
