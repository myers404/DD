<!-- web/src/lib/components/OptionGroup.svelte -->
<!-- Showing only the fixed selection text part -->
<script>
    import { onMount } from 'svelte';
    import OptionCard from './OptionCard.svelte';
    import { sanitizeText } from '../utils/sanitizer.js';

    let {
        group,
        options = [],
        selections = {},
        availableOptions = [],
        onSelectionChange,
        expanded = true,
        onToggle
    } = $props();

    // Computed values with proper array safety
    let selectedCount = $derived(
        Array.isArray(options) ? options.filter(opt => (selections[opt.id] || 0) > 0).length : 0
    );

    let isComplete = $derived(
        group.required
            ? (group.min_selections ? selectedCount >= group.min_selections : selectedCount > 0)
            : true
    );

    // Get option state
    function getOptionState(option) {
        const selected = (selections[option.id] || 0) > 0;
        const availableIds = Array.isArray(availableOptions) ? availableOptions.map(opt => opt.id) : [];
        const available = availableIds.length === 0 || availableIds.includes(option.id); // If no available list, assume all available
        const disabled = !available && !selected; // Can always deselect

        return { selected, available, disabled };
    }

    // Handle option change
    function handleOptionChange(optionId, value) {
        // Simple on/off - backend handles all constraint logic
        const newValue = value > 0 ? 1 : 0;
        if (onSelectionChange) {
            onSelectionChange(optionId, newValue);
        }
    }
</script>

<div class="option-group" class:complete={isComplete} class:required={group.required}>
    <div class="group-header" on:click={onToggle} role="button" tabindex="0">
        <div class="group-info">
            <h3 class="group-name">
                {sanitizeText(group.name)}
                {#if group.required}
                    <span class="required-indicator">*</span>
                {/if}
            </h3>
            <div class="group-meta">
        <span class="selection-type">
          {#if group.selection_type === 'single'}
            Select one
          {:else if group.min_selections && group.max_selections}
            {#if group.min_selections === group.max_selections}
                Select exactly {group.min_selections}
            {:else}
                Select {group.min_selections}-{group.max_selections}
            {/if}
          {:else if group.min_selections}
            Select at least {group.min_selections}
          {:else if group.max_selections}
            Select up to {group.max_selections}
          {:else}
            Select multiple
          {/if}
        </span>
                {#if selectedCount > 0}
          <span class="selection-count">
            {selectedCount} selected
          </span>
                {/if}
            </div>
        </div>

        <button class="expand-toggle" aria-label={expanded ? 'Collapse' : 'Expand'}>
            <svg class="icon" class:rotated={!expanded} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
    </div>

    {#if expanded}
        <div class="group-content">
            {#if Array.isArray(options) && options.length > 0}
                <div class="options-list">
                    {#each options as option (option.id)}
                        {@const state = getOptionState(option)}
                        <OptionCard
                                {option}
                                selected={state.selected}
                                disabled={state.disabled}
                                available={state.available}
                                selectionType={group.selection_type}
                                onChange={(value) => handleOptionChange(option.id, value)}
                        />
                    {/each}
                </div>
            {:else}
                <div class="no-options">
                    <p>No options available in this group.</p>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .option-group {
        margin-bottom: 24px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        background: white;
    }

    .option-group.required:not(.complete) {
        border-color: #fbbf24;
    }

    .group-header {
        padding: 16px 20px;
        background-color: #f9fafb;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.2s;
    }

    .group-header:hover {
        background-color: #f3f4f6;
    }

    .group-info {
        flex: 1;
    }

    .group-name {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
    }

    .required-indicator {
        color: #ef4444;
        margin-left: 4px;
    }

    .group-meta {
        margin-top: 4px;
        display: flex;
        gap: 16px;
        font-size: 14px;
    }

    .selection-type {
        color: #6b7280;
    }

    .selection-count {
        color: #3b82f6;
        font-weight: 500;
    }

    .expand-toggle {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: #6b7280;
        transition: transform 0.2s;
    }

    .icon {
        transition: transform 0.2s;
    }

    .icon.rotated {
        transform: rotate(-90deg);
    }

    .group-content {
        padding: 16px;
    }

    .options-list {
        /* Options stack vertically */
    }

    .no-options {
        text-align: center;
        padding: 32px;
        color: #6b7280;
    }
</style>