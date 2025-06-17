<!-- web/src/lib/ConfiguratorApp.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';
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
    apiUrl = '/api/v1',
    embedMode = false,
    onComplete = null,
    onConfigurationChange = null,
    onError = null,
    configurationId = null
  } = $props();

  const dispatch = createEventDispatcher();

  let mounted = $state(false);
  let showValidationPanel = $state(false);
  let autoSaveEnabled = $state(true);
  let autoSaveInterval = null;

  const steps = [
    { id: 'configure', label: 'Configure', icon: '⚙️' },
    { id: 'validate', label: 'Validate', icon: '✅' },
    { id: 'price', label: 'Price', icon: '💰' },
    { id: 'summary', label: 'Summary', icon: '📋' }
  ];

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
    if (autoSaveEnabled) {
      autoSaveInterval = setInterval(() => {
        if (configStore.isDirty) {
          configStore.saveConfiguration();
        }
      }, 30000); // Every 30 seconds
    }

    // Watch for configuration changes
    const unsubscribe = $effect.root(() => {
      $effect(() => {
        if (onConfigurationChange && configStore.selectedCount > 0) {
          onConfigurationChange(configStore.exportConfiguration());
        }
      });

      $effect(() => {
        if (onError && configStore.error) {
          onError(new Error(configStore.error));
          dispatch('error', { message: configStore.error });
        }
      });
    });

    return () => {
      unsubscribe();
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  });

  onDestroy(() => {
    // Save on unmount if dirty
    if (configStore.isDirty) {
      configStore.saveConfiguration();
    }
  });

  async function handleComplete() {
    // Final validation and save
    await configStore.validateConfiguration();

    if (!configStore.isValid) {
      configStore.error = 'Please resolve all validation issues before completing';
      return;
    }

    await configStore.saveConfiguration();

    const config = configStore.exportConfiguration();
    dispatch('complete', config);
    onComplete?.(config);
  }

  function nextStep() {
    if (configStore.canProceedToStep(configStore.currentStep + 1)) {
      configStore.nextStep();
    } else {
      // Show why we can't proceed
      if (configStore.currentStep === 0 && configStore.selectedCount === 0) {
        configStore.error = 'Please select at least one option';
      } else if (configStore.currentStep === 1 && !configStore.isValid) {
        configStore.error = 'Please resolve validation issues';
      }
    }
  }

  function prevStep() {
    configStore.previousStep();
  }

  function goToStep(index) {
    configStore.goToStep(index);
  }

  function toggleValidationPanel() {
    showValidationPanel = !showValidationPanel;
  }

  // Expose store methods to parent
  export const store = configStore;
</script>

