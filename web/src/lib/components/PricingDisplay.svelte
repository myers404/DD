<!-- web/src/lib/components/PricingDisplay.svelte -->
<script>
  let {
    pricingData,
    selections = {},
    options = [],
    volumeTiers = [],
    detailed = false
  } = $props();

  let showBreakdown = $state(detailed);
  let showDiscounts = $state(true);

  // Get option details for pricing display
  function getOption(optionId) {
    if (!Array.isArray(options)) return null;
    return options.find(o => o.id === optionId);
  }

  // Format currency
  function formatPrice(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  // Calculate savings
  let totalSavings = $derived(() => {
    if (!pricingData?.discounts) return 0;
    return pricingData.discounts.reduce((sum, d) => sum + (d.amount || 0), 0);
  });

  let savingsPercent = $derived(() => {
    if (!pricingData || !totalSavings) return 0;
    const subtotal = pricingData.base_price + (pricingData.options_total || 0);
    if (subtotal === 0) return 0;
    return Math.round((totalSavings / subtotal) * 100);
  });

  // Group selections by option group
  let groupedSelections = $derived(() => {
    const groups = new Map();

    Object.entries(selections).forEach(([optionId, quantity]) => {
      if (quantity <= 0) return;

      const option = getOption(optionId);
      if (!option) return;

      const groupId = option.group_id || 'other';
      if (!groups.has(groupId)) {
        groups.set(groupId, []);
      }

      groups.get(groupId).push({
        option,
        quantity,
        lineTotal: (option.price || 0) * quantity
      });
    });

    return Array.from(groups.entries());
  });
</script>

<div class="pricing-display" class:detailed>
  {#if !pricingData}
    <div class="pricing-empty">
      <p>Add options to see pricing</p>
    </div>
  {:else}
    <!-- Summary Section -->
    <div class="pricing-summary">
      <div class="summary-row total">
        <span class="label">Total Price</span>
        <span class="amount">{formatPrice(pricingData.total_price)}</span>
      </div>

      {#if totalSavings > 0}
        <div class="summary-row savings">
          <span class="label">Total Savings</span>
          <span class="amount">-{formatPrice(totalSavings)} ({savingsPercent}%)</span>
        </div>
      {/if}

      {#if detailed}
        <button
                class="toggle-btn"
                onclick={() => showBreakdown = !showBreakdown}
        >
          {showBreakdown ? 'Hide' : 'Show'} Breakdown
          <svg class="chevron" class:rotated={showBreakdown} width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 6.646a.5.5 0 01.708 0L8 9.293l2.646-2.647a.5.5 0 01.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 010-.708z"/>
          </svg>
        </button>
      {/if}
    </div>

    {#if showBreakdown}
      <!-- Base Price -->
      <div class="pricing-section">
        <h4 class="section-title">Base Configuration</h4>
        <div class="line-item">
          <span class="item-name">Base Model Price</span>
          <span class="item-price">{formatPrice(pricingData.base_price)}</span>
        </div>
      </div>

      <!-- Selected Options -->
      {#if groupedSelections.length > 0}
        <div class="pricing-section">
          <h4 class="section-title">Selected Options</h4>
          {#each groupedSelections as [groupId, items]}
            <div class="option-group">
              {#each items as { option, quantity, lineTotal }}
                <div class="line-item">
                  <div class="item-details">
                    <span class="item-name">{option.name}</span>
                    {#if quantity > 1}
                      <span class="item-quantity">×{quantity} @ {formatPrice(option.price)} each</span>
                    {/if}
                  </div>
                  <span class="item-price">{formatPrice(lineTotal)}</span>
                </div>
              {/each}
            </div>
          {/each}

          <div class="line-item subtotal">
            <span class="item-name">Options Subtotal</span>
            <span class="item-price">{formatPrice(pricingData.options_total || 0)}</span>
          </div>
        </div>
      {/if}

      <!-- Discounts -->
      {#if pricingData.discounts?.length > 0}
        <div class="pricing-section">
          <h4 class="section-title">
            Discounts Applied
            <button
                    class="toggle-discounts"
                    onclick={() => showDiscounts = !showDiscounts}
            >
              {showDiscounts ? 'Hide' : 'Show'}
            </button>
          </h4>

          {#if showDiscounts}
            {#each pricingData.discounts as discount}
              <div class="line-item discount">
                <div class="item-details">
                  <span class="item-name">{discount.name}</span>
                  {#if discount.description}
                    <span class="item-description">{discount.description}</span>
                  {/if}
                </div>
                <span class="item-price discount-amount">-{formatPrice(discount.amount)}</span>
              </div>
            {/each}
          {/if}
        </div>
      {/if}

      <!-- Volume Tiers -->
      {#if volumeTiers.length > 0 && detailed}
        <div class="pricing-section">
          <h4 class="section-title">Volume Pricing Tiers</h4>
          <div class="volume-tiers">
            {#each volumeTiers as tier}
              {@const isActive = pricingData.active_tier?.id === tier.id}
              <div class="tier-item" class:active={isActive}>
                <div class="tier-range">
                  {tier.min_quantity}
                  {#if tier.max_quantity}
                    - {tier.max_quantity}
                  {:else}
                    +
                  {/if}
                  units
                </div>
                <div class="tier-discount">
                  {tier.discount_percent}% off
                  {#if isActive}
                    <span class="active-badge">Active</span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Price Breakdown -->
      {#if pricingData.breakdown && detailed}
        <div class="pricing-section">
          <h4 class="section-title">Detailed Breakdown</h4>
          <div class="breakdown-items">
            {#each pricingData.breakdown as item}
              <div class="line-item small">
                <span class="item-name">{item.name}</span>
                <span class="item-price">{formatPrice(item.amount)}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}

    <!-- Final Total -->
    <div class="pricing-footer">
      <div class="final-total">
        <span class="label">Total</span>
        <span class="amount">{formatPrice(pricingData.total_price)}</span>
      </div>

      {#if pricingData.currency && pricingData.currency !== 'USD'}
        <div class="currency-note">
          Prices shown in {pricingData.currency}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .pricing-display {
    background: var(--bg-primary, #ffffff);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 8px;
    overflow: hidden;
  }

  .pricing-display.detailed {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .pricing-empty {
    padding: 3rem;
    text-align: center;
    color: var(--text-secondary, #6b7280);
  }

  .pricing-summary {
    padding: 1.5rem;
    background: var(--bg-secondary, #f9fafb);
    border-bottom: 1px solid var(--border-color, #e5e7eb);
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .summary-row:last-child {
    margin-bottom: 0;
  }

  .summary-row.total {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary, #111827);
  }

  .summary-row.savings {
    color: var(--success-color, #10b981);
    font-weight: 600;
  }

  .toggle-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    width: 100%;
    background: var(--bg-primary, #ffffff);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .toggle-btn:hover {
    background: var(--bg-tertiary, #f3f4f6);
  }

  .chevron {
    transition: transform 0.2s;
  }

  .chevron.rotated {
    transform: rotate(180deg);
  }

  .pricing-section {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
  }

  .pricing-section:last-of-type {
    border-bottom: none;
  }

  .section-title {
    margin: 0 0 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary, #6b7280);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .toggle-discounts {
    font-size: 0.75rem;
    color: var(--primary-color, #3b82f6);
    background: none;
    border: none;
    cursor: pointer;
    text-transform: none;
  }

  .line-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }

  .line-item:last-child {
    margin-bottom: 0;
  }

  .line-item.subtotal {
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-color, #e5e7eb);
    font-weight: 600;
  }

  .line-item.discount {
    color: var(--success-color, #10b981);
  }

  .line-item.small {
    font-size: 0.75rem;
    color: var(--text-secondary, #6b7280);
  }

  .item-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .item-name {
    color: var(--text-primary, #111827);
  }

  .item-quantity,
  .item-description {
    font-size: 0.75rem;
    color: var(--text-secondary, #6b7280);
  }

  .item-price {
    font-weight: 500;
    white-space: nowrap;
    margin-left: 1rem;
  }

  .discount-amount {
    color: var(--success-color, #10b981);
  }

  .option-group {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px dashed var(--border-color, #e5e7eb);
  }

  .option-group:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .volume-tiers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .tier-item {
    padding: 0.75rem;
    background: var(--bg-tertiary, #f9fafb);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 6px;
    text-align: center;
    transition: all 0.2s;
  }

  .tier-item.active {
    background: var(--primary-bg, #eff6ff);
    border-color: var(--primary-color, #3b82f6);
  }

  .tier-range {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary, #111827);
    margin-bottom: 0.25rem;
  }

  .tier-discount {
    font-size: 0.75rem;
    color: var(--text-secondary, #6b7280);
  }

  .active-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    background: var(--primary-color, #3b82f6);
    color: white;
    border-radius: 999px;
    font-size: 0.625rem;
    font-weight: 600;
    margin-left: 0.25rem;
  }

  .breakdown-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .pricing-footer {
    padding: 1.5rem;
    background: var(--bg-tertiary, #f3f4f6);
  }

  .final-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary, #111827);
  }

  .currency-note {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-secondary, #6b7280);
    text-align: right;
  }

  @media (max-width: 640px) {
    .pricing-section {
      padding: 1rem;
    }

    .volume-tiers {
      grid-template-columns: 1fr;
    }
  }
</style>