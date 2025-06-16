<!-- web/src/lib/components/ErrorBoundary.svelte -->
<script>
  import { onMount } from 'svelte';

  let {
    error = null,
    onRetry = null,
    fallback = null,
    children
  } = $props();

  let hasError = $state(false);
  let errorMessage = $state('');

  $effect(() => {
    if (error) {
      hasError = true;
      errorMessage = error.message || 'An unexpected error occurred';
    }
  });

  function handleRetry() {
    hasError = false;
    errorMessage = '';
    if (onRetry) onRetry();
  }
</script>

{#if hasError}
  {#if fallback}
    {@render fallback()}
  {:else}
    <div class="error-boundary">
      <div class="error-content">
        <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <h3>Something went wrong</h3>
        <p>{errorMessage}</p>
        {#if onRetry}
          <button class="retry-btn" onclick={handleRetry}>
            Try Again
          </button>
        {/if}
      </div>
    </div>
  {/if}
{:else}
  {@render children?.()}
{/if}

<style>
  .error-boundary {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    padding: 2rem;
  }

  .error-content {
    text-align: center;
    max-width: 400px;
  }

  .error-icon {
    width: 3rem;
    height: 3rem;
    color: var(--error);
    margin: 0 auto 1rem;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
  }

  p {
    color: var(--text-secondary);
    margin: 0 0 1.5rem;
  }

  .retry-btn {
    padding: 0.75rem 1.5rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .retry-btn:hover {
    background: var(--primary-hover);
  }
</style>