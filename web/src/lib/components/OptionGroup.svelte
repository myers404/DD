<!-- web/src/lib/components/OptionGroup.svelte -->
<!-- Simplified design matching ConstraintTester style -->
<script>
    import OptionCard from './OptionCard.svelte';
    import { sanitizeText } from '../utils/sanitizer.js';

    let {
        group,
        options = [],
        selections = {},
        availableOptions = [],
        onSelectionChange
    } = $props();

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
        
        const disabled = !available && !selected;
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

<div class="option-group">
    <h4 class="group-title">
        {sanitizeText(group.name)}
        {#if group.is_required}
            <span class="required">*</span>
        {/if}
    </h4>
    
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
                selectionType={group.type === 'single-select' || group.type === 'single_select' ? 'single' : 'multiple'}
                groupName={`group-${group.id}`}
                onChange={(value) => handleOptionChange(option.id, value)}
            />
        {/each}
    </div>
</div>

<style>
    .option-group {
        margin-bottom: 24px;
    }

    .group-title {
        font-size: 16px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 12px;
    }

    .required {
        color: #ef4444;
        font-weight: 600;
        margin-left: 2px;
    }

    .options-container {
        padding-left: 8px;
    }
</style>