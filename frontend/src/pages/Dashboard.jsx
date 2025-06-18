// frontend/src/pages/Dashboard.jsx
// Admin dashboard with proper error handling and data access

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CubeIcon,
  RectangleStackIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowRightIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  CogIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { cpqApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch models with proper error handling
  const {
    data: modelsResponse,
    isLoading: modelsLoading,
    error: modelsError
  } = useQuery({
    queryKey: ['models'],
    queryFn: cpqApi.getModels,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Fetch recent configurations with proper error handling
  const {
    data: configurationsResponse,
    isLoading: configsLoading,
    error: configsError
  } = useQuery({
    queryKey: ['configurations-recent'],
    queryFn: () => cpqApi.getConfigurations({
      limit: 10,
      sort_by: 'createdAt',
      sort_order: 'desc'
    }),
    staleTime: 2 * 60 * 1000,
    retry: 1,
    enabled: false // Disable for now if endpoint doesn't exist
  });

  // Safely extract data arrays
  const models = Array.isArray(modelsResponse)
      ? modelsResponse
      : Array.isArray(modelsResponse?.data)
          ? modelsResponse.data
          : [];

  const configurations = Array.isArray(configurationsResponse)
      ? configurationsResponse
      : Array.isArray(configurationsResponse?.data)
          ? configurationsResponse.data
          : [];

  // Calculate stats safely
  const stats = {
    totalModels: models.length,
    activeModels: models.filter(m => m && (m.isActive || m.active)).length,
    totalConfigurations: configurations.length,
    validConfigurations: configurations.filter(c => c && c.is_valid).length,
    totalOptions: models.reduce((sum, model) => {
      const options = model?.options || [];
      return sum + (Array.isArray(options) ? options.length : 0);
    }, 0),
    totalRules: models.reduce((sum, model) => {
      const rules = model?.rules || [];
      return sum + (Array.isArray(rules) ? rules.length : 0);
    }, 0)
  };

  const isLoading = modelsLoading || configsLoading;

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `${diffInMinutes} minutes ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" message="Loading dashboard..." />
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.username || 'Admin'}!
              </h1>
              <p className="text-blue-100 mt-1">
                Here's an overview of your CPQ system
              </p>
            </div>
            <Link
                to="/models"
                className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Model
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {modelsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading models</h3>
                  <p className="text-sm text-red-700 mt-1">{modelsError.message}</p>
                </div>
              </div>
            </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg border"
          >
            <div className="flex items-center">
              <CubeIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Models</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalModels}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.activeModels} active
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg border"
          >
            <div className="flex items-center">
              <RectangleStackIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Configurations</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalConfigurations}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.validConfigurations} valid
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg border"
          >
            <div className="flex items-center">
              <CogIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Options</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOptions}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Across all models
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-lg border"
          >
            <div className="flex items-center">
              <WrenchScrewdriverIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Business Rules</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRules}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Constraint rules
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Models */}
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Recent Models</h2>
                <Link
                    to="/models"
                    className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {models.length === 0 ? (
                  <div className="text-center py-8">
                    <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No models yet</p>
                    <Link
                        to="/models"
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create First Model
                    </Link>
                  </div>
              ) : (
                  <div className="space-y-4">
                    {models.slice(0, 5).map((model) => (
                        <div key={model.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <CubeIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{model.name || 'Unnamed Model'}</p>
                              <p className="text-xs text-gray-500">
                                {model.options?.length || 0} options • {model.rules?.length || 0} rules
                              </p>
                            </div>
                          </div>
                          <Link
                              to={`/models/${model.id}`}
                              className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </Link>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>

          {/* Recent Configurations */}
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Recent Configurations</h2>
                {models.length > 0 && (
                    <Link
                        to={`/models/${models[0]?.id}/configurations`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View all
                    </Link>
                )}
              </div>
            </div>
            <div className="p-6">
              {configsError ? (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Unable to load configurations</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Check your backend connection
                    </p>
                  </div>
              ) : configurations.length === 0 ? (
                  <div className="text-center py-8">
                    <RectangleStackIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No configurations yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Users will create configurations from your models
                    </p>
                  </div>
              ) : (
                  <div className="space-y-4">
                    {configurations.slice(0, 5).map((config) => {
                      const model = models.find(m => m.id === config.model_id);
                      return (
                          <div key={config.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              {config.is_valid ? (
                                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                              ) : (
                                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {model?.name || 'Unknown Model'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {config.user_email || 'Anonymous'} • {formatDate(config.createdAt)}
                                </p>
                              </div>
                            </div>
                            {model && (
                                <Link
                                    to={`/models/${model.id}/configurations`}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                  View
                                </Link>
                            )}
                          </div>
                      );
                    })}
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
                to="/models"
                className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <CubeIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Models</p>
                <p className="text-sm text-gray-500">Create and edit product models</p>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>

            <Link
                to={models.length > 0 ? `/models/${models[0].id}` : '/models'}
                className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <WrenchScrewdriverIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Model Builder</p>
                <p className="text-sm text-gray-500">Configure options and rules</p>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>

            <Link
                to={models.length > 0 ? `/models/${models[0].id}/configurations` : '/models'}
                className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <RectangleStackIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View Configurations</p>
                <p className="text-sm text-gray-500">See user configurations</p>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;