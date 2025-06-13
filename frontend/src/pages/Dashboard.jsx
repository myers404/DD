import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CogIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  PlusIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useConfiguration } from '../contexts/ConfigurationContext';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const { 
    models, 
    configurations, 
    loadModels, 
    getPerformanceMetrics, 
    isLoading 
  } = useConfiguration();
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalConfigurations: 0,
    validConfigurations: 0,
    totalValue: 0,
    avgResponseTime: 0,
  });

  // Load data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await loadModels();
        
        // Generate demo activity data
        const demoActivity = [
          {
            id: 1,
            type: 'configuration',
            title: 'Business Laptop Configuration',
            description: 'Completed configuration with Intel i7, 16GB RAM, 512GB SSD',
            timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
            status: 'completed',
            value: 2499,
          },
          {
            id: 2,
            type: 'model',
            title: 'Gaming Laptop Model Updated',
            description: 'Added new RTX 4090 graphics card option',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            status: 'updated',
          },
          {
            id: 3,
            type: 'validation',
            title: 'Workstation Config Validation',
            description: 'Constraint violation detected and resolved',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            status: 'warning',
          },
          {
            id: 4,
            type: 'configuration',
            title: 'Ultrabook Configuration',
            description: 'Lightweight configuration optimized for portability',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            status: 'completed',
            value: 1899,
          },
        ];
        
        setRecentActivity(demoActivity);
        
        // Generate demo stats
        setStats({
          totalConfigurations: 47,
          validConfigurations: 43,
          totalValue: 125750,
          avgResponseTime: 47,
        });
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [loadModels]);

  // Performance metrics
  const performanceMetrics = getPerformanceMetrics();

  // Quick action cards
  const quickActions = [
    {
      title: 'Start Configuration',
      description: 'Begin configuring a new product',
      href: '/configure',
      icon: CogIcon,
      color: 'bg-blue-500',
      permission: 'configurations',
    },
    {
      title: 'Build Model',
      description: 'Create or edit product models',
      href: '/model-builder',
      icon: WrenchScrewdriverIcon,
      color: 'bg-green-500',
      permission: 'model_builder',
    },
    {
      title: 'View Analytics',
      description: 'Analyze configuration patterns',
      href: '/analytics',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      permission: 'analytics',
    },
  ];

  const filteredQuickActions = quickActions.filter(action => 
    !action.permission || hasPermission(action.permission)
  );

  // Status indicators
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'updated':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-blue-100 mt-1">
              Here's what's happening with your CPQ system today.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-blue-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{models?.length || 0}</div>
              <div className="text-sm">Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalConfigurations}</div>
              <div className="text-sm">Configurations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.avgResponseTime}ms</div>
              <div className="text-sm">Avg Response</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CogIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Configurations</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalConfigurations}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-600">
              <span>+12% from last month</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Valid Configurations</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.validConfigurations}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <span>{Math.round((stats.validConfigurations / stats.totalConfigurations) * 100)}% success rate</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats.totalValue.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-600">
              <span>+8% from last month</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.avgResponseTime}ms</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-600">
              <span>Well below 200ms target</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredQuickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link
                to={action.href}
                className="block p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link
              to="/activity"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start space-x-4"
              >
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    <span>{formatTimeAgo(activity.timestamp)}</span>
                    {activity.value && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-green-600 font-medium">
                          ${activity.value.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Available models */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Available Models</h2>
            {hasPermission('model_builder') && (
              <Link
                to="/model-builder"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                New Model
              </Link>
            )}
          </div>
          
          <div className="space-y-3">
            {models?.slice(0, 5).map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{model.name}</p>
                    <p className="text-xs text-gray-500">
                      {model.options?.length || 0} options • {model.rules?.length || 0} rules
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/configure/${model.id}`}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Configure"
                  >
                    <CogIcon className="h-4 w-4" />
                  </Link>
                  {hasPermission('model_builder') && (
                    <Link
                      to={`/model-builder/${model.id}`}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Edit Model"
                    >
                      <WrenchScrewdriverIcon className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
            
            {models && models.length > 5 && (
              <div className="text-center pt-2">
                <Link
                  to="/configure"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all {models.length} models
                </Link>
              </div>
            )}
            
            {(!models || models.length === 0) && (
              <div className="text-center py-6 text-gray-500">
                <WrenchScrewdriverIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No models available</p>
                {hasPermission('model_builder') && (
                  <Link
                    to="/model-builder"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block"
                  >
                    Create your first model
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System status */}
      {performanceMetrics && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {performanceMetrics.cacheSize}
              </div>
              <div className="text-sm text-gray-500">Cache Entries</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {performanceMetrics.modelsCount}
              </div>
              <div className="text-sm text-gray-500">Active Models</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {performanceMetrics.selectionsCount}
              </div>
              <div className="text-sm text-gray-500">Current Selections</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${performanceMetrics.validationStatus ? 'text-green-600' : 'text-red-600'}`}>
                {performanceMetrics.validationStatus ? 'Valid' : 'Invalid'}
              </div>
              <div className="text-sm text-gray-500">Validation Status</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
