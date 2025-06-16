<!-- web/src/lib/components/OptionGroup.svelte -->
<script>
    import { configStore } from '../stores/configuration.svelte.js';
    import { createVirtualScroller } from '../utils/virtual-scroll.js';
    import OptionCard from './OptionCard.svelte';

    let { group } = $props();

    let expanded = $state(true);
    let searchTerm = $state('');
    let showVirtualScroll = $state(false);
    let virtualScroller = $state(null);
    let scrollContainer;

    // Filter options based on search
    let filteredOptions = $derived(
        group.options.filter(option =>
            option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            option.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    $effect(() => {
        if (filteredOptions.length > 20) {
            showVirtualScroll = true;
            virtualScroller = createVirtualScroller({
                items: filteredOptions,
                itemHeight: 120,
                containerHeight: 600,
                buffer: 3
            });
        } else {
            showVirtualScroll = false;
            virtualScroller = null;
        }
    });

    // Check if group has selections
    let hasSelections = $derived(
        group.options.some(option => configStore.selections[option.id] > 0)
    );

    // Check if group has errors
    let hasErrors = $derived(
        configStore.validationResults.violations.some(v =>
            v.group_id === group.id ||
            group.options.some(opt => v.option_id === opt.id)
        )
    );

    // Get group-specific errors
    let groupErrors = $derived(
        configStore.validationResults.violations.filter(v =>
            v.group_id === group.id ||
            group.options.some(opt => v.option_id === opt.id)
        )
    );

    function handleScroll(event) {
        if (virtualScroller) {
            virtualScroller.updateScroll(event.target.scrollTop);
        }
    }
</script>

<div class="option-group" class:has-errors={hasErrors}>
    <!-- Group header -->
    <div class="group-header" onclick={() => expanded = !expanded}>
        <div class="header-content">
            <h3 class="group-title">
                {group.name}
                {#if group.required}
                    <span class="required-badge">Required</span>
                {/if}
            </h3>

            <div class="group-meta">
                {#if group.selection_type === 'single'}
                    <span class="selection-type">Single selection</span>
                {:else if group.selection_type === 'multiple'}
          <span class="selection-type">
            Multiple selection
              {#if group.min_selections > 0 || group.max_selections}
              ({group.min_selections || 0}-{group.max_selections || '∞'})
            {/if}
          </span>
                {/if}

                {#if hasSelections}
          <span class="selection-count">
            {group.options.filter(o => configStore.selections[o.id] > 0).length} selected
          </span>
                {/if}
            </div>
        </div>

        <button class="expand-toggle" aria-label={expanded ? 'Collapse' : 'Expand'}>
            <svg class="icon" class:rotated={expanded} viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
    </div>

    {#if expanded}
        <div class="group-content">
            {#if group.description}
                <p class="group-description">{group.description}</p>
            {/if}

            {#if groupErrors.length > 0}
                <div class="group-errors">
                    {#each groupErrors as error}
                        <div class="error-message">
                            <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                            {error.message}
                        </div>
                    {/each}
                </div>
            {/if}

            {#if filteredOptions.length > 10}
                <div class="search-box">
                    <input
                            type="search"
                            placeholder="Search options..."
                            bind:value={searchTerm}
                            class="search-input"
                    />
                </div>
            {/if}

            <div class="options-container" class:virtual={showVirtualScroll}>
                {#if showVirtualScroll && virtualScroller}
                    <div
                            class="virtual-scroll-container"
                            bind:this={scrollContainer}
                            onscroll={handleScroll}
                            style="height: 600px"
                    >
                        <div style="height: {virtualScroller?.totalHeight || 0}px; position: relative;">
                            <div style="transform: translateY({virtualScroller?.offsetY || 0}px);">
                                {#each virtualScroller?.visibleItems || [] as option}
                                    <OptionCard {option} {group} />
                                {/each}
                            </div>
                        </div>
                    </div>
                {:else}
                    <div class="options-grid">
                        {#each filteredOptions as option}
                            <OptionCard {option} {group} />
                        {/each}
                    </div>
                {/if}
            </div>

            {#if filteredOptions.length === 0}
                <div class="no-results">
                    No options found matching "{searchTerm}"
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .option-group {
        background: var(--bg-secondary);
        border-radius: 0.75rem;
        border: 1px solid var(--border);
        overflow: hidden;
        transition: border-color 0.2s;
    }

    .option-group.has-errors {
        border-color: var(--error);
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
        background: var(--bg);
    }

    .header-content {
        flex: 1;
    }

    .group-title {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .required-badge {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--error);
        background: rgba(239, 68, 68, 0.1);
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
    }

    .group-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
    }

    .selection-count {
        color: var(--success);
        font-weight: 500;
    }

    .expand-toggle {
        background: none;
        border: none;
        padding: 0.5rem;
        cursor: pointer;
        color: var(--text-secondary);
    }

    .icon {
        width: 1.25rem;
        height: 1.25rem;
        transition: transform 0.2s;
    }

    .icon.rotated {
        transform: rotate(180deg);
    }

    .group-content {
        padding: 0 1.25rem 1.25rem;
    }

    .group-description {
        color: var(--text-secondary);
        font-size: 0.875rem;
        margin: 0 0 1rem;
    }

    .group-errors {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 0.5rem;
        color: var(--error);
        font-size: 0.875rem;
    }

    .error-icon {
        width: 1.25rem;
        height: 1.25rem;
        flex-shrink: 0;
    }

    .search-box {
        margin-bottom: 1rem;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        background: var(--bg);
        font-size: 0.875rem;
    }

    .search-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }

    .virtual-scroll-container {
        overflow-y: auto;
        scrollbar-width: thin;
    }

    .no-results {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
    }

    @media (max-width: 640px) {
        .options-grid {
            grid-template-columns: 1fr;
        }
    }
</style>