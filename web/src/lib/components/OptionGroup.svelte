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
    
    // Debug logging for default options
    $effect(() => {
        if (group?.default_option_id) {
            console.log(`OptionGroup ${group.name}:`, {
                defaultOptionId: group.default_option_id,
                selections: selections,
                selectionsType: typeof selections,
                isArray: Array.isArray(selections),
                defaultSelected: selections && selections[group.default_option_id] > 0,
                selectionsKeys: selections ? Object.keys(selections) : [],
                selectionsJSON: JSON.stringify(selections)
            });
        }
    });
    
    // Get selected option count for this group
    const selectedCount = $derived(options.filter(opt => selections && selections[opt.id] > 0).length);
    
    // Get option state
    function getOptionState(option) {
        const selected = selections && (selections[option.id] || 0) > 0;
        
        // Debug for default options
        if (option.id === group?.default_option_id) {
            console.log(`getOptionState for default ${option.id}:`, {
                selections,
                selectionValue: selections ? selections[option.id] : undefined,
                selected
            });
        }
        
        // Check availability from backend response
        let available = true;
        let reason = null;
        let isRequired = false;
        let impact = null;
        let helpsResolve = [];
        let status = 'selectable';
        let requiresDeselect = [];
        let blockedBy = [];
        let canSelect = true;
        let selectionMethod = 'add';
        let requirementTooltip = null;
        
        if (Array.isArray(availableOptions) && availableOptions.length > 0) {
            const firstItem = availableOptions[0];
            
            if (firstItem && typeof firstItem === 'object' && 'is_selectable' in firstItem) {
                const availableOption = availableOptions.find(ao => 
                    (ao.option && ao.option.id === option.id) || ao.id === option.id
                );
                
                if (availableOption) {
                    // Check for new status field first
                    if (availableOption.status) {
                        status = availableOption.status;
                        canSelect = availableOption.can_select || false;
                        selectionMethod = availableOption.selection_method || 'none';
                        requiresDeselect = availableOption.requires_deselect || [];
                        blockedBy = availableOption.blocked_by || [];
                        
                        // Map status to available/disabled for UI
                        available = status !== 'blocked';
                        
                        // Set reason from blocked_by if available
                        if (blockedBy.length > 0) {
                            reason = blockedBy[0].message || blockedBy[0].description || availableOption.reason;
                        } else {
                            reason = availableOption.reason || null;
                        }
                    } else {
                        // Legacy support
                        available = availableOption.is_selectable !== false;
                        reason = availableOption.reason || null;
                    }
                    
                    isRequired = availableOption.is_required === true;
                    impact = availableOption.impact || null;
                    helpsResolve = availableOption.helps_resolve || [];
                    requirementTooltip = availableOption.requirement_tooltip || null;
                    
                    // Debug log for first few options
                    if (availableOptions.indexOf(availableOption) < 3) {
                        console.log(`Option ${option.name}:`, {
                            status: availableOption.status,
                            impact: availableOption.impact,
                            helps_resolve: availableOption.helps_resolve,
                            requires_deselect: availableOption.requires_deselect,
                            blocked_by: availableOption.blocked_by
                        });
                    }
                }
            }
        }
        
        // Never disable options - we want them clickable for testing
        const disabled = false;
        return { 
            selected, 
            available, 
            disabled, 
            reason, 
            isRequired, 
            impact, 
            helpsResolve,
            status,
            requiresDeselect,
            blockedBy,
            canSelect,
            selectionMethod,
            requirementTooltip
        };
    }

    // Handle option change
    function handleOptionChange(optionId, value) {
        const newValue = value > 0 ? 1 : 0;
        
        // Check if this is a switch operation for single-select groups
        if (isRadioGroup && newValue > 0) {
            // Find the option being selected
            const selectedOption = availableOptions.find(ao => 
                ((ao.option && ao.option.id === optionId) || ao.id === optionId)
            );
            
            // If it's a switch status, deselect options that need to be deselected
            if (selectedOption && selectedOption.status === 'switch' && selectedOption.requires_deselect) {
                for (const deselectId of selectedOption.requires_deselect) {
                    if (onSelectionChange) {
                        onSelectionChange(deselectId, 0);
                    }
                }
            } else if (isRadioGroup) {
                // For regular radio groups, deselect other options in the group
                for (const opt of options) {
                    if (opt.id !== optionId && selections && selections[opt.id] > 0) {
                        if (onSelectionChange) {
                            onSelectionChange(opt.id, 0);
                        }
                    }
                }
            }
        }
        
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
                impact={state.impact}
                helpsResolve={state.helpsResolve}
                status={state.status}
                requiresDeselect={state.requiresDeselect}
                blockedBy={state.blockedBy}
                canSelect={state.canSelect}
                selectionMethod={state.selectionMethod}
                selectionType={isRadioGroup ? 'single' : 'multiple'}
                groupName={`group-${group.id}`}
                requirementTooltip={state.requirementTooltip}
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