<!-- web/src/lib/components/ProgressIndicator.svelte -->
<script>
  let {
    currentStep = 0,
    completionPercentage = 0
  } = $props();

  const steps = [
    { name: 'Configure', icon: '1' },
    { name: 'Validate', icon: '2' },
    { name: 'Price', icon: '3' },
    { name: 'Complete', icon: '4' }
  ];
</script>

<div class="progress-indicator">
  <div class="progress-bar">
    <div class="progress-fill" style="width: {completionPercentage}%"></div>
  </div>

  <div class="progress-steps">
    {#each steps as step, index}
      <div
              class="step"
              class:active={index === currentStep}
              class:completed={index < currentStep}
      >
        <div class="step-icon">
          {#if index < currentStep}
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {:else}
            {step.icon}
          {/if}
        </div>
        <span class="step-name">{step.name}</span>
      </div>
    {/each}
  </div>

  <div class="progress-text">
    {completionPercentage}% Complete
  </div>
</div>

<style>
  .progress-indicator {
    margin-bottom: 2rem;
  }

  .progress-bar {
    height: 0.5rem;
    background: var(--bg-secondary);
    border-radius: 9999px;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }

  .progress-fill {
    height: 100%;
    background: var(--primary);
    transition: width 0.3s ease;
  }

  .progress-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .step.active,
  .step.completed {
    opacity: 1;
  }

  .step-icon {
    width: 2rem;
    height: 2rem;
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .step.active .step-icon {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .step.completed .step-icon {
    background: var(--success);
    color: white;
    border-color: var(--success);
  }

  .step-icon svg {
    width: 1rem;
    height: 1rem;
  }

  .step-name {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .progress-text {
    text-align: center;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
</style>