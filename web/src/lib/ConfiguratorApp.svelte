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
  let initialized = $state(false);

  // Set API URL globally
  if (typeof window !== 'undefined') {
    window.__API_BASE_URL__ = apiUrl;
  }

  onMount(() => {
    console.log('🚀 ConfiguratorApp mounting with modelId:', modelId);

    // Initialize the store effects (must be done in component context)
    configStore.initialize();

    // Only set modelId once during mount
    if (!initialized) {
      configStore.setModelId(modelId);
      initialized = true;
    }

    // Set up theme
    document.documentElement.setAttribute('data-theme', theme);

    // Handle embed mode
    if (embedMode) {
      setupEmbedMode();
    }
  });

  // Watch for modelId changes (but only after initial mount)
  $effect(() => {
    if (initialized && modelId !== configStore.modelId) {
      console.log('📝 ModelId prop changed, updating store:', modelId);
      configStore.setModelId(modelId);
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
          type: 'cpq-configuration-response',
          configuration: configStore.exportConfiguration()
        }, '*');
        break;
    }
  }

  function handleRetry() {
    retryCount++;
    configStore.loadModel();
  }

  function handleError(error) {
    console.error('ConfiguratorApp error:', error);
    if (onError) {
      onError(error);
    }

    // Send error to parent if embedded
    if (embedMode && window.parent !== window) {
      window.parent.postMessage({
        type: 'cpq-error',
        error: error.message
      }, '*');
    }
  }

  function handleConfigurationChange() {
    if (onConfigurationChange) {
      onConfigurationChange(configStore.exportConfiguration());
    }

    // Send to parent if embedded
    if (embedMode && window.parent !== window) {
      window.parent.postMessage({
        type: 'cpq-configuration-change',
        configuration: configStore.exportConfiguration()
      }, '*');
    }
  }

  function handleComplete() {
    const config = configStore.exportConfiguration();

    if (onComplete) {
      onComplete(config);
    }

    // Send to parent if embedded
    if (embedMode && window.parent !== window) {
      window.parent.postMessage({
        type: 'cpq-configuration-complete',
        configuration: config
      }, '*');
    }
  }

  // Watch for selection changes to trigger callbacks
  $effect(() => {
    if (initialized && Object.keys(configStore.selections).length > 0) {
      handleConfigurationChange();
    }
  });
</script>

<div
        class="cpq-configurator {embedMode ? 'cpq-embed-mode' : ''} {isCompact ? 'cpq-compact' : ''}"
        data-theme={theme}
>
  {#if configStore.error}
    <ErrorBoundary
            error={configStore.error}
            onRetry={handleRetry}
            retryCount={retryCount}
    />
  {:else if configStore.isLoading}
    <LoadingSpinner
            message="Loading product configuration..."
            size="large"
    />
  {:else if configStore.model}
    <!-- Progress indicator -->
    {#if !embedMode}
      <ProgressIndicator
              currentStep={configStore.currentStep}
              totalSteps={4}
              completionPercentage={configStore.completionPercentage}
      />
    {/if}

    <div class="grid grid-cols-1 {embedMode ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6">
      <!-- Options panel -->
      <div class="{embedMode ? 'col-span-1' : 'col-span-2'} space-y-6">
        {#if configStore.model.option_groups}
          {#each configStore.model.option_groups as group}
            <OptionGroup {group} />
          {/each}
        {/if}
      </div>

      <!-- Sidebar -->
      {#if !embedMode}
        <div class="space-y-6">
          <ValidationDisplay />
          <PricingDisplay detailed={true} />

          {#if configStore.completionPercentage >= 100}
            <ConfigurationSummary />
          {/if}
        </div>
      {:else}
        <!-- Compact pricing for embed mode -->
        <div class="mt-4">
          <PricingDisplay detailed={false} />
          <ValidationDisplay />
        </div>
      {/if}
    </div>

    <!-- Action buttons -->
    {#if !embedMode}
      <div class="mt-8 flex justify-between items-center">
        <button
                type="button"
                onclick={() => configStore.previousStep()}
                class="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors
                 {configStore.currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                disabled={configStore.currentStep === 0}
        >
          Previous
        </button>

        <button
                type="button"
                onclick={() => configStore.canProceedToNextStep ? handleComplete() : configStore.nextStep()}
                class="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors
                 {!configStore.canProceedToNextStep && configStore.currentStep === 3 ? 'opacity-50 cursor-not-allowed' : ''}"
                disabled={!configStore.canProceedToNextStep && configStore.currentStep === 3}
        >
          {configStore.currentStep === 3 ? 'Complete Configuration' : 'Next'}
        </button>
      </div>
    {/if}
  {:else}
    <LoadingSpinner
            message="Initializing configurator..."
            size="large"
    />
  {/if}
</div>