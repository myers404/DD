import ConfiguratorApiClient from '../api/client.js';

class ConfigurationStore {
  // Core state using Svelte 5 runes
  modelId = $state('');
  model = $state(null);
  selections = $state({});
  validationResults = $state([]);
  pricingData = $state(null);
  isLoading = $state(false);
  isValidating = $state(false);
  isPricing = $state(false);
  error = $state(null);
  currentStep = $state(0);

  // Configuration management
  configurationId = $state(null);
  lastSaved = $state(null);
  isDirty = $state(false);

  // API client
  api = $state(null);

  // Internal flags to prevent infinite loops
  #lastValidationSelections = '';
  #lastPricingSelections = '';
  #debounceTimeouts = new Map();
  #modelLoading = false;

  constructor() {
    // Effects will be set up when the store is used in components
    this.initialized = false;
  }

  // Initialize effects - call this from components
  initialize() {
    if (this.initialized) return;
    this.initialized = true;

    console.log('🔧 ConfigurationStore initialized');

    // Initialize API client when modelId changes
    $effect(() => {
      if (this.modelId && !this.#modelLoading) {
        console.log('🔄 ModelId changed, initializing API client:', this.modelId);
        this.api = new ConfiguratorApiClient(__API_BASE_URL__, {
          modelId: this.modelId
        });
        this.loadModel();
      }
    });

    // Debounced auto-validation when selections change
    $effect(() => {
      const selectionsString = JSON.stringify(this.selections);
      if (this.api && Object.keys(this.selections).length > 0 &&
          selectionsString !== this.#lastValidationSelections) {

        // Clear existing timeout
        this.#clearDebounceTimeout('validation');

        // Set new debounced timeout
        const timeoutId = setTimeout(() => {
          this.#lastValidationSelections = selectionsString;
          this.validateSelections();
        }, 300); // 300ms debounce

        this.#debounceTimeouts.set('validation', timeoutId);
      }
    });

    // Debounced auto-pricing when valid selections exist
    $effect(() => {
      const selectionsString = JSON.stringify(this.selections);
      if (this.api && this.isValid && Object.keys(this.selections).length > 0 &&
          selectionsString !== this.#lastPricingSelections) {

        // Clear existing timeout
        this.#clearDebounceTimeout('pricing');

        // Set new debounced timeout
        const timeoutId = setTimeout(() => {
          this.#lastPricingSelections = selectionsString;
          this.calculatePricing();
        }, 500); // 500ms debounce for pricing

        this.#debounceTimeouts.set('pricing', timeoutId);
      }
    });

    // Auto-save every 30 seconds if dirty
    $effect(() => {
      if (this.isDirty && this.configurationId) {
        const interval = setInterval(() => {
          this.saveConfiguration();
        }, 30000);

        return () => clearInterval(interval);
      }
    });
  }

