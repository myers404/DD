// web/src/widget.js
import { mount } from 'svelte';
import ConfiguratorApp from './lib/ConfiguratorApp.svelte';

// Initialize global API URL if not set
if (typeof window !== 'undefined' && !window.__API_BASE_URL__) {
  window.__API_BASE_URL__ = 'http://localhost:8080/api/v1';
}

// Global widget API
window.CPQConfigurator = {
  instances: new Map(),

  // Main embed function
  embed: function(options) {
    const {
      container,
      modelId,
      theme = 'light',
      apiUrl = window.__API_BASE_URL__,
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

    // Set global API URL
    window.__API_BASE_URL__ = apiUrl;

    // Clean up any existing instance
    const existingInstance = this.instances.get(target);
    if (existingInstance) {
      existingInstance.$destroy();
      this.instances.delete(target);
    }

    // Mount the app
    try {
      const app = mount(ConfiguratorApp, {
        target,
        props: {
          modelId,
          theme,
          apiUrl,
          embedMode: true,
          onComplete,
          onConfigurationChange,
          onError,
          ...otherProps
        }
      });

      // Store instance
      this.instances.set(target, app);

      // Return control API
      return {
        destroy: () => {
          app.$destroy();
          this.instances.delete(target);
        },

        update: (newProps) => {
          Object.assign(app.$state, newProps);
        },

        getConfiguration: () => {
          return app.getConfiguration?.() || null;
        },

        reset: () => {
          app.reset?.();
        }
      };
    } catch (error) {
      console.error('Failed to embed configurator:', error);
      throw error;
    }
  },

  // Create standalone instance
  create: function(options) {
    const container = document.createElement('div');
    container.className = 'cpq-configurator-container';
    document.body.appendChild(container);

    return this.embed({
      ...options,
      container,
      embedMode: false
    });
  },

  // Destroy all instances
  destroyAll: function() {
    this.instances.forEach((app, target) => {
      app.$destroy();
    });
    this.instances.clear();
  },

  // Version info
  version: '1.0.0'
};

// Auto-initialize if data attributes present
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const autoElements = document.querySelectorAll('[data-cpq-model-id]');

    autoElements.forEach(element => {
      const modelId = element.dataset.cpqModelId;
      const theme = element.dataset.cpqTheme || 'light';
      const apiUrl = element.dataset.cpqApiUrl || window.__API_BASE_URL__;

      try {
        window.CPQConfigurator.embed({
          container: element,
          modelId,
          theme,
          apiUrl
        });
      } catch (error) {
        console.error('Auto-initialization failed:', error);
      }
    });
  });
}

// Export for ES modules
export default window.CPQConfigurator;