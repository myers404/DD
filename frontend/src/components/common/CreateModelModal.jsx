import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    XMarkIcon,
    DocumentTextIcon,
    CogIcon,
} from '@heroicons/react/24/outline';

// API Functions
import { cpqApi } from '../../services/api';

const CreateModelModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        version: '1.0.0'
    });
    const [isCreating, setIsCreating] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Model name is required';
        }

        if (!formData.id.trim()) {
            newErrors.id = 'Model ID is required';
        } else if (!/^[a-z0-9-_]+$/.test(formData.id)) {
            newErrors.id = 'Model ID can only contain lowercase letters, numbers, hyphens, and underscores';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateIdFromName = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            // Auto-generate ID from name if ID is empty or was auto-generated
            id: prev.id === generateIdFromName(prev.name) || !prev.id
                ? generateIdFromName(name)
                : prev.id
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsCreating(true);

        try {
            // Create the model in the backend
            const newModel = await cpqApi.createModel({
                id: formData.id.trim(),
                name: formData.name.trim(),
                description: formData.description.trim(),
                version: formData.version,
                options: [],
                groups: [],
                rules: [],
                price_rules: []
            });

            // Handle response structure - backend might return { success: true, data: model }
            const modelData = newModel.data || newModel;

            toast.success('Model created successfully!');

            // Call the success callback with the new model
            if (onSuccess) {
                onSuccess(modelData);
            }

            // Reset form and close modal
            setFormData({ id: '', name: '', description: '', version: '1.0.0' });
            setErrors({});
            onClose();

        } catch (error) {
            console.error('Create model error:', error);

            // Handle specific API errors
            if (error.status === 400 && error.details) {
                setErrors({ id: 'Model ID already exists' });
            } else if (error.code === 'VALIDATION_ERROR' && error.fields) {
                setErrors(error.fields);
            } else {
                toast.error(`Failed to create model: ${error.message}`);
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        if (!isCreating) {
            setFormData({ id: '', name: '', description: '', version: '1.0.0' });
            setErrors({});
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <CogIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Create New Model</h3>
                            <p className="text-sm text-gray-500">Set up a new product configuration model</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isCreating}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Model Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Model Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={handleNameChange}
                            placeholder="e.g., Business Laptop Configuration"
                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                                errors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={isCreating}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Model ID */}
                    <div>
                        <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                            Model ID *
                        </label>
                        <input
                            type="text"
                            id="id"
                            value={formData.id}
                            onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                            placeholder="e.g., business-laptop"
                            className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                                errors.id ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={isCreating}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Lowercase letters, numbers, hyphens, and underscores only
                        </p>
                        {errors.id && (
                            <p className="mt-1 text-sm text-red-600">{errors.id}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe what this model configures..."
                            rows={3}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            disabled={isCreating}
                        />
                    </div>

                    {/* Version */}
                    <div>
                        <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
                            Version
                        </label>
                        <input
                            type="text"
                            id="version"
                            value={formData.version}
                            onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            disabled={isCreating}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isCreating}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <DocumentTextIcon className="h-4 w-4" />
                                    Create Model
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateModelModal;