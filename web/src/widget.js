import ConfiguratorApp from './lib/ConfiguratorApp.svelte';

class CPQConfigurator {
  constructor() {
    this.instances = new Map();
  }
  
  embed(options) {
    const {
      container,
      modelId,
      theme = 'light',
      apiUrl = 'http://localhost:8080/api/v1',
      onComplete,
      onConfigurationChange,
      onError
    } = options;
    
    if (!container || !modelId) {
      throw new Error('Container and modelId are required');
    }
    
    const targetElement = typeof container === 'string' 
      ? document.querySelector(container)
      : container;
      
    if (!targetElement) {
      throw new Error('Target container not found');
    }
    
    // Create configurator instance
    const instance = new ConfiguratorApp({
      target: targetElement,
      props: {
        modelId,
        theme,
        apiUrl,
        embedMode: true,
        onComplete,
        onConfigurationChange,
        onError
      }
    });
    
    // Store instance for cleanup
    const instanceId = Math.random().toString(36).substr(2, 9);
    this.instances.set(instanceId, instance);
    
    return {
      id: instanceId,
      destroy: () => this.destroy(instanceId),
      updateProps: (newProps) => {
        Object.entries(newProps).forEach(([key, value]) => {
          instance.$set({ [key]: value });
        });
      }
    };
  }
  
  destroy(instanceId) {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.$destroy();
      this.instances.delete(instanceId);
    }
  }
  
  destroyAll() {
    this.instances.forEach(instance => instance.$destroy());
    this.instances.clear();
  }
}

// Global API
window.CPQConfigurator = new CPQConfigurator();

// Auto-initialize if data attributes present
document.addEventListener('DOMContentLoaded', () => {
  const autoElements = document.querySelectorAll('[data-cpq-configurator]');
  
  autoElements.forEach(element => {
    const modelId = element.dataset.cpqModelId;
    const theme = element.dataset.cpqTheme || 'light';
    const apiUrl = element.dataset.cpqApiUrl;
    
    if (modelId) {
      window.CPQConfigurator.embed({
        container: element,
        modelId,
        theme,
        ...(apiUrl && { apiUrl })
      });
    }
  });
});