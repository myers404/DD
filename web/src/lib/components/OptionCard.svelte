<script>
  import { configStore } from '../stores/configuration.svelte.js';

  let {
    option,
    group
  } = $props();

  let quantity = $state(configStore.selections[option.id] || 0);
  let isSelected = $derived(quantity > 0);
  let totalPrice = $derived(quantity * option.base_price);

  // Update store when quantity changes
  $effect(() => {
    configStore.updateSelection(option.id, quantity);
  });

  function incrementQuantity() {
    if (group.max_selections && quantity >= group.max_selections) return;
    quantity++;
  }

  function decrementQuantity() {
    if (quantity > 0) {
      quantity--;
    }
  }

  function toggleSelection() {
    if (isSelected) {
      quantity = 0;
    } else {
      quantity = 1;
    }
  }

  // Handle group constraints
  $effect(() => {
    if (group.selection_type === 'single' && isSelected) {
      // Deselect other options in the same group
      for (const otherOption of group.options) {
        if (otherOption.id !== option.id && configStore.selections[otherOption.id] > 0) {
          configStore.updateSelection(otherOption.id, 0);
        }
      }
    }
  });
</script>

<div class="relative rounded-lg border-2 transition-all duration-200 
            {isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}">

  <!-- Selection indicator -->
  {#if isSelected}
    <div class="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </div>
  {/if}

  <div class="p-4">
    <!-- Option header -->
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h3 class="text-sm font-medium text-gray-900">{option.name}</h3>
        {#if option.description}
          <p class="mt-1 text-sm text-gray-500">{option.description}</p>
        {/if}
      </div>

      <div class="ml-4 text-right">
        <div class="text-sm font-medium text-gray-900">
          ${option.base_price.toFixed(2)}
          {#if option.price_unit && option.price_unit !== 'each'}
            <span class="text-xs text-gray-500">/{option.price_unit}</span>
          {/if}
        </div>
        {#if totalPrice > option.base_price}
          <div class="text-xs text-primary-600">
            Total: ${totalPrice.toFixed(2)}
          </div>
        {/if}
      </div>
    </div>

    <!-- Option constraints/specifications -->
    {#if option.constraints && option.constraints.length > 0}
      <div class="mt-2 flex flex-wrap gap-1">
        {#each option.constraints.slice(0, 3) as constraint}
          <span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
            {constraint}
          </span>
        {/each}
        {#if option.constraints.length > 3}
          <span class="text-xs text-gray-500">+{option.constraints.length - 3} more</span>
        {/if}
      </div>
    {/if}

    <!-- Selection controls -->
    <div class="mt-4 flex items-center justify-between">
      {#if group.selection_type === 'single'}
        <!-- Radio button style for single selection -->
        <button
                type="button"
                class="flex items-center space-x-2 text-sm font-medium
                 {isSelected ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}"
                onclick={toggleSelection}
        >
          <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center
                      {isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}">
            {#if isSelected}
              <div class="w-2 h-2 bg-white rounded-full"></div>
            {/if}
          </div>
          <span>{isSelected ? 'Selected' : 'Select'}</span>
        </button>
      {:else}
        <!-- Quantity controls for multiple selection -->
        <div class="flex items-center space-x-3">
          <span class="text-sm text-gray-500">Quantity:</span>
          <div class="flex items-center space-x-2">
            <button
                    type="button"
                    class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                     {quantity > 0 ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'}"
                    onclick={decrementQuantity}
                    disabled={quantity <= 0}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>

            <span class="w-8 text-center text-sm font-medium">{quantity}</span>

            <button
                    type="button"
                    class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center
                     hover:bg-gray-100 text-gray-700
                     {group.max_selections && quantity >= group.max_selections ? 'opacity-50 cursor-not-allowed' : ''}"
                    onclick={incrementQuantity}
                    disabled={group.max_selections && quantity >= group.max_selections}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      {/if}

      {#if option.availability_status && option.availability_status !== 'available'}
        <div class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          {option.availability_status}
        </div>
      {/if}
    </div>
  </div>
</div>