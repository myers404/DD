<!-- web/src/lib/ConfiguratorApp.svelte -->
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
    apiUrl = '/api/v1',
    embedMode = false,
    onComplete = null,
    onConfigurationChange = null,
    onError = null
  } = $props();

  const dispatch = createEventDispatcher();

  let mounted = $state(false);
  let steps = $derived([
    { id: 'configure', label: 'Configure', icon: '⚙️' },
    { id: 'validate', label: 'Validate', icon: '✓' },
    { id: 'price', label: 'Price', icon: '💰' },
    { id: 'summary', label: 'Summary', icon: '📋' }
  ]);

  // Set API URL globally
  if (typeof window !== 'undefined') {
    window.__API_BASE_URL__ = apiUrl;
    console.log('Configurator initialized with API URL:', apiUrl);
  }

  onMount(() => {
    configStore.initialize();
    configStore.setModelId(modelId);
    mounted = true;

    // Set theme
    document.documentElement.setAttribute('data-theme', theme);

    // Watch for changes
    const unsubscribe = $effect.root(() => {
      $effect(() => {
        if (onConfigurationChange && Object.keys(configStore.selections).length > 0) {
          onConfigurationChange(configStore.exportConfiguration());
        }
      });

      $effect(() => {
        if (onError && configStore.error) {
          onError(configStore.error);
        }
      });
    });

    return () => {
      unsubscribe();
      configStore.reset();
    };
  });

  function handleComplete() {
    const config = configStore.exportConfiguration();
    dispatch('complete', config);
    onComplete?.(config);
  }

  function nextStep() {
    if (configStore.currentStep < steps.length - 1) {
      configStore.currentStep++;
    }
  }

  function prevStep() {
    if (configStore.currentStep > 0) {
      configStore.currentStep--;
    }
  }
</script>

