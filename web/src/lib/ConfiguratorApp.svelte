<!-- web/src/lib/ConfiguratorApp.svelte -->
<!-- Simplified CPQ UI with no animations and immediate feedback -->
<script>
  import { onMount } from 'svelte';
  import { configStore } from './stores/configuration.svelte.js';
  import { createConfigurationSessionStore } from './stores/configuration-session.svelte.js';
  import LoadingSpinner from './components/LoadingSpinner.svelte';
  import ErrorBoundary from './components/ErrorBoundary.svelte';
  import OptionGroup from './components/OptionGroup.svelte';
  import PricingDisplay from './components/PricingDisplay.svelte';
  import ValidationDisplay from './components/ValidationDisplay.svelte';
  import ProgressIndicator from './components/ProgressIndicator.svelte';
  import ConfigurationSummary from './components/ConfigurationSummary.svelte';
  
  let {
    modelId,
    theme = 'light',
    apiUrl = '/api/v1',
    embedMode = false,
    onComplete = null,
    configurationId = null,
    useSessionApi = false
  } = $props();
  
  let mounted = $state(false);
  
  // Choose store based on API version
  let store = useSessionApi ? createConfigurationSessionStore() : configStore;
  
  // Set API URL globally
  if (typeof window !== 'undefined') {
    window.__API_BASE_URL__ = apiUrl;
  }
  
  // Computed values - works with both stores
  const visibleGroups = $derived(
    Array.isArray(store.groups) 
      ? store.groups.filter(g => g.is_active !== false) 
      : []
  );
  const isComplete = $derived(store.isValid && store.selectedCount > 0);
  const sessionInfo = $derived(useSessionApi ? {
    status: store.sessionStatus,
    timeRemaining: store.sessionTimeRemaining,
    sessionId: store.sessionId
  } : null);
  
  // Debug logging
  $effect(() => {
    if (useSessionApi) {
      console.log('Session Store State:', {
        groups: store.groups,
        options: store.options,
        model: store.model,
        visibleGroups,
        sessionId: store.sessionId,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  onMount(async () => {
    if (useSessionApi) {
      // Initialize session-based store
      // Let the SessionApiClient determine the correct URL based on environment
      await store.initialize(modelId, {
        authToken: localStorage.getItem('auth_token')
      });
    } else {
      // Initialize regular store
      await store.initialize();
      store.setModelId(modelId);
      
      if (configurationId) {
        await store.loadConfiguration(configurationId);
      }
    }
    
    mounted = true;
    document.documentElement.setAttribute('data-theme', theme);
  });
  
  async function handleSave() {
    if (store.isSaving) return;
    
    if (useSessionApi) {
      // Complete session for session-based API
      await store.completeSession();
      if (onComplete) {
        onComplete({
          sessionId: store.sessionId,
          selections: store.selections,
          totalPrice: store.totalPrice,
          isValid: store.isValid
        });
      }
    } else {
      // Save configuration for regular API
      const saved = await store.saveConfiguration();
      if (saved && onComplete) {
        onComplete(store.exportConfiguration());
      }
    }
  }
  
  async function handleExtendSession() {
    if (useSessionApi && store.extendSession) {
      await store.extendSession(30);
    }
  }
  
  function retry() {
    store.error = null;
    if (useSessionApi) {
      store.initialize(modelId, {
        authToken: localStorage.getItem('auth_token')
      });
    } else {
      store.loadModel();
    }
  }
</script>

<div class="configurator-app" class:embed-mode={embedMode} data-theme={theme}>
  <ErrorBoundary>
    {#if !mounted}
      <div class="loading-state">
        <LoadingSpinner size="large" />
        <p>Initializing configurator...</p>
      </div>
    {:else if store.error}
      <div class="error-state">
        <h2>Unable to Load Configuration</h2>
        <p>{store.error.message || 'Something went wrong'}</p>
        <button class="btn-retry" onclick={retry}>Try Again</button>
      </div>
    {:else if store.isLoading}
      <div class="loading-state">
        <LoadingSpinner size="large" />
        <p>Loading configuration options...</p>
      </div>
    {:else if !store.model}
      <div class="error-state">
        <h2>Model Not Found</h2>
        <p>The requested configuration model could not be loaded.</p>
      </div>
    {:else}
      <div class="configurator-layout">
        <!-- Header -->
        <header class="configurator-header">
          <div class="header-content">
            <h1>{store.model.name}</h1>
            {#if store.model.description}
              <p class="model-description">{store.model.description}</p>
            {/if}
          </div>
          
          {#if sessionInfo}
            <div class="session-info">
              <span class="session-status {sessionInfo.status}">{sessionInfo.status}</span>
              {#if sessionInfo.timeRemaining}
                <span class="session-expiry">Expires in: {sessionInfo.timeRemaining}</span>
                {#if sessionInfo.timeRemaining === '1 days' || sessionInfo.timeRemaining.includes('hours')}
                  <button class="extend-btn" onclick={handleExtendSession}>Extend</button>
                {/if}
              {/if}
            </div>
          {/if}
          
          {#if visibleGroups.length > 0}
            <ProgressIndicator 
              totalGroups={visibleGroups.length} 
              completedGroups={visibleGroups.filter(g => {
                const groupOptions = store.options?.filter(o => o.group_id === g.id) || [];
                return groupOptions.some(o => store.selections?.[o.id]);
              }).length}
            />
          {/if}
        </header>
        
        <div class="configurator-body">
          <!-- Left Column: Option Groups -->
          <div class="options-column">
            <h2 class="column-title">Configuration Options</h2>
            
            {#if visibleGroups.length === 0}
              <p class="empty-state">No configuration groups available.</p>
            {:else}
              {#each visibleGroups as group (group.id)}
                <OptionGroup
                  {group}
                  options={store.options?.filter(o => 
                    o.group_id === group.id && o.is_active !== false
                  ) || []}
                  selections={store.selections || {}}
                  availableOptions={store.availableOptions || []}
                  validationResults={useSessionApi ? store.validationResult : store.validationResults}
                  onSelectionChange={(optionId, value) => 
                    store.updateSelection(optionId, value)
                  }
                />
              {/each}
            {/if}
          </div>
          
          <!-- Right Column: Constraints, Summary & Pricing -->
          <div class="info-column">
            <!-- Validation Display -->
            <div class="info-section">
              <ValidationDisplay
                validationResults={useSessionApi ? store.validationResult : store.validationResults}
                model={store.model}
              />
            </div>
            
            <!-- Summary & Pricing -->
            <div class="info-section">
              <h3>Selected Items & Pricing</h3>
              
              <PricingDisplay
                pricing={useSessionApi ? store.pricingResult : store.pricingData}
                isCalculating={store.isPricing || false}
                selections={store.selections || {}}
                options={store.options || []}
              />
              
              <!-- Actions -->
              <div class="actions-section">
                <button
                  class="btn-primary"
                  onclick={handleSave}
                  disabled={!isComplete || store.isSaving || (useSessionApi && sessionInfo?.status === 'completed')}
                >
                  {#if store.isSaving}
                    <LoadingSpinner size="small" />
                    <span>Saving...</span>
                  {:else}
                    <span>{useSessionApi ? 'Complete Configuration' : 'Save Configuration'}</span>
                  {/if}
                </button>
                
                {#if store.selectedCount > 0}
                  <button 
                    class="btn-secondary"
                    onclick={() => useSessionApi ? store.reset() : store.clearSelections()}
                  >
                    Clear All
                  </button>
                {/if}
                
                {#if !isComplete && store.selectedCount > 0}
                  <p class="help-text">Resolve validation errors to continue</p>
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
    --primary-color: #3b82f6;
    --primary-hover: #2563eb;
    --success-color: #10b981;
    --error-color: #ef4444;
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    --border-color: #e5e7eb;
    
    min-height: 100vh;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  
  .configurator-app.embed-mode {
    min-height: auto;
    background-color: var(--bg-primary);
  }
  
  /* Loading & Error States */
  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
    text-align: center;
    gap: 1rem;
  }
  
  .error-state h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }
  
  .error-state p {
    color: var(--text-secondary);
    margin: 0.5rem 0 1.5rem;
  }
  
  .btn-retry {
    padding: 0.5rem 1rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
  }
  
  .btn-retry:hover {
    background-color: var(--primary-hover);
  }
  
  /* Layout */
  .configurator-layout {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  /* Header */
  .configurator-header {
    margin-bottom: 1.5rem;
  }
  
  .header-content {
    margin-bottom: 1rem;
  }
  
  .configurator-header h1 {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
  }
  
  .model-description {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0;
  }
  
  /* Session Info */
  .session-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }
  
  .session-status {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .session-status.draft {
    background: #fef3c7;
    color: #92400e;
  }
  
  .session-status.validated {
    background: #d1fae5;
    color: #065f46;
  }
  
  .session-status.completed {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .session-expiry {
    color: var(--text-secondary);
  }
  
  .extend-btn {
    padding: 0.25rem 0.75rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
  }
  
  .extend-btn:hover {
    background: var(--primary-hover);
  }
  
  /* Two Column Layout */
  .configurator-body {
    display: grid;
    grid-template-columns: 1fr 500px;
    gap: 1.5rem;
    align-items: start;
  }
  
  /* Options Column */
  .options-column {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .column-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem;
  }
  
  .empty-state {
    text-align: center;
    color: var(--text-secondary);
    padding: 2rem;
  }
  
  /* Info Column */
  .info-column {
    position: sticky;
    top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .info-section {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  .info-section h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem;
  }
  
  /* Actions */
  .actions-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .btn-primary {
    background-color: var(--primary-color);
    color: white;
  }
  
  .btn-primary:hover:not(:disabled) {
    background-color: var(--primary-hover);
  }
  
  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .btn-secondary {
    background-color: white;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  }
  
  .btn-secondary:hover {
    background-color: var(--bg-secondary);
  }
  
  .help-text {
    margin: 0;
    font-size: 0.875rem;
    color: var(--error-color);
    text-align: center;
  }
  
  /* Responsive */
  @media (max-width: 1024px) {
    .configurator-body {
      grid-template-columns: 1fr;
    }
    
    .info-column {
      position: static;
    }
  }
  
  @media (max-width: 640px) {
    .configurator-layout {
      padding: 0.5rem;
    }
    
    .options-column,
    .info-section {
      padding: 1rem;
    }
  }
</style>