<!-- web/src/lib/components/ProgressIndicator.svelte -->
<!-- Flexible progress indicator supporting both percentage and steps -->
<script>
  let {
    // Common props
    type = 'percentage', // 'percentage' | 'steps'
    
    // Percentage mode props
    progress = 0,
    label = '',
    showPercentage = true,
    size = 'medium', // 'small' | 'medium' | 'large' | 'linear'
    
    // Steps mode props
    steps = [],
    currentStep = 0,
    onStepClick = null,
    canNavigate = false
  } = $props();
  
  // For percentage mode
  const circumference = $derived(2 * Math.PI * 36);
  const strokeDashoffset = $derived(circumference - (progress / 100) * circumference);
  const progressColor = $derived(progress === 100 ? 'var(--success-color)' : 'var(--primary-color)');
  
  // For steps mode
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

{#if type === 'percentage'}
  <!-- Percentage-based progress -->
  <div class="progress-indicator" class:small={size === 'small'} class:large={size === 'large'}>
    {#if size === 'linear'}
      <!-- Linear progress bar -->
      <div class="linear-progress">
        <div class="progress-track">
          <div 
            class="progress-fill" 
            style="width: {progress}%; background-color: {progressColor}"
          ></div>
        </div>
        {#if label || showPercentage}
          <div class="progress-label">
            {label || `${progress}%`}
          </div>
        {/if}
      </div>
    {:else}
      <!-- Circular progress -->
      <div class="circular-progress">
        <svg class="progress-ring" viewBox="0 0 80 80">
          <!-- Background circle -->
          <circle
            class="progress-ring-bg"
            stroke="var(--border-color)"
            stroke-width="4"
            fill="none"
            cx="40"
            cy="40"
            r="36"
          />
          <!-- Progress circle -->
          <circle
            class="progress-ring-fill"
            stroke={progressColor}
            stroke-width="4"
            fill="none"
            cx="40"
            cy="40"
            r="36"
            style="stroke-dasharray: {circumference}; stroke-dashoffset: {strokeDashoffset}"
          />
        </svg>
        <div class="progress-text">
          {#if showPercentage && !label}
            <span class="percentage">{progress}%</span>
          {:else if label}
            <span class="label">{label}</span>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{:else}
  <!-- Step-based progress -->
  <div class="progress-steps">
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
{/if}

<style>
  /* Common styles */
  .progress-indicator,
  .progress-steps {
    position: relative;
  }
  
  /* Percentage mode - Linear progress */
  .linear-progress {
    width: 100%;
  }
  
  .progress-track {
    height: 8px;
    background-color: var(--bg-tertiary);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }
  
  .progress-fill {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
  }
  
  .linear-progress .progress-label {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-align: center;
  }
  
  /* Percentage mode - Circular progress */
  .circular-progress {
    position: relative;
    width: 80px;
    height: 80px;
  }
  
  .progress-indicator.small .circular-progress {
    width: 48px;
    height: 48px;
  }
  
  .progress-indicator.large .circular-progress {
    width: 120px;
    height: 120px;
  }
  
  .progress-ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
  
  .progress-ring-fill {
    transition: stroke-dashoffset 0.3s ease, stroke 0.3s ease;
    stroke-linecap: round;
  }
  
  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  
  .percentage {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .progress-indicator.small .percentage {
    font-size: 0.875rem;
  }
  
  .progress-indicator.large .percentage {
    font-size: 1.5rem;
  }
  
  .label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  .progress-indicator.small .label {
    font-size: 0.625rem;
  }
  
  .progress-indicator.large .label {
    font-size: 0.875rem;
  }
  
  /* Steps mode */
  .progress-steps {
    padding: 2rem 0;
  }
  
  .progress-steps .progress-bar {
    position: absolute;
    top: 3rem;
    left: 2rem;
    right: 2rem;
    height: 2px;
    background: var(--border-color, #e5e7eb);
    z-index: 0;
  }
  
  .progress-steps .progress-fill {
    background: var(--primary-color, #3b82f6);
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
    .progress-steps .progress-bar {
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