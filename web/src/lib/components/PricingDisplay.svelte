<!-- web/src/lib/components/PricingDisplay.svelte -->
<script>
  import LoadingSpinner from './LoadingSpinner.svelte';

  let {
    pricing = null,
    isCalculating = false,
    selections = {},
    options = []
  } = $props();

  // Get selected options with details - using proper Svelte 5 $derived
  let selectedOptions = $derived((() => {
    if (!Array.isArray(options)) return [];

    return Object.entries(selections || {})
            .filter(([_, selected]) => selected > 0)
            .map(([optionId]) => options.find(o => o.id === optionId))
            .filter(Boolean);
  })());

  // Calculate totals
  let baseTotal = $derived(
          selectedOptions?.reduce((sum, d) => sum + (d.base_price || 0), 0) || 0
  );

  let totalDiscounts = $derived(
          pricing?.breakdown?.adjustments?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
  );

  let finalTotal = $derived(pricing?.breakdown?.total_price || 0);
</script>

<div class="pricing-display">
  <h3 class="pricing-title">Pricing Summary</h3>

  {#if isCalculating}
    <div class="calculating">
      <LoadingSpinner size="small" />
      <span>Calculating price...</span>
    </div>
  {:else if selectedOptions.length === 0}
    <div class="empty-pricing">
      <p>Select options to see pricing</p>
    </div>
  {:else}
    <!-- Selected Options -->
    <div class="pricing-section">
      <h4>Selected Options</h4>
      <div class="line-items">
        {#each selectedOptions as option (option.id)}
          <div class="line-item">
            <span class="item-name">{option.name}</span>
            <span class="item-price">
              ${option.base_price?.toFixed(2) || '0.00'}
            </span>
          </div>
        {/each}
      </div>
      <div class="subtotal">
        <span>Subtotal</span>
        <span>${baseTotal.toFixed(2)}</span>
      </div>
    </div>

    <!-- Discounts -->
    {#if pricing?.adjustments && pricing.adjustments.length > 0}
      <div class="pricing-section">
        <h4>Discounts</h4>
        <div class="line-items">
          {#each pricing.breakdown.adjustments as adjustment}
            <div class="line-item discount">
              <span class="item-name">{adjustment.description}</span>
              <span class="item-price">-${adjustment.amount.toFixed(2)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Total -->
    <div class="total-section">
      <div class="total-line">
        <span class="total-label">Total</span>
        <span class="total-amount">${finalTotal.toFixed(2)}</span>
      </div>
      {#if totalDiscounts > 0}
        <div class="savings">
          You save ${totalDiscounts.toFixed(2)}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .pricing-display {
    /* Container styles inherited from parent */
  }

  .pricing-title {
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: 600;
    color: #111827;
  }

  .calculating {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 20px;
    color: #6b7280;
    font-size: 14px;
  }

  .empty-pricing {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
  }

  .pricing-section {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  .pricing-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    color: #6b7280;
  }

  .line-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .line-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
  }

  .item-name {
    color: #374151;
    flex: 1;
    margin-right: 12px;
  }

  .item-price {
    font-weight: 500;
    color: #111827;
    white-space: nowrap;
  }

  .line-item.discount .item-price {
    color: #10b981;
  }

  .subtotal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f3f4f6;
    font-weight: 500;
  }

  .total-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
  }

  .total-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .total-label {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }

  .total-amount {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
  }

  .savings {
    margin-top: 8px;
    font-size: 14px;
    color: #10b981;
    text-align: right;
  }
</style>