  #clearDebounceTimeout(key) {
    const existingTimeout = this.#debounceTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.#debounceTimeouts.delete(key);
    }
  }

  // Derived state (these work without effects)
  get isValid() {
    return this.validationResults.length === 0;
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

    const selected = [];
    for (const group of this.model.option_groups) {
      for (const option of group.options) {
        if (this.selections[option.id] > 0) {
          selected.push({
            ...option,
            quantity: this.selections[option.id],
            group_name: group.name
          });
        }
      }
    }
    return selected;
  }

  get completionPercentage() {
    if (!this.model?.option_groups) return 0;

    const requiredGroups = this.model.option_groups.filter(g => g.required);
    if (requiredGroups.length === 0) return 100;

    const completedGroups = requiredGroups.filter(group =>
        group.options.some(option => this.selections[option.id] > 0)
    );

    return Math.round((completedGroups.length / requiredGroups.length) * 100);
  }

  get canProceedToNextStep() {
    return this.completionPercentage >= 100 && this.isValid;
  }

  // Core methods
  setModelId(modelId) {
    console.log('🆔 setModelId called:', { current: this.modelId, new: modelId });
    if (this.modelId !== modelId) {
      console.log('🔄 ModelId changing from', this.modelId, 'to', modelId);
      this.modelId = modelId;
      this.reset();
    }
  }

  async loadModel() {
    if (!this.api || this.#modelLoading) {
      console.log('⚠️ Skipping loadModel - no API or already loading');
      return;
    }

    this.#modelLoading = true;
    this.isLoading = true;
    this.error = null;

    console.log('📡 Loading model:', this.modelId);

    try {
      const model = await this.api.getModel();
      console.log('✅ Model loaded successfully:', model.name);
      this.model = model;

      // Initialize selections for any pre-selected options (but only if no current selections)
      if (Object.keys(this.selections).length === 0) {
        const initialSelections = {};
        if (model.option_groups) {
          for (const group of model.option_groups) {
            for (const option of group.options) {
              if (option.default_selected) {
                initialSelections[option.id] = option.default_quantity || 1;
              }
            }
          }
        }

        if (Object.keys(initialSelections).length > 0) {
          console.log('🎯 Setting initial selections:', initialSelections);
          this.selections = initialSelections;
          this.isDirty = true;
        }
      }

    } catch (err) {
      this.error = err.message;
      console.error('❌ Failed to load model:', err);
    } finally {
      this.isLoading = false;
      this.#modelLoading = false;
      console.log('🏁 loadModel completed');
    }
  }

  updateSelection(optionId, quantity) {
    const currentQuantity = this.selections[optionId] || 0;
    if (currentQuantity !== quantity) {
      if (quantity > 0) {
        this.selections[optionId] = quantity;
      } else {
        delete this.selections[optionId];
      }
      this.isDirty = true;

      // Trigger reactive updates
      this.selections = { ...this.selections };
    }
  }

  async validateSelections() {
    if (!this.api || this.isValidating) return;

    this.isValidating = true;

    try {
      const result = await this.api.validateConfiguration(this.selections);
      this.validationResults = result.violations || [];
    } catch (err) {
      console.error('Validation failed:', err);
      this.validationResults = [{
        type: 'error',
        message: 'Failed to validate configuration. Please try again.'
      }];
    } finally {
      this.isValidating = false;
    }
  }

  async calculatePricing() {
    if (!this.api || this.isPricing) return;

    this.isPricing = true;

    try {
      const pricing = await this.api.calculatePricing(this.selections);
      this.pricingData = pricing;
    } catch (err) {
      console.error('Pricing calculation failed:', err);
      this.pricingData = null;
    } finally {
      this.isPricing = false;
    }
  }

  async saveConfiguration() {
    if (!this.api || !this.isDirty) return null;

    try {
      let result;
      if (this.configurationId) {
        result = await this.api.updateConfiguration(this.configurationId, {
          selections: this.selections,
          pricing: this.pricingData
        });
      } else {
        result = await this.api.createConfiguration({
          model_id: this.modelId,
          selections: this.selections,
          pricing: this.pricingData
        });
        this.configurationId = result.id;
      }

      this.lastSaved = new Date();
      this.isDirty = false;
      return result;

    } catch (err) {
      console.error('Failed to save configuration:', err);
      throw err;
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

  goToStep(step) {
    this.currentStep = Math.max(0, Math.min(step, 3));
  }

  reset() {
    console.log('🔄 Resetting store state');

    // Clear timeouts
    for (const timeoutId of this.#debounceTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.#debounceTimeouts.clear();

    // Reset state
    this.model = null;
    this.selections = {};
    this.validationResults = [];
    this.pricingData = null;
    this.currentStep = 0;
    this.configurationId = null;
    this.lastSaved = null;
    this.isDirty = false;
    this.error = null;

    // Reset internal flags
    this.#lastValidationSelections = '';
    this.#lastPricingSelections = '';
    this.#modelLoading = false;
  }

  // Sharing and export
  generateShareableUrl() {
    const config = {
      modelId: this.modelId,
      selections: this.selections,
      timestamp: Date.now()
    };
    const encoded = btoa(JSON.stringify(config));
    return `${window.location.origin}/configure/${this.modelId}?config=${encoded}`;
  }

  loadFromShareableUrl(configParam) {
    try {
      const decoded = JSON.parse(atob(configParam));
      if (decoded.modelId && decoded.selections) {
        this.setModelId(decoded.modelId);
        this.selections = decoded.selections;
        this.isDirty = true;
      }
    } catch (err) {
      console.warn('Failed to load shared configuration:', err);
    }
  }

  exportConfiguration() {
    return {
      model_id: this.modelId,
      model_name: this.model?.name,
      selections: this.selectedOptions.map(option => ({
        option_id: option.id,
        option_name: option.name,
        quantity: this.selections[option.id],
        unit_price: option.base_price,
        total_price: option.base_price * this.selections[option.id]
      })),
      pricing: this.pricingData,
      validation: {
        is_valid: this.isValid,
        errors: this.validationResults
      },
      metadata: {
        created_at: new Date().toISOString(),
        completion_percentage: this.completionPercentage
      }
    };
  }
}

// Create singleton instance
export const configStore = new ConfigurationStore();