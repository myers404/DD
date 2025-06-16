<!-- web/src/lib/components/OptionCard.svelte -->
<script>
  import { configStore } from '../stores/configuration.svelte.js';

  let { option, group } = $props();

  let quantity = $derived(configStore.selections[option.id] || 0);
  let isSelected = $derived(quantity > 0);
  let isAvailable = $derived(
          !configStore.availableOptions.length ||
          configStore.availableOptions.some(opt => opt.option_id === option.id)
  );

  let totalPrice = $derived(quantity * (option.base_price || 0));

  function getMaxQuantity() {
    if (group.selection_type === 'single') return 1;
    return group.max_selections || 10;
  }

  function updateQuantity(newQty) {
    if (!isAvailable && newQty > 0) return;
    configStore.updateSelection(option.id, newQty);
  }

  function increment() {
    if (quantity < getMaxQuantity()) {
      updateQuantity(quantity + 1);
    }
  }

  function decrement() {
    if (quantity > 0) {
      updateQuantity(quantity - 1);
    }
  }

  function toggle() {
    updateQuantity(isSelected ? 0 : 1);
  }
</script>

<div
        class="option-card"
        class:selected={isSelected}
        class:unavailable={!isAvailable}
>
  <div class="option-header">
    <h4>{option.name}</h4>
    {#if option.sku}
      <span class="sku">SKU: {option.sku}</span>
    {/if}
  </div>

  {#if option.description}
    <p class="description">{option.description}</p>
  {/if}

  <div class="price-section">
    <span class="base-price">
      ${(option.base_price || 0).toFixed(2)}
      {#if quantity > 1}
        <span class="price-each">each</span>
      {/if}
    </span>
    {#if quantity > 1}
      <span class="total-price">
        Total: ${totalPrice.toFixed(2)}
      </span>
    {/if}
  </div>

  <div class="actions">
    {#if group.selection_type === 'single'}
      <button
              class="select-button"
              class:selected={isSelected}
              onclick={toggle}
              disabled={!isAvailable}
      >
        {isSelected ? '✓ Selected' : 'Select'}
      </button>
    {:else}
      <div class="quantity-controls">
        <button
                class="qty-button"
                onclick={decrement}
                disabled={quantity === 0}
                aria-label="Decrease quantity"
        >
          −
        </button>
        <input
                type="number"
                value={quantity}
                min="0"
                max={getMaxQuantity()}
                onchange={(e) => updateQuantity(parseInt(e.target.value) || 0)}
                disabled={!isAvailable}
                aria-label="Quantity"
        />
        <button
                class="qty-button"
                onclick={increment}
                disabled={quantity >= getMaxQuantity() || !isAvailable}
                aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    {/if}
  </div>

  {#if !isAvailable && !isSelected}
    <div class="unavailable-overlay">
      <span>Not available with current selection</span>
    </div>
  {/if}
</div>

<style>
  .option-card {
    position: relative;
    background: white;
    border: 2px solid var(--border-color, #e5e7eb);
    border-radius: 8px;
    padding: 1.25rem;
    transition: all 0.2s;
  }

  .option-card:hover:not(.unavailable) {
    border-color: var(--primary-light, #93bbfc);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .option-card.selected {
    border-color: var(--primary-color, #3b82f6);
    background: var(--primary-bg, #eff6ff);
  }

  .option-card.unavailable {
    opacity: 0.6;
  }

  .option-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 0.5rem;
  }

  .option-header h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary, #1a1a1a);
    margin: 0;
  }

  .sku {
    font-size: 0.75rem;
    color: var(--text-tertiary, #9ca3af);
  }

  .description {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    margin: 0 0 1rem;
    line-height: 1.5;
  }

  .price-section {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1rem;
  }

  .base-price {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-color, #3b82f6);
  }

  .price-each {
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--text-secondary, #6b7280);
  }

  .total-price {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
  }

  .actions {
    margin-top: auto;
  }

  .select-button {
    width: 100%;
    padding: 0.625rem 1rem;
    border: 2px solid var(--primary-color, #3b82f6);
    border-radius: 6px;
    background: white;
    color: var(--primary-color, #3b82f6);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .select-button:hover:not(:disabled) {
    background: var(--primary-color, #3b82f6);
    color: white;
  }

  .select-button.selected {
    background: var(--primary-color, #3b82f6);
    color: white;
  }

  .select-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .qty-button {
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 4px;
    background: white;
    font-size: 1.125rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .qty-button:hover:not(:disabled) {
    background: var(--bg-hover, #f9fafb);
    border-color: var(--primary-color, #3b82f6);
  }

  .qty-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .quantity-controls input {
    width: 3rem;
    text-align: center;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 4px;
    padding: 0.375rem;
    font-size: 0.875rem;
  }

  .quantity-controls input:focus {
    outline: none;
    border-color: var(--primary-color, #3b82f6);
  }

  .unavailable-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
  }

  .unavailable-overlay span {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    text-align: center;
    padding: 1rem;
  }
</style>