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

  constructor() {
    // Effects will be set up when the store is used in components
    this.initialized = false;
  }

  // Initialize effects - call this from components
  initialize() {
    if (this.initialized) return;
    this.initialized = true;

    // Initialize API client when modelId changes
    $effect(() => {
      if (this.modelId) {
        this.api = new ConfiguratorApiClient(__API_BASE_URL__, {
          modelId: this.modelId
        });
        this.loadModel();
      }
    });

    // Auto-validate when selections change
    $effect(() => {
      if (this.api && Object.keys(this.selections).length > 0) {
        this.validateSelections();
      }
    });

    // Auto-price when valid selections exist
    $effect(() => {
      if (this.api && this.isValid && Object.keys(this.selections).length > 0) {
        this.calculatePricing();
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

  get completionPercentage() {
    if (!this.model?.option_groups) return 0;
    const requiredGroups = this.model.option_groups.filter(g => g.required);
    if (requiredGroups.length === 0) return 100;

    const completedGroups = requiredGroups.filter(group => {
      return group.options.some(option => this.selections[option.id] > 0);
    });

    return Math.round((completedGroups.length / requiredGroups.length) * 100);
  }

  get canProceedToNextStep() {
    switch (this.currentStep) {
      case 0: // Model selection
        return this.model !== null;
      case 1: // Option selection
        return this.isValid && Object.keys(this.selections).length > 0;
      case 2: // Review
        return this.isValid && this.pricingData !== null;
      default:
        return false;
    }
  }

  get selectedOptions() {
    if (!this.model?.options) return [];
    return this.model.options.filter(option => this.selections[option.id] > 0);
  }

  // Actions
  async loadModel() {
    if (!this.api) return;

    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.api.getModel();
      if (response.success) {
        this.model = response.data;
      } else {
        throw new Error(response.message || 'Failed to load model');
      }
    } catch (err) {
      this.error = err.message;
    } finally {
      this.isLoading = false;
    }
  }

  async validateSelections() {
    if (!this.api || this.isValidating) return;

    this.isValidating = true;

    try {
      const response = await this.api.validateConfiguration(this.selections);
      if (response.success) {
        this.validationResults = response.data?.validation_result?.errors || [];
      }
    } catch (err) {
      console.warn('Validation failed:', err);
      this.validationResults = [{ message: 'Validation service unavailable' }];
    } finally {
      this.isValidating = false;
    }
  }

  async calculatePricing() {
    if (!this.api || this.isPricing) return;

    this.isPricing = true;

    try {
      const response = await this.api.calculatePricing(this.selections);
      if (response.success) {
        this.pricingData = response.data;
      }
    } catch (err) {
      console.warn('Pricing calculation failed:', err);
      this.pricingData = null;
    } finally {
      this.isPricing = false;
    }
  }

  async saveConfiguration() {
    if (!this.api) return;

    try {
      if (this.configurationId) {
        await this.api.updateConfiguration(this.configurationId, this.selections);
      } else {
        const response = await this.api.createConfiguration(this.selections);
        if (response.success) {
          this.configurationId = response.data.id;
        }
      }
      this.lastSaved = new Date();
      this.isDirty = false;
    } catch (err) {
      console.warn('Failed to save configuration:', err);
    }
  }

  setModelId(id) {
    this.modelId = id;
    this.reset();

    // Initialize API client immediately
    if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
      this.api = new ConfiguratorApiClient(window.__API_BASE_URL__, {
        modelId: id
      });
      this.loadModel();
    }
  }

  updateSelection(optionId, quantity) {
    if (quantity <= 0) {
      delete this.selections[optionId];
      this.selections = { ...this.selections };
    } else {
      this.selections[optionId] = quantity;
      this.selections = { ...this.selections };
    }
    this.isDirty = true;

    // Trigger validation manually if not auto-validating
    if (this.api && !this.initialized) {
      this.validateSelections();
    }
  }

  removeSelection(optionId) {
    delete this.selections[optionId];
    this.selections = { ...this.selections };
    this.isDirty = true;
  }

  clearSelections() {
    this.selections = {};
    this.validationResults = [];
    this.pricingData = null;
    this.isDirty = true;
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
    this.model = null;
    this.selections = {};
    this.validationResults = [];
    this.pricingData = null;
    this.currentStep = 0;
    this.configurationId = null;
    this.lastSaved = null;
    this.isDirty = false;
    this.error = null;
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