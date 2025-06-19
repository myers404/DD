<!-- web/src/lib/ConfiguratorApp.svelte -->
<!-- Simplified design matching ConstraintTester style -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { configStore } from './stores/configuration.svelte.js';
  import LoadingSpinner from './components/LoadingSpinner.svelte';
  import ErrorBoundary from './components/ErrorBoundary.svelte';
  import OptionGroup from './components/OptionGroup.svelte';
  import PricingDisplay from './components/PricingDisplay.svelte';
  import ValidationDisplay from './components/ValidationDisplay.svelte';

  let {
    modelId,
    theme = 'light',
    apiUrl = '/api/v1',
    embedMode = false,
    onComplete = null,
    onConfigurationChange = null,
    onError = null,
    configurationId = null
  } = $props();

  const dispatch = createEventDispatcher();

  let mounted = $state(false);

  // Set API URL globally
  if (typeof window !== 'undefined') {
    window.__API_BASE_URL__ = apiUrl;
  }

  onMount(async () => {
    // Initialize store
    await configStore.initialize();

    // Set model ID
    configStore.setModelId(modelId);

    // Load existing configuration if provided
    if (configurationId) {
      await configStore.loadConfiguration(configurationId);
    }

    mounted = true;

    // Set theme
    document.documentElement.setAttribute('data-theme', theme);
  });

  // Watch for configuration changes
  $effect(() => {
    if (mounted && configStore.configuration && onConfigurationChange) {
      onConfigurationChange(configStore.exportConfiguration());
    }
  });

  // Watch for errors
  $effect(() => {
    if (configStore.error && onError) {
      onError(configStore.error);
    }
  });

  async function handleSave() {
    if (configStore.isSaving) return;

    const saved = await configStore.saveConfiguration();
    if (saved) {
      if (onComplete) {
        onComplete(configStore.exportConfiguration());
      }
      dispatch('complete', configStore.exportConfiguration());
    }
  }

  function retry() {
    configStore.error = null;
    configStore.loadModel();
  }
</script>

<div class="configurator-app" class:embed-mode={embedMode}>
  <ErrorBoundary>
    {#if !mounted}
      <div class="loading-container">
        <LoadingSpinner size="large" message="Initializing configurator..." />
      </div>
    {:else if configStore.error}
      <div class="error-container">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h2>Configuration Error</h2>
          <p>{configStore.error.message || 'Failed to load configuration'}</p>
          <button class="retry-button" onclick={retry}>
            Try Again
          </button>
        </div>
      </div>
    {:else if configStore.isLoading}
      <div class="loading-container">
        <LoadingSpinner size="large" message="Loading model..." />
      </div>
    {:else if !configStore.model}
      <div class="error-container">
        <div class="error-content">
          <h2>Model Not Found</h2>
          <p>The requested model could not be loaded.</p>
        </div>
      </div>
    {:else}
      <div class="configurator-container">
        <!-- Header -->
        <div class="header-card">
          <h2 class="model-title">{configStore.model.name}</h2>
          {#if configStore.model.description}
            <p class="model-description">{configStore.model.description}</p>
          {/if}
        </div>

        <div class="main-grid">
          <!-- Left Column: Option Groups -->
          <div class="options-column">
            <div class="card">
              <h3 class="section-title">Configuration Options</h3>
              
              {#if configStore.isValidating}
                <div class="validating-indicator">
                  <LoadingSpinner size="small" /> Checking constraints...
                </div>
              {/if}

              {#if Array.isArray(configStore.groups) && configStore.groups.length > 0}
                <div class="groups-container">
                  {#each configStore.groups.filter(g => g.is_active !== false) as group (group.id)}
                    {@const groupOptions = Array.isArray(configStore.options)
                            ? configStore.options.filter(o => o.group_id === group.id && o.is_active !== false)
                            : []}
                    <OptionGroup
                            {group}
                            options={groupOptions}
                            selections={configStore.selections || {}}
                            availableOptions={configStore.availableOptions || []}
                            onSelectionChange={(optionId, value) => configStore.updateSelection(optionId, value)}
                    />
                  {/each}
                </div>
              {:else}
                <div class="empty-state">
                  <p>No option groups available for this model.</p>
                </div>
              {/if}
            </div>
          </div>

          <!-- Middle Column: Validation Results -->
          <div class="validation-column">
            <div class="card">
              <h3 class="section-title">Constraint Validation</h3>
              <ValidationDisplay
                      validationResults={configStore.validationResults}
                      model={configStore.model}
              />
            </div>
          </div>

          <!-- Right Column: Pricing & Actions -->
          <div class="pricing-column">
            <div class="card">
              <h3 class="section-title">Configuration Summary</h3>
              
              <PricingDisplay
                      pricing={configStore.pricingData}
                      isCalculating={configStore.isPricing}
                      selections={configStore.selections || {}}
                      options={configStore.options || []}
              />

              <div class="actions-container">
                <button
                        class="save-button"
                        onclick={handleSave}
                        disabled={configStore.isSaving || !configStore.isValid || configStore.selectedCount === 0}
                        class:saving={configStore.isSaving}
                >
                  {#if configStore.isSaving}
                    <LoadingSpinner size="small" /> Saving...
                  {:else}
                    Save Configuration
                  {/if}
                </button>

                {#if configStore.isDirty}
                  <div class="unsaved-indicator">
                    <span class="unsaved-dot"></span>
                    Unsaved changes
                  </div>
                {/if}

                {#if configStore.lastSaved}
                  <div class="saved-info">
                    Last saved: {new Date(configStore.lastSaved).toLocaleTimeString()}
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </ErrorBoundary>
</div>

<style>
  .configurator-app {
    min-height: 100vh;
    background-color: #f3f4f6;
    padding: 24px;
  }

  .configurator-app.embed-mode {
    min-height: auto;
    padding: 0;
    background-color: white;
  }

  .loading-container,
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 40px;
  }

  .error-content {
    text-align: center;
    max-width: 400px;
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .error-content h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    color: #111827;
  }

  .error-content p {
    margin: 0 0 24px 0;
    color: #6b7280;
  }

  .retry-button {
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .retry-button:hover {
    background-color: #2563eb;
  }

  .configurator-container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .header-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
  }

  .model-title {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: 700;
    color: #111827;
  }

  .model-description {
    margin: 0;
    font-size: 16px;
    color: #6b7280;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
  }

  .card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
  }

  .section-title {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }

  .validating-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #fef3c7;
    border-radius: 6px;
    font-size: 14px;
    color: #92400e;
    margin-bottom: 16px;
  }

  .groups-container {
    display: flex;
    flex-direction: column;
  }

  .empty-state {
    text-align: center;
    padding: 32px;
    color: #6b7280;
  }

  .actions-container {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
  }

  .save-button {
    width: 100%;
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .save-button:hover:not(:disabled) {
    background-color: #2563eb;
  }

  .save-button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }

  .save-button.saving {
    background-color: #6b7280;
  }

  .unsaved-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    font-size: 14px;
    color: #f59e0b;
  }

  .unsaved-dot {
    width: 8px;
    height: 8px;
    background-color: #f59e0b;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  .saved-info {
    margin-top: 8px;
    font-size: 12px;
    color: #6b7280;
    text-align: center;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  /* Responsive layout */
  @media (max-width: 1024px) {
    .main-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .configurator-app {
      padding: 16px;
    }

    .header-card {
      padding: 16px;
    }

    .card {
      padding: 16px;
    }

    .model-title {
      font-size: 24px;
    }
  }
</style>