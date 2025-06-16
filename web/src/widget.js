// Widget entry point for JavaScript embedding
import './app.css';
import { mount } from 'svelte';
import ConfiguratorApp from './lib/ConfiguratorApp.svelte';

// Global widget API
window.CPQConfigurator = {
  // Main embed function
  embed: function(options) {
    const {
      container,
      modelId,
      theme = 'light',
      apiUrl = __API_BASE_URL__,
      onComplete = null,
      onConfigurationChange = null,
      onError = null,
      ...otherProps
    } = options;

    // Validate required options
    if (!container || !modelId) {
      throw new Error('CPQConfigurator.embed() requires container and modelId options');
    }

    // Get target element
    const target = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!target) {
      throw new Error(`Container element not found: ${container}`);
    }

    // Mount the Svelte component using Svelte 5 API
    const app = mount(ConfiguratorApp, {
      target,
      props: {
        modelId,
        theme,
        apiUrl,
        embedMode: false, // Widget mode, not iframe embed
        onComplete,
        onConfigurationChange,
        onError,
        ...otherProps
      }
    });

    return {
      // Return control methods
      destroy: () => {
        if (app && typeof app.destroy === 'function') {
          app.destroy();
        }
      },

      // Update props
      update: (newProps) => {
        if (app && typeof app.$set === 'function') {
          app.$set(newProps);
        }
      }
    };
  },

  // Version info
  version: __BUILD_VERSION__
};

// Auto-initialization for data attributes
document.addEventListener('DOMContentLoaded', function() {
  // Find all elements with data-cpq-configurator attribute
  const autoElements = document.querySelectorAll('[data-cpq-configurator]');

  autoElements.forEach(element => {
    const modelId = element.getAttribute('data-cpq-model-id');
    const theme = element.getAttribute('data-cpq-theme') || 'light';
    const apiUrl = element.getAttribute('data-cpq-api-url') || __API_BASE_URL__;

    if (modelId) {
      window.CPQConfigurator.embed({
        container: element,
        modelId,
        theme,
        apiUrl,
        onComplete: (config) => {
          // Dispatch custom event for auto-initialized widgets
          const event = new CustomEvent('cpq-configuration-complete', {
            detail: { configuration: config },
            bubbles: true
          });
          element.dispatchEvent(event);
        },
        onConfigurationChange: (config) => {
          const event = new CustomEvent('cpq-configuration-change', {
            detail: { configuration: config },
            bubbles: true
          });
          element.dispatchEvent(event);
        },
        onError: (error) => {
          const event = new CustomEvent('cpq-error', {
            detail: { error },
            bubbles: true
          });
          element.dispatchEvent(event);
        }
      });
    }
  });
});

export default window.CPQConfigurator;