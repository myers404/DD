import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  TrashIcon,
  PencilIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const ConfigurationSummary = ({
  model,
  selections = [],
  validation = { isValid: true, violations: [] },
  onRemoveSelection,
  onEditSelection,
  onShare,
  onDuplicate,
  onSave,
  showActions = true,
  showMetadata = true,
  isCompact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!isCompact);

  // Group selections by category/group
  const groupedSelections = useMemo(() => {
    if (!selections.length || !model?.groups) return [];

    const groups = model.groups.map(group => {
      const groupSelections = selections.filter(selection =>
        group.options?.some(option => option.id === selection.optionId)
      );

      const groupOptions = groupSelections.map(selection => {
        const option = group.options.find(opt => opt.id === selection.optionId);
        return {
          ...selection,
          option,
          subtotal: (option?.price || 0) * selection.quantity,
        };
      });

      return {
        ...group,
        selections: groupOptions,
        total: groupOptions.reduce((sum, opt) => sum + opt.subtotal, 0),
        count: groupOptions.reduce((sum, opt) => sum + opt.quantity, 0),
      };
    }).filter(group => group.selections.length > 0);

    return groups;
  }, [selections, model]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = groupedSelections.reduce((sum, group) => sum + group.total, 0);
    const itemCount = groupedSelections.reduce((sum, group) => sum + group.count, 0);
    const groupCount = groupedSelections.length;

    return { subtotal, itemCount, groupCount };
  }, [groupedSelections]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClipboardDocumentListIcon className="h-5 w-5 text-gray-500 mr-2" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Configuration Summary
              </h3>
              {model && (
                <p className="text-xs text-gray-600">{model.name}</p>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center">
            {validation.isValid ? (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Valid</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">
                  {validation.violations?.length || 0} Issues
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {totals.itemCount}
            </div>
            <div className="text-xs text-gray-500">Items</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {totals.groupCount}
            </div>
            <div className="text-xs text-gray-500">Groups</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(totals.subtotal)}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* No Selections State */}
        {selections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No items selected</p>
            <p className="text-xs mt-1">Start configuring your product</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selections by Group */}
            {groupedSelections.map((group, groupIndex) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="border border-gray-100 rounded-lg p-3"
              >
                {/* Group Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {group.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {group.count} item{group.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(group.total)}
                  </div>
                </div>

                {/* Group Selections */}
                <div className="space-y-2">
                  {group.selections.map((selection, selectionIndex) => (
                    <motion.div
                      key={selection.optionId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (groupIndex * group.selections.length + selectionIndex) * 0.05 }}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {selection.option?.name || 'Unknown Option'}
                            </p>
                            {selection.option?.sku && (
                              <p className="text-xs text-gray-500">
                                SKU: {selection.option.sku}
                              </p>
                            )}
                          </div>
                          
                          {selection.quantity > 1 && (
                            <div className="ml-2 text-xs text-gray-600">
                              × {selection.quantity}
                            </div>
                          )}
                        </div>

                        {/* Option Details */}
                        {selection.option?.description && !isCompact && (
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {selection.option.description}
                          </p>
                        )}
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center ml-3">
                        <div className="text-right mr-2">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(selection.subtotal)}
                          </div>
                          {selection.quantity > 1 && (
                            <div className="text-xs text-gray-500">
                              {formatCurrency(selection.option?.price || 0)} each
                            </div>
                          )}
                        </div>

                        {/* Selection Actions */}
                        {showActions && (
                          <div className="flex items-center space-x-1">
                            {onEditSelection && (
                              <button
                                onClick={() => onEditSelection(selection)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit selection"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </button>
                            )}
                            
                            {onRemoveSelection && (
                              <button
                                onClick={() => onRemoveSelection(selection.optionId)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Remove selection"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Configuration Metadata */}
            {showMetadata && !isCompact && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <TagIcon className="h-3 w-3 mr-1" />
                    <span>Version: 1.0</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions Footer */}
      {showActions && selections.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Primary Actions */}
            <button
              onClick={onSave}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
              Save Config
            </button>

            <button
              onClick={onShare}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ShareIcon className="h-4 w-4 mr-1" />
              Share
            </button>
          </div>

          {/* Secondary Actions */}
          {(onDuplicate || validation.violations?.length > 0) && (
            <div className="mt-2 space-y-2">
              {onDuplicate && (
                <button
                  onClick={onDuplicate}
                  className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <DocumentDuplicateIcon className="h-3 w-3 mr-1" />
                  Duplicate Configuration
                </button>
              )}

              {validation.violations?.length > 0 && (
                <div className="text-xs text-red-600 text-center">
                  <ExclamationTriangleIcon className="h-3 w-3 inline mr-1" />
                  Resolve {validation.violations.length} validation issue{validation.violations.length !== 1 ? 's' : ''} before saving
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigurationSummary;
