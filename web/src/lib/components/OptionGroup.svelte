<!-- web/src/lib/components/OptionGroup.svelte -->
<script>
    import { configStore } from '../stores/configuration.svelte.js';
    import OptionCard from './OptionCard.svelte';

    let { group } = $props();

    let isExpanded = $state(true);
    let hasSelection = $derived(
        group.options && Array.isArray(group.options) &&
        group.options.some(opt => configStore.selections[opt.id] > 0)
    );

    // Debug logging
    $effect(() => {
        if (group.options?.length === 0) {
            console.warn(`⚠️ Group "${group.name}" has no options!`, {
                groupId: group.id,
                groupData: group
            });
        }
    });
</script>

<div class="option-group" class:has-selection={hasSelection}>
    <div class="group-header" onclick={() => isExpanded = !isExpanded}>
        <div class="group-info">
            <h3>
                {group.name}
                {#if group.required}
                    <span class="required">*</span>
                {/if}
            </h3>
            {#if group.description}
                <p class="group-description">{group.description}</p>
            {/if}
        </div>

        <button class="expand-toggle" aria-label="Toggle group">
            <svg
                    class="icon"
                    class:rotated={!isExpanded}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
            >
                <path
                        fill="currentColor"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                />
            </svg>
        </button>
    </div>

    {#if isExpanded}
        <div class="group-content">
            <div class="selection-info">
        <span class="selection-type">
          {group.selection_type === 'single' ? 'Choose one' : 'Choose multiple'}
        </span>
                {#if group.min_selections}
          <span class="selection-constraint">
            Min: {group.min_selections}
          </span>
                {/if}
                {#if group.max_selections}
          <span class="selection-constraint">
            Max: {group.max_selections}
          </span>
                {/if}
            </div>

            <div class="options-grid">
                {#if group.options && Array.isArray(group.options)}
                    {#each group.options as option}
                        <OptionCard {option} {group} />
                    {/each}
                {:else}
                    <div class="no-options">
                        <p>No options available</p>
                        <p class="help-text">Check API response</p>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .option-group {
        background: white;
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.2s;
    }

    .option-group.has-selection {
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem;
        cursor: pointer;
        user-select: none;
    }

    .group-header:hover {
        background: var(--bg-hover, #f9fafb);
    }

    .group-info h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
        margin: 0;
    }

    .required {
        color: var(--error-color, #dc2626);
        margin-left: 0.25rem;
    }

    .group-description {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        color: var(--text-secondary, #6b7280);
    }

    .expand-toggle {
        background: none;
        border: none;
        padding: 0.5rem;
        cursor: pointer;
        color: var(--text-secondary, #6b7280);
        transition: transform 0.2s;
    }

    .icon {
        transition: transform 0.2s;
    }

    .icon.rotated {
        transform: rotate(-90deg);
    }

    .group-content {
        padding: 0 1.25rem 1.25rem;
    }

    .selection-info {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: var(--text-secondary, #6b7280);
    }

    .selection-type {
        font-weight: 500;
    }

    .selection-constraint {
        color: var(--text-tertiary, #9ca3af);
    }

    .options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
    }

    .no-options {
        padding: 2rem;
        text-align: center;
        color: var(--text-secondary, #6b7280);
        background: var(--bg-secondary, #f9fafb);
        border-radius: 6px;
    }

    .no-options p {
        margin: 0 0 0.5rem;
    }

    .no-options .help-text {
        font-size: 0.75rem;
        color: var(--text-tertiary, #9ca3af);
    }

    @media (max-width: 640px) {
        .options-grid {
            grid-template-columns: 1fr;
        }
    }
</style>