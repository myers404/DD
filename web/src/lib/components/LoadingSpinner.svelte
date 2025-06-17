<!-- web/src/lib/components/LoadingSpinner.svelte -->
<script>
  let {
    size = 'medium',
    message = ''
  } = $props();
</script>

<div class="loading-spinner" class:small={size === 'small'} class:large={size === 'large'}>
  <div class="spinner"></div>
  {#if message}
    <p class="loading-message">{message}</p>
  {/if}
</div>

<style>
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-spinner.small .spinner {
    width: 20px;
    height: 20px;
    border-width: 2px;
  }

  .loading-spinner.large .spinner {
    width: 60px;
    height: 60px;
    border-width: 4px;
  }

  .loading-message {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
    text-align: center;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>