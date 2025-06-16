<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { configStore } from './stores/configuration.svelte.js';
  import ProgressIndicator from './components/ProgressIndicator.svelte';
  import LoadingSpinner from './components/LoadingSpinner.svelte';
  import ErrorBoundary from './components/ErrorBoundary.svelte';
  import OptionGroup from './components/OptionGroup.svelte';
  import PricingDisplay from './components/PricingDisplay.svelte';
  import ValidationDisplay from './components/ValidationDisplay.svelte';
  import ConfigurationSummary from './components/ConfigurationSummary.svelte';

  let {
    modelId,
    theme = 'light',
    apiUrl = 'http://localhost:8080/api/v1',
    embedMode = false,
    onComplete = null,
    onConfigurationChange = null,
    onError = null
  } = $props();

  const dispatch = createEventDispatcher();

  let retryCount = $state(0);
  let isCompact = $state(embedMode);

  // Set API URL globally
  if (typeof window !== 'undefined') {
    window.__API_BASE_URL__ = apiUrl;
  }

  onMount(() => {
    // Initialize the store effects (must be done in component context)
    configStore.initialize();

    configStore.setModelId(modelId);

    // Set up theme
    document.documentElement.setAttribute('data-theme', theme);

    // Handle embed mode
    if (embedMode) {
      setupEmbedMode();
    }
  });

  function setupEmbedMode() {
    // Listen for parent window messages
    window.addEventListener('message', handleParentMessage);

    // Send ready signal to parent
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'cpq-configurator-ready',
        modelId
      }, '*');
    }

    // Auto-resize for iframe
    const resizeObserver = new ResizeObserver(() => {
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'cpq-configurator-resize',
          height: document.body.scrollHeight
        }, '*');
      }
    });

    resizeObserver.observe(document.body);
  }

  function handleParentMessage(event) {
    const { type, data } = event.data;

    switch (type) {
      case 'cpq-set-theme':
        theme = data.theme;
        document.documentElement.setAttribute('data-theme', theme);
        break;

      case 'cpq-load-configuration':
        if (data.config) {
          configStore.loadFromShareableUrl(data.config);
        }
        break;

      case 'cpq-get-configuration':
        window.parent.postMessage({
          type: 'cpq-configuration-data',
          configuration: configStore.exportConfiguration()
        }, '*');
        break;
    }
  }

  function handleRetry() {
    retryCount++;
    configStore.reset();
    configStore.setModelId(modelId);
  }

  function handleComplete() {
    const configuration = configStore.exportConfiguration();

    // Call callback if provided
    if (onComplete) {
      onComplete(configuration);
    }

    // Dispatch event
    dispatch('complete', configuration);

    // Send to parent if embedded
    if (embedMode && window.parent !== window) {
      window.parent.postMessage({
        type: 'cpq-configuration-complete',
        configuration
      }, '*');
    }
  }

  // Watch for configuration changes
  $effect(() => {
    if (onConfigurationChange) {
      onConfigurationChange(configStore.exportConfiguration());
    }

    if (embedMode && window.parent !== window) {
      window.parent.postMessage({
        type: 'cpq-configuration-change',
        configuration: configStore.exportConfiguration()
      }, '*');
    }
  });

  // Watch for errors
  $effect(() => {
    if (configStore.error && onError) {
      onError(configStore.error);
    }
  });
</script>

