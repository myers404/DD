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
  
  // Check if we have properly loaded the model and selections
  const isReady = $derived(
    store.model && 
    store.groups && 
    store.options && 
    store.selections !== null &&
    store.selections !== undefined &&
    Object.keys(store.selections).length >= 0  // Force reactivity check
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
        isValid: store.isValid,
        validationResult: store.validationResult,
        selections: store.selections,
        selectionCount: Object.keys(store.selections || {}).length,
        timestamp: new Date().toISOString()
      });
      
      // Debug each group's default option
      if (store.groups && store.selections) {
        store.groups.forEach(group => {
          if (group.default_option_id) {
            const isSelected = store.selections[group.default_option_id] > 0;
            console.log(`Group ${group.name}: default=${group.default_option_id}, selected=${isSelected}`);
          }
        });
      }
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
  
  function handleClearSession() {
    // Clear session from local storage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('session_id');
      localStorage.removeItem('session_token');
      localStorage.removeItem('auth_token');
    }
    
    // Reset the store
    store.reset();
    
    // Reinitialize
    if (useSessionApi) {
      store.initialize(modelId, {
        authToken: null
      });
    } else {
      store.setModelId(modelId);
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
    {:else if store.isLoading || !isReady}
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
        <!-- Debug Info (temporary) -->
        {#if window.location.hostname === 'localhost'}
          <div class="debug-info">
            <details>
              <summary>Debug: Store State</summary>
              <pre>{JSON.stringify({
                selections: store.selections,
                selectionCount: store.selectedCount,
                groupsWithDefaults: store.groups?.filter(g => g.default_option_id).map(g => ({
                  name: g.name,
                  defaultOptionId: g.default_option_id,
                  isSelected: store.selections && store.selections[g.default_option_id] > 0
                }))
              }, null, 2)}</pre>
            </details>
          </div>
        {/if}
        
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
              <button class="clear-session-btn" onclick={handleClearSession} title="Clear session and start over">
                Clear Session
              </button>
            </div>
          {/if}
          
          {#if !sessionInfo && store.configurationId}
            <div class="session-info">
              <span class="config-id">Config ID: {store.configurationId}</span>
              <button class="clear-session-btn" onclick={handleClearSession} title="Clear configuration and start over">
                Start New Configuration
              </button>
            </div>
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
                  selections={store.selections}
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
            <!-- Summary & Pricing -->
            <div class="info-section">
              <h3>Configuration Summary</h3>
              
              <ConfigurationSummary
                selections={store.selections || {}}
                options={store.options || []}
                groups={store.groups || []}
                compact={false}
                configuration={store.configuration}
                validationResults={useSessionApi ? store.validationResult : store.validationResults}
                constraintSummary={typeof store.getConstraintSummary === 'function' ? store.getConstraintSummary() : null}
              />
              
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
                    onclick={() => store.reset()}
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
  
  .config-id {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-family: monospace;
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
  
  .clear-session-btn {
    padding: 0.25rem 0.75rem;
    background: var(--error-color);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    margin-left: auto;
  }
  
  .clear-session-btn:hover {
    background: #dc2626;
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
  
  /* Debug Info */
  .debug-info {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 4px;
    padding: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.75rem;
  }
  
  .debug-info summary {
    cursor: pointer;
    font-weight: 600;
    color: #92400e;
  }
  
  .debug-info pre {
    margin: 0.5rem 0 0;
    padding: 0.5rem;
    background: white;
    border-radius: 4px;
    overflow-x: auto;
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