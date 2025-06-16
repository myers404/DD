<!-- web/src/lib/components/LoadingSpinner.svelte -->
<script>
  let { message = 'Loading...', size = 'medium' } = $props();
</script>

<div class="loading-spinner {size}">
  <div class="spinner"></div>
  <p class="message">{message}</p>
</div>

<style>
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    min-height: 200px;
  }

  .loading-spinner.small {
    min-height: 100px;
    padding: 1rem;
  }

  .loading-spinner.large {
    min-height: 400px;
  }

  .spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid var(--border-color, #e5e7eb);
    border-top-color: var(--primary-color, #3b82f6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .small .spinner {
    width: 2rem;
    height: 2rem;
    border-width: 2px;
  }

  .large .spinner {
    width: 4rem;
    height: 4rem;
    border-width: 4px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .message {
    margin: 0;
    color: var(--text-secondary, #6b7280);
    font-size: 0.875rem;
  }

  .large .message {
    font-size: 1rem;
  }
</style>