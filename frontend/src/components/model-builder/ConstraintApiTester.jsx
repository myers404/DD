import React, { useState } from 'react';
import { 
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const ConstraintApiTester = () => {
  const [apiResults, setApiResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState('validate-selection');

  // API test configurations based on actual backend endpoints
  const apiTests = [
    {
      id: 'validate_basic_config',
      name: 'Validate Basic Configuration',
      endpoint: '/api/v1/configurations/validate-selection',
      method: 'POST',
      payload: {
        model_id: 'sample-laptop',
        option_id: 'opt_cpu_basic',
        quantity: 1
      },
      expectedValid: true,
      description: 'Basic CPU selection should be valid'
    },
    {
      id: 'validate_cpu_high',
      name: 'Validate High-End CPU',
      endpoint: '/api/v1/configurations/validate-selection',
      method: 'POST',
      payload: {
        model_id: 'sample-laptop',
        option_id: 'opt_cpu_high',
        quantity: 1
      },
      expectedValid: true,
      description: 'High-end i7 CPU selection should be valid'
    },
    {
      id: 'validate_ram_16gb',
      name: 'Validate 16GB RAM',
      endpoint: '/api/v1/configurations/validate-selection',
      method: 'POST',
      payload: {
        model_id: 'sample-laptop',
        option_id: 'opt_ram_16gb',
        quantity: 1
      },
      expectedValid: true,
      description: '16GB RAM selection should be valid'
    },
    {
      id: 'validate_monitor',
      name: 'Validate Monitor Selection',
      endpoint: '/api/v1/configurations/validate-selection',
      method: 'POST',
      payload: {
        model_id: 'sample-laptop',
        option_id: 'opt_monitor',
        quantity: 1
      },
      expectedValid: true,
      description: 'Monitor selection should be valid independently'
    },
    {
      id: 'validate_keyboard',
      name: 'Validate Keyboard Selection',
      endpoint: '/api/v1/configurations/validate-selection',
      method: 'POST',
      payload: {
        model_id: 'sample-laptop',
        option_id: 'opt_keyboard',
        quantity: 1
      },
      expectedValid: true,
      description: 'Keyboard selection should be valid'
    },
  ];

  const runApiTest = async (test) => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const response = await fetch(`http://localhost:8080${test.endpoint}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if needed
          // 'Authorization': 'Bearer your-token-here'
        },
        body: JSON.stringify(test.payload)
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const data = await response.json();
      
      const result = {
        testId: test.id,
        testName: test.name,
        success: response.ok,
        responseTime,
        httpStatus: response.status,
        data,
        expectedValid: test.expectedValid,
        actualValid: data.data?.valid || false,
        passed: response.ok && ((data.data?.valid || false) === test.expectedValid),
        timestamp: new Date().toLocaleTimeString(),
        errors: data.errors || [],
        violations: data.data?.validation?.violations || []
      };

      setApiResults(prev => [result, ...prev]);

    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const result = {
        testId: test.id,
        testName: test.name,
        success: false,
        responseTime,
        httpStatus: 0,
        error: error.message,
        expectedValid: test.expectedValid,
        actualValid: false,
        passed: false,
        timestamp: new Date().toLocaleTimeString()
      };

      setApiResults(prev => [result, ...prev]);
    }

    setIsLoading(false);
  };

  const runAllTests = async () => {
    setApiResults([]);
    for (const test of apiTests) {
      await runApiTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => {
    setApiResults([]);
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Backend API Constraint Testing</h2>
        <p className="text-gray-600">
          Test constraint validation through the actual backend API endpoints to verify server-side rule evaluation.
        </p>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Prerequisites:</strong> Make sure the backend server is running on localhost:8080 
                and the database contains the sample laptop model with constraint rules.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Test Controls</h3>
          
          <div className="space-y-4">
            <div className="flex space-x-3">
              <button
                onClick={runAllTests}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlayIcon className="h-4 w-4 mr-2" />
                )}
                Run All Tests
              </button>
              
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear Results
              </button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Individual Tests</h4>
              <div className="space-y-2">
                {apiTests.map((test) => (
                  <div key={test.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{test.name}</div>
                        <div className="text-sm text-gray-600">{test.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {test.method} {test.endpoint}
                        </div>
                      </div>
                      <button
                        onClick={() => runApiTest(test)}
                        disabled={isLoading}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
                      >
                        Run
                      </button>
                    </div>
                    
                    {/* Show payload preview */}
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">View Payload</summary>
                      <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                        {formatJson(test.payload)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Status</h3>
          
          {isLoading && (
            <div className="flex items-center text-blue-600 mb-4">
              <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
              Running API tests...
            </div>
          )}

          {apiResults.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {apiResults.filter(r => r.passed).length}
                  </div>
                  <div className="text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {apiResults.filter(r => !r.passed).length}
                  </div>
                  <div className="text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {apiResults.length}
                  </div>
                  <div className="text-gray-600">Total</div>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="font-medium text-gray-900 mb-2">Recent Results</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {apiResults.slice(0, 5).map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      result.passed 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {result.passed ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                          ) : (
                            <XCircleIcon className="h-4 w-4 text-red-600 mr-2" />
                          )}
                          <span className="font-medium text-sm">{result.testName}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {result.responseTime}ms
                        </div>
                      </div>
                      
                      {result.violations && result.violations.length > 0 && (
                        <div className="mt-2 text-xs">
                          <div className="font-medium text-red-800">Violations:</div>
                          {result.violations.map((violation, i) => (
                            <div key={i} className="text-red-700">• {violation.message || violation}</div>
                          ))}
                        </div>
                      )}
                      
                      {result.error && (
                        <div className="mt-2 text-xs text-red-700">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Results Table */}
      {apiResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Test Results</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiResults.map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.testName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {result.passed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.expectedValid ? 'Valid' : 'Invalid'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.actualValid ? 'Valid' : 'Invalid'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.responseTime}ms
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {result.violations && result.violations.length > 0 && (
                        <div>
                          <strong>Violations:</strong>
                          <ul className="list-disc list-inside text-xs mt-1">
                            {result.violations.map((v, i) => (
                              <li key={i}>{v.message || v}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.error && (
                        <div className="text-red-600 text-xs">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstraintApiTester;