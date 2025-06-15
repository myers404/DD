// frontend/src/components/configurator/PricingSummary.jsx
// Pricing calculation and breakdown display - fully functional implementation

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CurrencyDollarIcon,
  CalculatorIcon,
  TagIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PrinterIcon,
  ShareIcon,
  DocumentTextIcon,
  SparklesIcon,
  PercentBadgeIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

const PricingSummary = ({ 
  model, 
  configuration, 
  selections = [], 
  pricingResults, 
  onRecalculate, 
  isPricing = false 
}) => {
  // Local state
  const [expandedSections, setExpandedSections] = useState(new Set(['summary', 'breakdown']));
  const [showVolumeDiscounts, setShowVolumeDiscounts] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Toggle section expansion
  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Process pricing data
  const pricingData = useMemo(() => {
    if (!pricingResults) {
      return {
        basePrice: 0,
        adjustments: [],
        totalPrice: 0,
        savings: 0,
        hasDiscounts: false,
        hasUpcharges: false,
        itemizedPricing: [],
        volumeDiscounts: [],
        effectiveDiscountRate: 0
      };
    }

    const basePrice = pricingResults.base_price || 0;
    const adjustments = pricingResults.adjustments || [];
    const totalPrice = pricingResults.total_price || basePrice;
    
    const discounts = adjustments.filter(adj => adj.amount < 0);
    const upcharges = adjustments.filter(adj => adj.amount > 0);
    const totalAdjustments = adjustments.reduce((sum, adj) => sum + adj.amount, 0);
    const savings = Math.abs(discounts.reduce((sum, disc) => sum + disc.amount, 0));
    
    // Calculate itemized pricing from selections
    const itemizedPricing = selections.map(selection => {
      const option = model?.groups
        ?.flatMap(g => g.options || [])
        ?.find(opt => opt.id === selection.option_id);
      
      if (!option) return null;
      
      const unitPrice = option.base_price || 0;
      const quantity = selection.quantity || 1;
      const lineTotal = unitPrice * quantity;
      
      return {
        optionId: selection.option_id,
        optionName: option.name,
        unitPrice,
        quantity,
        lineTotal,
        sku: option.sku,
        category: option.category
      };
    }).filter(Boolean);

    // Calculate effective discount rate
    const effectiveDiscountRate = basePrice > 0 ? (savings / basePrice) * 100 : 0;

    return {
      basePrice,
      adjustments,
      totalPrice,
      savings,
      hasDiscounts: discounts.length > 0,
      hasUpcharges: upcharges.length > 0,
      itemizedPricing,
      volumeDiscounts: pricingResults.volume_discounts || [],
      effectiveDiscountRate,
      totalAdjustments
    };
  }, [pricingResults, selections, model]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get adjustment icon
  const getAdjustmentIcon = (amount) => {
    if (amount > 0) return ArrowTrendingUpIcon;
    if (amount < 0) return ArrowTrendingDownIcon;
    return TagIcon;
  };

  // Get adjustment color classes
  const getAdjustmentColors = (amount) => {
    if (amount > 0) {
      return {
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      };
    }
    if (amount < 0) {
      return {
        text: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200'
      };
    }
    return {
      text: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200'
    };
  };

  // Render pricing summary card
  const renderPricingSummary = () => (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
          Pricing Summary
        </h3>
        
        {pricingData.savings > 0 && (
          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            <SparklesIcon className="h-4 w-4" />
            You Save {formatCurrency(pricingData.savings)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Base Price */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Base Price</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(pricingData.basePrice)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {selections.length} item{selections.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Adjustments */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">
            {pricingData.totalAdjustments >= 0 ? 'Surcharges' : 'Discounts'}
          </p>
          <p className={`text-2xl font-bold ${
            pricingData.totalAdjustments >= 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {pricingData.totalAdjustments >= 0 ? '+' : ''}{formatCurrency(pricingData.totalAdjustments)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {pricingData.adjustments.length} adjustment{pricingData.adjustments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Total Price */}
        <div className="text-center bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Total Price</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(pricingData.totalPrice)}
          </p>
          {pricingData.effectiveDiscountRate > 0 && (
            <p className="text-xs text-green-600 mt-1">
              {pricingData.effectiveDiscountRate.toFixed(1)}% off
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {(pricingData.hasDiscounts || pricingData.hasUpcharges) && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center justify-center gap-6 text-sm">
            {pricingData.hasDiscounts && (
              <div className="flex items-center gap-1 text-green-600">
                <ArrowTrendingDownIcon className="h-4 w-4" />
                {pricingData.adjustments.filter(adj => adj.amount < 0).length} Discount{pricingData.adjustments.filter(adj => adj.amount < 0).length !== 1 ? 's' : ''}
              </div>
            )}
            {pricingData.hasUpcharges && (
              <div className="flex items-center gap-1 text-red-600">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                {pricingData.adjustments.filter(adj => adj.amount > 0).length} Surcharge{pricingData.adjustments.filter(adj => adj.amount > 0).length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Render itemized breakdown
  const renderItemizedBreakdown = () => (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div
        className="px-6 py-4 cursor-pointer border-b border-gray-200"
        onClick={() => toggleSection('breakdown')}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-gray-600" />
            Itemized Breakdown
          </h3>
          {expandedSections.has('breakdown') ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expandedSections.has('breakdown') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {pricingData.itemizedPricing.length > 0 ? (
                <div className="space-y-3">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 border-b border-gray-200 pb-2">
                    <div className="col-span-5">Item</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-3 text-right">Line Total</div>
                  </div>

                  {/* Items */}
                  {pricingData.itemizedPricing.map((item, index) => (
                    <motion.div
                      key={item.optionId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-12 gap-4 text-sm py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="col-span-5">
                        <div className="font-medium text-gray-900">{item.optionName}</div>
                        {item.sku && (
                          <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                        )}
                      </div>
                      <div className="col-span-2 text-center text-gray-600">
                        {item.quantity}
                      </div>
                      <div className="col-span-2 text-right text-gray-600">
                        {formatCurrency(item.unitPrice)}
                      </div>
                      <div className="col-span-3 text-right font-medium text-gray-900">
                        {formatCurrency(item.lineTotal)}
                      </div>
                    </motion.div>
                  ))}

                  {/* Subtotal */}
                  <div className="grid grid-cols-12 gap-4 text-sm pt-3 border-t border-gray-200">
                    <div className="col-span-9 text-right font-medium text-gray-700">
                      Subtotal:
                    </div>
                    <div className="col-span-3 text-right font-semibold text-gray-900">
                      {formatCurrency(pricingData.basePrice)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TagIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No items selected for pricing breakdown</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Render price adjustments
  const renderPriceAdjustments = () => {
    if (pricingData.adjustments.length === 0) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div
          className="px-6 py-4 cursor-pointer border-b border-gray-200"
          onClick={() => toggleSection('adjustments')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PercentBadgeIcon className="h-5 w-5 text-gray-600" />
              Price Adjustments ({pricingData.adjustments.length})
            </h3>
            {expandedSections.has('adjustments') ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {expandedSections.has('adjustments') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-3">
                {pricingData.adjustments.map((adjustment, index) => {
                  const Icon = getAdjustmentIcon(adjustment.amount);
                  const colors = getAdjustmentColors(adjustment.amount);

                  return (
                    <motion.div
                      key={adjustment.rule_name || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-4 rounded-lg border ${colors.border} ${colors.bg}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${colors.text}`} />
                        <div>
                          <div className="font-medium text-gray-900">
                            {adjustment.rule_name || 'Price Adjustment'}
                          </div>
                          {adjustment.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {adjustment.description}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-semibold ${colors.text}`}>
                          {adjustment.amount >= 0 ? '+' : ''}{formatCurrency(adjustment.amount)}
                        </div>
                        {adjustment.percentage && (
                          <div className="text-xs text-gray-500">
                            {adjustment.percentage}%
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render volume discounts
  const renderVolumeDiscounts = () => {
    if (pricingData.volumeDiscounts.length === 0) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-blue-900 flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4" />
            Volume Discounts Available
          </h4>
          <button
            onClick={() => setShowVolumeDiscounts(!showVolumeDiscounts)}
            className="text-blue-600 text-sm hover:text-blue-700"
          >
            {showVolumeDiscounts ? 'Hide' : 'Show'} Details
          </button>
        </div>

        <AnimatePresence>
          {showVolumeDiscounts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="space-y-2">
                {pricingData.volumeDiscounts.map((tier, index) => (
                  <div key={tier.id || index} className="bg-white rounded border border-blue-200 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{tier.name}</div>
                        <div className="text-sm text-gray-600">
                          {tier.min_quantity}+ items
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {((1 - tier.multiplier) * 100).toFixed(0)}% off
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(pricingData.basePrice * tier.multiplier)} total
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Loading and empty states
  if (isPricing) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Calculating Pricing...</h2>
          <p className="text-gray-600">Processing your configuration and applying pricing rules</p>
        </div>
      </div>
    );
  }

  if (!pricingResults && selections.length === 0) {
    return (
      <div className="text-center py-12">
        <CurrencyDollarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Pricing Data</h2>
        <p className="text-gray-600 mb-4">
          Add some options to your configuration to see pricing information
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pricing Review</h2>
          <p className="text-gray-600 mt-1">
            Review your configuration pricing and adjustments
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Recalculate Button */}
          <button
            onClick={onRecalculate}
            disabled={isPricing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <CalculatorIcon className="w-4 h-4" />
            Recalculate
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
              <PrinterIcon className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      {renderPricingSummary()}

      {/* Itemized Breakdown */}
      {renderItemizedBreakdown()}

      {/* Price Adjustments */}
      {renderPriceAdjustments()}

      {/* Volume Discounts */}
      {renderVolumeDiscounts()}

      {/* Pricing Notes */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <InformationCircleIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Pricing Information:</p>
            <ul className="space-y-1 text-xs">
              <li>• Prices shown are in USD and include applicable discounts</li>
              <li>• Volume discounts are automatically applied based on quantity</li>
              <li>• Final pricing may vary based on customer-specific agreements</li>
              <li>• Tax and shipping charges not included</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSummary;