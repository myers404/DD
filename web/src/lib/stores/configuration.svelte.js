// web/src/lib/stores/configuration.svelte.js
import { debounce, throttle } from '../utils/timing.js';
import ConfiguratorApiClient from '../api/client.js';
import { persist, recover } from '../utils/storage.js';

class ConfigurationStore {
  // Core state
  modelId = $state('');
  model = $state(null);
  selections = $state({});
  validationResults = $state({ violations: [], isValid: true });
  pricingData = $state(null);

  // UI state
  isLoading = $state(false);
  isValidating = $state(false);
  isPricing = $state(false);
  error = $state(null);
  currentStep = $state(0);

  // Configuration management
  configurationId = $state(null);
  lastSaved = $state(null);
  isDirty = $state(false);

  // History for undo/redo
  history = $state([]);
  historyIndex = $state(-1);
  maxHistorySize = 50;

  // Network state
  isOnline = $state(navigator.onLine);
  retryQueue = [];

  // API client
  #api = null;
  #initialized = false;
  #cleanupFns = [];

  // Computed values
  get isValid() {
    return this.validationResults.isValid && this.validationResults.violations.length === 0;
  }

  get totalPrice() {
    return this.pricingData?.total_price || 0;
  }

  get basePrice() {
    return this.pricingData?.base_price || 0;
  }

  get adjustments() {
    return this.pricingData?.adjustments || [];
  }

  get selectedOptions() {
    if (!this.model?.option_groups) return [];

    return this.model.option_groups.flatMap(group =>
        group.options
            .filter(option => this.selections[option.id] > 0)
            .map(option => ({
              ...option,
              quantity: this.selections[option.id],
              group_name: group.name
            }))
    );
  }

  get completionPercentage() {
    if (!this.model?.option_groups) return 0;

    const requiredGroups = this.model.option_groups.filter(g => g.required);
    if (!requiredGroups.length) return 100;

    const completedGroups = requiredGroups.filter(group =>
        group.options.some(option => this.selections[option.id] > 0)
    );

    return Math.round((completedGroups.length / requiredGroups.length) * 100);
  }

  get canProceedToNextStep() {
    return this.completionPercentage >= 100 && this.isValid && !this.isValidating;
  }

  get canUndo() {
    return this.historyIndex > 0;
  }

  get canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  // Initialize store
  initialize(apiUrl = window.__API_BASE_URL__) {
    if (this.#initialized) return;
    this.#initialized = true;

    // Set up API client
    this.#api = new ConfiguratorApiClient(apiUrl);

    // Recover from localStorage
    this.#recoverState();

    // Set up effects
    this.#setupEffects();

    // Set up network monitoring
    this.#setupNetworkMonitoring();
  }

  // Clean up resources
  destroy() {
    this.#cleanupFns.forEach(fn => fn());
    this.#cleanupFns = [];
    this.#api = null;
    this.#initialized = false;
  }

  #setupEffects() {
    // Auto-load model when modelId changes
    const unsubModel = $effect.root(() => {
      $effect(() => {
        if (this.modelId && this.#api && !this.model && !this.error) {
          this.#api.modelId = this.modelId;
          this.loadModel();
        }
      });
    });
    this.#cleanupFns.push(unsubModel);

    // Debounced validation
    const validateDebounced = debounce(() => {
      if (Object.keys(this.selections).length > 0) {
        this.validateSelections();
      }
    }, 300);

    const unsubValidate = $effect.root(() => {
      $effect(() => {
        // Track selections changes
        const _ = JSON.stringify(this.selections);
        validateDebounced();
      });
    });
    this.#cleanupFns.push(unsubValidate);

    // Debounced pricing
    const pricingDebounced = debounce(() => {
      if (this.isValid && Object.keys(this.selections).length > 0) {
        this.calculatePricing();
      }
    }, 500);

    const unsubPricing = $effect.root(() => {
      $effect(() => {
        // Track validation state and selections
        const _ = this.isValid + JSON.stringify(this.selections);
        pricingDebounced();
      });
    });
    this.#cleanupFns.push(unsubPricing);

    // Auto-save
    const saveDebounced = debounce(() => {
      if (this.isDirty) {
        this.saveConfiguration();
      }
    }, 2000);

    const unsubSave = $effect.root(() => {
      $effect(() => {
        // Track dirty state
        if (this.isDirty) {
          saveDebounced();
        }
      });
    });
    this.#cleanupFns.push(unsubSave);

    // Persist state changes
    const unsubPersist = $effect.root(() => {
      $effect(() => {
        this.#persistState();
      });
    });
    this.#cleanupFns.push(unsubPersist);
  }

  #setupNetworkMonitoring() {
    const handleOnline = () => {
      this.isOnline = true;
      this.#processRetryQueue();
    };

    const handleOffline = () => {
      this.isOnline = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    this.#cleanupFns.push(() => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    });
  }

  async #processRetryQueue() {
    while (this.retryQueue.length > 0 && this.isOnline) {
      const operation = this.retryQueue.shift();
      try {
        await operation();
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }
  }

  #persistState() {
    const state = {
      modelId: this.modelId,
      selections: this.selections,
      configurationId: this.configurationId,
      currentStep: this.currentStep,
      lastSaved: this.lastSaved
    };
    persist('cpq_config_state', state);
  }

  #recoverState() {
    const state = recover('cpq_config_state');
    if (state) {
      this.modelId = state.modelId || '';
      this.selections = state.selections || {};
      this.configurationId = state.configurationId || null;
      this.currentStep = state.currentStep || 0;
      this.lastSaved = state.lastSaved || null;
    }
  }

  #addToHistory() {
    // Remove any redo history
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Add current state
    this.history.push({
      selections: { ...this.selections },
      timestamp: Date.now()
    });

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }

    this.historyIndex = this.history.length - 1;
  }

  // Public methods
  setModelId(modelId) {
    if (this.modelId !== modelId) {
      this.modelId = modelId;
      // Only reset if we had a different model loaded
      if (this.model || this.error) {
        this.reset();
      }
    }
  }

  async loadModel() {
    if (!this.#api || this.isLoading || !this.modelId) {
      console.log('Skipping loadModel:', { api: !!this.#api, isLoading: this.isLoading, modelId: this.modelId });
      return;
    }

    console.log('Loading model:', this.modelId);
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.#api.getModel();
      console.log('Model loaded successfully:', response);
      this.model = response.data || response;

      // Initialize selections for required single-select groups
      if (this.model?.option_groups) {
        for (const group of this.model.option_groups) {
          if (group.required && group.selection_type === 'single' && group.min_selections > 0) {
            const hasSelection = group.options.some(opt => this.selections[opt.id] > 0);
            if (!hasSelection && group.options.length > 0) {
              this.selections[group.options[0].id] = 1;
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load model:', error);
      this.error = {
        type: 'load',
        message: error.message || 'Failed to load model',
        code: error.code
      };

      // Only add to retry queue if offline
      if (!this.isOnline && !error.message.includes('404')) {
        this.retryQueue.push(() => this.loadModel());
      }
    } finally {
      this.isLoading = false;
    }
  }

  updateSelection(optionId, quantity) {
    const oldSelections = { ...this.selections };

    if (quantity > 0) {
      this.selections[optionId] = quantity;
    } else {
      delete this.selections[optionId];
    }

    // Check group constraints
    if (this.model?.option_groups) {
      const option = this.model.option_groups
          .flatMap(g => g.options)
          .find(o => o.id === optionId);

      if (option) {
        const group = this.model.option_groups.find(g =>
            g.options.some(o => o.id === option.id)
        );

        if (group?.selection_type === 'single' && quantity > 0) {
          // Clear other selections in group
          for (const otherOption of group.options) {
            if (otherOption.id !== optionId) {
              delete this.selections[otherOption.id];
            }
          }
        }
      }
    }

    // Only mark dirty if actually changed
    if (JSON.stringify(oldSelections) !== JSON.stringify(this.selections)) {
      this.isDirty = true;
      this.#addToHistory();
    }
  }

  async validateSelections() {
    if (!this.#api || this.isValidating) return;

    this.isValidating = true;

    try {
      const response = await this.#api.validateConfiguration(this.selections);
      this.validationResults = {
        violations: response.data?.violations || [],
        isValid: response.data?.is_valid ?? true
      };
    } catch (error) {
      if (!this.isOnline) {
        this.validationResults = { violations: [], isValid: true };
      } else {
        this.error = { type: 'validation', message: error.message };
      }
    } finally {
      this.isValidating = false;
    }
  }

  async calculatePricing() {
    if (!this.#api || this.isPricing) return;

    this.isPricing = true;

    try {
      const response = await this.#api.calculatePricing(this.selections);
      this.pricingData = response.data || response;
    } catch (error) {
      if (!this.isOnline) {
        // Use cached pricing if available
        this.pricingData = this.pricingData || null;
      } else {
        this.error = { type: 'pricing', message: error.message };
      }
    } finally {
      this.isPricing = false;
    }
  }

  async saveConfiguration() {
    if (!this.#api || !this.isDirty) return;

    try {
      let response;
      if (this.configurationId) {
        response = await this.#api.updateConfiguration(this.configurationId, this.selections);
      } else {
        response = await this.#api.createConfiguration(this.selections);
        this.configurationId = response.data?.id || response.id;
      }

      this.lastSaved = new Date();
      this.isDirty = false;

      return response;
    } catch (error) {
      if (!this.isOnline) {
        this.retryQueue.push(() => this.saveConfiguration());
      } else {
        this.error = { type: 'save', message: error.message };
      }
      throw error;
    }
  }

  undo() {
    if (this.canUndo) {
      this.historyIndex--;
      this.selections = { ...this.history[this.historyIndex].selections };
      this.isDirty = true;
    }
  }

  redo() {
    if (this.canRedo) {
      this.historyIndex++;
      this.selections = { ...this.history[this.historyIndex].selections };
      this.isDirty = true;
    }
  }

  nextStep() {
    if (this.canProceedToNextStep) {
      this.currentStep = Math.min(this.currentStep + 1, 3);
    }
  }

  previousStep() {
    this.currentStep = Math.max(this.currentStep - 1, 0);
  }

  reset() {
    this.model = null;
    this.selections = {};
    this.validationResults = { violations: [], isValid: true };
    this.pricingData = null;
    this.currentStep = 0;
    this.configurationId = null;
    this.lastSaved = null;
    this.isDirty = false;
    this.error = null;
    this.isLoading = false;
    this.isValidating = false;
    this.isPricing = false;
    this.history = [];
    this.historyIndex = -1;
    this.retryQueue = [];
  }

  clearError() {
    this.error = null;
  }
}

// Export singleton instance
export const configStore = new ConfigurationStore();