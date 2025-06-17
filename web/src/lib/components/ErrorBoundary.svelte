<!-- web/src/lib/components/ErrorBoundary.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';

  let {
    children,
    fallback = null,
    onError = null
  } = $props();

  let error = $state(null);
  let hasError = $state(false);

  function handleError(event) {
    console.error('ErrorBoundary caught:', event.error);
    error = event.error;
    hasError = true;

    if (onError) {
      onError(event.error);
    }

    // Prevent the error from propagating
    event.preventDefault();
    event.stopPropagation();
  }

  function reset() {
    error = null;
    hasError = false;
  }

  onMount(() => {
    // Listen for unhandled errors
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      handleError({ error: event.reason });
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  });
</script>

{#if hasError}
  {#if fallback}
    {@render fallback(error, reset)}
  {:else}
    <div class="error-boundary">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">Something went wrong</h2>
        <p class="error-message">{error?.message || 'An unexpected error occurred'}</p>

        {#if import.meta.env.DEV && error?.stack}
          <details class="error-details">
            <summary>Error Details</summary>
            <pre class="error-stack">{error.stack}</pre>
          </details>
        {/if}

        <div class="error-actions">
          <button class="btn btn-primary" onclick={reset}>
            Try Again
          </button>
          <button class="btn btn-secondary" onclick={() => location.reload()}>
            Reload Page
          </button>
        </div>
      </div>
    </div>
  {/if}
{:else}
  {@render children()}
{/if}

<style>
  .error-boundary {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .error-content {
    max-width: 500px;
    text-align: center;
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-title {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary, #111827);
  }

  .error-message {
    margin: 0 0 1.5rem;
    font-size: 1rem;
    color: var(--text-secondary, #6b7280);
  }

  .error-details {
    margin: 1rem 0;
    text-align: left;
    background: var(--bg-secondary, #f9fafb);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 6px;
    padding: 1rem;
  }

  .error-details summary {
    cursor: pointer;
    font-weight: 500;
    color: var(--text-secondary, #6b7280);
    font-size: 0.875rem;
  }

  .error-stack {
    margin: 1rem 0 0;
    padding: 1rem;
    background: var(--bg-tertiary, #111827);
    color: var(--text-code, #f3f4f6);
    border-radius: 4px;
    font-size: 0.75rem;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
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

  .btn-primary {
    background: var(--primary-color, #3b82f6);
    color: white;
  }

  .btn-primary:hover {
    background: var(--primary-hover, #2563eb);
  }

  .btn-secondary {
    background: var(--bg-secondary, #f3f4f6);
    color: var(--text-primary, #111827);
  }

  .btn-secondary:hover {
    background: var(--bg-tertiary, #e5e7eb);
  }
</style>