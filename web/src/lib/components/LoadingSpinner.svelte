<script>
  let {
    size = 'md',
    color = 'primary',
    message = '',
    overlay = false
  } = $props();

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    primary: 'border-primary-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };
</script>

{#if overlay}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-live="polite">
    <div class="bg-white rounded-lg p-6 text-center">
      <div class="animate-spin rounded-full {sizes[size]} border-2 border-gray-200 {colors[color]} border-t-transparent mx-auto"></div>
      {#if message}
        <p class="mt-4 text-sm text-gray-600">{message}</p>
      {/if}
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center" aria-live="polite">
    <div class="animate-spin rounded-full {sizes[size]} border-2 border-gray-200 {colors[color]} border-t-transparent"></div>
    {#if message}
      <span class="ml-3 text-sm text-gray-600">{message}</span>
    {/if}
  </div>
{/if}