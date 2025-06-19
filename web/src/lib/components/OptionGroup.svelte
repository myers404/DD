<!-- web/src/lib/components/OptionGroup.svelte -->
<!-- Compact group component without animations -->
<script>
    import OptionCard from './OptionCard.svelte';
    import { sanitizeText } from '../utils/sanitizer.js';

    let {
        group,
        options = [],
        selections = {},
        availableOptions = [],
        validationResults = null,
        onSelectionChange
    } = $props();
    
    // Determine if this is a radio group
    const isRadioGroup = group?.selection_type === 'single' || 
                        group?.selection_type === 'single-select' || 
                        group?.type === 'single-select' ||
                        group?.type === 'single';
    
    // Get selected option count for this group
    const selectedCount = $derived(options.filter(opt => selections[opt.id] > 0).length);
    
    // Get option state
    function getOptionState(option) {
        const selected = (selections[option.id] || 0) > 0;
        
        // Handle both simple array and AvailableOption structure
        let available = true;
        let reason = null;
        let isRequired = false;
        
        if (Array.isArray(availableOptions) && availableOptions.length > 0) {
            const firstItem = availableOptions[0];
            
            if (firstItem && typeof firstItem === 'object' && 'is_selectable' in firstItem) {
                // It's an array of AvailableOption objects
                const availableOption = availableOptions.find(ao => 
                    (ao.option && ao.option.id === option.id) || ao.id === option.id
                );
                
                if (availableOption) {
                    available = availableOption.is_selectable !== false;
                    reason = availableOption.reason || null;
                    isRequired = availableOption.is_required === true;
                }
            } else {
                // It's a simple array of option IDs or options
                const availableIds = availableOptions.map(opt => 
                    typeof opt === 'string' ? opt : opt.id
                );
                available = availableIds.includes(option.id);
            }
        }
        
        // Check max selections constraint for multi-select groups
        let maxSelectionsReached = false;
        if (!isRadioGroup && group.max_selections && selectedCount >= group.max_selections && !selected) {
            maxSelectionsReached = true;
            if (!reason) {
                reason = `Maximum ${group.max_selections} selections allowed`;
            }
        }
        
        const disabled = (!available && !selected) || maxSelectionsReached;
        return { selected, available, disabled, reason, isRequired };
    }

    // Handle option change
    function handleOptionChange(optionId, value) {
        const newValue = value > 0 ? 1 : 0;
        if (onSelectionChange) {
            onSelectionChange(optionId, newValue);
        }
    }
</script>

<div class="option-group" class:radio-group={isRadioGroup}>
    <div class="group-header">
        <h3 class="group-title">
            {sanitizeText(group.name)}
            {#if group.is_required}
                <span class="required">*</span>
            {/if}
        </h3>
        
        {#if group.min_selections || group.max_selections}
            <p class="selection-info">
                {#if group.min_selections && group.max_selections}
                    Select {group.min_selections} to {group.max_selections}
                {:else if group.min_selections}
                    Select at least {group.min_selections}
                {:else if group.max_selections}
                    Select up to {group.max_selections}
                {/if}
                {#if selectedCount > 0}
                    ({selectedCount} selected)
                {/if}
            </p>
        {/if}
    </div>
    
    <div class="options-container">
        {#each options as option (option.id)}
            {@const state = getOptionState(option)}
            <OptionCard
                {option}
                selected={state.selected}
                disabled={state.disabled}
                available={state.available}
                unavailableReason={state.reason}
                isRequired={state.isRequired}
                selectionType={isRadioGroup ? 'single' : 'multiple'}
                groupName={`group-${group.id}`}
                onChange={(value) => handleOptionChange(option.id, value)}
            />
        {/each}
    </div>
</div>

<style>
    .option-group {
        margin-bottom: 1rem;
    }
    
    .group-header {
        margin-bottom: 0.75rem;
    }

    .group-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary, #111827);
        margin: 0 0 0.25rem;
    }
    
    .required {
        color: var(--error-color, #ef4444);
        font-weight: 600;
        margin-left: 0.25rem;
    }
    
    .selection-info {
        font-size: 0.75rem;
        color: var(--text-secondary, #6b7280);
        margin: 0;
    }

    .options-container {
        display: flex;
        flex-direction: column;
        gap: 0;
    }
</style>