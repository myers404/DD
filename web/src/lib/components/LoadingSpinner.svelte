<!-- web/src/lib/components/LoadingSpinner.svelte -->
<script>
  let {
    size = 'medium',
    message = '',
    overlay = false
  } = $props();

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
</script>

<div class="loading-spinner" class:overlay>
  <div class="spinner-content">
    <div class="spinner {sizeClasses[size]}"></div>
    {#if message}
      <p class="loading-message">{message}</p>
    {/if}
  </div>
</div>

<style>
  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .loading-spinner.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
  }

  .spinner-content {
    text-align: center;
  }

  .spinner {
    margin: 0 auto;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-message {
    margin-top: 1rem;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>