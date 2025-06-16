<script>
  import { createEventDispatcher } from 'svelte';

  let {
    error = null,
    context = 'Application',
    showDetails = false,
    retryable = true,
    retryCount = 0,
    maxRetries = 3
  } = $props();

  const dispatch = createEventDispatcher();

  function handleRetry() {
    if (retryCount < maxRetries) {
      dispatch('retry');
    }
  }

  function toggleDetails() {
    showDetails = !showDetails;
  }

  let canRetry = $derived(retryable && retryCount < maxRetries);
</script>

{#if error}
  <div class="rounded-md bg-red-50 p-4 border border-red-200">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-red-800">
          {context} Error
        </h3>
        <div class="mt-2 text-sm text-red-700">
          <p>Something went wrong. {error.message || 'An unexpected error occurred.'}</p>
        </div>

        {#if showDetails}
          <div class="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded border">
            <pre class="whitespace-pre-wrap">{error.stack || JSON.stringify(error, null, 2)}</pre>
          </div>
        {/if}

        <div class="mt-4 flex space-x-3">
          {#if canRetry}
            <button
                    type="button"
                    class="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                    onclick={handleRetry}
            >
              Retry {retryCount > 0 ? `(${retryCount}/${maxRetries})` : ''}
            </button>
          {/if}

          <button
                  type="button"
                  class="text-sm text-red-600 hover:text-red-500 underline"
                  onclick={toggleDetails}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}