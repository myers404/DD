<!-- A nicer, faster tooltip component -->
<script>
  let {
    content = '',
    position = 'top',
    delay = 100, // Much faster than default browser tooltips
    maxWidth = '400px'
  } = $props();

  let showTooltip = $state(false);
  let tooltipElement;
  let targetElement;
  let timeoutId;

  function handleMouseEnter() {
    timeoutId = setTimeout(() => {
      showTooltip = true;
    }, delay);
  }

  function handleMouseLeave() {
    clearTimeout(timeoutId);
    showTooltip = false;
  }
</script>

<div 
  class="tooltip-wrapper"
  bind:this={targetElement}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
>
  <slot />
  
  {#if showTooltip && content}
    <div 
      class="tooltip {position}"
      bind:this={tooltipElement}
      style="max-width: {maxWidth}; min-width: 200px;"
    >
      <div class="tooltip-content">
        {content}
      </div>
      <div class="tooltip-arrow"></div>
    </div>
  {/if}
</div>

<style>
  .tooltip-wrapper {
    position: relative;
    display: inline-block;
  }

  .tooltip {
    position: absolute;
    z-index: 1000;
    pointer-events: none;
    animation: fadeIn 0.2s ease-out;
  }

  .tooltip-content {
    background: rgba(31, 41, 55, 0.95);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.5;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-weight: 400;
    letter-spacing: 0.01em;
    white-space: normal;
    word-wrap: break-word;
  }

  .tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }

  /* Position variants */
  .tooltip.top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 8px;
  }

  .tooltip.top .tooltip-arrow {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px 5px 0 5px;
    border-color: rgba(31, 41, 55, 0.95) transparent transparent transparent;
  }

  .tooltip.bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 8px;
  }

  .tooltip.bottom .tooltip-arrow {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 5px 5px 5px;
    border-color: transparent transparent rgba(31, 41, 55, 0.95) transparent;
  }

  .tooltip.left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 8px;
  }

  .tooltip.left .tooltip-arrow {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border-width: 5px 0 5px 5px;
    border-color: transparent transparent transparent rgba(31, 41, 55, 0.95);
  }

  .tooltip.right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 8px;
  }

  .tooltip.right .tooltip-arrow {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border-width: 5px 5px 5px 0;
    border-color: transparent rgba(31, 41, 55, 0.95) transparent transparent;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .tooltip.bottom {
    animation: fadeInBottom 0.2s ease-out;
  }

  @keyframes fadeInBottom {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(2px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .tooltip.left, .tooltip.right {
    animation: fadeInSide 0.2s ease-out;
  }

  @keyframes fadeInSide {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>