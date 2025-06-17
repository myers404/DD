<!-- web/src/lib/components/OptionCard.svelte -->
<script>
  let {
    option,
    selected = false,
    disabled = false,
    available = true,
    selectionType = 'single',
    onChange
  } = $props();

  function handleClick() {
    if (!disabled && available) {
      // Always toggle for both single and multiple
      // Backend will handle deselecting others for single selection
      onChange(selected ? 0 : 1);
    }
  }
</script>

<div
        class="option-card"
        class:selected
        class:disabled
        class:unavailable={!available}
        on:click={handleClick}
        role="button"
        tabindex={disabled || !available ? -1 : 0}
        on:keydown={(e) => e.key === 'Enter' && handleClick()}
>
  <div class="option-header">
    <input
            type={selectionType === 'single' ? 'radio' : 'checkbox'}
            checked={selected}
            disabled={disabled || !available}
            on:click|stopPropagation
            tabindex="-1"
    />
    <div class="option-info">
      <h4 class="option-name">{option.name}</h4>
      {#if option.description}
        <p class="option-description">{option.description}</p>
      {/if}
    </div>
    <div class="option-price">
      {#if option.price && option.price > 0}
        <span class="price-amount">${option.price.toFixed(2)}</span>
      {:else}
        <span class="price-included">Included</span>
      {/if}
    </div>
  </div>

  {#if !available && option.unavailable_reason}
    <div class="unavailable-reason">
      {option.unavailable_reason}
    </div>
  {/if}
</div>

<style>
  .option-card {
    position: relative;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    background-color: white;
    transition: all 0.2s ease;
    cursor: pointer;
    user-select: none;
  }

  .option-card:hover:not(.disabled):not(.unavailable) {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .option-card:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .option-card.selected {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }

  .option-card.disabled,
  .option-card.unavailable {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #f9fafb;
  }

  .option-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  input[type="radio"],
  input[type="checkbox"] {
    margin-top: 2px;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    cursor: pointer;
  }

  .option-info {
    flex: 1;
    min-width: 0;
  }

  .option-name {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: #111827;
    line-height: 1.5;
  }

  .option-description {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.4;
  }

  .option-price {
    flex-shrink: 0;
    text-align: right;
  }

  .price-amount {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }

  .price-included {
    font-size: 14px;
    color: #10b981;
    font-weight: 500;
  }

  .unavailable-reason {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e5e7eb;
    font-size: 13px;
    color: #ef4444;
  }
</style>