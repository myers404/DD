// web/src/lib/stores/configuration.svelte.js
import ConfiguratorApiClient from '../api/client.js';
import { sanitizeObject, debugCheckForCode } from '../utils/sanitizer.js';

class ConfigurationStore {
  constructor() {
    // Core state
    this.modelId = $state('');
    this.model = $state(null);
    this.configuration = $state(null);
    this.selections = $state({});
    this.validationResults = $state(null);
    this.pricingData = $state(null);
    this.availableOptions = $state([]);
    this.constraints = $state([]);

    // Model data
    this.groups = $state([]);
    this.options = $state([]);
    this.rules = $state([]);
    this.pricingRules = $state([]);
    this.volumeTiers = $state([]);

    // Loading states
    this.isLoading = $state(false);
    this.isValidating = $state(false);
    this.isPricing = $state(false);
    this.isSaving = $state(false);

    // Error handling
    this.error = $state(null);
    this.validationErrors = $state([]);

    // Configuration management
    this.configurationId = $state(null);
    this.lastSaved = $state(null);
    this.isDirty = $state(false);

    // UI state
    this.currentStep = $state(0);
    this.expandedGroups = $state(new Set());

    // API client
    this.api = null;

    // Internal
    this._initialized = false;
    this._debounceTimers = new Map();
    this._modelLoaded = false;
  }

  // Initialize store
  async initialize() {
    if (this._initialized) return;
    this._initialized = true;

    console.log('🚀 ConfigurationStore initialized');

    // Setup effects for reactive updates
    $effect(() => {
      if (this.modelId && !this.api) {
        this.api = new ConfiguratorApiClient(window.__API_BASE_URL__, {
          modelId: this.modelId
        });
        this.loadModel();
      }
    });

    // Auto-validate and price on selection changes
    $effect(() => {
      if (this.configurationId && this.selections && Object.keys(this.selections).length >= 0) {
        this._debounce('update', () => {
          this.updateSelectionsOnBackend();
        }, 300);
      }
    });
  }

  // Computed values
  get isValid() {
    return !this.validationResults ||
        !this.validationResults.violations ||
        this.validationResults.violations.length === 0;
  }

  get selectedCount() {
    return Object.values(this.selections).filter(v => v > 0).length;
  }

  get progress() {
    if (!this.model || !this.options) return 0;
    const totalRequired = this.groups.filter(g => g.required).length;
    if (totalRequired === 0) return this.selectedCount > 0 ? 100 : 0;

    const completedRequired = this.groups
        .filter(g => g.required)
        .filter(g => this.hasGroupSelection(g.id))
        .length;

    return Math.round((completedRequired / totalRequired) * 100);
  }

  get totalPrice() {
    return this.pricingData?.final_total || 0;
  }

  get discounts() {
    return this.pricingData?.discounts || [];
  }

  get safeGroups() {
    return Array.isArray(this.groups) ? this.groups : [];
  }

  get safeOptions() {
    return Array.isArray(this.options) ? this.options : [];
  }

  // Model loading
  async loadModel() {
    if (!this.api || !this.modelId || this._modelLoaded) return;

    this.isLoading = true;
    this.error = null;

    try {
      const model = await this.api.getModel(this.modelId);

      // Sanitize and set model data
      this.model = sanitizeObject(model);
      this.groups = model.groups || [];
      this.options = model.options || [];
      this.rules = model.rules || [];
      this.pricingRules = model.pricing_rules || [];
      this.volumeTiers = model.volume_tiers || [];

      // Initialize available options
      this.availableOptions = [...this.options];

      this._modelLoaded = true;

      // Expand first few groups by default
      this.groups.slice(0, 3).forEach(g => this.expandedGroups.add(g.id));

    } catch (error) {
      console.error('Failed to load model:', error);
      this.error = error;
    } finally {
      this.isLoading = false;
    }
  }

  // Configuration management
  async createConfiguration() {
    if (!this.api || this.configurationId) return;

    try {
      const result = await this.api.createConfiguration({
        model_id: this.modelId,
        name: `Configuration ${new Date().toISOString()}`
      });

      this.configuration = result;
      this.configurationId = result.id;

      // Now update with current selections
      if (this.selectedCount > 0) {
        await this.updateSelectionsOnBackend();
      }

    } catch (error) {
      console.error('Failed to create configuration:', error);
      this.error = error;
    }
  }

  async loadConfiguration(configId) {
    if (!this.api) return;

    this.isLoading = true;

    try {
      const config = await this.api.getConfiguration(configId);

      this.configuration = config;
      this.configurationId = config.id;
      this.selections = config.selections || {};

      // Load the model if needed
      if (config.model_id && config.model_id !== this.modelId) {
        this.modelId = config.model_id;
        await this.loadModel();
      }

      // Validate and price
      await this.validateConfiguration();
      await this.calculatePricing();

    } catch (error) {
      console.error('Failed to load configuration:', error);
      this.error = error;
    } finally {
      this.isLoading = false;
    }
  }

