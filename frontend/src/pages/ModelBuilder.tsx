import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  AdjustmentsVerticalIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// Import the model builder components we created
import RuleEditor from './components/model-builder/RuleEditor';
import ConflictDetection from './components/model-builder/ConflictDetection';
import ImpactAnalysis from './components/model-builder/ImpactAnalysis';
import ModelValidation from './components/model-builder/ModelValidation';
import RulePriorityManager from './components/model-builder/RulePriorityManager';

const ModelBuilder = () => {
  const [selectedModel, setSelectedModel] = useState('model-123');
  const [activeTab, setActiveTab] = useState('rules');
  const [modelHealth, setModelHealth] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Sample model data
  const availableModels = [
    { id: 'model-123', name: 'SMB Computer Configuration', status: 'active', lastModified: '2025-06-12' },
    { id: 'model-456', name: 'Enterprise Server Config', status: 'draft', lastModified: '2025-06-10' },
    { id: 'model-789', name: 'Gaming PC Builder', status: 'active', lastModified: '2025-06-08' }
  ];

  // Sample model health data
  const sampleModelHealth = {
    overallScore: 78,
    status: 'warning',
    rules: { total: 15, active: 12, conflicts: 2 },
    validation: { errors: 3, warnings: 8, info: 2 },
    lastValidation: new Date().toISOString(),
    recommendations: [
      'Resolve 2 rule conflicts',
      'Fix 3 validation errors',
      'Review rule priorities'
    ]
  };

  const tabs = [
    {
      id: 'rules',
      name: 'Rules',
      icon: WrenchScrewdriverIcon,
      description: 'Create and manage configuration rules',
      badge: modelHealth?.rules?.total || 0
    },
    {
      id: 'conflicts',
      name: 'Conflicts',
      icon: ExclamationTriangleIcon,
      description: 'Detect and resolve rule conflicts',
      badge: modelHealth?.rules?.conflicts || 0,
      badgeColor: 'bg-red-500'
    },
    {
      id: 'impact',
      name: 'Impact Analysis',
      icon: ChartBarIcon,
      description: 'Analyze rule change impacts',
      badge: null
    },
    {
      id: 'validation',
      name: 'Validation',
      icon: ShieldCheckIcon,
      description: 'Validate model structure and constraints',
      badge: modelHealth?.validation?.errors || 0,
      badgeColor: 'bg-red-500'
    },
    {
      id: 'priorities',
      name: 'Priorities',
      icon: AdjustmentsVerticalIcon,
      description: 'Manage rule execution priorities',
      badge: null
    }
  ];

  useEffect(() => {
    loadModelHealth();
  }, [selectedModel]);

  const loadModelHealth = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setModelHealth(sampleModelHealth);
        updateNotifications(sampleModelHealth);
      }, 1000);
    } catch (error) {
      console.error('Failed to load model health:', error);
    }
  };

  const updateNotifications = (health) => {
    const newNotifications = [];
    
    if (health.rules.conflicts > 0) {
      newNotifications.push({
        id: 'conflicts',
        type: 'error',
        title: 'Rule Conflicts Detected',
        message: `${health.rules.conflicts} rule conflicts need resolution`,
        action: () => setActiveTab('conflicts')
      });
    }
    
    if (health.validation.errors > 0) {
      newNotifications.push({
        id: 'validation',
        type: 'error',
        title: 'Validation Errors',
        message: `${health.validation.errors} validation errors found`,
        action: () => setActiveTab('validation')
      });
    }
    
    if (health.validation.warnings > 5) {
      newNotifications.push({
        id: 'warnings',
        type: 'warning',
        title: 'Multiple Warnings',
        message: `${health.validation.warnings} warnings detected`,
        action: () => setActiveTab('validation')
      });
    }
    
    setNotifications(newNotifications);
  };

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    // Reset to rules tab when switching models
    setActiveTab('rules');
  };

  const handleRuleChange = () => {
    // Refresh model health when rules change
    loadModelHealth();
  };

  const handleConflictResolved = () => {
    // Refresh model health when conflicts are resolved
    loadModelHealth();
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Cog6ToothIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Model Builder</h1>
                <p className="text-gray-600">Create and manage CPQ configuration models</p>
              </div>
            </div>
            
            {/* Model Selector */}
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Active Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Model Health Indicator */}
              {modelHealth && (
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    {getHealthStatusIcon(modelHealth.status)}
                    <span className={`font-medium ${getHealthStatusColor(modelHealth.status)}`}>
                      Health: {modelHealth.overallScore}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Last validated: {new Date(modelHealth.lastValidation).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="space-y-2">
            {notifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  notification.type === 'error' 
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {notification.type === 'error' ? (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm">{notification.message}</p>
                  </div>
                </div>
                <button
                  onClick={notification.action}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    notification.type === 'error'
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                >
                  Fix Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Model Tools</h3>
                <p className="text-sm text-gray-600 mt-1">Choose a tool to get started</p>
              </div>
              <nav className="space-y-1 p-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <div>
                          <p className="font-medium">{tab.name}</p>
                          <p className="text-xs text-gray-500">{tab.description}</p>
                        </div>
                      </div>
                      {tab.badge !== null && tab.badge > 0 && (
                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full text-white ${
                          tab.badgeColor || 'bg-gray-500'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Model Health Summary */}
            {modelHealth && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-3">Model Health</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Overall Score</span>
                    <span className={`font-medium ${getHealthStatusColor(modelHealth.status)}`}>
                      {modelHealth.overallScore}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Rules</span>
                    <span className="font-medium text-gray-900">
                      {modelHealth.rules.active}/{modelHealth.rules.total}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conflicts</span>
                    <span className={`font-medium ${modelHealth.rules.conflicts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {modelHealth.rules.conflicts}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Errors</span>
                    <span className={`font-medium ${modelHealth.validation.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {modelHealth.validation.errors}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'rules' && (
                    <motion.div
                      key="rules"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <RuleEditor 
                        modelId={selectedModel} 
                        onRuleChange={handleRuleChange}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'conflicts' && (
                    <motion.div
                      key="conflicts"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <ConflictDetection 
                        modelId={selectedModel}
                        onConflictResolved={handleConflictResolved}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'impact' && (
                    <motion.div
                      key="impact"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <ImpactAnalysis 
                        modelId={selectedModel}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'validation' && (
                    <motion.div
                      key="validation"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <ModelValidation 
                        modelId={selectedModel}
                        onValidationComplete={loadModelHealth}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'priorities' && (
                    <motion.div
                      key="priorities"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <RulePriorityManager 
                        modelId={selectedModel}
                        onPriorityChange={handleRuleChange}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelBuilder;