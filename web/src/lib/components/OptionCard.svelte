<!-- web/src/lib/components/OptionCard.svelte -->
<!-- Simplified option card with basic HTML controls -->
<script>
  let {
    option,
    selected = false,
    disabled = false,
    available = true,
    unavailableReason = null,
    isRequired = false,
    selectionType = 'single',
    groupName = null,
    onChange
  } = $props();

  function handleChange(event) {
    if (!disabled && available) {
      // For radio buttons, always send 1 when selected (can't deselect radio buttons)
      if (selectionType === 'single') {
        onChange(1);
      } else {
        // For checkboxes, toggle between 0 and 1
        // Don't allow deselecting required options
        if (selected && isRequired) {
          event.preventDefault();
          return;
        }
        onChange(selected ? 0 : 1);
      }
    }
  }
</script>

<div class="option-item" class:unavailable={!available && !selected}>
  <label class="option-label" class:disabled={disabled || !available}>
    <input
      type={selectionType === 'single' ? 'radio' : 'checkbox'}
      name={selectionType === 'single' && groupName ? groupName : undefined}
      checked={selected}
      disabled={disabled || !available}
      onchange={handleChange}
      class="option-input"
    />
    <span class="option-text">
      {option.name}
      {#if option.base_price && option.base_price > 0}
        <span class="price">(+${option.base_price.toFixed(2)})</span>
      {/if}
      {#if isRequired}
        <span class="badge-required">[Required]</span>
      {/if}
    </span>
  </label>
  
  {#if ((!available || disabled) && unavailableReason && !selected)}
    <div class="constraint-reason">
      {unavailableReason}
    </div>
  {/if}
</div>

<style>
  .option-item {
    margin: 0;
  }
  
  .option-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0.125rem 0;
    gap: 0.375rem;
  }

  .option-label.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .option-input {
    width: 1rem;
    height: 1rem;
    margin: 0;
    cursor: pointer;
  }

  .option-input:disabled {
    cursor: not-allowed;
  }
  
  .option-text {
    font-size: 0.875rem;
    color: var(--text-primary, #111827);
  }
  
  .price {
    color: var(--primary-color, #3b82f6);
    font-weight: 500;
    margin-left: 0.25rem;
  }
  
  .badge-required {
    color: var(--error-color, #ef4444);
    font-size: 0.75rem;
    font-weight: 500;
    margin-left: 0.5rem;
  }
  
  .constraint-reason {
    margin-left: 1.375rem;
    padding: 0.125rem 0 0.25rem 0;
    font-size: 0.75rem;
    color: var(--text-secondary, #6b7280);
    font-style: italic;
  }
  
  .option-item.unavailable .constraint-reason {
    color: #dc2626;
  }
</style>