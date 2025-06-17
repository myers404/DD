<!-- web/src/lib/components/ProgressIndicator.svelte -->
<script>
  let {
    steps = [],
    currentStep = 0,
    onStepClick = null,
    canNavigate = false
  } = $props();

  function handleStepClick(index) {
    if (canNavigate && onStepClick && index <= currentStep) {
      onStepClick(index);
    }
  }

  function getStepStatus(index) {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  }
</script>

<div class="progress-indicator">
  <div class="progress-bar">
    <div
            class="progress-fill"
            style="width: {currentStep === 0 ? 0 : (currentStep / (steps.length - 1)) * 100}%"
    ></div>
  </div>

  <div class="steps">
    {#each steps as step, index}
      {@const status = getStepStatus(index)}
      {@const isClickable = canNavigate && index <= currentStep}

      <div
              class="step {status}"
              class:clickable={isClickable}
              onclick={() => handleStepClick(index)}
              role={isClickable ? 'button' : 'presentation'}
              tabindex={isClickable ? 0 : -1}
              onkeydown={(e) => {
          if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleStepClick(index);
          }
        }}
      >
        <div class="step-marker">
          {#if status === 'completed'}
            <svg class="checkmark" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"/>
            </svg>
          {:else}
            <span class="step-number">{index + 1}</span>
          {/if}
        </div>

        <div class="step-content">
          <span class="step-icon">{step.icon}</span>
          <span class="step-label">{step.label}</span>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .progress-indicator {
    position: relative;
    padding: 2rem 0;
  }

  .progress-bar {
    position: absolute;
    top: 3rem;
    left: 2rem;
    right: 2rem;
    height: 2px;
    background: var(--border-color, #e5e7eb);
    z-index: 0;
  }

  .progress-fill {
    height: 100%;
    background: var(--primary-color, #3b82f6);
    transition: width 0.3s ease;
  }

  .steps {
    display: flex;
    justify-content: space-between;
    position: relative;
    z-index: 1;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    transition: all 0.2s;
  }

  .step.clickable {
    cursor: pointer;
  }

  .step.clickable:hover .step-marker {
    transform: scale(1.1);
  }

  .step-marker {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary, #ffffff);
    border: 2px solid var(--border-color, #e5e7eb);
    transition: all 0.2s;
    font-weight: 600;
  }

  .step.active .step-marker {
    border-color: var(--primary-color, #3b82f6);
    color: var(--primary-color, #3b82f6);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  .step.completed .step-marker {
    background: var(--primary-color, #3b82f6);
    border-color: var(--primary-color, #3b82f6);
    color: white;
  }

  .checkmark {
    width: 1rem;
    height: 1rem;
  }

  .step-number {
    font-size: 0.875rem;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    text-align: center;
  }

  .step-icon {
    font-size: 1.25rem;
  }

  .step-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary, #6b7280);
  }

  .step.active .step-label {
    color: var(--primary-color, #3b82f6);
  }

  .step.completed .step-label {
    color: var(--text-primary, #111827);
  }

  @media (max-width: 640px) {
    .progress-bar {
      left: 1rem;
      right: 1rem;
    }

    .step-content {
      display: none;
    }

    .step.active .step-content {
      display: flex;
    }
  }
</style>