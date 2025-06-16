<script>
  import { onMount } from 'svelte';
  import { configStore } from './lib/stores/configuration.svelte.js';
  import ConfiguratorApp from './lib/ConfiguratorApp.svelte';
  
  let currentView = $state('home');
  let modelId = $state('');
  
  onMount(() => {
    // Check URL for direct model access
    const path = window.location.pathname;
    const modelMatch = path.match(/^\/configure\/(.+)$/);
    if (modelMatch) {
      modelId = modelMatch[1];
      currentView = 'configure';
    }
    
    // Handle URL changes
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  });
  
  function handleRouteChange() {
    const path = window.location.pathname;
    const modelMatch = path.match(/^\/configure\/(.+)$/);
    if (modelMatch) {
      modelId = modelMatch[1];
      currentView = 'configure';
    } else {
      currentView = 'home';
      modelId = '';
    }
  }
  
  function navigateToModel(id) {
    modelId = id;
    currentView = 'configure';
    window.history.pushState({}, '', `/configure/${id}`);
  }
  
  function navigateHome() {
    currentView = 'home';
    modelId = '';
    window.history.pushState({}, '', '/');
  }
</script>

<svelte:head>
  <title>CPQ Configurator</title>
  <meta name="description" content="Configure your perfect product" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  {#if currentView === 'home'}
    <!-- Home Page -->
    <div class="max-w-4xl mx-auto p-4 py-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Product Configurator
        </h1>
        <p class="text-xl text-gray-600 mb-8">
          Configure your perfect product with our advanced configurator
        </p>
      </div>
      
      <!-- Model Selection -->
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Start Configuration</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Enter Model ID
              </label>
              <input
                type="text"
                placeholder="e.g., sample-laptop"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                bind:value={modelId}
                onkeydown={(e) => e.key === 'Enter' && modelId.trim() && navigateToModel(modelId.trim())}
              />
            </div>
            
            <button
              type="button"
              class="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onclick={() => navigateToModel(modelId.trim())}
              disabled={!modelId.trim()}
            >
              Start Configuration
            </button>
          </div>
          
          <!-- Quick Start Options -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Quick Start</h3>
            <div class="space-y-2">
              <button
                type="button"
                class="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                onclick={() => navigateToModel('sample-laptop')}
              >
                📱 Laptop Configuration
              </button>
              <button
                type="button"
                class="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                onclick={() => navigateToModel('desktop-model-456')}
              >
                🖥️ Desktop Configuration
              </button>
              <button
                type="button"
                class="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                onclick={() => navigateToModel('server-model-789')}
              >
                🖥️ Server Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Features -->
      <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Real-time Validation</h3>
          <p class="text-gray-600">Instant constraint checking with advanced MTBDD engine</p>
        </div>
        
        <div class="text-center">
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Live Pricing</h3>
          <p class="text-gray-600">Real-time price calculation with volume discounts</p>
        </div>
        
        <div class="text-center">
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Easy Sharing</h3>
          <p class="text-gray-600">Share configurations via URL, email, or export</p>
        </div>
      </div>
    </div>
    
  {:else if currentView === 'configure'}
    <!-- Configuration Page -->
    <div class="relative">
      <!-- Back button -->
      <div class="absolute top-4 left-4 z-10">
        <button
          type="button"
          class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white rounded-md shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
          onclick={navigateHome}
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>
      </div>
      
      <!-- Configurator -->
      <ConfiguratorApp 
        {modelId}
        embedMode={false}
        onComplete={(config) => {
          console.log('Configuration completed:', config);
          // Could redirect to checkout, show success message, etc.
        }}
        onError={(error) => {
          console.error('Configuration error:', error);
        }}
      />
    </div>
  {/if}
</div>