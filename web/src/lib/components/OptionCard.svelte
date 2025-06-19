<!-- web/src/lib/components/OptionCard.svelte -->
<!-- Simplified design matching ConstraintTester style -->
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

  function handleChange() {
    if (!disabled && available) {
      // Don't allow deselecting required options
      if (selected && isRequired) {
        return;
      }
      onChange(selected ? 0 : 1);
    }
  }
</script>

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
    {#if option.price && option.price > 0}
      <span class="price">(+${option.price.toFixed(2)})</span>
    {/if}
    {#if isRequired}
      <span class="required">*</span>
    {/if}
  </span>
</label>

{#if !available && (unavailableReason || option.unavailable_reason)}
  <div class="unavailable-reason">
    {unavailableReason || option.unavailable_reason}
  </div>
{/if}

<style>
  .option-label {
    display: flex;
    align-items: center;
    padding: 8px 0;
    cursor: pointer;
    font-size: 14px;
    color: #374151;
  }

  .option-label:hover:not(.disabled) {
    color: #111827;
  }

  .option-label.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .option-input {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    cursor: pointer;
  }

  .option-input:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  .option-input:disabled {
    cursor: not-allowed;
  }

  .option-text {
    flex: 1;
    line-height: 1.5;
  }

  .price {
    color: #059669;
    font-weight: 500;
    margin-left: 4px;
  }

  .required {
    color: #ef4444;
    font-weight: 600;
    margin-left: 2px;
  }

  .unavailable-reason {
    margin-left: 24px;
    margin-top: 4px;
    font-size: 12px;
    color: #ef4444;
    line-height: 1.4;
  }
</style>