<script>
  import { configStore } from '../stores/configuration.svelte.js';

  let {
    detailed = false,
    showBreakdown = true
  } = $props();

  let savings = $derived(
          configStore.adjustments.reduce((total, adj) => {
            return adj.amount < 0 ? total + Math.abs(adj.amount) : total;
          }, 0)
  );

  let additionalCharges = $derived(
          configStore.adjustments.reduce((total, adj) => {
            return adj.amount > 0 ? total + adj.amount : total;
          }, 0)
  );
</script>

<div class="bg-white rounded-lg border border-gray-200 p-6">
  <!-- Pricing header -->
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-medium text-gray-900">Pricing</h3>
    {#if configStore.isPricing}
      <div class="text-sm text-gray-500 flex items-center">
        <div class="animate-spin w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full mr-2"></div>
        Calculating...
      </div>
    {:else if configStore.pricingData}
      <div class="text-sm text-green-600">Updated</div>
    {/if}
  </div>

  <!-- Main price display -->
  <div class="text-center mb-6">
    <div class="text-3xl font-bold text-gray-900">
      ${configStore.totalPrice.toFixed(2)}
    </div>
    {#if configStore.basePrice !== configStore.totalPrice}
      <div class="text-sm text-gray-500">
        Base: ${configStore.basePrice.toFixed(2)}
        {#if savings > 0}
          <span class="text-green-600 ml-2">Save ${savings.toFixed(2)}</span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Pricing breakdown -->
  {#if showBreakdown && configStore.pricingData && configStore.selectedOptions.length > 0}
    <div class="space-y-3">
      <h4 class="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
        Price Breakdown
      </h4>

      <!-- Selected options -->
      {#each configStore.selectedOptions as option}
        <div class="flex justify-between text-sm">
          <div class="flex-1">
            <div class="text-gray-900">{option.name}</div>
            {#if configStore.selections[option.id] > 1}
              <div class="text-gray-500 text-xs">
                ${option.base_price.toFixed(2)} × {configStore.selections[option.id]}
              </div>
            {/if}
          </div>
          <div class="text-gray-900 font-medium">
            ${(option.base_price * configStore.selections[option.id]).toFixed(2)}
          </div>
        </div>
      {/each}

      <!-- Subtotal -->
      <div class="border-t border-gray-200 pt-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Subtotal</span>
          <span class="text-gray-900">${configStore.basePrice.toFixed(2)}</span>
        </div>
      </div>

      <!-- Adjustments -->
      {#if configStore.adjustments.length > 0}
        {#each configStore.adjustments as adjustment}
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">{adjustment.rule_name || adjustment.name}</span>
            <span class="{adjustment.amount < 0 ? 'text-green-600' : 'text-red-600'}">
              {adjustment.amount < 0 ? '-' : '+'}${Math.abs(adjustment.amount).toFixed(2)}
            </span>
          </div>
        {/each}
      {/if}

      <!-- Total -->
      <div class="border-t border-gray-200 pt-3">
        <div class="flex justify-between text-lg font-medium">
          <span class="text-gray-900">Total</span>
          <span class="text-gray-900">${configStore.totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Pricing actions -->
  {#if detailed}
    <div class="mt-6 space-y-3">
      <button
              type="button"
              class="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
              onclick={() => configStore.saveConfiguration()}
      >
        Save Configuration
      </button>

      <button
              type="button"
              class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              onclick={() => {
          const config = configStore.exportConfiguration();
          const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `configuration-${Date.now()}.json`;
          a.click();
        }}
      >
        Export Configuration
      </button>
    </div>
  {/if}
</div>