<div class="cpq-configurator {embedMode ? 'cpq-embed-mode' : ''} {isCompact ? 'cpq-compact' : ''}" data-theme={theme}>
  {#if configStore.error}
    <ErrorBoundary
            error={configStore.error}
            context="Configurator"
            {retryCount}
            on:retry={handleRetry}
    />
  {:else if configStore.isLoading}
    <LoadingSpinner size="lg" message="Loading configurator..." />
  {:else if configStore.model}

    <!-- Compact header for embed mode -->
    {#if embedMode}
      <div class="cpq-embed-header bg-white border-b border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-semibold text-gray-900">{configStore.model.name}</h1>
            <div class="text-sm text-gray-500">
              Step {configStore.currentStep + 1} of 4 • {configStore.completionPercentage}% complete
            </div>
          </div>

          <div class="text-right">
            <div class="text-lg font-bold text-primary-600">
              ${configStore.totalPrice.toFixed(2)}
            </div>
            {#if configStore.validationResults.length > 0}
              <div class="text-sm text-red-500">
                {configStore.validationResults.length} issues
              </div>
            {:else if configStore.selectedOptions.length > 0}
              <div class="text-sm text-green-600">Valid</div>
            {/if}
          </div>
        </div>

        <!-- Compact progress -->
        <div class="mt-3">
          <div class="bg-gray-200 rounded-full h-2">
            <div
                    class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style="width: {configStore.completionPercentage}%"
            ></div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Full header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{configStore.model.name}</h1>
            {#if configStore.model.description}
              <p class="mt-1 text-gray-600">{configStore.model.description}</p>
            {/if}
          </div>

          <div class="text-right">
            <div class="text-sm text-gray-500">Progress</div>
            <div class="text-lg font-semibold text-primary-600">
              {configStore.completionPercentage}%
            </div>
          </div>
        </div>

        <ProgressIndicator />
      </div>
    {/if}

    <!-- Main content -->
    <div class="{embedMode ? 'cpq-embed-content' : 'cpq-full-content'}">

      {#if configStore.currentStep === 0}
        <!-- Product overview -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Product Overview</h2>

          <div class="space-y-4">
            {#if configStore.model.specifications}
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">Specifications</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  {#each Object.entries(configStore.model.specifications) as [key, value]}
                    <div>
                      <span class="text-gray-500">{key}:</span>
                      <span class="ml-2 text-gray-900">{value}</span>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <div class="pt-4">
              <button
                      type="button"
                      class="bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
                      onclick={() => configStore.nextStep()}
              >
                Start Configuring
              </button>
            </div>
          </div>
        </div>

      {:else if configStore.currentStep === 1}
        <!-- Option selection -->
        <div class="space-y-6">
          {#if configStore.model.option_groups && configStore.model.option_groups.length > 0}
            {#each configStore.model.option_groups as group}
              <div class="bg-white rounded-lg border border-gray-200 p-6">
                <OptionGroup {group} />
              </div>
            {/each}
          {:else}
            <div class="text-center py-8 text-gray-500">
              No configuration options available.
            </div>
          {/if}

          <!-- Validation -->
          {#if configStore.validationResults.length > 0 || configStore.isValidating}
            <div class="bg-white rounded-lg border border-gray-200 p-6">
              <ValidationDisplay />
            </div>
          {/if}
        </div>

      {:else if configStore.currentStep === 2}
        <!-- Review -->
        <ConfigurationSummary />

      {:else if configStore.currentStep === 3}
        <!-- Complete -->
        <div class="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>

          <h2 class="text-2xl font-bold text-gray-900 mb-2">Configuration Complete!</h2>
          <p class="text-gray-600 mb-6">Your product configuration has been finalized.</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
                    type="button"
                    class="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
                    onclick={handleComplete}
            >
              Get Quote
            </button>

            <button
                    type="button"
                    class="border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
                    onclick={() => configStore.goToStep(1)}
            >
              Modify
            </button>
          </div>
        </div>
      {/if}

      <!-- Navigation -->
      <div class="mt-6 flex justify-between">
        <button
                type="button"
                class="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors
                 {configStore.currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                onclick={() => configStore.previousStep()}
                disabled={configStore.currentStep === 0}
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {#if configStore.currentStep < 3}
          <button
                  type="button"
                  class="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors
                   {!configStore.canProceedToNextStep ? 'opacity-50 cursor-not-allowed' : ''}"
                  onclick={() => configStore.nextStep()}
                  disabled={!configStore.canProceedToNextStep}
          >
            {configStore.currentStep === 2 ? 'Complete' : 'Next'}
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        {/if}
      </div>
    </div>

    <!-- Sidebar for full mode -->
    {#if !embedMode}
      <div class="cpq-sidebar">
        <div class="sticky top-8 space-y-6">
          <PricingDisplay />

          <div class="bg-white rounded-lg border border-gray-200 p-4">
            <h3 class="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div class="space-y-2">
              <button
                      type="button"
                      class="w-full text-left text-sm text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-50"
                      onclick={() => configStore.clearSelections()}
              >
                Clear All
              </button>
              <button
                      type="button"
                      class="w-full text-left text-sm text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-50"
                      onclick={() => configStore.saveConfiguration()}
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}

  {:else}
    <div class="text-center py-12">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Model Not Found</h2>
      <p class="text-gray-600">The requested model could not be found.</p>
    </div>
  {/if}
</div>

<style>
  .cpq-configurator {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.5;
  }

  .cpq-full-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
  }

  .cpq-embed-mode .cpq-full-content {
    display: block;
  }

  .cpq-embed-content {
    padding: 1rem;
  }

  .cpq-compact {
    max-height: 600px;
    overflow-y: auto;
  }

  @media (max-width: 1024px) {
    .cpq-full-content {
      grid-template-columns: 1fr;
    }
  }
</style>