  async saveConfiguration() {
    if (!this.api || !this.configurationId) return false;

    this.isSaving = true;

    try {
      await this.api.updateConfiguration(this.configurationId, {
        selections: this.selections,
        status: 'in_progress'
      });

      this.lastSaved = new Date();
      this.isDirty = false;

      return true;
    } catch (error) {
      console.error('Failed to save configuration:', error);
      this.error = error;
      return false;
    } finally {
      this.isSaving = false;
    }
  }

  // Selection management
  updateSelection(optionId, quantity) {
    if (!optionId) return;

    const newQuantity = quantity > 0 ? 1 : 0;

    if (newQuantity === 0) {
      delete this.selections[optionId];
    } else {
      this.selections[optionId] = newQuantity;
    }

    this.isDirty = true;

    // Create configuration if needed
    if (!this.configurationId && this.selectedCount > 0) {
      this.createConfiguration();
    }
  }

  async updateSelectionsOnBackend() {
    if (!this.api || !this.configurationId) return;

    try {
      const result = await this.api.addSelections(this.configurationId, {
        selections: Object.entries(this.selections).map(([optionId, quantity]) => ({
          option_id: optionId,
          quantity: quantity
        }))
      });

      // Update state from response
      if (result.configuration) {
        this.configuration = result.configuration;
      }

      if (result.validation) {
        this.validationResults = result.validation;
        this.validationErrors = result.validation.violations || [];
      }

      if (result.available_options) {
        this.availableOptions = result.available_options;
      }

      // Call pricing endpoint after successful update
      if (this.isValid && this.selectedCount > 0) {
        await this.calculatePricing();
      } else {
        // Clear pricing if invalid or no selections
        this.pricingData = null;
      }

    } catch (error) {
      console.error('Failed to update selections:', error);
      this.error = error;
    }
  }

  // Validation
  async validateConfiguration() {
    if (!this.api || !this.configurationId) return;

    this.isValidating = true;

    try {
      const result = await this.api.validateConfiguration(this.configurationId);
      this.validationResults = result;

      if (result.available_options) {
        this.availableOptions = result.available_options;
      }

    } catch (error) {
      console.error('Configuration validation failed:', error);
    } finally {
      this.isValidating = false;
    }
  }

  // Pricing
  async calculatePricing(context = {}) {
    if (!this.api || !this.configurationId || this.isPricing) return;

    this.isPricing = true;

    try {
      // Transform selections to array format with option_id and quantity
      const selectionsArray = Object.entries(this.selections)
          .filter(([_, value]) => value > 0)
          .map(([optionId, _]) => ({
            option_id: optionId,
            quantity: 1  // Always 1 as per your requirement
          }));

      const result = await this.api.calculatePrice(this.configurationId, {
        selections: selectionsArray,
        ...context
      });

      // Handle the response structure - might be wrapped in 'data'
      if (result && result.data) {
        this.pricingData = result.data;
      } else {
        this.pricingData = result;
      }

      console.log('Pricing data updated:', this.pricingData);
    } catch (error) {
      console.error('Pricing calculation failed:', error);
      // Don't set error state - just log it
    } finally {
      this.isPricing = false;
    }
  }

  // UI helpers
  isGroupExpanded(groupId) {
    return this.expandedGroups.has(groupId);
  }

  toggleGroup(groupId) {
    if (this.expandedGroups.has(groupId)) {
      this.expandedGroups.delete(groupId);
    } else {
      this.expandedGroups.add(groupId);
    }
    // Force reactivity
    this.expandedGroups = new Set(this.expandedGroups);
  }

  hasGroupSelection(groupId) {
    const options = this.safeOptions;
    return options
        .filter(o => o.group_id === groupId)
        .some(o => this.selections[o.id] > 0);
  }

  getGroupSelectionCount(groupId) {
    const options = this.safeOptions;
    return options
        .filter(o => o.group_id === groupId)
        .filter(o => this.selections[o.id] > 0)
        .length;
  }

  // Export configuration
  exportConfiguration() {
    return {
      id: this.configurationId,
      model_id: this.modelId,
      selections: this.selections,
      validation: {
        is_valid: this.isValid,
        violations: this.validationErrors
      },
      pricing: {
        total_price: this.totalPrice,
        discounts: this.discounts,
        breakdown: this.pricingData?.breakdown || []
      },
      metadata: {
        created: this.configuration?.created_at,
        updated: this.configuration?.updated_at,
        saved: this.lastSaved
      }
    };
  }

  // Reset store
  reset() {
    this.selections = {};
    this.validationResults = null;
    this.pricingData = null;
    this.configuration = null;
    this.configurationId = null;
    this.currentStep = 0;
    this.isDirty = false;
    this.error = null;
    this.validationErrors = [];
  }

  // Utility method for debouncing
  _debounce(key, fn, delay) {
    clearTimeout(this._debounceTimers.get(key));
    this._debounceTimers.set(key, setTimeout(fn, delay));
  }

  // Model setter
  setModelId(modelId) {
    if (this.modelId !== modelId) {
      this.reset();
      this.modelId = modelId;
      this._modelLoaded = false;
    }
  }
}

// Create singleton instance
export const configStore = new ConfigurationStore();

// Export for component usage
export default configStore;