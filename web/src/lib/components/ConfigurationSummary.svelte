<!-- src/lib/components/ConfigurationSummary.svelte -->
<script>
    import { configStore } from '../stores/configuration.svelte.js';
    import PricingDisplay from './PricingDisplay.svelte';
    import ValidationDisplay from './ValidationDisplay.svelte';

    let shareableUrl = $derived(configStore.generateShareableUrl());
    let showShareDialog = $state(false);
    let copySuccess = $state(false);

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            copySuccess = true;
            setTimeout(() => copySuccess = false, 2000);
        } catch (err) {
            console.warn('Failed to copy to clipboard:', err);
        }
    }

    function exportConfiguration() {
        const config = configStore.exportConfiguration();
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `configuration-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
</script>

<div class="space-y-6">
    <!-- Configuration header -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Configuration Summary</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-primary-600">{configStore.selectedOptions.length}</div>
                <div class="text-sm text-gray-500">Options Selected</div>
            </div>

            <div class="text-center p-4 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-primary-600">{configStore.completionPercentage}%</div>
                <div class="text-sm text-gray-500">Complete</div>
            </div>

            <div class="text-center p-4 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold {configStore.isValid ? 'text-green-600' : 'text-red-600'}">
                    {configStore.isValid ? '✓' : '✗'}
                </div>
                <div class="text-sm text-gray-500">
                    {configStore.isValid ? 'Valid' : 'Has Errors'}
                </div>
            </div>
        </div>
    </div>

    <!-- Selected options -->
    {#if configStore.selectedOptions.length > 0}
        <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Selected Options</h3>

            <div class="space-y-4">
                {#each configStore.selectedOptions as option}
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex-1">
                            <div class="font-medium text-gray-900">{option.name}</div>
                            {#if option.description}
                                <div class="text-sm text-gray-500 mt-1">{option.description}</div>
                            {/if}
                            {#if configStore.selections[option.id] > 1}
                                <div class="text-sm text-gray-600 mt-1">
                                    Quantity: {configStore.selections[option.id]}
                                </div>
                            {/if}
                        </div>

                        <div class="text-right">
                            <div class="font-medium text-gray-900">
                                ${(option.base_price * configStore.selections[option.id]).toFixed(2)}
                            </div>
                            {#if configStore.selections[option.id] > 1}
                                <div class="text-sm text-gray-500">
                                    ${option.base_price.toFixed(2)} each
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Validation status -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Validation Status</h3>
        <ValidationDisplay />
    </div>

    <!-- Pricing -->
    <PricingDisplay detailed={true} />

    <!-- Actions -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Actions</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
                    type="button"
                    class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    onclick={() => showShareDialog = true}
            >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Configuration
            </button>

            <button
                    type="button"
                    class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    onclick={exportConfiguration}
            >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Configuration
            </button>

            <button
                    type="button"
                    class="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                    onclick={() => configStore.saveConfiguration()}
                    disabled={!configStore.isValid}
            >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Configuration
            </button>

            <button
                    type="button"
                    class="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                    disabled={!configStore.isValid}
            >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H3m4 10v6a1 1 0 001 1h6a1 1 0 001-1v-6m-8 0V9a1 1 0 011-1h6a1 1 0 011 1v4.01" />
                </svg>
                Request Quote
            </button>
        </div>
    </div>
</div>

<!-- Share dialog -->
{#if showShareDialog}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick={() => showShareDialog = false}>
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" onclick={(e) => e.stopPropagation()}>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Share Configuration</h3>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Shareable Link
                    </label>
                    <div class="flex">
                        <input
                                type="text"
                                value={shareableUrl}
                                readonly
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm bg-gray-50"
                        />
                        <button
                                type="button"
                                class="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors text-sm"
                                onclick={() => copyToClipboard(shareableUrl)}
                        >
                            {copySuccess ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                <div class="flex justify-end space-x-3">
                    <button
                            type="button"
                            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            onclick={() => showShareDialog = false}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}