<div class="configurator-app {embedMode ? 'embed-mode' : 'standalone-mode'}" data-theme={theme}>
  <ErrorBoundary>
    {#if configStore.isLoading && !mounted}
      <div class="loading-container">
        <LoadingSpinner size="large" message="Loading configuration model..." />
      </div>
    {:else if configStore.error && !configStore.model}
      <div class="error-container">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h2>Configuration Error</h2>
          <p>{configStore.error}</p>
          <button onclick={() => location.reload()} class="btn btn-primary">
            Reload Page
          </button>
        </div>
      </div>
    {:else if mounted && configStore.model}
      <div class="configurator-container">
        <!-- Header -->
        <header class="configurator-header">
          <div class="header-content">
            <h1>{configStore.model.name}</h1>
            {#if configStore.model.description}
              <p class="model-description">{configStore.model.description}</p>
            {/if}
          </div>

          <div class="header-actions">
            {#if configStore.hasViolations}
              <button
                      class="validation-indicator warning"
                      onclick={toggleValidationPanel}
                      title="View validation issues"
              >
                ⚠️ {configStore.validationResults?.violations?.length || 0} Issues
              </button>
            {/if}

            {#if configStore.isSaving}
              <span class="save-indicator">
                <LoadingSpinner size="small" /> Saving...
              </span>
            {:else if configStore.lastSaved}
              <span class="save-indicator saved">
                ✅ Saved {new Date(configStore.lastSaved).toLocaleTimeString()}
              </span>
            {/if}
          </div>
        </header>

        <!-- Progress Indicator -->
        <ProgressIndicator
                {steps}
                currentStep={configStore.currentStep}
                onStepClick={goToStep}
                canNavigate={true}
        />

        <!-- Main Content -->
        <div class="configurator-content">
          {#if configStore.currentStep === 0}
            <!-- Configuration Step -->
            <div class="configuration-step">
              <div class="step-header">
                <h2>Select Your Options</h2>
                <p>Choose from the available options below. Required selections are marked with *</p>
              </div>

              {#if configStore.safeGroups.length > 0}
                <div class="groups-container">
                  {#each configStore.safeGroups as group (group.id)}
                    <OptionGroup
                            {group}
                            options={configStore.safeOptions.filter(o => o.group_id === group.id)}
                            selections={configStore.selections}
                            availableOptions={configStore.availableOptions}
                            onSelectionChange={(optionId, quantity) => configStore.updateSelection(optionId, quantity)}
                            expanded={configStore.isGroupExpanded(group.id)}
                            onToggle={() => configStore.toggleGroup(group.id)}
                    />
                  {/each}
                </div>
              {:else if configStore.isLoading}
                <div class="loading-state">
                  <LoadingSpinner size="medium" message="Loading options..." />
                </div>
              {:else}
                <div class="empty-state">
                  <p>No option groups available for this model.</p>
                </div>
              {/if}

              <div class="step-actions">
                <div class="selection-summary">
                  <span>{configStore.selectedCount} options selected</span>
                  {#if configStore.progress > 0}
                    <span class="progress-text">{Math.round(configStore.progress)}% complete</span>
                  {/if}
                </div>
                <button
                        onclick={nextStep}
                        disabled={configStore.selectedCount === 0}
                        class="btn btn-primary"
                >
                  Continue to Validation
                </button>
              </div>
            </div>

          {:else if configStore.currentStep === 1}
            <!-- Validation Step -->
            <div class="validation-step">
              <div class="step-header">
                <h2>Configuration Validation</h2>
                <p>Review and resolve any configuration issues</p>
              </div>

              <ValidationDisplay
                      validationResults={configStore.validationResults}
                      onFix={(suggestion) => {
                  // Apply fix suggestion
                  if (suggestion.action === 'add') {
                    configStore.updateSelection(suggestion.option_id, suggestion.quantity || 1);
                  } else if (suggestion.action === 'remove') {
                    configStore.updateSelection(suggestion.option_id, 0);
                  }
                }}
              />

              {#if configStore.isValidating}
                <div class="validation-loading">
                  <LoadingSpinner size="small" message="Validating configuration..." />
                </div>
              {/if}

              <div class="step-actions">
                <button onclick={prevStep} class="btn btn-secondary">
                  Back
                </button>
                <button
                        onclick={nextStep}
                        disabled={!configStore.isValid}
                        class="btn btn-primary"
                >
                  {configStore.isValid ? 'Continue to Pricing' : 'Resolve Issues First'}
                </button>
              </div>
            </div>

          {:else if configStore.currentStep === 2}
            <!-- Pricing Step -->
            <div class="pricing-step">
              <div class="step-header">
                <h2>Pricing Details</h2>
                <p>Review your configuration pricing</p>
              </div>

              <PricingDisplay
                      pricingData={configStore.pricingData}
                      selections={configStore.selections}
                      options={configStore.options}
                      volumeTiers={configStore.volumeTiers}
                      detailed={true}
              />

              {#if configStore.isPricing}
                <div class="pricing-loading">
                  <LoadingSpinner size="small" message="Calculating pricing..." />
                </div>
              {/if}

              <div class="step-actions">
                <button onclick={prevStep} class="btn btn-secondary">
                  Back
                </button>
                <button onclick={nextStep} class="btn btn-primary">
                  Continue to Summary
                </button>
              </div>
            </div>

          {:else if configStore.currentStep === 3}
            <!-- Summary Step -->
            <div class="summary-step">
              <div class="step-header">
                <h2>Configuration Summary</h2>
                <p>Review your complete configuration</p>
              </div>

              <ConfigurationSummary
                      configuration={configStore.exportConfiguration()}
                      model={configStore.model}
                      onEdit={(step) => goToStep(step)}
              />

              <div class="step-actions">
                <button onclick={prevStep} class="btn btn-secondary">
                  Back
                </button>
                <button
                        onclick={handleComplete}
                        class="btn btn-success"
                        disabled={configStore.isSaving}
                >
                  {configStore.isSaving ? 'Saving...' : 'Complete Configuration'}
                </button>
              </div>
            </div>
          {/if}
        </div>

        <!-- Validation Panel (Slide-out) -->
        {#if showValidationPanel && configStore.hasViolations}
          <div class="validation-panel" class:open={showValidationPanel}>
            <div class="panel-header">
              <h3>Validation Issues</h3>
              <button class="close-btn" onclick={() => showValidationPanel = false}>×</button>
            </div>
            <ValidationDisplay
                    validationResults={configStore.validationResults}
                    compact={true}
                    onFix={(suggestion) => {
                if (suggestion.action === 'add') {
                  configStore.updateSelection(suggestion.option_id, suggestion.quantity || 1);
                } else if (suggestion.action === 'remove') {
                  configStore.updateSelection(suggestion.option_id, 0);
                }
                showValidationPanel = false;
              }}
            />
          </div>
        {/if}

        <!-- Sidebar (desktop only) -->
        {#if !embedMode}
          <aside class="configurator-sidebar">
            <div class="sidebar-section">
              <h3>Quick Summary</h3>

              <div class="summary-item">
                <span>Selected Options</span>
                <strong>{configStore.selectedCount}</strong>
              </div>

              <div class="summary-item">
                <span>Total Price</span>
                <strong class="price">${configStore.totalPrice.toFixed(2)}</strong>
              </div>

              {#if configStore.discounts.length > 0}
                <div class="summary-item discount">
                  <span>Discounts Applied</span>
                  <strong>{configStore.discounts.length}</strong>
                </div>
              {/if}

              <div class="summary-item status">
                <span>Status</span>
                <strong class:valid={configStore.isValid} class:invalid={!configStore.isValid}>
                  {configStore.isValid ? '✅ Valid' : '⚠️ Issues'}
                </strong>
              </div>
            </div>

            {#if configStore.selectedCount > 0}
              <div class="sidebar-section">
                <h3>Selected Items</h3>
                <div class="selected-items">
                  {#each Object.entries(configStore.selections) as [optionId, quantity]}
                    {@const option = configStore.safeOptions.find(o => o.id === optionId)}
                    {#if option && quantity > 0}
                      <div class="selected-item">
                        <span class="item-name">{option.name}</span>
                        <span class="item-quantity">×{quantity}</span>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}
          </aside>
        {/if}
      </div>
    {/if}
  </ErrorBoundary>
</div>

<style>
  .configurator-app {
    width: 100%;
    min-height: 100vh;
    background: var(--bg-primary, #ffffff);
    color: var(--text-primary, #111827);
    font-family: system-ui, -apple-system, sans-serif;
  }

  .embed-mode {
    min-height: auto;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 8px;
  }

  .loading-container,
  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    padding: 2rem;
  }

  .error-content {
    text-align: center;
    max-width: 400px;
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .configurator-container {
    display: flex;
    min-height: 100vh;
    position: relative;
  }

  .embed-mode .configurator-container {
    min-height: 600px;
  }

  .configurator-header {
    position: sticky;
    top: 0;
    background: var(--bg-primary, #ffffff);
    border-bottom: 1px solid var(--border-color, #e5e7eb);
    padding: 1.5rem 2rem;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .header-content h1 {
    margin: 0 0 0.25rem;
    font-size: 1.875rem;
    font-weight: 700;
  }

  .model-description {
    margin: 0;
    color: var(--text-secondary, #6b7280);
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .validation-indicator {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: none;
    background: var(--warning-bg, #fef3c7);
    color: var(--warning-text, #92400e);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .validation-indicator:hover {
    background: var(--warning-hover, #fde68a);
  }

  .save-indicator {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .save-indicator.saved {
    color: var(--success-text, #059669);
  }

  .configurator-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .configurator-sidebar {
    width: 320px;
    background: var(--bg-secondary, #f9fafb);
    border-left: 1px solid var(--border-color, #e5e7eb);
    padding: 2rem;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .embed-mode .configurator-sidebar {
    display: none;
  }

  .step-header {
    margin-bottom: 2rem;
  }

  .step-header h2 {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .step-header p {
    margin: 0;
    color: var(--text-secondary, #6b7280);
  }

  .groups-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .step-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color, #e5e7eb);
  }

  .selection-summary {
    display: flex;
    gap: 1rem;
    align-items: center;
    color: var(--text-secondary, #6b7280);
  }

  .progress-text {
    font-weight: 500;
    color: var(--primary-color, #3b82f6);
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1rem;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--primary-color, #3b82f6);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--primary-hover, #2563eb);
  }

  .btn-secondary {
    background: var(--bg-secondary, #f3f4f6);
    color: var(--text-primary, #111827);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--bg-tertiary, #e5e7eb);
  }

  .btn-success {
    background: var(--success-color, #10b981);
    color: white;
  }

  .btn-success:hover:not(:disabled) {
    background: var(--success-hover, #059669);
  }

  .validation-panel {
    position: fixed;
    right: -400px;
    top: 0;
    width: 400px;
    height: 100vh;
    background: var(--bg-primary, #ffffff);
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease;
    z-index: 100;
    overflow-y: auto;
  }

  .validation-panel.open {
    right: 0;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
  }

  .panel-header h3 {
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary, #6b7280);
  }

  .sidebar-section {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
  }

  .sidebar-section:last-child {
    border-bottom: none;
  }

  .sidebar-section h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
  }

  .summary-item strong {
    font-weight: 600;
  }

  .summary-item.status .valid {
    color: var(--success-text, #059669);
  }

  .summary-item.status .invalid {
    color: var(--error-text, #dc2626);
  }

  .price {
    color: var(--primary-color, #3b82f6);
    font-size: 1.125rem;
  }

  .selected-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .selected-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: var(--bg-primary, #ffffff);
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .item-quantity {
    font-weight: 500;
    color: var(--text-secondary, #6b7280);
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary, #6b7280);
  }

  .loading-state {
    display: flex;
    justify-content: center;
    padding: 3rem;
  }

  @media (max-width: 1024px) {
    .configurator-sidebar {
      display: none;
    }

    .configurator-content {
      max-width: 100%;
    }
  }

  @media (max-width: 640px) {
    .configurator-header {
      flex-direction: column;
      gap: 1rem;
    }

    .header-actions {
      width: 100%;
      justify-content: space-between;
    }

    .configurator-content {
      padding: 1rem;
    }

    .validation-panel {
      width: 100%;
      right: -100%;
    }
  }
</style>