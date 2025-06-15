// frontend/src/pages/Configure.jsx
// Main configuration page with model selection and configuration workflow

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CogIcon,
  RocketLaunchIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  GridIcon,
  ListViewIcon,
  StarIcon,
  ClockIcon,
  TagIcon,
  WrenchScrewdriverIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// API and components
import { cpqApi } from '../services/api';
import CustomerConfigurator from '../components/configurator/CustomerConfigurator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';

const Configure = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();

  // Local state for model selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch models for selection
  const { data: models, isLoading: modelsLoading, error: modelsError } = useQuery({
    queryKey: ['models'],
    queryFn: cpqApi.getModels,
    enabled: !modelId, // Only fetch if no model is selected
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // If a specific model is selected, show the configurator
  if (modelId) {
    return (
      <ErrorBoundary>
        <CustomerConfigurator />
      </ErrorBoundary>
    );
  }

  // Filter models based on search and category
  const filteredModels = React.useMemo(() => {
    if (!models) return [];

    let filtered = models.data || models || [];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(model => 
        model.category === selectedCategory || 
        model.tags?.includes(selectedCategory)
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchLower) ||
        model.description?.toLowerCase().includes(searchLower) ||
        model.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [models, selectedCategory, searchTerm]);

  // Get unique categories from models
  const categories = React.useMemo(() => {
    if (!models) return [];
    
    const allModels = models.data || models || [];
    const categorySet = new Set();
    
    allModels.forEach(model => {
      if (model.category) categorySet.add(model.category);
      if (model.tags) {
        model.tags.forEach(tag => categorySet.add(tag));
      }
    });
    
    return Array.from(categorySet).sort();
  }, [models]);

  // Render model card
  const renderModelCard = (model) => (
    <motion.div
      key={model.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Model Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <CogIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {model.name}
            </h3>
          </div>
          
          {model.featured && (
            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
              <StarIcon className="h-3 w-3" />
              Featured
            </div>
          )}
        </div>

        {model.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {model.description}
          </p>
        )}

        {/* Model Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {model.groups?.reduce((acc, group) => acc + (group.options?.length || 0), 0) || 0}
            </div>
            <div className="text-xs text-gray-500">Options</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {model.groups?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Groups</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {model.rules?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Rules</div>
          </div>
        </div>

        {/* Tags */}
        {model.tags && model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {model.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {model.tags.length > 3 && (
              <span className="text-gray-400 text-xs">
                +{model.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Pricing Info */}
        {model.base_price && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Starting at</span>
              <span className="text-lg font-semibold text-gray-900">
                ${model.base_price.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/configure/${model.id}`}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium flex items-center justify-center gap-2"
          >
            <RocketLaunchIcon className="h-4 w-4" />
            Start Configuration
          </Link>
          
          <Link
            to={`/models/${model.id}`}
            className="px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            title="View Details"
          >
            <TagIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Last Updated */}
      {model.updated_at && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <ClockIcon className="h-3 w-3" />
            Updated {new Date(model.updated_at).toLocaleDateString()}
          </div>
        </div>
      )}
    </motion.div>
  );

  // Render model list item
  const renderModelListItem = (model) => (
    <motion.div
      key={model.id}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CogIcon className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {model.name}
              </h3>
              {model.featured && (
                <StarIcon className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            
            {model.description && (
              <p className="text-sm text-gray-600 truncate">
                {model.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{model.groups?.reduce((acc, group) => acc + (group.options?.length || 0), 0) || 0} options</span>
              <span>{model.groups?.length || 0} groups</span>
              <span>{model.rules?.length || 0} rules</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {model.base_price && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Starting at</div>
              <div className="font-semibold text-gray-900">
                ${model.base_price.toFixed(2)}
              </div>
            </div>
          )}
          
          <Link
            to={`/configure/${model.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            Configure
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );

  // Loading state
  if (modelsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner size="large" message="Loading available models..." />
      </div>
    );
  }

  // Error state
  if (modelsError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Models</h2>
          <p className="text-gray-600 mb-6">{modelsError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Configuration Model
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select a product model to start building your perfect configuration. 
            Each model provides different options and pricing structures.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <GridIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List View"
              >
                <ListViewIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </p>
          
          {filteredModels.length > 0 && (
            <p className="text-sm text-gray-500">
              Click on a model to start configuring
            </p>
          )}
        </div>

        {/* Models Grid/List */}
        <AnimatePresence mode="wait">
          {filteredModels.length > 0 ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredModels.map(model =>
                viewMode === 'grid' 
                  ? renderModelCard(model)
                  : renderModelListItem(model)
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <WrenchScrewdriverIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Models Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No configuration models are currently available'
                }
              </p>
              
              {(searchTerm || selectedCategory !== 'all') && (
                <div className="flex items-center justify-center gap-3">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Clear search
                    </button>
                  )}
                  {selectedCategory !== 'all' && (
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Need Help Choosing?
            </h3>
            <p className="text-blue-700 mb-4">
              Not sure which model fits your needs? Our team can help you select the right configuration.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/support"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Contact Support
              </Link>
              <Link
                to="/models"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Browse All Models
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Configure;