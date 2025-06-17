<!-- web/src/lib/components/OptionGroup.svelte -->
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

    // Computed values
    let selectedCount = $derived(
        Array.isArray(options) ? options.filter(opt => selections[opt.id] > 0).length : 0
    );

    let totalQuantity = $derived(
        Array.isArray(options) ? options.reduce((sum, opt) => sum + (selections[opt.id] || 0), 0) : 0
    );

    let isComplete = $derived(
        group.required
            ? (group.min_selections ? selectedCount >= group.min_selections : selectedCount > 0)
            : true
    );

    // Use a function instead of $derived for selection text
    function getSelectionText() {
        if (group.selection_type === 'single') {
            return 'Select one';
        } else if (group.selection_type === 'multiple') {
            if (group.min_selections && group.max_selections) {
                if (group.min_selections === group.max_selections) {
                    return `Select exactly ${group.min_selections}`;
                }
                return `Select ${group.min_selections}-${group.max_selections}`;
            } else if (group.min_selections) {
                return `Select at least ${group.min_selections}`;
            } else if (group.max_selections) {
                return `Select up to ${group.max_selections}`;
            }
            return 'Select multiple';
        }
        return '';
    }

    // Update selection text when group changes
    let selectionText = $state(getSelectionText());

    // Debug logging on mount
    onMount(() => {
        const text = getSelectionText();
        if (text.includes('=>') || text.includes('function')) {
            console.error('[OptionGroup] Selection text contains code!', {
                text,
                group
            });
        }
    });

    function handleOptionChange(optionId, quantity) {
        // For single selection groups, ensure only one is selected
        if (group.selection_type === 'single' && quantity > 0 && Array.isArray(options)) {
            // Clear other selections in this group
            options.forEach(opt => {
                if (opt.id !== optionId && selections[opt.id] > 0) {
                    onSelectionChange(opt.id, 0);
                }
            });
        }

        // Check max selections
        if (group.max_selections && quantity > 0 && Array.isArray(options)) {
            const currentSelections = options.filter(opt =>
                opt.id !== optionId && selections[opt.id] > 0
            ).length;

            if (currentSelections >= group.max_selections) {
                // Can't add more
                return;
            }
        }

        onSelectionChange(optionId, quantity);
    }

    function isOptionDisabled(option) {
        // Check if option is available based on constraints
        if (availableOptions.length > 0 && !availableOptions.includes(option.id)) {
            return true;
        }

        // Check group max selections
        if (group.max_selections && !selections[option.id]) {
            const currentSelections = options.filter(opt => selections[opt.id] > 0).length;
            if (currentSelections >= group.max_selections) {
                return true;
            }
        }

        return false;
    }

    function getOptionState(option) {
        const isSelected = selections[option.id] > 0;
        const isAvailable = availableOptions.length === 0 || availableOptions.includes(option.id);
        const isDisabled = isOptionDisabled(option);

        return {
            selected: isSelected,
            available: isAvailable,
            disabled: isDisabled,
            quantity: selections[option.id] || 0
        };
    }
</script>

<div class="option-group" class:expanded class:required={group.required}>
    <div class="group-header" onclick={onToggle}>
        <div class="group-info">
            <h3 class="group-name">
                {group.name || 'Unnamed Group'}
                {#if group.required}
                    <span class="required">*</span>
                {/if}
            </h3>
            {#if group.description && typeof group.description === 'string' &&
            !group.description.includes('=>') &&
            !group.description.includes('function') &&
            !group.description.includes('$props')}
                <p class="group-description">{group.description}</p>
            {/if}
        </div>

        <div class="group-meta">
            <div class="selection-info">
        <span class="selection-type">
          {sanitizeText(selectionText, group.selection_type === 'single' ? 'Select one' : 'Select multiple')}
        </span>
                {#if selectedCount > 0}
          <span class="selection-count">
            {selectedCount} selected
              {#if totalQuantity > selectedCount}
              ({totalQuantity} total)
            {/if}
          </span>
                {/if}
            </div>

            <button class="expand-toggle" aria-label={expanded ? 'Collapse' : 'Expand'}>
                <svg class="icon" class:rotated={!expanded} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    </div>

    {#if expanded}
        <div class="group-content">
            {#if Array.isArray(options) && options.length > 0}
                <div class="options-grid" data-selection-type={group.selection_type}>
                    {#each options as option (option.id)}
                        {@const state = getOptionState(option)}
                        <OptionCard
                                {option}
                                selected={state.selected}
                                quantity={state.quantity}
                                disabled={state.disabled}
                                available={state.available}
                                selectionType={group.selection_type}
                                maxQuantity={option.max_quantity || 10}
                                onChange={(quantity) => handleOptionChange(option.id, quantity)}
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
        background: var(--bg-primary, #ffffff);
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.2s;
    }

    .option-group.required {
        border-color: var(--primary-color, #3b82f6);
    }

    .group-header {
        padding: 1.25rem;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        background: var(--bg-secondary, #f9fafb);
        transition: background 0.2s;
    }

    .group-header:hover {
        background: var(--bg-tertiary, #f3f4f6);
    }

    .group-info {
        flex: 1;
    }

    .group-name {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary, #111827);
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .required {
        color: var(--error-color, #dc2626);
    }

    .group-description {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        color: var(--text-secondary, #6b7280);
    }

    .group-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .selection-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.25rem;
        font-size: 0.875rem;
    }

    .selection-type {
        color: var(--text-secondary, #6b7280);
    }

    .selection-count {
        font-weight: 500;
        color: var(--primary-color, #3b82f6);
    }

    .expand-toggle {
        background: none;
        border: none;
        padding: 0.5rem;
        cursor: pointer;
        color: var(--text-secondary, #6b7280);
        transition: transform 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon {
        transition: transform 0.2s;
    }

    .icon.rotated {
        transform: rotate(-90deg);
    }

    .group-content {
        padding: 1.25rem;
        border-top: 1px solid var(--border-color, #e5e7eb);
    }

    .options-grid {
        display: grid;
        gap: 1rem;
    }

    .options-grid[data-selection-type="single"] {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }

    .options-grid[data-selection-type="multiple"] {
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }

    .no-options {
        padding: 2rem;
        text-align: center;
        color: var(--text-secondary, #6b7280);
        background: var(--bg-tertiary, #f9fafb);
        border-radius: 6px;
    }

    @media (max-width: 640px) {
        .options-grid {
            grid-template-columns: 1fr !important;
        }

        .group-header {
            flex-direction: column;
            gap: 1rem;
        }

        .group-meta {
            width: 100%;
            justify-content: space-between;
        }
    }
</style>