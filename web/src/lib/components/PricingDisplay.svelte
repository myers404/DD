<!-- web/src/lib/components/PricingDisplay.svelte -->
<script>
  import { configStore } from '../stores/configuration.svelte.js';

  let { detailed = false, showBreakdown = true } = $props();

  let savings = $derived(
          configStore.adjustments
                  .filter(adj => adj.amount < 0)
                  .reduce((total, adj) => total + Math.abs(adj.amount), 0)
  );

  let additionalCharges = $derived(
          configStore.adjustments
                  .filter(adj => adj.amount > 0)
                  .reduce((total, adj) => total + adj.amount, 0)
  );

  let formattedPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
</script>

<div class="pricing-display" class:detailed>
  {#if configStore.isPricing}
    <div class="loading">
      <span class="spinner"></span>
      Calculating price...
    </div>
  {:else}
    <div class="price-summary">
      <div class="price-line total">
        <span class="label">Total Price</span>
        <span class="amount">{formattedPrice(configStore.totalPrice)}</span>
      </div>

      {#if showBreakdown && (configStore.basePrice !== configStore.totalPrice || detailed)}
        <div class="price-breakdown">
          <div class="price-line">
            <span class="label">Base Price</span>
            <span class="amount">{formattedPrice(configStore.basePrice)}</span>
          </div>

          {#if detailed && configStore.adjustments.length > 0}
            <div class="adjustments">
              {#each configStore.adjustments as adjustment}
                <div class="price-line adjustment">
                  <span class="label">
                    {adjustment.type === 'discount' ? '−' : '+'}
                    {adjustment.description}
                  </span>
                  <span class="amount" class:discount={adjustment.amount < 0}>
                    {formattedPrice(Math.abs(adjustment.amount))}
                  </span>
                </div>
              {/each}
            </div>
          {:else}
            {#if savings > 0}
              <div class="price-line">
                <span class="label">Savings</span>
                <span class="amount discount">−{formattedPrice(savings)}</span>
              </div>
            {/if}

            {#if additionalCharges > 0}
              <div class="price-line">
                <span class="label">Additional Charges</span>
                <span class="amount">+{formattedPrice(additionalCharges)}</span>
              </div>
            {/if}
          {/if}
        </div>
      {/if}

      {#if savings > 0}
        <div class="savings-badge">
          You save {formattedPrice(savings)}!
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .pricing-display {
    background: white;
    border-radius: 8px;
    padding: 1rem;
  }

  .pricing-display.detailed {
    padding: 1.5rem;
    border: 1px solid var(--border-color, #e5e7eb);
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary, #6b7280);
    font-size: 0.875rem;
  }

  .spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--border-color, #e5e7eb);
    border-top-color: var(--primary-color, #3b82f6);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .price-summary {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .price-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .price-line.total {
    font-size: 1.125rem;
    font-weight: 600;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--border-color, #e5e7eb);
  }

  .price-line.adjustment {
    font-size: 0.875rem;
    padding-left: 1rem;
  }

  .label {
    color: var(--text-secondary, #6b7280);
  }

  .price-line.total .label {
    color: var(--text-primary, #1a1a1a);
  }

  .amount {
    font-weight: 500;
    color: var(--text-primary, #1a1a1a);
  }

  .price-line.total .amount {
    font-size: 1.25rem;
    color: var(--primary-color, #3b82f6);
  }

  .amount.discount {
    color: var(--success-color, #10b981);
  }

  .price-breakdown {
    padding-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .adjustments {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin: 0.5rem 0;
  }

  .savings-badge {
    background: var(--success-bg, #d1fae5);
    color: var(--success-color, #10b981);
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
    margin-top: 0.5rem;
  }
</style>