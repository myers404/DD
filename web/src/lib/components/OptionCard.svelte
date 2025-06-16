<!-- web/src/lib/components/OptionCard.svelte -->
<script>
  import { configStore } from '../stores/configuration.svelte.js';
  import { formatCurrency } from '../utils/format.js';
  import { throttle } from '../utils/timing.js';

  let { option, group } = $props();

  let quantity = $state(configStore.selections[option.id] || 0);
  let isSelected = $derived(quantity > 0);
  let isLoading = $state(false);

  // Throttle quantity updates for performance
  const updateQuantity = throttle((newQuantity) => {
    configStore.updateSelection(option.id, newQuantity);
  }, 100);

  // Check for option-specific errors
  let optionErrors = $derived(
          configStore.validationResults.violations.filter(v => v.option_id === option.id)
  );

  function handleQuantityChange(delta) {
    const newQuantity = Math.max(0, quantity + delta);

    // Check max selections for group
    if (group.max_selections && delta > 0) {
      const currentGroupSelections = group.options
              .filter(opt => configStore.selections[opt.id] > 0)
              .length;

      if (!isSelected && currentGroupSelections >= group.max_selections) {
        return;
      }
    }

    quantity = newQuantity;
    updateQuantity(newQuantity);
  }

  function handleToggle() {
    if (group.selection_type === 'single') {
      // For single select, toggle between 0 and 1
      const newQuantity = isSelected ? 0 : 1;
      quantity = newQuantity;
      configStore.updateSelection(option.id, newQuantity);
    } else {
      // For multi-select, toggle between 0 and 1
      handleQuantityChange(isSelected ? -quantity : 1);
    }
  }

  // Sync local state with store
  $effect(() => {
    quantity = configStore.selections[option.id] || 0;
  });
</script>

<div
        class="option-card"
        class:selected={isSelected}
        class:has-errors={optionErrors.length > 0}
        class:loading={isLoading}
>
  <div class="option-header">
    <div class="option-info">
      <h4 class="option-name">{option.name}</h4>
      {#if option.sku}
        <span class="option-sku">SKU: {option.sku}</span>
      {/if}
    </div>

    <div class="option-price">
      {formatCurrency(option.base_price)}
      {#if option.price_unit}
        <span class="price-unit">/{option.price_unit}</span>
      {/if}
    </div>
  </div>

  {#if option.description}
    <p class="option-description">{option.description}</p>
  {/if}

  {#if option.attributes && Object.keys(option.attributes).length > 0}
    <div class="option-attributes">
      {#each Object.entries(option.attributes) as [key, value]}
        <span class="attribute">
          <span class="attribute-key">{key}:</span>
          <span class="attribute-value">{value}</span>
        </span>
      {/each}
    </div>
  {/if}

  {#if optionErrors.length > 0}
    <div class="option-errors">
      {#each optionErrors as error}
        <div class="error-text">{error.message}</div>
      {/each}
    </div>
  {/if}

  <div class="option-controls">
    {#if group.selection_type === 'single'}
      <label class="radio-control">
        <input
                type="radio"
                name={`group-${group.id}`}
                checked={isSelected}
                onchange={handleToggle}
                class="radio-input"
        />
        <span class="radio-label">Select</span>
      </label>
    {:else}
      <div class="quantity-controls">
        <button
                type="button"
                class="quantity-btn"
                onclick={() => handleQuantityChange(-1)}
                disabled={quantity === 0}
                aria-label="Decrease quantity"
        >
          <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
        </button>

        <input
                type="number"
                class="quantity-input"
                bind:value={quantity}
                onchange={(e) => updateQuantity(parseInt(e.target.value) || 0)}
                min="0"
                max={option.max_quantity || 999}
        />

        <button
                type="button"
                class="quantity-btn"
                onclick={() => handleQuantityChange(1)}
                disabled={option.max_quantity && quantity >= option.max_quantity}
                aria-label="Increase quantity"
        >
          <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      {#if quantity > 0}
        <div class="quantity-total">
          Total: {formatCurrency(option.base_price * quantity)}
        </div>
      {/if}
    {/if}
  </div>

  {#if option.availability === 'limited'}
    <div class="availability-warning">
      Limited availability
    </div>
  {:else if option.availability === 'out_of_stock'}
    <div class="availability-error">
      Out of stock
    </div>
  {/if}
</div>

<style>
  .option-card {
    background: var(--bg);
    border: 2px solid var(--border);
    border-radius: 0.75rem;
    padding: 1.25rem;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .option-card.selected {
    border-color: var(--primary);
    background: rgba(59, 130, 246, 0.05);
  }

  .option-card.has-errors {
    border-color: var(--error);
  }

  .option-card.loading {
    opacity: 0.6;
    pointer-events: none;
  }

  .option-card.loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--primary);
    animation: loading 1s ease-in-out infinite;
  }

  @keyframes loading {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .option-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 0.75rem;
  }

  .option-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }

  .option-sku {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .option-price {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--primary);
    text-align: right;
  }

  .price-unit {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-secondary);
  }

  .option-description {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0 0 0.75rem;
    line-height: 1.5;
  }

  .option-attributes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .attribute {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: var(--bg-secondary);
    border-radius: 0.25rem;
  }

  .attribute-key {
    color: var(--text-secondary);
  }

  .attribute-value {
    font-weight: 500;
  }

  .option-errors {
    margin: 0.75rem 0;
    padding: 0.5rem;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 0.25rem;
  }

  .error-text {
    font-size: 0.75rem;
    color: var(--error);
  }

  .option-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
  }

  .radio-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .radio-input {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
  }

  .quantity-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .quantity-btn {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .quantity-btn:hover:not(:disabled) {
    background: var(--border);
  }

  .quantity-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon {
    width: 1rem;
    height: 1rem;
  }

  .quantity-input {
    width: 4rem;
    text-align: center;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--bg);
  }

  .quantity-total {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--success);
  }

  .availability-warning {
    margin-top: 0.75rem;
    padding: 0.5rem;
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning);
    font-size: 0.75rem;
    text-align: center;
    border-radius: 0.25rem;
  }

  .availability-error {
    margin-top: 0.75rem;
    padding: 0.5rem;
    background: rgba(239, 68, 68, 0.1);
    color: var(--error);
    font-size: 0.75rem;
    text-align: center;
    border-radius: 0.25rem;
  }
</style>