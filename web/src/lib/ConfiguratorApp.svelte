<!-- web/src/lib/ConfiguratorApp.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { configStore } from './stores/configuration.svelte.js';
  import ProgressIndicator from './components/ProgressIndicator.svelte';
  import LoadingSpinner from './components/LoadingSpinner.svelte';
  import ErrorBoundary from './components/ErrorBoundary.svelte';
  import OptionGroup from './components/OptionGroup.svelte';
  import PricingDisplay from './components/PricingDisplay.svelte';
  import ValidationDisplay from './components/ValidationDisplay.svelte';
  import ConfigurationSummary from './components/ConfigurationSummary.svelte';
  import NetworkStatus from './components/NetworkStatus.svelte';
  import UndoRedo from './components/UndoRedo.svelte';

  let {
    modelId,
    theme = 'light',
    apiUrl = 'http://localhost:8080/api/v1',
    embedMode = false,
    onComplete = null,
    onConfigurationChange = null,
    onError = null
  } = $props();

  let mounted = false;
  let container;

  // Set API URL globally before anything else
  if (typeof window !== 'undefined') {
    window.__API_BASE_URL__ = apiUrl;
  }

  onMount(() => {
    mounted = true;

    // Initialize store with API URL first
    configStore.initialize(apiUrl);

    // Then set model ID after a tick to ensure proper initialization
    if (modelId) {
      setTimeout(() => {
        configStore.setModelId(modelId);
      }, 0);
    }

    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);

    // Set up event handlers
    if (onConfigurationChange) {
      const unsubscribe = $effect.root(() => {
        $effect(() => {
          if (configStore.isDirty && configStore.selections) {
            onConfigurationChange({
              selections: configStore.selections,
              validation: configStore.validationResults,
              pricing: configStore.pricingData
            });
          }
        });
      });

      return () => unsubscribe();
    }
  });

  onDestroy(() => {
    configStore.destroy();
  });

  function handleComplete() {
    const configuration = {
      modelId: configStore.modelId,
      selections: configStore.selections,
      pricing: configStore.pricingData,
      validation: configStore.validationResults
    };

    if (onComplete) {
      onComplete(configuration);
    }
  }

  function handleError(error) {
    console.error('Configuration error:', error);
    if (onError) {
      onError(error);
    }
  }

  function handleRetry() {
    configStore.clearError();
    configStore.loadModel();
  }

  $effect(() => {
    if (configStore.error) {
      handleError(configStore.error);
    }
  });
</script>

<div class="cpq-configurator" bind:this={container} class:embed-mode={embedMode} data-theme={theme}>
  <NetworkStatus />

  <ErrorBoundary error={configStore.error} onRetry={handleRetry}>
    {#snippet children()}
      <div class="configurator-content">
        {#if configStore.error && configStore.error.code === 'NOT_FOUND'}
          <div class="error-state">
            <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <h2>Model Not Found</h2>
            <p>The model with ID "{modelId}" could not be found.</p>
            <p class="error-details">Please check the model ID and try again.</p>
          </div>
        {:else if configStore.isLoading}
          <LoadingSpinner size="large" message="Loading configuration..." />
        {:else if configStore.model}
          <!-- Header with progress -->
          <div class="configurator-header">
            <div class="header-content">
              <h1 class="configurator-title">{configStore.model.name}</h1>
              {#if configStore.model.description}
                <p class="configurator-description">{configStore.model.description}</p>
              {/if}
            </div>

            <UndoRedo />
          </div>

          <ProgressIndicator
                  currentStep={configStore.currentStep}
                  completionPercentage={configStore.completionPercentage}
          />

          <!-- Main content -->
          <div class="configurator-body" class:compact={embedMode}>
            <!-- Options panel -->
            <div class="options-panel">
              {#if configStore.model.option_groups}
                {#each configStore.model.option_groups as group}
                  <OptionGroup {group} />
                {/each}
              {/if}
            </div>

            <!-- Sidebar -->
            <div class="sidebar-panel">
              <ValidationDisplay />
              <PricingDisplay detailed={!embedMode} />

              {#if configStore.completionPercentage === 100}
                <ConfigurationSummary />
              {/if}
            </div>
          </div>

          <!-- Actions -->
          <div class="configurator-actions">
            <button
                    type="button"
                    class="btn btn-secondary"
                    disabled={configStore.currentStep === 0}
                    onclick={() => configStore.previousStep()}
            >
              Previous
            </button>

            <div class="action-group">
              {#if configStore.isDirty}
              <span class="save-indicator">
                {#if configStore.lastSaved}
                  Last saved {new Date(configStore.lastSaved).toLocaleTimeString()}
                {:else}
                  Unsaved changes
                {/if}
              </span>
              {/if}

              <button
                      type="button"
                      class="btn btn-primary"
                      disabled={!configStore.canProceedToNextStep && configStore.currentStep < 3}
                      onclick={() => {
                if (configStore.currentStep === 3) {
                  handleComplete();
                } else {
                  configStore.nextStep();
                }
              }}
              >
                {configStore.currentStep === 3 ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        {:else}
          <div class="no-model">
            <p>No model selected</p>
          </div>
        {/if}
      </div>
    {/snippet}
  </ErrorBoundary>
</div>

<style>
  .cpq-configurator {
    --primary: #3b82f6;
    --primary-hover: #2563eb;
    --secondary: #6b7280;
    --success: #10b981;
    --warning: #f59e0b;
    --error: #ef4444;
    --bg: #ffffff;
    --bg-secondary: #f9fafb;
    --text: #111827;
    --text-secondary: #6b7280;
    --border: #e5e7eb;

    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .cpq-configurator[data-theme="dark"] {
    --bg: #111827;
    --bg-secondary: #1f2937;
    --text: #f9fafb;
    --text-secondary: #9ca3af;
    --border: #374151;
  }

  .embed-mode {
    min-height: auto;
  }

  .configurator-content {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
  }

  .configurator-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 2rem;
  }

  .configurator-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
  }

  .configurator-description {
    color: var(--text-secondary);
    margin: 0.5rem 0 0;
  }

  .configurator-body {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    margin: 2rem 0;
  }

  .configurator-body.compact {
    grid-template-columns: 1fr;
  }

  .options-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .sidebar-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: sticky;
    top: 2rem;
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
  }

  .configurator-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 2rem;
    border-top: 1px solid var(--border);
  }

  .action-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .save-indicator {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--primary);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  .btn-secondary {
    background: var(--bg-secondary);
    color: var(--text);
    border: 1px solid var(--border);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--border);
  }

  .no-model {
    text-align: center;
    padding: 4rem;
    color: var(--text-secondary);
  }

  .error-state {
    text-align: center;
    padding: 4rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .error-state .error-icon {
    width: 3rem;
    height: 3rem;
    color: var(--warning);
    margin: 0 auto 1rem;
  }

  .error-state h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
  }

  .error-state p {
    color: var(--text-secondary);
    margin: 0 0 0.5rem;
  }

  .error-state .error-details {
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .configurator-body {
      grid-template-columns: 1fr;
    }

    .sidebar-panel {
      position: static;
      max-height: none;
    }
  }
</style>