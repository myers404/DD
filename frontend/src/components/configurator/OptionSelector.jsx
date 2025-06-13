import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const OptionSelector = ({
  group,
  selections = [],
  availableOptions = [],
  onSelectionChange,
  isLoading = false,
  showPricing = true,
  allowMultiple = true,
  maxSelections = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOptions, setExpandedOptions] = useState(new Set());

  // Get current selections for this group
  const groupSelections = useMemo(() => {
    return selections.filter(sel => 
      group.options?.some(opt => opt.id === sel.optionId)
    );
  }, [selections, group.options]);

  // Filter options based on search and availability
  const filteredOptions = useMemo(() => {
    if (!group.options) return [];

    let filtered = group.options.filter(option => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          option.name.toLowerCase().includes(searchLower) ||
          option.description?.toLowerCase().includes(searchLower) ||
          option.sku?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    // Sort by availability and name
    return filtered.sort((a, b) => {
      const aAvailable = isOptionAvailable(a.id);
      const bAvailable = isOptionAvailable(b.id);
      
      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;
      
      return a.name.localeCompare(b.name);
    });
  }, [group.options, searchTerm, availableOptions]);

  // Check if option is available
  const isOptionAvailable = (optionId) => {
    if (availableOptions.length === 0) return true;
    return availableOptions.some(opt => opt.optionId === optionId && opt.available);
  };

  // Get current quantity for an option
  const getOptionQuantity = (optionId) => {
    const selection = groupSelections.find(sel => sel.optionId === optionId);
    return selection?.quantity || 0;
  };

  // Check if option is selected
  const isOptionSelected = (optionId) => {
    return getOptionQuantity(optionId) > 0;
  };

  // Handle option selection
  const handleOptionSelect = (optionId, action = 'toggle') => {
    if (isLoading) return;

    const currentQuantity = getOptionQuantity(optionId);
    let newQuantity;

    switch (action) {
      case 'toggle':
        newQuantity = currentQuantity > 0 ? 0 : 1;
        break;
      case 'increase':
        newQuantity = currentQuantity + 1;
        break;
      case 'decrease':
        newQuantity = Math.max(0, currentQuantity - 1);
        break;
      case 'set':
        newQuantity = arguments[2] || 0;
        break;
      default:
        return;
    }

    // Check max selections limit
    if (maxSelections && newQuantity > 0 && !isOptionSelected(optionId)) {
      const totalSelections = groupSelections.length;
      if (totalSelections >= maxSelections) {
        return;
      }
    }

    onSelectionChange(optionId, newQuantity, newQuantity > currentQuantity ? 'add' : 'remove');
  };

  // Toggle option details
  const toggleOptionDetails = (optionId) => {
    const newExpanded = new Set(expandedOptions);
    if (newExpanded.has(optionId)) {
      newExpanded.delete(optionId);
    } else {
      newExpanded.add(optionId);
    }
    setExpandedOptions(newExpanded);
  };

  // Get constraint info for option
  const getConstraintInfo = (optionId) => {
    const availableOption = availableOptions.find(opt => opt.optionId === optionId);
    return availableOption?.constraints || [];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Group Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
            {group.description && (
              <p className="text-sm text-gray-600 mt-1">{group.description}</p>
            )}
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span>
                {groupSelections.length} of {group.options?.length || 0} selected
              </span>
              {group.required && (
                <span className="ml-2 text-red-600 font-medium">Required</span>
              )}
              {maxSelections && (
                <span className="ml-2 text-blue-600">
                  (Max: {maxSelections})
                </span>
              )}
            </div>
          </div>
          
          {/* Selection Summary */}
          <div className="text-right">
            {groupSelections.length > 0 && showPricing && (
              <div className="text-lg font-semibold text-green-600">
                ${groupSelections.reduce((total, sel) => {
                  const option = group.options?.find(opt => opt.id === sel.optionId);
                  return total + ((option?.price || 0) * sel.quantity);
                }, 0).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        {group.options?.length > 5 && (
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={`Search ${group.name.toLowerCase()}...`}
            />
          </div>
        )}
      </div>

      {/* Options List */}
      <div className="divide-y divide-gray-100">
        <AnimatePresence>
          {filteredOptions.map((option, index) => {
            const isSelected = isOptionSelected(option.id);
            const isAvailable = isOptionAvailable(option.id);
            const quantity = getOptionQuantity(option.id);
            const constraints = getConstraintInfo(option.id);
            const isExpanded = expandedOptions.has(option.id);

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 transition-colors ${
                  !isAvailable ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
                } ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Selection Control */}
                  <div className="flex-shrink-0 pt-1">
                    {allowMultiple && isAvailable ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOptionSelect(option.id, 'decrease')}
                          disabled={quantity === 0 || isLoading}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        
                        <span className="w-8 text-center font-medium">
                          {quantity}
                        </span>
                        
                        <button
                          onClick={() => handleOptionSelect(option.id, 'increase')}
                          disabled={!isAvailable || isLoading}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOptionSelect(option.id, 'toggle')}
                        disabled={!isAvailable || isLoading}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 hover:border-blue-500'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isSelected && <CheckIcon className="h-4 w-4" />}
                      </button>
                    )}
                  </div>

                  {/* Option Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          !isAvailable ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {option.name}
                          {option.sku && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({option.sku})
                            </span>
                          )}
                        </h4>
                        
                        {option.description && (
                          <p className={`text-sm mt-1 ${
                            !isAvailable ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {option.description}
                          </p>
                        )}

                        {/* Constraints */}
                        {constraints.length > 0 && (
                          <div className="mt-2 flex items-center text-xs text-yellow-600">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                            <span>{constraints.length} constraint(s)</span>
                          </div>
                        )}

                        {/* Additional Details */}
                        {(option.specifications || option.features) && (
                          <button
                            onClick={() => toggleOptionDetails(option.id)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center"
                          >
                            <InformationCircleIcon className="h-4 w-4 mr-1" />
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </button>
                        )}
                      </div>

                      {/* Pricing */}
                      {showPricing && option.price !== undefined && (
                        <div className="text-right ml-4">
                          <div className={`text-sm font-semibold ${
                            !isAvailable ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {option.price === 0 ? 'Included' : `$${option.price.toLocaleString()}`}
                          </div>
                          {quantity > 1 && (
                            <div className="text-xs text-gray-500">
                              Total: ${(option.price * quantity).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-3 bg-gray-50 rounded-lg text-sm"
                        >
                          {option.specifications && (
                            <div className="mb-3">
                              <h5 className="font-medium text-gray-900 mb-2">Specifications</h5>
                              <dl className="grid grid-cols-2 gap-2">
                                {Object.entries(option.specifications).map(([key, value]) => (
                                  <div key={key}>
                                    <dt className="text-gray-500 capitalize">{key}:</dt>
                                    <dd className="text-gray-900 font-medium">{value}</dd>
                                  </div>
                                ))}
                              </dl>
                            </div>
                          )}

                          {option.features && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Features</h5>
                              <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {option.features.map((feature, idx) => (
                                  <li key={idx}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Availability Status */}
                    {!isAvailable && (
                      <div className="mt-2 flex items-center text-xs text-red-600">
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        <span>Not available with current selections</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* No Options Message */}
        {filteredOptions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? (
              <>
                <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No options found matching "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <InformationCircleIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No options available for this group</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default OptionSelector;
