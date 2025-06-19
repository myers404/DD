// frontend/src/pages/ConfigurationsList.jsx
// Read-only list of configurations created by users

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RectangleStackIcon,
    UserIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    CurrencyDollarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowLeftIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { cpqApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ConfigurationsList = () => {
    const { modelId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [expandedConfig, setExpandedConfig] = useState(null);

    // Fetch model details
    const { data: model } = useQuery({
        queryKey: ['model', modelId],
        queryFn: () => cpqApi.getModel(modelId),
        enabled: !!modelId
    });

    // Fetch configurations for this model
    const { data: configurationsResponse, isLoading, error } = useQuery({
        queryKey: ['session-configurations', modelId, { status: statusFilter, sort: sortBy, order: sortOrder }],
        queryFn: async () => {
            console.log('Fetching session configurations for model:', modelId, {
                status: statusFilter,
                sort_by: sortBy,
                sort_order: sortOrder
            });
            
            const response = await cpqApi.getSessionConfigurations(modelId, {
                status: statusFilter !== 'all' ? statusFilter : undefined,
                sort_by: sortBy,
                sort_order: sortOrder
            });
            
            console.log('Session configurations response:', response);
            return response;
        },
        enabled: !!modelId,
        refetchInterval: 30000 // Refresh every 30 seconds
    });
    
    // Extract configurations array from response
    // Debug log to see the structure
    console.log('configurationsResponse structure:', configurationsResponse);
    
    // Handle different response structures
    let configurations = [];
    if (configurationsResponse) {
        // If it's already an array, use it directly
        if (Array.isArray(configurationsResponse)) {
            configurations = configurationsResponse;
        }
        // If it has a configurations property, use that
        else if (configurationsResponse.configurations) {
            configurations = configurationsResponse.configurations;
        }
        // If it has data.configurations, use that
        else if (configurationsResponse.data?.configurations) {
            configurations = configurationsResponse.data.configurations;
        }
    }
    
    console.log('Extracted configurations:', configurations, 'Count:', configurations.length);

    // Filter configurations based on search
    const filteredConfigurations = configurations?.filter(config => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            config.id?.toLowerCase().includes(search) ||
            config.user_id?.toLowerCase().includes(search) ||
            config.user_email?.toLowerCase().includes(search) ||
            config.name?.toLowerCase().includes(search)
        );
    });

    // Calculate stats
    const stats = {
        total: configurations?.length || 0,
        complete: configurations?.filter(c => c.status === 'complete' || c.session_status === 'completed').length || 0,
        incomplete: configurations?.filter(c => c.status === 'incomplete' || c.session_status === 'draft').length || 0,
        valid: configurations?.filter(c => c.is_valid).length || 0
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        if (typeof price !== 'number') return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const getStatusBadge = (config) => {
        if (config.status === 'complete' && config.is_valid) {
            return (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Complete
        </span>
            );
        } else if (config.status === 'complete' && !config.is_valid) {
            return (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Invalid
        </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          <ClockIcon className="w-3 h-3 mr-1" />
          In Progress
        </span>
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="large" message="Loading configurations..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Failed to load configurations</h3>
                <p className="mt-1 text-sm text-gray-500">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        to="/models"
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Back to Models
                    </Link>
                </div>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <RectangleStackIcon className="h-8 w-8 text-blue-600" />
                            Configurations for {model?.name}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            View all configurations created by users for this model
                        </p>
                    </div>
                    <Link
                        to={`/models/${modelId}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Edit Model
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-500">Total Configurations</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
                    <div className="text-sm text-gray-500">Complete</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-yellow-600">{stats.incomplete}</div>
                    <div className="text-sm text-gray-500">In Progress</div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">{stats.valid}</div>
                    <div className="text-sm text-gray-500">Valid</div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg border mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by ID, user, or name..."
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="complete">Complete</option>
                            <option value="incomplete">In Progress</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="createdAt">Created Date</option>
                            <option value="updatedAt">Updated Date</option>
                            <option value="total_price">Price</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Configurations List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredConfigurations?.map((config) => (
                        <motion.div
                            key={config.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-lg border hover:shadow-md transition-shadow"
                        >
                            <div
                                className="p-6 cursor-pointer"
                                onClick={() => setExpandedConfig(expandedConfig === config.id ? null : config.id)}
                            >
                                <div className="flex justify-between items-start">
                                    {/* Left side - Config info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {config.name || `Configuration ${config.id}`}
                                            </h3>
                                            {getStatusBadge(config)}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <UserIcon className="h-4 w-4 mr-2" />
                                                {config.user_email || config.user_id || 'Anonymous'}
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <ClockIcon className="h-4 w-4 mr-2" />
                                                {formatDate(config.created_at || config.createdAt)}
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                                                {formatPrice(config.total_price)}
                                            </div>
                                        </div>

                                        {config.selections && (
                                            <div className="mt-2 text-sm text-gray-500">
                                                {Object.keys(config.selections).length} options selected
                                            </div>
                                        )}
                                    </div>

                                    {/* Right side - Expand icon */}
                                    <div className="ml-4">
                                        <ChevronRightIcon
                                            className={`h-5 w-5 text-gray-400 transform transition-transform ${
                                                expandedConfig === config.id ? 'rotate-90' : ''
                                            }`}
                                        />
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedConfig === config.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-4 pt-4 border-t overflow-hidden"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Configuration Details */}
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-2">Configuration Details</h4>
                                                    <dl className="space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <dt className="text-gray-500">Configuration ID:</dt>
                                                            <dd className="font-mono text-gray-900">{config.id}</dd>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <dt className="text-gray-500">Last Updated:</dt>
                                                            <dd className="text-gray-900">{formatDate(config.updated_at || config.updatedAt)}</dd>
                                                        </div>
                                                        {config.metadata && (
                                                            <>
                                                                {Object.entries(config.metadata).map(([key, value]) => (
                                                                    <div key={key} className="flex justify-between">
                                                                        <dt className="text-gray-500">{key}:</dt>
                                                                        <dd className="text-gray-900">{value}</dd>
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )}
                                                    </dl>
                                                </div>

                                                {/* Selected Options */}
                                                {config.selections && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 mb-2">Selected Options</h4>
                                                        <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
                                                            {Object.entries(config.selections).map(([optionId, quantity]) => {
                                                                const option = model?.options?.find(o => o.id === optionId);
                                                                return (
                                                                    <div key={optionId} className="flex justify-between">
                                    <span className="text-gray-700">
                                      {option?.name || optionId}
                                    </span>
                                                                        <span className="text-gray-900">
                                      {quantity > 1 ? `${quantity}x` : '✓'}
                                    </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Validation Issues */}
                                                {config.validation_errors && config.validation_errors.length > 0 && (
                                                    <div className="md:col-span-2">
                                                        <h4 className="font-medium text-red-800 mb-2">Validation Issues</h4>
                                                        <ul className="space-y-1 text-sm text-red-600">
                                                            {config.validation_errors.map((error, idx) => (
                                                                <li key={idx} className="flex items-start">
                                                                    <ExclamationTriangleIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                                                    {error}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {(!filteredConfigurations || filteredConfigurations.length === 0) && (
                <div className="text-center py-12 bg-white rounded-lg border">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No configurations found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'No users have created configurations for this model yet'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ConfigurationsList;