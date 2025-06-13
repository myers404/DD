import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  TagIcon,
  // TrendingUpIcon,
  // TrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const PricingDisplay = ({
  pricing = { totalPrice: 0, breakdown: [] },
  isValid = true,
  isLoading = false,
  showBreakdown = true,
  showVolumeDiscounts = true,
  showComparison = false,
  comparisonPrice = null,
  currency = 'USD',
  showTax = false,
  taxRate = 0.08,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  // Calculate derived values
  const subtotal = useMemo(() => {
    return pricing.breakdown?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || pricing.totalPrice || 0;
  }, [pricing]);

  const taxAmount = useMemo(() => {
    return showTax ? subtotal * taxRate : 0;
  }, [subtotal, taxRate, showTax]);

  const totalWithTax = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  const savings = useMemo(() => {
    if (!comparisonPrice || !showComparison) return 0;
    return Math.max(0, comparisonPrice - totalWithTax);
  }, [comparisonPrice, totalWithTax, showComparison]);

  const savingsPercentage = useMemo(() => {
    if (!savings || !comparisonPrice) return 0;
    return (savings / comparisonPrice) * 100;
  }, [savings, comparisonPrice]);

  // Format currency
  const formatCurrency = (amount, options = {}) => {
    const { showSymbol = true, showDecimals = true } = options;
    
    if (amount === 0) return showSymbol ? '$0' : '0';
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount);
    
    return formatted;
  };

  // Group breakdown items by category
  const groupedBreakdown = useMemo(() => {
    if (!pricing.breakdown) return [];
    
    const groups = pricing.breakdown.reduce((acc, item) => {
      const category = item.category || 'Configuration';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
    
    return Object.entries(groups).map(([category, items]) => ({
      category,
      items,
      total: items.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
    }));
  }, [pricing.breakdown]);

  // Volume discount tiers (demo data)
  const volumeDiscounts = useMemo(() => {
    if (!showVolumeDiscounts) return [];
    
    return [
      { quantity: 1, discount: 0, label: 'Single Unit' },
      { quantity: 5, discount: 0.05, label: '5+ Units' },
      { quantity: 10, discount: 0.10, label: '10+ Units' },
      { quantity: 25, discount: 0.15, label: '25+ Units' },
    ];
  }, [showVolumeDiscounts]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center">
            {isValid ? (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Valid</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Invalid</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Pricing */}
      <div className="p-6">
        {/* Total Price */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-32 mx-auto rounded" />
            ) : (
              formatCurrency(totalWithTax)
            )}
          </div>
          
          {showTax && taxAmount > 0 && (
            <p className="text-sm text-gray-600">
              Includes {formatCurrency(taxAmount)} tax ({(taxRate * 100).toFixed(1)}%)
            </p>
          )}

          {/* Comparison and Savings */}
          {showComparison && comparisonPrice && !isLoading && (
            <div className="mt-3 space-y-1">
              <div className="text-sm text-gray-500 line-through">
                Was: {formatCurrency(comparisonPrice)}
              </div>
              {savings > 0 && (
                <div className="flex items-center justify-center text-green-600">
                  <span className="text-sm font-medium">
                    Save {formatCurrency(savings)} ({savingsPercentage.toFixed(0)}% off)
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Volume Discounts */}
        {showVolumeDiscounts && volumeDiscounts.length > 0 && !isLoading && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <TagIcon className="h-4 w-4 mr-1" />
              Volume Discounts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {volumeDiscounts.map((tier, index) => {
                const discountedPrice = totalWithTax * (1 - tier.discount);
                const isSelected = selectedTier === index;
                
                return (
                  <button
                    key={tier.quantity}
                    onClick={() => setSelectedTier(isSelected ? null : index)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {tier.label}
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(discountedPrice)}
                    </div>
                    {tier.discount > 0 && (
                      <div className="text-xs text-green-600">
                        {(tier.discount * 100).toFixed(0)}% off
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Breakdown Toggle */}
        {showBreakdown && pricing.breakdown && pricing.breakdown.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span>Price Breakdown</span>
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4 overflow-hidden"
                >
                  {groupedBreakdown.map((group, groupIndex) => (
                    <div key={group.category} className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-1">
                        {group.category}
                      </h5>
                      
                      {group.items.map((item, itemIndex) => (
                        <motion.div
                          key={`${item.id || itemIndex}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (groupIndex * group.items.length + itemIndex) * 0.05 }}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {item.name}
                            </div>
                            {item.description && (
                              <div className="text-gray-600 text-xs mt-1">
                                {item.description}
                              </div>
                            )}
                            {item.quantity && item.quantity > 1 && (
                              <div className="text-gray-500 text-xs">
                                Qty: {item.quantity} × {formatCurrency(item.unitPrice || 0)}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right ml-4">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(item.totalPrice || 0)}
                            </div>
                            {item.discount && item.discount > 0 && (
                              <div className="text-xs text-green-600">
                                -{(item.discount * 100).toFixed(0)}% discount
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Group Subtotal */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
                        <span className="font-medium text-gray-700">
                          {group.category} Subtotal:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(group.total)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Totals Summary */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    
                    {showTax && taxAmount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Tax ({(taxRate * 100).toFixed(1)}%):
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(taxAmount)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-base font-semibold text-gray-900 border-t border-gray-200 pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(totalWithTax)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {(!pricing.breakdown || pricing.breakdown.length === 0) && subtotal === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No selections made yet</p>
            <p className="text-xs mt-1">Add options to see pricing</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        )}

        {/* Invalid Configuration Warning */}
        {!isValid && !isLoading && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Invalid Configuration
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Please resolve constraint violations before proceeding.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingDisplay;
