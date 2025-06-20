<!-- web/src/lib/components/OptionCard.svelte -->
<!-- Simplified option card with basic HTML controls -->
<script>
  import Tooltip from './Tooltip.svelte';
  
  let {
    option,
    selected = false,
    disabled = false,
    available = true,
    unavailableReason = null,
    isRequired = false,
    selectionType = 'single',
    groupName = null,
    impact = null,
    helpsResolve = [],
    status = 'selectable',
    requiresDeselect = [],
    blockedBy = [],
    canSelect = true,
    selectionMethod = 'add',
    onChange,
    requirementTooltip = null
  } = $props();
  
  // Debug logging
  $effect(() => {
    if (option.id === 'opt_keyboard' || option.id === 'opt_ram_16gb' || option.id === 'opt_ssd_512gb') {
      console.log(`OptionCard ${option.id}: status=${status}, impact=${impact}, helpsResolve=`, helpsResolve);
    }
  });

  function handleChange(event) {
    // Handle different selection methods based on status
    if (status === 'switch' && selectionType === 'single') {
      // For switch status in single-select groups, always allow selection
      // The parent will handle deselecting the other option
      onChange(1);
    } else if (status === 'blocked') {
      // Prevent selection if blocked
      event.preventDefault();
      return;
    } else if (selectionType === 'single') {
      // For radio buttons, always send 1 when selected
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
  
  // Determine visual marker based on status and impact
  function getVisualMarker() {
    // For selected options that are now blocked (constraint violation)
    if (status === 'selected' && blockedBy && blockedBy.length > 0) {
      const reasons = blockedBy.map(b => b.message || b.description).join('; ');
      return { symbol: '×', title: `Constraint violation: ${reasons}`, class: 'blocked' };
    }
    
    // No marker for selected items that are valid
    if (status === 'selected') {
      return null;
    }
    
    // Switch icon only for same-group alternatives in single-select groups
    if (status === 'switch' && selectionType === 'single') {
      if (impact === 'helps' && helpsResolve && helpsResolve.length > 0) {
        return { symbol: '⟲', title: `Switch to resolve: ${helpsResolve.join(', ')}`, class: 'switch-helps' };
      }
      return { symbol: '⟲', title: 'Switch selection', class: 'switch' };
    }
    
    // Blocked options (cannot be selected due to constraints)
    if (status === 'blocked') {
      const reasons = blockedBy && blockedBy.length > 0 
        ? blockedBy.map(b => b.message || b.description).join('; ')
        : unavailableReason || 'Cannot select due to constraints';
      return { symbol: '×', title: reasons, class: 'blocked' };
    }
    
    // Green arrow for options that help resolve violations
    if ((status === 'available' || status === 'selectable') && impact === 'helps' && helpsResolve && helpsResolve.length > 0) {
      return { symbol: '◄', title: `Helps resolve: ${helpsResolve.join(', ')}`, class: 'helps' };
    }
    
    // No marker for regular selectable options or those that don't impact constraints
    return null;
  }
  
  const marker = $derived(getVisualMarker());
</script>

<div class="option-item" class:unavailable={!available && !selected}>
  <label class="option-label" class:disabled={false}>
    <input
      type={selectionType === 'single' ? 'radio' : 'checkbox'}
      name={selectionType === 'single' && groupName ? groupName : undefined}
      checked={selected}
      disabled={false}
      onchange={handleChange}
      class="option-input"
    />
    <span class="option-text" 
          class:helps-resolve={impact === 'helps'} 
          class:has-requirements={requirementTooltip && !marker}
          class:has-violations={status === 'selected' && blockedBy && blockedBy.length > 0}>
      {#if impact === 'helps' && helpsResolve && helpsResolve.length > 0}
        <Tooltip content={`Helps resolve: ${helpsResolve.join(', ')}`} position="top">
          {option.name}
          {#if option.base_price && option.base_price > 0}
            <span class="price">(+${option.base_price.toFixed(2)})</span>
          {/if}
        </Tooltip>
      {:else if requirementTooltip && !marker}
        <Tooltip content={requirementTooltip} position="top">
          {option.name}
          {#if option.base_price && option.base_price > 0}
            <span class="price">(+${option.base_price.toFixed(2)})</span>
          {/if}
          <span class="requirement-hint">i</span>
        </Tooltip>
      {:else}
        {option.name}
        {#if option.base_price && option.base_price > 0}
          <span class="price">(+${option.base_price.toFixed(2)})</span>
        {/if}
      {/if}
      {#if isRequired && !selected}
        <span class="badge-required">[Required]</span>
      {/if}
      {#if marker}
        <Tooltip content={marker.title} position="top">
          <span class="impact-marker {marker.class}">{marker.symbol}</span>
        </Tooltip>
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
    overflow: visible;
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
    overflow: visible;
    position: relative;
    display: inline-block;
  }
  
  /* Green squiggle for options that help resolve */
  .option-text.helps-resolve {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 6' preserveAspectRatio='none'%3E%3Cpath fill='none' stroke='%2310b981' stroke-width='1.5' d='M0,4.5 Q2.5,1.5 5,4.5 t5,0 t5,0 t5,0'/%3E%3C/svg%3E");
    background-position: 0 100%;
    background-size: 12px 4px;
    background-repeat: repeat-x;
    padding-bottom: 4px;
    font-weight: 500;
  }
  
  /* Blue squiggle for options with requirements */
  .option-text.has-requirements {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 6' preserveAspectRatio='none'%3E%3Cpath fill='none' stroke='%233b82f6' stroke-width='1.5' d='M0,4.5 Q2.5,1.5 5,4.5 t5,0 t5,0 t5,0'/%3E%3C/svg%3E");
    background-position: 0 100%;
    background-size: 12px 4px;
    background-repeat: repeat-x;
    padding-bottom: 4px;
  }
  
  /* Red squiggle for selected options with violations */
  .option-text.has-violations {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 6' preserveAspectRatio='none'%3E%3Cpath fill='none' stroke='%23ef4444' stroke-width='1.5' d='M0,4.5 Q2.5,1.5 5,4.5 t5,0 t5,0 t5,0'/%3E%3C/svg%3E");
    background-position: 0 100%;
    background-size: 12px 4px;
    background-repeat: repeat-x;
    padding-bottom: 4px;
    font-weight: 500;
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
  
  .impact-marker {
    /* Sizing */
    --marker-size: 16px;
    --marker-font-size: 14px;
    --marker-border-width: 1.5px;
    
    /* Base styles */
    display: inline-block;
    width: var(--marker-size);
    height: var(--marker-size);
    margin-left: 0.5rem;
    text-align: center;
    line-height: calc(var(--marker-size) - 2 * var(--marker-border-width) - 1px);
    font-size: var(--marker-font-size);
    font-weight: bold;
    cursor: help;
    vertical-align: middle;
    transition: all 0.2s;
    border-radius: 50%;
    border: var(--marker-border-width) solid;
  }
  
  .impact-marker.switch {
    /* Blue switch icon */
    --marker-color: #3b82f6;
    --marker-bg: transparent;
    --marker-hover-bg: #3b82f6;
    --marker-hover-color: white;
    
    color: var(--marker-color);
    background: var(--marker-bg);
    border-color: var(--marker-color);
    font-family: sans-serif;
  }
  
  .impact-marker.switch-helps {
    /* Green switch icon when it helps resolve constraints */
    --marker-color: #10b981;
    --marker-bg: transparent;
    --marker-hover-bg: #10b981;
    --marker-hover-color: white;
    
    color: var(--marker-color);
    background: var(--marker-bg);
    border-color: var(--marker-color);
    font-family: sans-serif;
  }
  
  .impact-marker.blocked {
    /* Red X for blocked options */
    --marker-color: #ef4444;
    --marker-font-size: 18px;
    
    color: var(--marker-color);
    border: none;
    width: auto;
    height: auto;
    line-height: 1;
    font-family: Arial, sans-serif;
  }
  
  .impact-marker.helps {
    /* Green arrow for options that help resolve violations */
    --marker-color: #10b981;
    --marker-font-size: 14px;
    
    color: var(--marker-color);
    border: none;
    width: auto;
    height: auto;
    line-height: 1;
    font-family: Arial, sans-serif;
  }
  
  .impact-marker:hover {
    background: var(--marker-hover-bg);
    color: var(--marker-hover-color);
    transform: scale(1.1);
  }
  
  .impact-marker.helps:hover {
    background: transparent;
    color: var(--marker-color);
    opacity: 0.8;
    transform: scale(1.2);
  }
  
  .impact-marker.blocked:hover {
    background: transparent;
    color: var(--marker-color);
    opacity: 0.8;
    transform: scale(1.2);
  }
  
  .requirement-hint {
    /* Sizing */
    --info-icon-size: 16px;
    --info-icon-font-size: 11px;
    --info-icon-border-width: 2px;
    
    /* Colors - easy to override for skinning */
    --info-icon-color: var(--info-color, #3b82f6);
    --info-icon-bg: transparent;
    --info-icon-hover-bg: var(--info-color, #3b82f6);
    --info-icon-hover-color: white;
    
    /* Base styles */
    display: inline-block;
    width: var(--info-icon-size);
    height: var(--info-icon-size);
    margin-left: 0.25rem;
    border: var(--info-icon-border-width) solid var(--info-icon-color);
    border-radius: 50%;
    text-align: center;
    line-height: calc(var(--info-icon-size) - 2 * var(--info-icon-border-width));
    font-size: var(--info-icon-font-size);
    font-weight: bold;
    font-style: italic;
    font-family: Georgia, serif;
    color: var(--info-icon-color);
    background: var(--info-icon-bg);
    cursor: help;
    vertical-align: middle;
    transition: all 0.2s;
  }
  
  .requirement-hint:hover {
    background: var(--info-icon-hover-bg);
    color: var(--info-icon-hover-color);
    transform: scale(1.1);
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