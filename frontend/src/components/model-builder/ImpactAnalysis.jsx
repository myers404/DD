import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  PlayIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const ImpactAnalysis = ({ modelId, proposedChanges = null }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [analysisType, setAnalysisType] = useState('add');

  // Sample analysis data for demo
  const sampleAnalysis = {
    totalConfigurations: 128,
    affectedConfigurations: 23,
    testCoverage: {
      totalScenarios: 128,
      coveredScenarios: 125,
      coveragePercentage: 97.7
    },
    validityChanges: [
      {
        configurationId: 'config-1',
        name: 'Gaming Workstation',
        beforeStatus: 'valid',
        afterStatus: 'invalid',
        reason: 'Premium CPU requires liquid cooling',
        selections: ['opt_cpu_high', 'opt_tier_gaming', 'opt_cooling_air']
      },
      {
        configurationId: 'config-2',
        name: 'Budget Gaming Setup',
        beforeStatus: 'invalid',
        afterStatus: 'valid',
        reason: 'Budget constraints now allow basic GPU',
        selections: ['opt_tier_budget', 'opt_gpu_basic', 'opt_storage_hdd']
      }
    ],
    pricingChanges: [
      {
        configurationId: 'config-3',
        name: 'Professional Workstation',
        beforePrice: 2499,
        afterPrice: 2799,
        priceChange: 300,
        changePercentage: 12.0,
        reason: 'Premium cooling requirement increases cost'
      },
      {
        configurationId: 'config-4',
        name: 'Standard Desktop',
        beforePrice: 1299,
        afterPrice: 1199,
        priceChange: -100,
        changePercentage: -7.7,
        reason: 'Budget tier discount now applies'
      }
    ],
    recommendedActions: [
      'Review configurations that become invalid after rule change',
      'Notify customers about pricing changes in affected configurations',
      'Consider adding exception rules for edge cases',
      'Update product documentation to reflect new constraints'
    ],
    impactSummary: {
      validityImpact: { improved: 12, degraded: 11 },
      pricingImpact: { increased: 8, decreased: 15 },
      totalAffected: 23,
      riskLevel: 'medium'
    }
  };

  const runImpactAnalysis = async (ruleChange) => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setAnalysis(sampleAnalysis);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to run impact analysis:', error);
      setLoading(false);
    }
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />;
    if (change < 0) return <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />;
    return <ExclamationCircleIcon className="w-4 h-4 text-gray-500" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ExclamationCircleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const RuleChangeForm = () => {
    const [formData, setFormData] = useState({
      changeType: 'add',
      ruleName: '',
      ruleExpression: '',
      ruleType: 'requires'
    });

    const handleAnalyze = () => {
      setSelectedRule(formData);
      runImpactAnalysis(formData);
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Propose Rule Change</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Change Type
            </label>
            <select
              value={formData.changeType}
              onChange={(e) => setFormData({...formData, changeType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="add">Add New Rule</option>
              <option value="modify">Modify Existing Rule</option>
              <option value="remove">Remove Rule</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rule Type
            </label>
            <select
              value={formData.ruleType}
              onChange={(e) => setFormData({...formData, ruleType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="requires">Requires</option>
              <option value="excludes">Excludes</option>
              <option value="validation">Validation</option>
              <option value="pricing">Pricing</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rule Name
          </label>
          <input
            type="text"
            value={formData.ruleName}
            onChange={(e) => setFormData({...formData, ruleName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter rule name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rule Expression
          </label>
          <input
            type="text"
            value={formData.ruleExpression}
            onChange={(e) => setFormData({...formData, ruleExpression: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="opt_cpu_high -> opt_cooling_liquid"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !formData.ruleName || !formData.ruleExpression}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <PlayIcon className="w-4 h-4 mr-2" />
          {loading ? 'Analyzing...' : 'Analyze Impact'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Impact Analysis</h3>
        <p className="text-gray-600">Analyze how rule changes affect existing configurations</p>
      </div>

      {/* Rule Change Form */}
      <RuleChangeForm />

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
              <p className="text-sm font-medium text-blue-800">Running Impact Analysis</p>
              <p className="text-sm text-blue-600">Testing configurations and analyzing changes...</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{analysis.totalConfigurations}</p>
                  <p className="text-sm text-gray-600">Total Tested</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationCircleIcon className="w-8 h-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">{analysis.affectedConfigurations}</p>
                  <p className="text-sm text-gray-600">Affected</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {analysis.testCoverage.coveragePercentage}%
                  </p>
                  <p className="text-sm text-gray-600">Coverage</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <InformationCircleIcon className={`w-8 h-8 mr-3 ${
                  analysis.impactSummary.riskLevel === 'high' ? 'text-red-500' :
                  analysis.impactSummary.riskLevel === 'medium' ? 'text-yellow-500' :
                  'text-green-500'
                }`} />
                <div>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {analysis.impactSummary.riskLevel}
                  </p>
                  <p className="text-sm text-gray-600">Risk Level</p>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Validity Changes */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-500" />
                Validity Impact
              </h4>
              <div className="space-y-3">
                {analysis.validityChanges.map((change, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{change.name}</p>
                      <p className="text-sm text-gray-600">{change.reason}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(change.beforeStatus)}
                      <span className="text-gray-400">→</span>
                      {getStatusIcon(change.afterStatus)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Changes */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500" />
                Pricing Impact
              </h4>
              <div className="space-y-3">
                {analysis.pricingChanges.map((change, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{change.name}</p>
                      <p className="text-sm text-gray-600">{change.reason}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getChangeIcon(change.priceChange)}
                      <span className={`font-medium ${
                        change.priceChange > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {change.priceChange > 0 ? '+' : ''}${change.priceChange}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-yellow-500" />
              Recommended Actions
            </h4>
            <ul className="space-y-2">
              {analysis.recommendedActions.map((action, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-3"></span>
                  <span className="text-gray-700">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Test Coverage Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Test Coverage Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{analysis.testCoverage.totalScenarios}</p>
                <p className="text-sm text-gray-600">Total Scenarios</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{analysis.testCoverage.coveredScenarios}</p>
                <p className="text-sm text-gray-600">Covered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {analysis.testCoverage.totalScenarios - analysis.testCoverage.coveredScenarios}
                </p>
                <p className="text-sm text-gray-600">Uncovered</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${analysis.testCoverage.coveragePercentage}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {analysis.testCoverage.coveragePercentage}% Coverage
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* No Analysis State */}
      {!analysis && !loading && (
        <div className="text-center py-12">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Impact Analysis</h3>
          <p className="text-gray-600">Propose a rule change above to see its impact on existing configurations.</p>
        </div>
      )}
      )
    </div>
  );
};

export default ImpactAnalysis;