import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ModelValidation = ({ modelId, onValidationComplete = () => {} }) => {
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample validation data for demo
  const sampleValidation = {
    modelId: 'model-123',
    validationDate: new Date().toISOString(),
    overallStatus: 'warning',
    qualityScore: 78,
    totalErrors: 5,
    totalWarnings: 12,
    totalInfo: 3,
    
    categories: {
      idReferences: {
        name: 'ID References',
        status: 'error',
        errors: 2,
        warnings: 1,
        info: 0,
        description: 'Validates that all referenced IDs exist'
      },
      circularDependencies: {
        name: 'Circular Dependencies',
        status: 'success',
        errors: 0,
        warnings: 0,
        info: 1,
        description: 'Checks for circular dependency chains'
      },
      rulePriorities: {
        name: 'Rule Priorities',
        status: 'warning',
        errors: 1,
        warnings: 4,
        info: 0,
        description: 'Validates rule priority assignments'
      },
      groupConstraints: {
        name: 'Group Constraints',
        status: 'warning',
        errors: 2,
        warnings: 3,
        info: 1,
        description: 'Checks group constraint feasibility'
      },
      pricingRules: {
        name: 'Pricing Rules',
        status: 'warning',
        errors: 0,
        warnings: 4,
        info: 1,
        description: 'Validates pricing rule consistency'
      },
      expressions: {
        name: 'Expression Syntax',
        status: 'success',
        errors: 0,
        warnings: 0,
        info: 0,
        description: 'Checks expression syntax validity'
      }
    },

    errors: [
      {
        id: 'error-1',
        category: 'idReferences',
        severity: 'error',
        message: 'Option ID "opt_nonexistent" referenced in rule but not found in model',
        affectedIds: ['rule-123'],
        context: 'Rule: Premium CPU Requirements',
        suggestion: 'Add the missing option or update the rule expression'
      },
      {
        id: 'error-2',
        category: 'idReferences',
        severity: 'error',
        message: 'Group ID "grp_missing" referenced but does not exist',
        affectedIds: ['rule-456'],
        context: 'Rule: Storage Configuration',
        suggestion: 'Create the missing group or remove the reference'
      },
      {
        id: 'error-3',
        category: 'rulePriorities',
        severity: 'error',
        message: 'Duplicate priority 100 assigned to multiple rules',
        affectedIds: ['rule-789', 'rule-012'],
        context: 'Rule Priority Management',
        suggestion: 'Assign unique priorities to ensure predictable execution order'
      },
      {
        id: 'error-4',
        category: 'groupConstraints',
        severity: 'error',
        message: 'Single-select group has no available options',
        affectedIds: ['grp-empty'],
        context: 'Group: Display Options',
        suggestion: 'Add at least one option to the single-select group'
      },
      {
        id: 'error-5',
        category: 'groupConstraints',
        severity: 'error',
        message: 'Multi-select group requires more selections than available options',
        affectedIds: ['grp-impossible'],
        context: 'Group: Storage Configuration',
        suggestion: 'Reduce minimum selections or add more options'
      }
    ],

    warnings: [
      {
        id: 'warning-1',
        category: 'idReferences',
        severity: 'warning',
        message: 'Option "opt_deprecated" is referenced but marked as inactive',
        affectedIds: ['rule-legacy'],
        context: 'Legacy rule dependencies',
        suggestion: 'Update rule to use active options or reactivate the option'
      },
      {
        id: 'warning-2',
        category: 'rulePriorities',
        severity: 'warning',
        message: 'Large gap in priority sequence (100 to 500)',
        affectedIds: ['rule-gap1', 'rule-gap2'],
        context: 'Priority management',
        suggestion: 'Consider adjusting priorities for better organization'
      }
    ],

    recommendations: [
      'Fix all ID reference errors before deploying to production',
      'Review and reorganize rule priorities for better maintainability',
      'Consider adding more options to groups with limited choices',
      'Update deprecated option references in legacy rules',
      'Run validation regularly during model development'
    ],

    qualityMetrics: {
      complexity: {
        score: 72,
        label: 'Model Complexity',
        description: 'Overall complexity of the model structure'
      },
      maintainability: {
        score: 85,
        label: 'Maintainability',
        description: 'How easy the model is to maintain and modify'
      },
      consistency: {
        score: 68,
        label: 'Consistency',
        description: 'Consistency of naming and structure patterns'
      },
      completeness: {
        score: 91,
        label: 'Completeness',
        description: 'Coverage of business requirements'
      }
    }
  };

  const runValidation = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setValidation(sampleValidation);
        setLoading(false);
        onValidationComplete(sampleValidation);
      }, 2000);
    } catch (error) {
      console.error('Failed to run validation:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modelId) {
      runValidation();
    }
  }, [modelId]);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'error':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'success':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getQualityScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredIssues = validation ? [
    ...validation.errors.filter(e => selectedCategory === 'all' || e.category === selectedCategory),
    ...validation.warnings.filter(w => selectedCategory === 'all' || w.category === selectedCategory)
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Model Validation</h3>
          <p className="text-gray-600">Comprehensive validation of model structure and constraints</p>
        </div>
        <button
          onClick={runValidation}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Validating...' : 'Run Validation'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
            <div>
              <p className="text-sm font-medium text-blue-800">Running Model Validation</p>
              <p className="text-sm text-blue-600">Analyzing model structure and constraints...</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Validation Results */}
      {validation && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className={`w-8 h-8 ${
                  validation.overallStatus === 'success' ? 'text-green-500' :
                  validation.overallStatus === 'warning' ? 'text-yellow-500' :
                  'text-red-500'
                }`} />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Validation Complete
                  </h4>
                  <p className="text-gray-600">
                    Overall Status: <span className={`font-medium ${
                      validation.overallStatus === 'success' ? 'text-green-600' :
                      validation.overallStatus === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {validation.overallStatus.charAt(0).toUpperCase() + validation.overallStatus.slice(1)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <StarIcon className={`w-6 h-6 ${getQualityScoreColor(validation.qualityScore)}`} />
                  <span className={`text-2xl font-bold ${getQualityScoreColor(validation.qualityScore)}`}>
                    {validation.qualityScore}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Quality Score</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{validation.totalErrors}</p>
                <p className="text-sm text-gray-600">Errors</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{validation.totalWarnings}</p>
                <p className="text-sm text-gray-600">Warnings</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{validation.totalInfo}</p>
                <p className="text-sm text-gray-600">Info</p>
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-blue-500" />
              Quality Metrics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(validation.qualityMetrics).map(([key, metric]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    <span className={`font-bold ${getQualityScoreColor(metric.score)}`}>
                      {metric.score}%
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        metric.score >= 90 ? 'bg-green-500' :
                        metric.score >= 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${metric.score}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category Overview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2 text-purple-500" />
              Validation Categories
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(validation.categories).map(([key, category]) => (
                <div
                  key={key}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedCategory === key ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCategory(key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{category.name}</h5>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(category.status)}`}>
                      {category.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{category.description}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-600">{category.errors} errors</span>
                    <span className="text-yellow-600">{category.warnings} warnings</span>
                    <span className="text-blue-600">{category.info} info</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Filters */}
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Issues ({filteredIssues.length})
            </button>
            {Object.entries(validation.categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  selectedCategory === key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.errors + category.warnings})
              </button>
            ))}
          </div>

          {/* Issues List */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Issues {selectedCategory !== 'all' && `in ${validation.categories[selectedCategory]?.name}`}
            </h4>
            {filteredIssues.length > 0 ? (
              <div className="space-y-4">
                {filteredIssues.map(issue => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`border rounded-lg p-4 ${
                      issue.severity === 'error' ? 'border-red-200 bg-red-50' :
                      'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">{issue.message}</h5>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Context:</span> {issue.context}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Affected:</span> {issue.affectedIds.join(', ')}
                        </p>
                        <div className="bg-white border border-gray-200 rounded p-3 mt-3">
                          <p className="text-sm text-blue-800">
                            <InformationCircleIcon className="w-4 h-4 inline mr-1" />
                            <span className="font-medium">Suggestion:</span> {issue.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No issues found in this category</p>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-green-500" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {validation.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3"></span>
                  <span className="text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* No Validation State */}
      {!validation && !loading && (
        <div className="text-center py-12">
          <ShieldCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Validation</h3>
          <p className="text-gray-600 mb-4">Run validation to check your model for issues and get quality metrics.</p>
          <button
            onClick={runValidation}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ShieldCheckIcon className="w-4 h-4 mr-2" />
            Start Validation
          </button>
        </div>
      )}
    </div>
  );
};

export default ModelValidation;