import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    CogIcon,
    WrenchScrewdriverIcon,
    DocumentTextIcon,
    ChartBarIcon,
    BeakerIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
} from '@heroicons/react/24/outline';

// API Functions
import { cpqApi } from '../services/api';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import CreateModelModal from '../components/common/CreateModelModal';

const ModelSelection = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Fetch all models
    const { data: modelsResponse, isLoading, error, refetch } = useQuery({
        queryKey: ['models'],
        queryFn: () => cpqApi.getModels(),
        onError: (error) => {
            console.error('Models API error:', error);
            toast.error(`Failed to load models: ${error.message}`);
        },
    });

    // Handle different possible API response structures
    const models = (() => {
        if (!modelsResponse) return [];

        // Standard API response: { success: true, data: { models: [...] } }
        if (modelsResponse.data && Array.isArray(modelsResponse.data.models)) {
            return modelsResponse.data.models;
        }

        // Direct models array response: { models: [...] }
        if (Array.isArray(modelsResponse.models)) {
            return modelsResponse.models;
        }

        // Direct array response: [...]
        if (Array.isArray(modelsResponse)) {
            return modelsResponse;
        }

        console.warn('Unexpected models response structure:', modelsResponse);
        return [];
    })();

    // Filter models based on search and status
    const filteredModels = (() => {
        if (!Array.isArray(models)) {
            console.error('Models is not an array:', typeof models, models);
            return [];
        }

        return models.filter(model => {
            const matchesSearch = model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                model.description?.toLowerCase().includes(searchTerm.toLowerCase());

            if (statusFilter === 'all') return matchesSearch;

            // Mock status logic - in real app, this would come from the model data
            const hasRules = model.rules && model.rules.length > 0;
            const hasOptions = model.options && model.options.length > 0;
            const isComplete = hasRules && hasOptions;

            if (statusFilter === 'complete') return matchesSearch && isComplete;
            if (statusFilter === 'draft') return matchesSearch && !isComplete;

            return matchesSearch;
        });
    })();

    const handleCreateNewModel = () => {
        setShowCreateModal(true);
    };

    const handleModelCreated = (newModel) => {
        // Refresh the models list
        refetch();
        // Navigate to the newly created model (handle both direct model and wrapped response)
        const modelId = newModel.id || newModel.data?.id;
        if (modelId) {
            navigate(`/model-builder/${modelId}`);
        } else {
            console.error('No model ID found in response:', newModel);
            toast.error('Model created but navigation failed');
        }
    };

    const handleEditModel = (modelId) => {
        navigate(`/model-builder/${modelId}`);
    };

    const handleTestModel = (modelId) => {
        navigate(`/configure/${modelId}`);
    };

    const getModelStatus = (model) => {
        const hasRules = model.rules && model.rules.length > 0;
        const hasOptions = model.options && model.options.length > 0;

        if (hasRules && hasOptions) {
            return { status: 'complete', label: 'Complete', color: 'green' };
        } else if (hasOptions && !hasRules) {
            return { status: 'needs-rules', label: 'Needs Rules', color: 'yellow' };
        } else if (!hasOptions) {
            return { status: 'draft', label: 'Draft', color: 'gray' };
        }
        return { status: 'unknown', label: 'Unknown', color: 'gray' };
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'complete':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'needs-rules':
                return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
            default:
                return <DocumentTextIcon className="h-5 w-5 text-gray-400" />;
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="large" />
                </div>
            </div>
        );
    }

    if (error) {
        console.error('API Error Details:', error);
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading models</h3>
                    <p className="mt-1 text-sm text-gray-500">{error.message}</p>
                    <div className="mt-6">
                        <button
                            onClick={() => refetch()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // DEBUG: Log the API response structure
    console.log('API Response Debug:', {
        modelsResponse,
        modelsType: typeof models,
        modelsIsArray: Array.isArray(models),
        modelsLength: Array.isArray(models) ? models.length : 'N/A',
        firstModel: Array.isArray(models) && models.length > 0 ? models[0] : 'N/A'
    });

    return (
        <ErrorBoundary>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Model Builder</h1>
                            <p className="text-gray-600 mt-2">
                                Create and manage product configuration models with rules and constraints
                            </p>
                        </div>
                        <button
                            onClick={handleCreateNewModel}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Create New Model
                        </button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search models by name or description..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="complete">Complete</option>
                                <option value="draft">Draft</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <FunnelIcon className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="mt-4 text-sm text-gray-600">
                        Showing {Array.isArray(models) ? filteredModels.length : 0} of {Array.isArray(models) ? models.length : 0} models
                    </div>
                </div>

                {/* Models Grid */}
                {!Array.isArray(models) ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Unexpected API Response</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            The API returned an unexpected data structure. Check the console for details.
                        </p>
                        <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs max-w-md mx-auto">
                            <strong>Response type:</strong> {typeof models}<br/>
                            <strong>Response data:</strong> {JSON.stringify(models, null, 2).substring(0, 200)}...
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => refetch()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Retry API Call
                            </button>
                        </div>
                    </div>
                ) : filteredModels.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {searchTerm || statusFilter !== 'all' ? 'No models match your criteria' : 'No models found'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria'
                                : 'Get started by creating your first product model'
                            }
                        </p>
                        <div className="mt-6">
                            {searchTerm || statusFilter !== 'all' ? (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                                >
                                    Clear Filters
                                </button>
                            ) : (
                                <button
                                    onClick={handleCreateNewModel}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Create First Model
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredModels.map((model, index) => {
                            const modelStatus = getModelStatus(model);

                            return (
                                <motion.div
                                    key={model.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
                                >
                                    <div className="p-6">
                                        {/* Model Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {model.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {model.description || 'No description available'}
                                                </p>
                                            </div>
                                            <div className="ml-3 flex items-center">
                                                {getStatusIcon(modelStatus.status)}
                                            </div>
                                        </div>

                                        {/* Model Stats */}
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {model.options?.length || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Options</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {model.rules?.length || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Rules</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {model.groups?.length || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Groups</div>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          modelStatus.color === 'green'
                              ? 'bg-green-100 text-green-800'
                              : modelStatus.color === 'yellow'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                      }`}>
                        {modelStatus.label}
                      </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditModel(model.id)}
                                                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                            >
                                                <WrenchScrewdriverIcon className="h-4 w-4" />
                                                Edit Model
                                            </button>

                                            <button
                                                onClick={() => handleTestModel(model.id)}
                                                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                                title="Test Configuration"
                                            >
                                                <CogIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Getting Started Section */}
                {Array.isArray(models) && models.length === 0 && (
                    <div className="mt-12 bg-blue-50 rounded-lg p-8">
                        <div className="text-center">
                            <BeakerIcon className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Welcome to Model Builder
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                                Create sophisticated product configuration models with rules, constraints, and pricing logic.
                                Our MTBDD-powered engine ensures fast, reliable constraint resolution for complex products.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                <div className="text-center">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <CogIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                        <h4 className="font-medium text-gray-900">Define Options</h4>
                                        <p className="text-sm text-gray-600">Create configurable product options and groups</p>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <ExclamationTriangleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                        <h4 className="font-medium text-gray-900">Add Rules</h4>
                                        <p className="text-sm text-gray-600">Set up constraints and dependencies</p>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <ChartBarIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                                        <h4 className="font-medium text-gray-900">Test & Deploy</h4>
                                        <p className="text-sm text-gray-600">Validate and make available for configuration</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Model Modal */}
            <CreateModelModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleModelCreated}
            />
        </ErrorBoundary>
    );
};

export default ModelSelection;