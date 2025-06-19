// frontend/src/pages/ModelSelection.jsx
// Model management page for admins

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusIcon,
    CubeIcon,
    PencilIcon,
    TrashIcon,
    BeakerIcon,
    CogIcon,
    ClockIcon,
    RectangleStackIcon,
    WrenchScrewdriverIcon,
    DocumentDuplicateIcon,
    ExclamationTriangleIcon,
    ChevronRightIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { cpqApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

const ModelSelection = () => {
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        version: '1.0.0'
    });

    // Fetch models
    const { data: modelsResponse, isLoading, error } = useQuery({
        queryKey: ['models'],
        queryFn: cpqApi.getModels,
        staleTime: 30 * 1000, // 30 seconds
        retry: 1,
        onSuccess: (data) => {
            console.log('Models data received:', data);
        },
        onError: (error) => {
            console.error('Models query error:', error);
        }
    });

    // Safely extract models array with proper debugging
    const models = React.useMemo(() => {
        console.log('Processing models response:', modelsResponse);

        if (!modelsResponse) {
            console.log('No response data');
            return [];
        }

        // Handle the actual API structure: response.data.models
        if (modelsResponse.data && Array.isArray(modelsResponse.data.models)) {
            console.log('Found models in response.data.models, length:', modelsResponse.data.models.length);
            return modelsResponse.data.models;
        }

        // Fallback: response is direct array
        if (Array.isArray(modelsResponse)) {
            console.log('Response is direct array, length:', modelsResponse.length);
            return modelsResponse;
        }

        // Fallback: response.data is array
        if (modelsResponse.data && Array.isArray(modelsResponse.data)) {
            console.log('Found array in response.data, length:', modelsResponse.data.length);
            return modelsResponse.data;
        }

        console.error('Unexpected response structure, returning empty array');
        return [];
    }, [modelsResponse]);

    // Create model mutation
    const createMutation = useMutation({
        mutationFn: cpqApi.createModel,
        onSuccess: () => {
            queryClient.invalidateQueries(['models']);
            toast.success('Model created successfully');
            setShowCreateModal(false);
            resetForm();
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to create model');
        }
    });

    // Delete model mutation
    const deleteMutation = useMutation({
        mutationFn: cpqApi.deleteModel,
        onSuccess: () => {
            queryClient.invalidateQueries(['models']);
            toast.success('Model deleted successfully');
            setShowDeleteModal(false);
            setSelectedModel(null);
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to delete model');
        }
    });

    // Clone model mutation
    const cloneMutation = useMutation({
        mutationFn: cpqApi.cloneModel,
        onSuccess: () => {
            queryClient.invalidateQueries(['models']);
            toast.success('Model cloned successfully');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to clone model');
        }
    });

    // Update model mutation
    const updateMutation = useMutation({
        mutationFn: ({ modelId, modelData }) => cpqApi.updateModel(modelId, modelData),
        onSuccess: () => {
            queryClient.invalidateQueries(['models']);
            toast.success('Model updated successfully');
            setShowEditModal(false);
            setSelectedModel(null);
            resetForm();
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update model');
        }
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            version: '1.0.0'
        });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Model name is required');
            return;
        }

        createMutation.mutate(formData);
    };

    const handleDeleteConfirm = () => {
        if (selectedModel) {
            deleteMutation.mutate(selectedModel.id);
        }
    };

    const handleCloneModel = (model) => {
        cloneMutation.mutate(model.id);
    };

    const handleEditModel = (model) => {
        setSelectedModel(model);
        setFormData({
            name: model.name || '',
            description: model.description || '',
            version: model.version || '1.0.0'
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Model name is required');
            return;
        }

        updateMutation.mutate({
            modelId: selectedModel.id,
            modelData: formData
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';

        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            console.error('Date formatting error:', e, 'for date:', dateString);
            return 'Invalid Date';
        }
    };

    const getModelStatus = (model) => {
        if (!model) return { label: 'Unknown', color: 'gray' };

        const hasOptions = model.options && Array.isArray(model.options) && model.options.length > 0;
        const hasGroups = model.groups && Array.isArray(model.groups) && model.groups.length > 0;
        const hasRules = model.rules && Array.isArray(model.rules) && model.rules.length > 0;

        if (!hasOptions && !hasGroups) {
            return { label: 'Empty', color: 'red' };
        }
        if (!hasRules) {
            return { label: 'Basic', color: 'yellow' };
        }
        return { label: 'Complete', color: 'green' };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="large" message="Loading models..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load models</h3>
                <p className="mt-1 text-sm text-gray-500">{error.message}</p>
                <div className="mt-4 space-y-2">
                    <button
                        onClick={() => queryClient.invalidateQueries(['models'])}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                    <div className="text-xs text-gray-400">
                        Debug: Check browser console for details
                    </div>
                </div>
            </div>
        );
    }

    console.log('🔍 Final models array for render:', models, 'Length:', models.length);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Product Models</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Create and manage configuration models for your products
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Model
                    </button>
                </div>
            </div>

            {/* Models Grid */}
            {models.length === 0 ? (
                <div className="text-center py-12">
                    <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No models yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by creating your first product configuration model
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create First Model
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {models.map((model) => {
                            const modelStatus = getModelStatus(model);

                            return (
                                <motion.div
                                    key={model.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-lg border hover:shadow-lg transition-shadow duration-200"
                                >
                                    <div className="p-4 sm:p-6">
                                        {/* Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                                            <div className="flex items-center min-w-0">
                                                <CubeIcon className="h-8 w-8 text-blue-600 mr-3 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                                        {model.name || 'Unnamed Model'}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                                        modelStatus.color === 'green'
                                                            ? 'bg-green-100 text-green-800'
                                                            : modelStatus.color === 'yellow'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {modelStatus.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions Menu */}
                                            <div className="relative self-start">
                                                <button className="p-1 hover:bg-gray-100 rounded">
                                                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Model Description */}
                                        {model.description && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                {model.description}
                                            </p>
                                        )}

                                        {/* Model Stats */}
                                        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                                            <div className="bg-gray-50 rounded p-2">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {model.groups?.length || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Groups</div>
                                            </div>
                                            <div className="bg-gray-50 rounded p-2">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {model.options?.length || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Options</div>
                                            </div>
                                            <div className="bg-gray-50 rounded p-2">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {model.rules?.length || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Rules</div>
                                            </div>
                                        </div>

                                        {/* Timestamps - Use actual API field names */}
                                        <div className="flex items-center text-xs text-gray-500 mb-4">
                                            <ClockIcon className="h-3 w-3 mr-1" />
                                            Updated {formatDate(model.updated_at || model.created_at)}
                                        </div>

                                        {/* Actions */}
                                        <div className="grid grid-cols-3 sm:flex gap-1 sm:gap-2">
                                            <Link
                                                to={`/models/${model.id}`}
                                                className="flex sm:flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                                            >
                                                <WrenchScrewdriverIcon className="h-4 w-4 sm:mr-1" />
                                                <span className="hidden sm:inline">Build</span>
                                            </Link>
                                            <Link
                                                to={`/models/${model.id}/configurations`}
                                                className="flex items-center justify-center px-2 sm:px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                                title="View Configurations"
                                            >
                                                <RectangleStackIcon className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleEditModel(model)}
                                                className="flex items-center justify-center px-2 sm:px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                                title="Edit Model"
                                                disabled={updateMutation.isLoading}
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleCloneModel(model)}
                                                className="flex items-center justify-center px-2 sm:px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                                title="Clone Model"
                                                disabled={cloneMutation.isLoading}
                                            >
                                                <DocumentDuplicateIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedModel(model);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="flex items-center justify-center px-2 sm:px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                                title="Delete Model"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Create Model Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    resetForm();
                }}
                title="Create New Model"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Model Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter model name"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe this model..."
                        />
                    </div>

                    <div>
                        <label htmlFor="version" className="block text-sm font-medium text-gray-700">
                            Version
                        </label>
                        <input
                            type="text"
                            id="version"
                            value={formData.version}
                            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 1.0.0, 2.1.3, etc."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateModal(false);
                                resetForm();
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {createMutation.isLoading ? 'Creating...' : 'Create Model'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedModel(null);
                }}
                title="Delete Model"
            >
                <div className="space-y-4">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
                        <p className="text-sm text-gray-900">
                            Are you sure you want to delete "{selectedModel?.name}"? This action cannot be undone.
                        </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-800">
                            <strong>Warning:</strong> This will permanently delete the model and all its configurations.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setSelectedModel(null);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteConfirm}
                            disabled={deleteMutation.isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            {deleteMutation.isLoading ? 'Deleting...' : 'Delete Model'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Model Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedModel(null);
                    resetForm();
                }}
                title="Edit Model"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                            Model Name *
                        </label>
                        <input
                            type="text"
                            id="edit-name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter model name"
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="edit-description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe this model..."
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-version" className="block text-sm font-medium text-gray-700">
                            Version
                        </label>
                        <input
                            type="text"
                            id="edit-version"
                            value={formData.version}
                            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 1.0.0, 2.1.3, etc."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedModel(null);
                                resetForm();
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateMutation.isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {updateMutation.isLoading ? 'Updating...' : 'Update Model'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ModelSelection;