// web/src/embed.js
// Embed-specific entry point for iframe integration
import './app.css';
import { mount } from 'svelte';
import ConfiguratorApp from './lib/ConfiguratorApp.svelte';
import { configStore } from './lib/stores/configuration.svelte.js';

// Parse URL parameters for iframe mode
const urlParams = new URLSearchParams(window.location.search);
const modelId = urlParams.get('model') || window.location.pathname.split('/').pop();
const theme = urlParams.get('theme') || 'light';
const apiUrl = urlParams.get('api') || window.__API_BASE_URL__ || '/api/v1';
const configId = urlParams.get('config');

// Communication with parent window
class EmbedMessenger {
  constructor() {
    this.parentOrigin = '*'; // In production, restrict this to specific origins
  }

  send(type, data) {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: `cpq:${type}`,
        ...data
      }, this.parentOrigin);
    }
  }

  sendConfiguration(config) {
    this.send('configuration', { configuration: config });
  }

  sendComplete(config) {
    this.send('complete', { configuration: config });
  }

  sendError(error) {
    this.send('error', {
      error: {
        message: error.message || String(error),
        stack: error.stack
      }
    });
  }

  sendReady() {
    this.send('ready', {
      modelId,
      version: '1.0.0'
    });
  }

  sendResize(height) {
    this.send('resize', { height });
  }
}

const messenger = new EmbedMessenger();

// Create the embed app
if (!modelId) {
  document.body.innerHTML = `
    <div style="padding: 2rem; text-align: center; font-family: system-ui, sans-serif;">
      <h2 style="color: #dc2626;">Configuration Error</h2>
      <p style="color: #6b7280;">No model ID provided. Please specify a model parameter.</p>
    </div>
  `;
  messenger.sendError(new Error('No model ID provided'));
} else {
  // Initialize the configurator
  const app = mount(ConfiguratorApp, {
    target: document.body,
    props: {
      modelId,
      theme,
      apiUrl,
      configurationId: configId,
      embedMode: true,
      onComplete: (config) => {
        messenger.sendComplete(config);
      },
      onConfigurationChange: (config) => {
        messenger.sendConfiguration(config);
      },
      onError: (error) => {
        messenger.sendError(error);
      }
    }
  });

  // Monitor height changes for iframe resizing
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const height = entry.contentRect.height;
      messenger.sendResize(height);
    }
  });

  resizeObserver.observe(document.body);

  // Listen for messages from parent
  window.addEventListener('message', (event) => {
    // In production, verify event.origin
    const { data } = event;

    if (data.type === 'cpq:command') {
      switch (data.command) {
        case 'reset':
          configStore.reset();
          break;

        case 'next':
          configStore.nextStep();
          break;

        case 'previous':
          configStore.previousStep();
          break;

        case 'goToStep':
          if (data.step !== undefined) {
            configStore.goToStep(data.step);
          }
          break;

        case 'updateSelection':
          if (data.optionId && data.quantity !== undefined) {
            configStore.updateSelection(data.optionId, data.quantity);
          }
          break;

        case 'getConfiguration':
          messenger.sendConfiguration(configStore.exportConfiguration());
          break;

        case 'validate':
          configStore.validateSelections().then(() => {
            messenger.send('validation', {
              results: configStore.validationResults
            });
          });
          break;

        case 'calculatePricing':
          configStore.calculatePricing(data.context || {}).then(() => {
            messenger.send('pricing', {
              data: configStore.pricingData
            });
          });
          break;
      }
    }
  });

  // Send ready message when loaded
  configStore.initialize().then(() => {
    messenger.sendReady();
  });
}

// Expose API for debugging
window.__CPQ_EMBED__ = {
  store: configStore,
  messenger,
  modelId,
  theme,
  apiUrl
};