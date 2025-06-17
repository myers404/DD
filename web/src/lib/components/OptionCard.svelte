<!-- web/src/lib/components/OptionCard.svelte -->
<script>
  import SafeText from './SafeText.svelte';
  import { sanitizeText } from '../utils/sanitizer.js';

  let {
    option,
    selected = false,
    quantity = 0,
    disabled = false,
    available = true,
    selectionType = 'multiple',
    maxQuantity = 10,
    onChange
  } = $props();

  function handleToggle() {
    if (disabled) return;

    if (selectionType === 'single') {
      onChange(selected ? 0 : 1);
    } else {
      onChange(selected ? 0 : 1);
    }
  }

  function handleQuantityChange(newQuantity) {
    if (disabled) return;

    const qty = Math.max(0, Math.min(newQuantity, maxQuantity));
    onChange(qty);
  }

  function increment() {
    handleQuantityChange(quantity + 1);
  }

  function decrement() {
    handleQuantityChange(quantity - 1);
  }

  let formattedPrice = $derived(
          option.price ? `$${option.price.toFixed(2)}` : 'Included'
  );

  let totalPrice = $derived(
          quantity > 1 && option.price ? `$${(option.price * quantity).toFixed(2)} total` : ''
  );
</script>

<div
        class="option-card"
        class:selected
        class:disabled
        class:unavailable={!available}
        role="button"
        tabindex={disabled ? -1 : 0}
        onclick={selectionType === 'single' ? handleToggle : undefined}
        onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  }}
>
  <div class="option-header">
    {#if selectionType === 'single'}
      <input
              type="radio"
              checked={selected}
              {disabled}
              onchange={handleToggle}
              onclick={(e) => e.stopPropagation()}
              class="radio-input"
      />
    {:else}
      <input
              type="checkbox"
              checked={selected}
              {disabled}
              onchange={handleToggle}
              onclick={(e) => e.stopPropagation()}
              class="checkbox-input"
      />
    {/if}

    <div class="option-info">
      <SafeText text={option.name} fallback="Unnamed Option" tag="h4" class="option-name" />
      {#if option.sku}
        <span class="option-sku">SKU: {option.sku}</span>
      {/if}
    </div>

    <div class="option-price">
      <span class="price">{formattedPrice}</span>
      {#if totalPrice}
        <span class="total-price">{totalPrice}</span>
      {/if}
    </div>
  </div>

  {#if option.description}
    <SafeText text={option.description} tag="p" class="option-description" />
  {/if}

  {#if option.features && option.features.length > 0}
    <ul class="option-features">
      {#each option.features as feature}
        <li><SafeText text={feature} tag="span" /></li>
      {/each}
    </ul>
  {/if}

  {#if selectionType === 'multiple' && selected}
    <div class="quantity-controls" onclick={(e) => e.stopPropagation()}>
      <label class="quantity-label">Quantity:</label>
      <div class="quantity-input">
        <button
                class="qty-btn"
                onclick={decrement}
                disabled={disabled || quantity <= 1}
                aria-label="Decrease quantity"
        >
          −
        </button>
        <input
                type="number"
                value={quantity}
                min="1"
                max={maxQuantity}
                {disabled}
                onchange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                onclick={(e) => e.stopPropagation()}
                class="qty-value"
        />
        <button
                class="qty-btn"
                onclick={increment}
                disabled={disabled || quantity >= maxQuantity}
                aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  {/if}

  {#if !available && !disabled}
    <div class="unavailable-message">
      Not available with current selections
    </div>
  {/if}

  {#if disabled && available}
    <div class="disabled-message">
      Maximum selections reached for this group
    </div>
  {/if}
</div>

<style>
  .option-card {
    background: var(--bg-primary, #ffffff);
    border: 2px solid var(--border-color, #e5e7eb);
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.2s;
    cursor: pointer;
    position: relative;
  }

  .option-card:hover:not(.disabled):not(.unavailable) {
    border-color: var(--primary-color, #3b82f6);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .option-card.selected {
    border-color: var(--primary-color, #3b82f6);
    background: var(--primary-bg, #eff6ff);
  }

  .option-card.disabled,
  .option-card.unavailable {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .option-header {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .radio-input,
  .checkbox-input {
    margin-top: 0.125rem;
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
  }

  .radio-input:disabled,
  .checkbox-input:disabled {
    cursor: not-allowed;
  }

  .option-info {
    flex: 1;
  }

  .option-name {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary, #111827);
  }

  .option-sku {
    font-size: 0.75rem;
    color: var(--text-tertiary, #9ca3af);
    margin-top: 0.125rem;
    display: inline-block;
  }

  .option-price {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
  }

  .price {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--primary-color, #3b82f6);
  }

  .total-price {
    font-size: 0.75rem;
    color: var(--text-secondary, #6b7280);
  }

  .option-description {
    margin: 0.75rem 0 0 2rem;
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    line-height: 1.5;
  }

  .option-features {
    margin: 0.75rem 0 0 2rem;
    padding: 0;
    list-style: none;
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
  }

  .option-features li {
    position: relative;
    padding-left: 1.25rem;
    margin-bottom: 0.25rem;
  }

  .option-features li::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: var(--success-color, #10b981);
    font-weight: 600;
  }

  .quantity-controls {
    margin-top: 0.75rem;
    margin-left: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .quantity-label {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
  }

  .quantity-input {
    display: flex;
    align-items: center;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 6px;
    overflow: hidden;
  }

  .qty-btn {
    background: var(--bg-secondary, #f9fafb);
    border: none;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    font-size: 1.125rem;
    color: var(--text-primary, #111827);
    transition: background 0.2s;
  }

  .qty-btn:hover:not(:disabled) {
    background: var(--bg-tertiary, #e5e7eb);
  }

  .qty-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .qty-value {
    border: none;
    background: var(--bg-primary, #ffffff);
    text-align: center;
    width: 3rem;
    padding: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-primary, #111827);
  }

  .qty-value:focus {
    outline: none;
  }

  .unavailable-message,
  .disabled-message {
    margin-top: 0.75rem;
    margin-left: 2rem;
    padding: 0.5rem 0.75rem;
    background: var(--warning-bg, #fef3c7);
    color: var(--warning-text, #92400e);
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .option-card {
      padding: 0.875rem;
    }

    .option-description,
    .option-features,
    .quantity-controls,
    .unavailable-message,
    .disabled-message {
      margin-left: 0;
    }
  }
</style>