// web/src/widget.js
import { mount } from 'svelte';
import ConfiguratorApp from './lib/ConfiguratorApp.svelte';
import { configStore } from './lib/stores/configuration.svelte.js';

// CPQ Configurator Widget API
class CPQWidget {
  constructor(element, options = {}) {
    this.element = element;
    this.options = options;
    this.app = null;
    this.store = configStore;
  }

  mount() {
    // Ensure element is empty
    this.element.innerHTML = '';

    // Mount the Svelte app
    this.app = mount(ConfiguratorApp, {
      target: this.element,
      props: {
        modelId: this.options.modelId,
        apiUrl: this.options.apiUrl || '/api/v1',
        theme: this.options.theme || 'light',
        embedMode: this.options.embedMode !== false,
        configurationId: this.options.configurationId,
        onComplete: this.options.onComplete,
        onConfigurationChange: this.options.onConfigurationChange,
        onError: this.options.onError
      }
    });

    return this;
  }

  destroy() {
    if (this.app) {
      this.app.$destroy();
      this.app = null;
    }
    this.store.reset();
  }

  updateModel(modelId) {
    if (this.app) {
      this.store.setModelId(modelId);
    }
  }

  updateTheme(theme) {
    if (this.app) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  getConfiguration() {
    return this.store.exportConfiguration();
  }

  async loadConfiguration(configId) {
    return this.store.loadConfiguration(configId);
  }

  reset() {
    this.store.reset();
  }

  // Navigation methods
  nextStep() {
    this.store.nextStep();
  }

  previousStep() {
    this.store.previousStep();
  }

  goToStep(step) {
    this.store.goToStep(step);
  }

  // Selection methods
  updateSelection(optionId, quantity) {
    this.store.updateSelection(optionId, quantity);
  }

  getSelections() {
    return this.store.selections;
  }

  // Validation methods
  async validate() {
    return this.store.validateSelections();
  }

  isValid() {
    return this.store.isValid;
  }

  getValidationResults() {
    return this.store.validationResults;
  }

  // Pricing methods
  async calculatePricing(context = {}) {
    return this.store.calculatePricing(context);
  }

  getPricingData() {
    return this.store.pricingData;
  }

  getTotalPrice() {
    return this.store.totalPrice;
  }
}

// Global widget factory
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

    // Create and mount widget
    const widget = new CPQWidget(targetElement, options);
    widget.mount();

    return widget;
  },

  // Version info
  version: '1.0.0',

  // Export classes for advanced usage
  Widget: CPQWidget,
  Store: configStore
};

// Auto-initialize widgets with data attributes
document.addEventListener('DOMContentLoaded', () => {
  const autoElements = document.querySelectorAll('[data-cpq-auto-init]');

  autoElements.forEach(element => {
    const modelId = element.getAttribute('data-model-id');
    const apiUrl = element.getAttribute('data-api-url');
    const theme = element.getAttribute('data-theme');
    const configId = element.getAttribute('data-config-id');

    if (modelId) {
      try {
        const widget = window.CPQConfigurator.create(element, {
          modelId,
          apiUrl,
          theme,
          configurationId: configId,
          embedMode: true,
          onComplete: (config) => {
            // Dispatch custom event
            element.dispatchEvent(new CustomEvent('cpq:complete', {
              detail: config,
              bubbles: true
            }));
          },
          onConfigurationChange: (config) => {
            // Dispatch custom event
            element.dispatchEvent(new CustomEvent('cpq:change', {
              detail: config,
              bubbles: true
            }));
          },
          onError: (error) => {
            // Dispatch custom event
            element.dispatchEvent(new CustomEvent('cpq:error', {
              detail: error,
              bubbles: true
            }));
          }
        });

        // Store widget reference
        element.__cpqWidget = widget;
      } catch (error) {
        console.error('Failed to auto-initialize CPQ widget:', error);
      }
    }
  });
});

// ES Module export
export default window.CPQConfigurator;
export { CPQWidget, configStore };