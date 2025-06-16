<script>
    import OptionCard from './OptionCard.svelte';
    import { configStore } from '../stores/configuration.svelte.js';

    let { group } = $props();

    let selectedCount = $derived(
        group.options.reduce((count, option) => {
            return count + (configStore.selections[option.id] || 0);
        }, 0)
    );

    let isRequired = $derived(group.required);
    let isComplete = $derived(!isRequired || selectedCount >= (group.min_selections || 1));
    let hasError = $derived(
        configStore.validationResults.some(error =>
            error.group_id === group.id ||
            group.options.some(option => error.option_id === option.id)
        )
    );
</script>

<div class="mb-8">
    <!-- Group header -->
    <div class="mb-4">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-lg font-medium text-gray-900 flex items-center">
                    {group.name}
                    {#if isRequired}
                        <span class="ml-2 text-sm text-red-500">*</span>
                    {/if}
                    {#if isComplete}
                        <svg class="ml-2 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    {/if}
                </h2>

                {#if group.description}
                    <p class="mt-1 text-sm text-gray-500">{group.description}</p>
                {/if}
            </div>

            <div class="text-right">
                <div class="text-sm text-gray-500">
                    {selectedCount}
                    {#if group.max_selections}
                        / {group.max_selections}
                    {/if}
                    selected
                </div>

                {#if group.selection_type === 'single'}
                    <div class="text-xs text-gray-400">Choose one</div>
                {:else if group.min_selections || group.max_selections}
                    <div class="text-xs text-gray-400">
                        {#if group.min_selections && group.max_selections}
                            {group.min_selections}-{group.max_selections} required
                        {:else if group.min_selections}
                            Min {group.min_selections} required
                        {:else if group.max_selections}
                            Max {group.max_selections} allowed
                        {/if}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Group-level validation errors -->
        {#if hasError}
            <div class="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {#each configStore.validationResults as error}
                    {#if error.group_id === group.id}
                        <div>{error.message}</div>
                    {/if}
                {/each}
            </div>
        {/if}
    </div>

    <!-- Options grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each group.options as option}
            <OptionCard {option} {group} />
        {/each}
    </div>

    <!-- Group constraints info -->
    {#if group.constraints && group.constraints.length > 0}
        <div class="mt-4 text-sm text-gray-600">
            <details class="group">
                <summary class="cursor-pointer font-medium group-hover:text-gray-800">
                    View Constraints ({group.constraints.length})
                </summary>
                <div class="mt-2 space-y-1">
                    {#each group.constraints as constraint}
                        <div class="text-xs bg-gray-50 p-2 rounded">
                            {constraint}
                        </div>
                    {/each}
                </div>
            </details>
        </div>
    {/if}
</div>