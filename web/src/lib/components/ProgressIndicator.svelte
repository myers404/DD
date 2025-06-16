<!-- web/src/lib/components/ProgressIndicator.svelte -->
<script>
  let { steps = [], currentStep = 0, completionPercentage = 0 } = $props();
</script>

<div class="progress-indicator">
  <div class="steps">
    {#each steps as step, index}
      <div
              class="step"
              class:active={index === currentStep}
              class:completed={index < currentStep}
      >
        <div class="step-icon">
          {#if index < currentStep}
            ✓
          {:else}
            {step.icon || index + 1}
          {/if}
        </div>
        <div class="step-label">{step.label}</div>
      </div>
      {#if index < steps.length - 1}
        <div
                class="step-connector"
                class:completed={index < currentStep}
        ></div>
      {/if}
    {/each}
  </div>

  <div class="progress-bar">
    <div class="progress-fill" style="width: {completionPercentage}%"></div>
  </div>
</div>

<style>
  .progress-indicator {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .steps {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }

  .step-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary, #f3f4f6);
    color: var(--text-secondary, #6b7280);
    font-weight: 600;
    transition: all 0.3s;
  }

  .step.active .step-icon {
    background: var(--primary-color, #3b82f6);
    color: white;
    transform: scale(1.1);
  }

  .step.completed .step-icon {
    background: var(--success-color, #10b981);
    color: white;
  }

  .step-label {
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
    text-align: center;
  }

  .step.active .step-label {
    color: var(--primary-color, #3b82f6);
    font-weight: 600;
  }

  .step-connector {
    flex: 1;
    height: 2px;
    background: var(--border-color, #e5e7eb);
    margin: 0 0.5rem 1.5rem;
  }

  .step-connector.completed {
    background: var(--success-color, #10b981);
  }

  .progress-bar {
    height: 0.5rem;
    background: var(--bg-secondary, #f3f4f6);
    border-radius: 0.25rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--primary-color, #3b82f6);
    transition: width 0.3s ease;
  }
</style>