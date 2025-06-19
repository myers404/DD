import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

const ConstraintTester = ({ model, rules = [] }) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [violatedRules, setViolatedRules] = useState([]);
  const [satisfiedRules, setSatisfiedRules] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Sample test scenarios based on the actual rules in the database
  const testScenarios = [
    {
      id: 'scenario_1',
      name: 'Basic Valid Configuration',
      description: 'Basic i5 + 8GB RAM + 256GB SSD - should be valid',
      selections: {
        'opt_cpu_basic': true,
        'opt_ram_8gb': true,
        'opt_ssd_256gb': true
      },
      expectedValid: true,
      expectedViolations: []
    },
    {
      id: 'scenario_2', 
      name: 'CPU-RAM Compatibility Violation',
      description: 'i7 CPU with only 8GB RAM - should violate CPU-RAM compatibility rule',
      selections: {
        'opt_cpu_high': true,
        'opt_ram_8gb': true,
        'opt_ssd_256gb': true
      },
      expectedValid: false,
      expectedViolations: ['rule_cpu_ram_compatibility']
    },
    {
      id: 'scenario_3',
      name: 'Storage Performance Violation', 
      description: 'i7 CPU with only 256GB SSD - should violate storage performance rule',
      selections: {
        'opt_cpu_high': true,
        'opt_ram_16gb': true,
        'opt_ssd_256gb': true
      },
      expectedValid: false,
      expectedViolations: ['rule_storage_performance']
    },
    {
      id: 'scenario_4',
      name: 'Monitor-Keyboard Requirement',
      description: 'Monitor selected without keyboard - should violate monitor workspace rule',
      selections: {
        'opt_cpu_basic': true,
        'opt_ram_8gb': true,
        'opt_ssd_256gb': true,
        'opt_monitor': true
      },
      expectedValid: false,
      expectedViolations: ['rule_monitor_space']
    },
    {
      id: 'scenario_5',
      name: 'Professional Configuration',
      description: 'i7 + 32GB RAM + 1TB SSD + accessories - should be fully valid',
      selections: {
        'opt_cpu_high': true,
        'opt_ram_32gb': true,
        'opt_ssd_1tb': true,
        'opt_monitor': true,
        'opt_keyboard': true,
        'opt_mouse': true
      },
      expectedValid: true,
      expectedViolations: []
    }
  ];

  // Simple constraint evaluation (client-side approximation)
  const evaluateConstraints = () => {
    setIsEvaluating(true);
    
    const violated = [];
    const satisfied = [];

    // Rule: CPU-RAM Compatibility (opt_cpu_high -> opt_ram_16gb OR opt_ram_32gb)
    if (selectedOptions['opt_cpu_high']) {
      if (!selectedOptions['opt_ram_16gb'] && !selectedOptions['opt_ram_32gb']) {
        violated.push({
          id: 'rule_cpu_ram_compatibility',
          name: 'CPU-RAM Compatibility',
          message: 'Intel i7 processor requires at least 16GB RAM for optimal performance',
          expression: 'opt_cpu_high -> opt_ram_16gb OR opt_ram_32gb'
        });
      } else {
        satisfied.push({
          id: 'rule_cpu_ram_compatibility',
          name: 'CPU-RAM Compatibility',
          message: 'CPU and RAM are compatible'
        });
      }
    }

    // Rule: Storage Performance (opt_cpu_high -> opt_ssd_512gb OR opt_ssd_1tb)
    if (selectedOptions['opt_cpu_high']) {
      if (!selectedOptions['opt_ssd_512gb'] && !selectedOptions['opt_ssd_1tb']) {
        violated.push({
          id: 'rule_storage_performance',
          name: 'Storage Performance',
          message: 'High-performance processor works best with 512GB+ storage',
          expression: 'opt_cpu_high -> opt_ssd_512gb OR opt_ssd_1tb'
        });
      } else {
        satisfied.push({
          id: 'rule_storage_performance',
          name: 'Storage Performance', 
          message: 'CPU and storage are well matched'
        });
      }
    }

    // Rule: Monitor Workspace (opt_monitor -> opt_keyboard)
    if (selectedOptions['opt_monitor']) {
      if (!selectedOptions['opt_keyboard']) {
        violated.push({
          id: 'rule_monitor_space',
          name: 'Monitor Workspace',
          message: 'External monitor works best with a full-size keyboard',
          expression: 'opt_monitor -> opt_keyboard'
        });
      } else {
        satisfied.push({
          id: 'rule_monitor_space',
          name: 'Monitor Workspace',
          message: 'Monitor and keyboard setup is complete'
        });
      }
    }

    setTimeout(() => {
      setViolatedRules(violated);
      setSatisfiedRules(satisfied);
      setIsEvaluating(false);
    }, 500); // Simulate evaluation time
  };

  // Run test scenario
  const runTestScenario = (scenario) => {
    setSelectedOptions(scenario.selections);
    
    // Evaluate after a brief delay to let state update
    setTimeout(() => {
      setIsEvaluating(true);
      
      // Use the same evaluation logic
      const violated = [];
      
      // Check each rule based on scenario selections
      if (scenario.selections['opt_cpu_high']) {
        if (!scenario.selections['opt_ram_16gb'] && !scenario.selections['opt_ram_32gb']) {
          violated.push('rule_cpu_ram_compatibility');
        }
        if (!scenario.selections['opt_ssd_512gb'] && !scenario.selections['opt_ssd_1tb']) {
          violated.push('rule_storage_performance');
        }
      }
      
      if (scenario.selections['opt_monitor'] && !scenario.selections['opt_keyboard']) {
        violated.push('rule_monitor_space');
      }

      const isValid = violated.length === 0;
      const testPassed = isValid === scenario.expectedValid && 
                        violated.length === scenario.expectedViolations.length;

      setTimeout(() => {
        setTestResults(prev => [...prev, {
          scenario: scenario.name,
          expected: scenario.expectedValid,
          actual: isValid,
          passed: testPassed,
          violatedRules: violated,
          timestamp: new Date().toLocaleTimeString()
        }]);
        setIsEvaluating(false);
        evaluateConstraints();
      }, 300);
    }, 100);
  };

  // Clear all results
  const clearResults = () => {
    setTestResults([]);
    setSelectedOptions({});
    setViolatedRules([]);
    setSatisfiedRules([]);
  };

  // Toggle option selection
  const toggleOption = (optionId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  // Auto-evaluate when selections change
  useEffect(() => {
    if (Object.keys(selectedOptions).length > 0) {
      const timer = setTimeout(evaluateConstraints, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedOptions]);

  // Sample laptop options for testing
  const options = {
    'Processors': [
      { id: 'opt_cpu_basic', name: 'Intel i5 Basic', price: 0 },
      { id: 'opt_cpu_mid', name: 'Intel i5 Performance', price: 200 },
      { id: 'opt_cpu_high', name: 'Intel i7 Professional', price: 500 }
    ],
    'Memory': [
      { id: 'opt_ram_8gb', name: '8GB RAM', price: 0 },
      { id: 'opt_ram_16gb', name: '16GB RAM', price: 300 },
      { id: 'opt_ram_32gb', name: '32GB RAM', price: 700 }
    ],
    'Storage': [
      { id: 'opt_ssd_256gb', name: '256GB SSD', price: 0 },
      { id: 'opt_ssd_512gb', name: '512GB SSD', price: 200 },
      { id: 'opt_ssd_1tb', name: '1TB SSD', price: 500 }
    ],
    'Accessories': [
      { id: 'opt_mouse', name: 'Wireless Mouse', price: 25 },
      { id: 'opt_keyboard', name: 'Wireless Keyboard', price: 75 },
      { id: 'opt_monitor', name: '24" Monitor', price: 300 },
      { id: 'opt_bag', name: 'Laptop Bag', price: 50 },
      { id: 'opt_warranty', name: 'Extended Warranty', price: 150 }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Constraint Rule Testing</h2>
        <p className="text-gray-600">
          Test constraint rules with different option combinations to verify rule evaluation is working correctly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Scenarios */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Automated Test Scenarios</h3>
          
          <div className="space-y-3 mb-4">
            {testScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => runTestScenario(scenario)}
                disabled={isEvaluating}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{scenario.name}</div>
                    <div className="text-sm text-gray-600">{scenario.description}</div>
                  </div>
                  <PlayIcon className="h-5 w-5 text-blue-600" />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={clearResults}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Clear Results
          </button>
        </div>

        {/* Manual Option Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Configuration</h3>
          
          {Object.entries(options).map(([groupName, groupOptions]) => (
            <div key={groupName} className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">{groupName}</h4>
              <div className="space-y-2">
                {groupOptions.map((option) => (
                  <label key={option.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedOptions[option.id] || false}
                      onChange={() => toggleOption(option.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {option.name} {option.price > 0 && `(+$${option.price})`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Constraint Evaluation Results */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Constraint Evaluation
            {isEvaluating && <span className="text-sm font-normal text-blue-600 ml-2">Evaluating...</span>}
          </h3>

          {/* Rule Violations */}
          {violatedRules.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-red-700 mb-2 flex items-center">
                <XCircleIcon className="h-4 w-4 mr-1" />
                Rule Violations ({violatedRules.length})
              </h4>
              <div className="space-y-2">
                {violatedRules.map((rule) => (
                  <div key={rule.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-medium text-red-800">{rule.name}</div>
                    <div className="text-sm text-red-700">{rule.message}</div>
                    <div className="text-xs font-mono text-red-600 mt-1">{rule.expression}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Satisfied Rules */}
          {satisfiedRules.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-green-700 mb-2 flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Satisfied Rules ({satisfiedRules.length})
              </h4>
              <div className="space-y-2">
                {satisfiedRules.map((rule) => (
                  <div key={rule.id} className="p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800 text-sm">{rule.name}</div>
                    <div className="text-xs text-green-700">{rule.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overall Status */}
          {Object.keys(selectedOptions).length > 0 && (
            <div className={`p-3 rounded-lg ${
              violatedRules.length === 0 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`font-medium flex items-center ${
                violatedRules.length === 0 ? 'text-green-800' : 'text-red-800'
              }`}>
                {violatedRules.length === 0 ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Configuration Valid
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Configuration Invalid
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Scenario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testResults.map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.scenario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.expected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.expected ? 'Valid' : 'Invalid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.actual ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.actual ? 'Valid' : 'Invalid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result.passed ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-600" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rule Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Constraint Rules</h3>
        
        <div className="space-y-4">
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <h4 className="font-medium text-blue-800">CPU-RAM Compatibility</h4>
            <p className="text-sm text-blue-700 mt-1">opt_cpu_high → opt_ram_16gb OR opt_ram_32gb</p>
            <p className="text-xs text-blue-600 mt-1">Intel i7 processor requires at least 16GB RAM for optimal performance</p>
          </div>
          
          <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
            <h4 className="font-medium text-purple-800">Storage Performance</h4>
            <p className="text-sm text-purple-700 mt-1">opt_cpu_high → opt_ssd_512gb OR opt_ssd_1tb</p>
            <p className="text-xs text-purple-600 mt-1">High-performance processor works best with 512GB+ storage</p>
          </div>
          
          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <h4 className="font-medium text-green-800">Monitor Workspace</h4>
            <p className="text-sm text-green-700 mt-1">opt_monitor → opt_keyboard</p>
            <p className="text-xs text-green-600 mt-1">External monitor works best with a full-size keyboard</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstraintTester;