<!-- web/src/lib/components/PricingDisplay.svelte -->
<!-- Simplified pricing display matching ConstraintTester style -->
<script>
  import LoadingSpinner from './LoadingSpinner.svelte';

  let {
    pricing = null,
    isCalculating = false,
    selections = {},
    options = []
  } = $props();

  // Get selected options with details
  let selectedOptions = $derived((() => {
    if (!Array.isArray(options)) return [];

    return Object.entries(selections || {})
            .filter(([_, selected]) => selected > 0)
            .map(([optionId]) => options.find(o => o.id === optionId))
            .filter(Boolean);
  })());

  // Calculate totals
  let baseTotal = $derived(
          selectedOptions?.reduce((sum, opt) => sum + (opt.price || opt.base_price || 0), 0) || 0
  );

  let finalTotal = $derived(pricing?.total || pricing?.breakdown?.total_price || baseTotal);
</script>

<div class="pricing-display">
  {#if isCalculating}
    <div class="calculating">
      <LoadingSpinner size="small" />
      <span>Calculating price...</span>
    </div>
  {:else if selectedOptions.length === 0}
    <div class="empty-pricing">
      <p>No options selected</p>
    </div>
  {:else}
    <!-- Selected Items -->
    <div class="selected-items">
      <h4 class="section-label">Selected Options:</h4>
      {#each selectedOptions as option (option.id)}
        <div class="price-item">
          <span class="item-name">{option.name}</span>
          <span class="item-price">
            ${(option.price || option.base_price || 0).toFixed(2)}
          </span>
        </div>
      {/each}
    </div>

    <!-- Discounts if any -->
    {#if pricing?.breakdown?.adjustments && pricing.breakdown.adjustments.length > 0}
      <div class="discounts-section">
        <h4 class="section-label">Discounts Applied:</h4>
        {#each pricing.breakdown.adjustments as adjustment}
          {#if adjustment.amount < 0}
            <div class="discount-item">
              <span class="discount-name">{adjustment.description || adjustment.rule_name}</span>
              <span class="discount-amount">-${Math.abs(adjustment.amount).toFixed(2)}</span>
            </div>
          {/if}
        {/each}
      </div>
    {/if}

    <!-- Total -->
    <div class="total-section">
      <span class="total-label">Total Price:</span>
      <span class="total-amount">${finalTotal.toFixed(2)}</span>
    </div>
  {/if}
</div>

<style>
  .pricing-display {
    padding: 16px 0;
  }

  .calculating {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    padding: 24px;
    color: #6b7280;
    font-size: 14px;
  }

  .empty-pricing {
    text-align: center;
    padding: 24px;
    color: #9ca3af;
    font-size: 14px;
  }

  .section-label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin: 16px 0 8px 0;
  }

  .selected-items {
    margin-bottom: 16px;
  }

  .price-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 14px;
    color: #4b5563;
  }

  .item-name {
    flex: 1;
  }

  .item-price {
    font-weight: 500;
    color: #111827;
  }

  .discounts-section {
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    margin-bottom: 16px;
  }

  .discount-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 14px;
  }

  .discount-name {
    color: #059669;
  }

  .discount-amount {
    font-weight: 500;
    color: #059669;
  }

  .total-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-top: 2px solid #e5e7eb;
    margin-top: 16px;
  }

  .total-label {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }

  .total-amount {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
  }
</style>