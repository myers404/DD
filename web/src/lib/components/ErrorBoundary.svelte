<!-- web/src/lib/components/ErrorBoundary.svelte -->
<script>
  import { onMount } from 'svelte';

  let error = $state(null);
  let errorInfo = $state(null);

  onMount(() => {
    const handleError = (event) => {
      error = event.error || new Error('Unknown error');
      errorInfo = {
        componentStack: event.filename || 'Unknown',
        lineNumber: event.lineno,
        columnNumber: event.colno
      };
      console.error('Error caught by boundary:', error);
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      error = new Error(event.reason);
      errorInfo = { componentStack: 'Promise rejection' };
      event.preventDefault();
    });

    return () => {
      window.removeEventListener('error', handleError);
    };
  });

  function reset() {
    error = null;
    errorInfo = null;
  }

  function reload() {
    location.reload();
  }
</script>

{#if error}
  <div class="error-boundary">
    <div class="error-content">
      <h2>Something went wrong</h2>
      <p class="error-message">{error.message}</p>

      {#if import.meta.env.DEV && errorInfo}
        <details class="error-details">
          <summary>Error details</summary>
          <pre>{JSON.stringify(errorInfo, null, 2)}</pre>
          <pre>{error.stack}</pre>
        </details>
      {/if}

      <div class="error-actions">
        <button onclick={reset} class="btn btn-secondary">
          Try Again
        </button>
        <button onclick={reload} class="btn btn-primary">
          Reload Page
        </button>
      </div>
    </div>
  </div>
{:else}
  <slot />
{/if}

<style>
  .error-boundary {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 2rem;
  }

  .error-content {
    text-align: center;
    max-width: 500px;
  }

  .error-content h2 {
    color: var(--error-color, #dc2626);
    margin-bottom: 1rem;
  }

  .error-message {
    color: var(--text-secondary, #6b7280);
    margin-bottom: 2rem;
  }

  .error-details {
    text-align: left;
    background: var(--bg-secondary, #f9fafb);
    padding: 1rem;
    border-radius: 6px;
    margin-bottom: 2rem;
  }

  .error-details summary {
    cursor: pointer;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .error-details pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.75rem;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .btn {
    padding: 0.625rem 1.25rem;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: var(--primary-color, #3b82f6);
    color: white;
  }

  .btn-primary:hover {
    background: var(--primary-hover, #2563eb);
  }

  .btn-secondary {
    background: var(--secondary-color, #e5e7eb);
    color: var(--text-primary, #1a1a1a);
  }

  .btn-secondary:hover {
    background: var(--secondary-hover, #d1d5db);
  }
</style>