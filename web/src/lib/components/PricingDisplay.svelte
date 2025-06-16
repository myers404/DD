<!-- web/src/lib/components/PricingDisplay.svelte -->
<script>
  import { configStore } from '../stores/configuration.svelte.js';
  import { formatCurrency } from '../utils/format.js';

  let { detailed = true } = $props();

  let showBreakdown = $state(detailed);
  let showVolumeDetails = $state(false);

  // Calculate pricing breakdown
  let breakdown = $derived(() => {
    if (!configStore.pricingData) return null;

    const data = configStore.pricingData;
    const items = [];

    // Selected options
    configStore.selectedOptions.forEach(option => {
      items.push({
        type: 'option',
        name: option.name,
        quantity: option.quantity,
        unitPrice: option.base_price,
        total: option.base_price * option.quantity,
        group: option.group_name
      });
    });

    // Adjustments
    if (data.adjustments) {
      data.adjustments.forEach(adj => {
        items.push({
          type: 'adjustment',
          name: adj.description || adj.type,
          reason: adj.reason,
          amount: adj.amount,
          percentage: adj.percentage
        });
      });
    }

    return items;
  });

  // Volume discount details
  let volumeDiscounts = $derived(() => {
    if (!configStore.pricingData?.adjustments) return [];

    return configStore.pricingData.adjustments
            .filter(adj => adj.type === 'volume_discount')
            .map(adj => ({
              ...adj,
              saved: Math.abs(adj.amount)
            }));
  });

  let totalSavings = $derived(() => {
    if (!configStore.pricingData?.adjustments) return 0;

    return configStore.pricingData.adjustments
            .filter(adj => adj.amount < 0)
            .reduce((sum, adj) => sum + Math.abs(adj.amount), 0);
  });
</script>

<div class="pricing-display">
  <div class="pricing-header">
    <h3 class="pricing-title">
      Pricing Summary
      {#if configStore.isPricing}
        <span class="calculating">
          <span class="spinner"></span>
          Calculating...
        </span>
      {/if}
    </h3>

    {#if detailed && breakdown && breakdown.length > 0}
      <button
              class="toggle-btn"
              onclick={() => showBreakdown = !showBreakdown}
      >
        {showBreakdown ? 'Hide' : 'Show'} Details
      </button>
    {/if}
  </div>

  {#if configStore.pricingData}
    <div class="pricing-summary">
      <div class="price-row subtotal">
        <span>Subtotal</span>
        <span>{formatCurrency(configStore.basePrice)}</span>
      </div>

      {#if totalSavings > 0}
        <div class="price-row savings">
          <span>Total Savings</span>
          <span>-{formatCurrency(totalSavings)}</span>
        </div>
      {/if}

      <div class="price-row total">
        <span>Total Price</span>
        <span class="total-amount">{formatCurrency(configStore.totalPrice)}</span>
      </div>

      {#if configStore.pricingData.price_per_unit}
        <div class="price-per-unit">
          {formatCurrency(configStore.pricingData.price_per_unit)} per unit
        </div>
      {/if}
    </div>

    {#if showBreakdown && breakdown}
      <div class="pricing-breakdown">
        <h4 class="breakdown-title">Price Breakdown</h4>

        <div class="breakdown-items">
          {#each breakdown as item}
            <div class="breakdown-item type-{item.type}">
              <div class="item-info">
                <div class="item-name">
                  {item.name}
                  {#if item.quantity > 1}
                    <span class="item-quantity">×{item.quantity}</span>
                  {/if}
                </div>
                {#if item.group}
                  <div class="item-group">{item.group}</div>
                {/if}
                {#if item.reason}
                  <div class="item-reason">{item.reason}</div>
                {/if}
              </div>

              <div class="item-price">
                {#if item.type === 'option'}
                  {formatCurrency(item.total)}
                {:else if item.type === 'adjustment'}
                  <span class:discount={item.amount < 0}>
                    {item.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(item.amount))}
                    {#if item.percentage}
                      <span class="percentage">({item.percentage}%)</span>
                    {/if}
                  </span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if volumeDiscounts.length > 0}
      <div class="volume-discounts">
        <button
                class="volume-header"
                onclick={() => showVolumeDetails = !showVolumeDetails}
        >
          <span>Volume Discounts Applied</span>
          <span class="discount-amount">
            Save {formatCurrency(volumeDiscounts.reduce((sum, d) => sum + d.saved, 0))}
          </span>
        </button>

        {#if showVolumeDetails}
          <div class="volume-details">
            {#each volumeDiscounts as discount}
              <div class="discount-item">
                <div>
                  <div class="discount-name">{discount.description}</div>
                  <div class="discount-tier">Tier: {discount.tier_name || 'Volume'}</div>
                </div>
                <div class="discount-save">
                  Save {formatCurrency(discount.saved)}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  {:else if !configStore.isPricing && configStore.selectedOptions.length === 0}
    <div class="no-selections">
      <p>Select options to see pricing</p>
    </div>
  {/if}
</div>

<style>
  .pricing-display {
    background: var(--bg-secondary);
    border-radius: 0.75rem;
    padding: 1.25rem;
    border: 1px solid var(--border);
  }

  .pricing-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .pricing-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .calculating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-secondary);
  }

  .spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .toggle-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-btn:hover {
    background: var(--bg-secondary);
  }

  .pricing-summary {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.875rem;
  }

  .price-row.subtotal {
    color: var(--text-secondary);
  }

  .price-row.savings {
    color: var(--success);
    font-weight: 500;
  }

  .price-row.total {
    border-top: 2px solid var(--border);
    margin-top: 0.5rem;
    padding-top: 1rem;
    font-size: 1rem;
    font-weight: 600;
  }

  .total-amount {
    font-size: 1.5rem;
    color: var(--primary);
  }

  .price-per-unit {
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }

  .pricing-breakdown {
    margin-top: 1rem;
  }

  .breakdown-title {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 0.75rem;
  }

  .breakdown-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .breakdown-item {
    display: flex;
    justify-content: space-between;
    align-items: start;
    padding: 0.75rem;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    font-size: 0.813rem;
  }

  .item-info {
    flex: 1;
  }

  .item-name {
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .item-quantity {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .item-group,
  .item-reason {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  .item-price {
    font-weight: 600;
    text-align: right;
  }

  .item-price .discount {
    color: var(--success);
  }

  .percentage {
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--text-secondary);
  }

  .volume-discounts {
    margin-top: 1rem;
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .volume-header {
    width: 100%;
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 0.875rem;
  }

  .volume-header:hover {
    background: rgba(16, 185, 129, 0.1);
  }

  .discount-amount {
    color: var(--success);
    font-weight: 600;
  }

  .volume-details {
    padding: 0 1rem 1rem;
  }

  .discount-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.813rem;
  }

  .discount-name {
    font-weight: 500;
  }

  .discount-tier {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .discount-save {
    color: var(--success);
    font-weight: 500;
  }

  .no-selections {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
</style>