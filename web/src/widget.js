// web/src/widget.js
import ConfiguratorApp from './lib/ConfiguratorApp.svelte';

// Widget initialization
window.CPQConfigurator = {
  create: function(container, options = {}) {
    if (!container) {
      throw new Error('Container element is required');
    }

    if (!options.modelId) {
      throw new Error('Model ID is required');
    }

    // Ensure container is an element
    const targetElement = typeof container === 'string'
        ? document.querySelector(container)
        : container;

    if (!targetElement) {
      throw new Error('Container element not found');
    }

    // Create the Svelte app
    const app = new ConfiguratorApp({
      target: targetElement,
      props: {
        modelId: options.modelId,
        apiUrl: options.apiUrl || '/api/v1',
        theme: options.theme || 'light',
        embedMode: options.embedMode !== false,
        onComplete: options.onComplete,
        onConfigurationChange: options.onConfigurationChange,
        onError: options.onError
      }
    });

    // Return API for controlling the widget
    return {
      destroy: () => app.$destroy(),

      updateConfig: (config) => {
        if (config.modelId) {
          app.$set({ modelId: config.modelId });
        }
        if (config.theme) {
          app.$set({ theme: config.theme });
        }
      },

      getConfiguration: () => {
        return app.configStore?.exportConfiguration();
      },

      loadConfiguration: (configId) => {
        return app.configStore?.loadConfiguration(configId);
      },

      reset: () => {
        app.configStore?.reset();
      }
    };
  }
};

// Auto-initialize if data attributes are present
document.addEventListener('DOMContentLoaded', () => {
  const autoElements = document.querySelectorAll('[data-cpq-auto-init]');

  autoElements.forEach(element => {
    const modelId = element.getAttribute('data-model-id');
    const apiUrl = element.getAttribute('data-api-url');
    const theme = element.getAttribute('data-theme');

    if (modelId) {
      window.CPQConfigurator.create(element, {
        modelId,
        apiUrl,
        theme,
        embedMode: true
      });
    }
  });
});

// Export for module usage
export default window.CPQConfigurator;