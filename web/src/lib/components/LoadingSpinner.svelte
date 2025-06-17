<!-- web/src/lib/components/LoadingSpinner.svelte -->
<script>
  let {
    size = 'medium',
    message = '',
    overlay = false,
    color = 'primary'
  } = $props();

  let sizeClasses = $derived({
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  }[size] || 'w-8 h-8 border-3');

  let colorClasses = $derived({
    primary: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  }[color] || 'border-blue-600 border-t-transparent');
</script>

{#if overlay}
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="spinner {sizeClasses} {colorClasses}"></div>
      {#if message}
        <p class="loading-message">{message}</p>
      {/if}
    </div>
  </div>
{:else}
  <div class="loading-container">
    <div class="spinner {sizeClasses} {colorClasses}"></div>
    {#if message}
      <p class="loading-message">{message}</p>
    {/if}
  </div>
{/if}

<style>
  .loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    border-style: solid;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-message {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    text-align: center;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Border width utilities */
  .border-2 {
    border-width: 2px;
  }

  .border-3 {
    border-width: 3px;
  }

  .border-4 {
    border-width: 4px;
  }

  /* Size utilities */
  .w-4 { width: 1rem; }
  .h-4 { height: 1rem; }
  .w-8 { width: 2rem; }
  .h-8 { height: 2rem; }
  .w-12 { width: 3rem; }
  .h-12 { height: 3rem; }
</style>