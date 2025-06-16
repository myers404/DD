<script>
  import { configStore } from '../stores/configuration.svelte.js';
  
  const steps = [
    { id: 0, name: 'Select', description: 'Choose your product' },
    { id: 1, name: 'Configure', description: 'Customize options' },
    { id: 2, name: 'Review', description: 'Verify & price' },
    { id: 3, name: 'Complete', description: 'Finalize order' }
  ];
</script>

<nav aria-label="Progress">
  <ol class="flex items-center">
    {#each steps as step, i}
      <li class="relative {i < steps.length - 1 ? 'pr-8 sm:pr-20' : ''}">
        {#if i < steps.length - 1}
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="h-0.5 w-full {configStore.currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'}"></div>
          </div>
        {/if}
        
        <button
          class="relative w-8 h-8 flex items-center justify-center rounded-full transition-colors
                 {configStore.currentStep > step.id 
                   ? 'bg-primary-600 text-white' 
                   : configStore.currentStep === step.id 
                     ? 'bg-primary-50 border-2 border-primary-600 text-primary-600'
                     : 'bg-white border-2 border-gray-300 text-gray-500'}"
          onclick={() => configStore.goToStep(step.id)}
          aria-current={configStore.currentStep === step.id ? 'step' : undefined}
        >
          {#if configStore.currentStep > step.id}
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {:else}
            <span class="text-sm font-medium">{step.id + 1}</span>
          {/if}
        </button>
        
        <div class="mt-2 text-center">
          <div class="text-xs font-medium {configStore.currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}">
            {step.name}
          </div>
          <div class="text-xs {configStore.currentStep >= step.id ? 'text-gray-500' : 'text-gray-400'}">
            {step.description}
          </div>
        </div>
      </li>
    {/each}
  </ol>
</nav>