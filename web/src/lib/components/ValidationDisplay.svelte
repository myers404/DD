<!-- src/lib/components/ValidationDisplay.svelte -->
<script>
    import { configStore } from '../stores/configuration.svelte.js';

    let { showSuggestions = true } = $props();

    let criticalErrors = $derived(
        configStore.validationResults.filter(error => error.severity === 'error' || error.level === 'error')
    );

    let warnings = $derived(
        configStore.validationResults.filter(error => error.severity === 'warning' || error.level === 'warning')
    );

    let suggestions = $derived(
        configStore.validationResults.filter(error => error.severity === 'info' || error.level === 'suggestion')
    );
</script>

{#if configStore.validationResults.length > 0}
    <div class="space-y-3">
        <!-- Critical errors -->
        {#if criticalErrors.length > 0}
            <div class="rounded-md bg-red-50 p-4 border border-red-200">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">
                            Configuration Errors ({criticalErrors.length})
                        </h3>
                        <div class="mt-2 text-sm text-red-700">
                            <ul class="space-y-1">
                                {#each criticalErrors as error}
                                    <li>• {error.message}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Warnings -->
        {#if warnings.length > 0}
            <div class="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-yellow-800">
                            Warnings ({warnings.length})
                        </h3>
                        <div class="mt-2 text-sm text-yellow-700">
                            <ul class="space-y-1">
                                {#each warnings as warning}
                                    <li>• {warning.message}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Suggestions -->
        {#if showSuggestions && suggestions.length > 0}
            <div class="rounded-md bg-blue-50 p-4 border border-blue-200">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-blue-800">
                            Suggestions ({suggestions.length})
                        </h3>
                        <div class="mt-2 text-sm text-blue-700">
                            <ul class="space-y-1">
                                {#each suggestions as suggestion}
                                    <li>• {suggestion.message}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
{:else if configStore.isValidating}
    <div class="text-center py-4">
        <div class="animate-spin w-6 h-6 border-2 border-gray-300 border-t-primary-600 rounded-full mx-auto"></div>
        <p class="mt-2 text-sm text-gray-500">Validating configuration...</p>
    </div>
{:else}
    <div class="rounded-md bg-green-50 p-4 border border-green-200">
        <div class="flex">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">
                    Configuration Valid
                </h3>
                <div class="mt-2 text-sm text-green-700">
                    <p>Your configuration meets all requirements and constraints.</p>
                </div>
            </div>
        </div>
    </div>
{/if}