<div class="configurator-app {embedMode ? 'embed-mode' : ''}" data-theme={theme}>
  <ErrorBoundary>
    {#if !mounted || configStore.isLoading}
      <LoadingSpinner message="Loading configuration..." />
    {:else if configStore.error && configStore.retryCount >= 3}
      <div class="error-container">
        <div class="error-message">
          <h3>Configuration Error</h3>
          <p>{configStore.error}</p>
          <button onclick={() => location.reload()} class="btn btn-primary">
            Reload Page
          </button>
        </div>
      </div>
    {:else}
      <div class="configurator-container">
        <!-- Progress indicator -->
        <ProgressIndicator
                steps={steps}
                currentStep={configStore.currentStep}
                completionPercentage={configStore.completionPercentage}
        />

        <!-- Main content -->
        <div class="configurator-content">
          {#if configStore.currentStep === 0}
            <!-- Configuration step -->
            <div class="configuration-step">
              <h2>Configure Your {configStore.model?.name || 'Product'}</h2>

              {#if configStore.model?.option_groups && Array.isArray(configStore.model.option_groups)}
                {@const hasAnyOptions = configStore.model.option_groups.some(g => g.options?.length > 0)}

                {#if hasAnyOptions}
                  <div class="option-groups">
                    {#each configStore.model.option_groups as group}
                      <OptionGroup {group} />
                    {/each}
                  </div>
                {:else}
                  <div class="no-options">
                    <h3>⚠️ No Options Found</h3>
                    <p>Groups exist but contain no options.</p>
                    <p class="help">Check console for API details or use the debug test page.</p>
                  </div>
                {/if}
              {:else}
                <div class="no-options">
                  <h3>⚠️ No Configuration Options Available</h3>
                  <p>The model has no option groups configured.</p>
                  <p class="help">Check the browser console for API response details.</p>
                </div>
              {/if}

              <div class="step-actions">
                <button
                        onclick={nextStep}
                        disabled={!configStore.canProceedToNextStep}
                        class="btn btn-primary"
                >
                  Continue to Validation
                </button>
              </div>
            </div>

          {:else if configStore.currentStep === 1}
            <!-- Validation step -->
            <div class="validation-step">
              <h2>Configuration Validation</h2>

              <ValidationDisplay />

              <div class="step-actions">
                <button onclick={prevStep} class="btn btn-secondary">
                  Back
                </button>
                <button
                        onclick={nextStep}
                        disabled={!configStore.isValid}
                        class="btn btn-primary"
                >
                  Continue to Pricing
                </button>
              </div>
            </div>

          {:else if configStore.currentStep === 2}
            <!-- Pricing step -->
            <div class="pricing-step">
              <h2>Pricing Details</h2>

              <PricingDisplay detailed={true} />

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
            <!-- Summary step -->
            <div class="summary-step">
              <h2>Configuration Summary</h2>

              <ConfigurationSummary />

              <div class="step-actions">
                <button onclick={prevStep} class="btn btn-secondary">
                  Back
                </button>
                <button onclick={handleComplete} class="btn btn-success">
                  Complete Configuration
                </button>
              </div>
            </div>
          {/if}
        </div>

        <!-- Sidebar (desktop only) -->
        {#if !embedMode}
          <aside class="configurator-sidebar">
            <div class="sidebar-section">
              <h3>Current Selection</h3>
              <div class="selected-items">
                {#each configStore.selectedOptions as option}
                  <div class="selected-item">
                    <span>{option.name}</span>
                    <span class="quantity">×{option.quantity}</span>
                  </div>
                {/each}
              </div>
            </div>

            <div class="sidebar-section">
              <h3>Pricing Summary</h3>
              <PricingDisplay />
            </div>

            {#if configStore.validationResults.length > 0}
              <div class="sidebar-section">
                <h3>Issues</h3>
                <ValidationDisplay compact={true} />
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--text-primary, #1a1a1a);
    background: var(--bg-primary, #ffffff);
    min-height: 100vh;
  }

  .configurator-app.embed-mode {
    min-height: auto;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 8px;
  }

  .error-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
  }

  .error-message {
    text-align: center;
    max-width: 400px;
  }

  .error-message h3 {
    color: var(--error-color, #dc2626);
    margin-bottom: 1rem;
  }

  .configurator-container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  @media (min-width: 1024px) {
    .configurator-container {
      grid-template-columns: 1fr 320px;
    }
  }

  .configurator-content {
    background: var(--bg-secondary, #f9fafb);
    border-radius: 8px;
    padding: 2rem;
  }

  .option-groups {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .no-options {
    padding: 3rem 2rem;
    text-align: center;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 8px;
    margin: 2rem 0;
  }

  .no-options h3 {
    color: var(--error-color, #dc2626);
    margin-bottom: 1rem;
  }

  .no-options p {
    color: var(--text-secondary, #6b7280);
    margin-bottom: 0.5rem;
  }

  .no-options .help {
    font-size: 0.875rem;
    color: var(--text-tertiary, #9ca3af);
  }

  .step-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color, #e5e7eb);
  }

  .configurator-sidebar {
    display: none;
  }

  @media (min-width: 1024px) {
    .configurator-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  }

  .sidebar-section {
    background: var(--bg-secondary, #f9fafb);
    border-radius: 8px;
    padding: 1.5rem;
  }

  .sidebar-section h3 {
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary, #6b7280);
    margin-bottom: 1rem;
  }

  .selected-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .selected-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
  }

  .quantity {
    color: var(--text-secondary, #6b7280);
  }

  /* Button styles */
  .btn {
    padding: 0.625rem 1.25rem;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
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
    background: var(--secondary-color, #e5e7eb);
    color: var(--text-primary, #1a1a1a);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--secondary-hover, #d1d5db);
  }

  .btn-success {
    background: var(--success-color, #10b981);
    color: white;
  }

  .btn-success:hover:not(:disabled) {
    background: var(--success-hover, #059669);
  }
</style>