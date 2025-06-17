<!-- web/src/lib/ConfiguratorApp.svelte -->
<!-- Simplified: Just selections, live updates, and save -->
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
  let autoSaveInterval = null;

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

    // Setup auto-save
    autoSaveInterval = setInterval(() => {
      if (configStore.isDirty && configStore.configurationId) {
        configStore.saveConfiguration();
      }
    }, 30000); // Every 30 seconds
  });

  onDestroy(() => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
    }
  });

  // Debug: log pricing updates
  $effect(() => {
    if (configStore.pricingData) {
      console.log('Pricing updated:', configStore.pricingData);
    }
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
    if (configStore.isSaving) return; // Prevent double-clicks

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
          <button class="retry-button" on:click={retry}>
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
      <div class="configurator-layout">
        <!-- Header -->
        <div class="configurator-header">
          <div>
            <h1>{configStore.model.name}</h1>
            {#if configStore.model.description}
              <p>{configStore.model.description}</p>
            {/if}
          </div>
          <div class="header-actions">
            {#if configStore.configurationId}
              <span class="config-id">ID: {configStore.configurationId}</span>
            {/if}
            {#if configStore.lastSaved}
              <span class="last-saved">Saved {new Date(configStore.lastSaved).toLocaleTimeString()}</span>
            {/if}
          </div>
        </div>

        <!-- Main Content -->
        <div class="configurator-content">
          <!-- Left: Options -->
          <div class="options-panel">
            {#if configStore.isValidating}
              <div class="validating-indicator">
                <LoadingSpinner size="small" /> Checking availability...
              </div>
            {/if}

            {#if Array.isArray(configStore.groups) && configStore.groups.length > 0}
              <div class="groups-container">
                {#each configStore.groups as group (group.id)}
                  {@const groupOptions = Array.isArray(configStore.options)
                          ? configStore.options.filter(o => o.group_id === group.id)
                          : []}
                  <OptionGroup
                          {group}
                          options={groupOptions}
                          selections={configStore.selections || {}}
                          availableOptions={configStore.availableOptions || []}
                          onSelectionChange={(optionId, value) => configStore.updateSelection(optionId, value)}
                          expanded={configStore.isGroupExpanded(group.id)}
                          onToggle={() => configStore.toggleGroup(group.id)}
                  />
                {/each}
              </div>
            {:else}
              <div class="empty-state">
                <p>No option groups available for this model.</p>
              </div>
            {/if}
          </div>

          <!-- Right: Sidebar -->
          <div class="sidebar">
            <!-- Validation Display -->
            {#if configStore.validationResults && !configStore.isValid}
              <div class="sidebar-section validation-section">
                <ValidationDisplay
                        results={configStore.validationResults}
                        compact={true}
                />
              </div>
            {/if}

            <!-- Pricing Display -->
            <div class="sidebar-section">
              <PricingDisplay
                      pricing={configStore.pricingData}
                      isCalculating={configStore.isPricing}
                      selections={configStore.selections || {}}
                      options={configStore.options || []}
              />
            </div>

            <!-- Save Button -->
            <div class="sidebar-actions">
              <button
                      class="save-button"
                      on:click={handleSave}
                      disabled={configStore.isSaving || !configStore.isValid || configStore.selectedCount === 0}
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
    background-color: #f9fafb;
  }

  .configurator-app.embed-mode {
    min-height: auto;
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

  .configurator-layout {
    max-width: 1280px;
    margin: 0 auto;
    padding: 24px;
  }

  .configurator-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 32px;
  }

  .configurator-header h1 {
    margin: 0 0 8px 0;
    font-size: 32px;
    color: #111827;
  }

  .configurator-header p {
    margin: 0;
    font-size: 18px;
    color: #6b7280;
  }

  .header-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    font-size: 14px;
    color: #6b7280;
  }

  .config-id {
    font-family: monospace;
  }

  .configurator-content {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 24px;
    align-items: start;
  }

  .options-panel {
    background: white;
    border-radius: 12px;
    padding: 24px;
    min-height: 600px;
  }

  .validating-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background-color: #fef3c7;
    border-radius: 6px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #92400e;
  }

  .groups-container {
    /* Groups stack vertically with spacing handled by OptionGroup */
  }

  .empty-state {
    text-align: center;
    padding: 80px 40px;
    color: #6b7280;
  }

  .sidebar {
    position: sticky;
    top: 24px;
  }

  .sidebar-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .validation-section {
    border: 2px solid #fbbf24;
    background-color: #fffbeb;
  }

  .sidebar-actions {
    margin-top: 16px;
  }

  .save-button {
    width: 100%;
    background-color: #10b981;
    color: white;
    border: none;
    padding: 16px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .save-button:hover:not(:disabled) {
    background-color: #059669;
  }

  .save-button:disabled {
    background-color: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .unsaved-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
    font-size: 14px;
    color: #6b7280;
  }

  .unsaved-dot {
    width: 8px;
    height: 8px;
    background-color: #fbbf24;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .configurator-content {
      grid-template-columns: 1fr;
    }

    .sidebar {
      position: static;
      order: -1;
    }

    .configurator-header {
      flex-direction: column;
      gap: 16px;
    }

    .header-actions {
      align-items: flex-start;
    }
  }
</style>