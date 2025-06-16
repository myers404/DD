// Embed-specific entry point for iframe integration
import './app.css';
import { mount } from 'svelte';
import ConfiguratorApp from './lib/ConfiguratorApp.svelte';

// Parse URL parameters for iframe mode
const urlParams = new URLSearchParams(window.location.search);
const modelId = urlParams.get('model') || window.location.pathname.split('/').pop();
const theme = urlParams.get('theme') || 'light';
const apiUrl = urlParams.get('api') || __API_BASE_URL__;

// Create the embed app using Svelte 5 mount API
const app = mount(ConfiguratorApp, {
  target: document.body,
  props: {
    modelId,
    theme,
    apiUrl,
    embedMode: true,
    onComplete: (config) => {
      // Send completion event to parent
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'cpq-configuration-complete',
          configuration: config
        }, '*');
      }
    },
    onConfigurationChange: (config) => {
      // Send change events to parent
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'cpq-configuration-change',
          configuration: config
        }, '*');
      }
    },
    onError: (error) => {
      // Send error events to parent
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'cpq-error',
          error: error.message
        }, '*');
      }
    }
  }
});

export default app;