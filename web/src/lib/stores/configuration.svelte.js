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
    this.hiddenOptions = $state(new Set());

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
    return this.pricingData?.total || this.pricingData?.breakdown?.total_price || 0;
  }

  get adjustments() {
    return this.pricingData?.breakdown?.adjustments || [];
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
      // Filter out inactive groups and options for customer UI
      this.groups = (model.groups || []).filter(group => group.is_active !== false);
      this.options = (model.options || []).filter(option => option.is_active !== false);
      this.rules = model.rules || [];
      this.pricingRules = model.pricing_rules || [];
      this.volumeTiers = model.volume_tiers || [];

      // Initialize available options as simple array (will be updated with constraint info later)
      this.availableOptions = this.options.map(opt => ({
        option: opt,
        is_selectable: true,
        reason: null
      }));

      this._modelLoaded = true;

      // Expand first few groups by default
      this.groups.slice(0, 3).forEach(g => this.expandedGroups.add(g.id));

    } catch (error) {
      console.error('Failed to load model:', error);
      this.error = {
        message: error.message || 'Failed to load model',
        code: error.code || 'MODEL_LOAD_ERROR',
        details: error
      };
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
      this.error = {
        message: error.message || 'Failed to create configuration',
        code: error.code || 'CONFIG_CREATE_ERROR',
        details: error
      };
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
    
    // Find the option and its group to check selection type
    const option = this.options.find(o => o.id === optionId);
    if (!option) return;
    
    const group = this.groups.find(g => g.id === option.group_id);
    if (!group) return;

    // For single selection groups, clear other selections in the group
    if (group.selection_type === 'single' && newQuantity > 0) {
      const groupOptions = this.options.filter(o => o.group_id === group.id);
      groupOptions.forEach(opt => {
        if (opt.id !== optionId && this.selections[opt.id]) {
          delete this.selections[opt.id];
        }
      });
    }

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

      // Check for validation data in different possible locations
      const validation = result.validation || result.validation_result;
      if (validation) {
        // Handle nested validation structure
        const validationData = validation.result || validation;
        this.validationResults = validationData;
        this.validationErrors = validationData.violations || [];
      }

      if (result.available_options) {
        // Backend returns AvailableOption objects with is_selectable flag
        this.availableOptions = result.available_options;
        
        // Check for required options and auto-select them
        this.checkAndApplyRequiredOptions(result.available_options);
        
        // Also hide unavailable options by filtering the UI list
        this.updateVisibleOptions();
      }

      // Call pricing endpoint after successful update
      if (this.isValid && this.selectedCount > 0 && this.configurationId) {
        await this.calculatePricing();
      } else {
        // Clear pricing if invalid or no selections
        this.pricingData = null;
      }

    } catch (error) {
      console.error('Failed to update selections:', error);
      // Don't overwrite error state for selection updates - just log
      // This allows the UI to remain functional even if backend updates fail
    }
  }

  // Validation
  async validateConfiguration() {
    if (!this.api || !this.configurationId) return;

    this.isValidating = true;

    try {
      const result = await this.api.validateConfiguration(this.configurationId);
      // Handle nested validation structure from API
      const validationData = result.result || result;
      this.validationResults = validationData;
      this.validationErrors = validationData.violations || [];

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

      // The API client already unwraps the data
      this.pricingData = result;

      console.log('Pricing data updated:', this.pricingData);
    } catch (error) {
      console.error('Pricing calculation failed:', error);
      // Set pricing to null but don't show error to user
      this.pricingData = null;
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

  // Check if an option is available based on constraints
  isOptionAvailable(optionId) {
    if (!this.availableOptions || this.availableOptions.length === 0) {
      return true; // If no constraint info, assume available
    }
    
    const availableOption = this.availableOptions.find(ao => 
      (ao.option && ao.option.id === optionId) || ao.id === optionId
    );
    
    return availableOption ? availableOption.is_selectable !== false : true;
  }

  // Get the reason why an option is not available
  getOptionUnavailableReason(optionId) {
    if (!this.availableOptions || this.availableOptions.length === 0) {
      return null;
    }
    
    const availableOption = this.availableOptions.find(ao => 
      (ao.option && ao.option.id === optionId) || ao.id === optionId
    );
    
    return availableOption && !availableOption.is_selectable ? availableOption.reason : null;
  }

  // Check for and automatically apply required options based on constraints
  checkAndApplyRequiredOptions(availableOptions) {
    let autoSelected = false;
    
    // Look for options that must be selected based on current selections and backend constraint info
    if (Array.isArray(availableOptions)) {
      for (const availableOption of availableOptions) {
        const option = availableOption.option || availableOption;
        const optionId = option.id;
        
        // Check if this option is marked as required by the backend
        if (availableOption.is_required && !this.selections[optionId]) {
          // For single selection groups, clear other selections first
          const group = this.groups.find(g => g.id === option.group_id);
          if (group && group.selection_type === 'single') {
            const groupOptions = this.options.filter(o => o.group_id === group.id);
            groupOptions.forEach(opt => {
              if (opt.id !== optionId && this.selections[opt.id]) {
                delete this.selections[opt.id];
              }
            });
          }
          
          // Auto-select the required option
          this.selections[optionId] = 1;
          autoSelected = true;
          console.log(`Auto-selected required option: ${option.name} (${optionId})`);
        }
      }
    }
    
    // If we auto-selected anything, trigger a re-validation to get updated constraint info
    if (autoSelected) {
      this.isDirty = true;
      // Don't trigger immediate update to avoid infinite loops
      // The reactive effect will handle the next update cycle
    }
  }

  // Simple rule condition evaluator
  evaluateRuleCondition(rule) {
    // This is a simplified version - the real evaluation happens on the backend
    // We're just checking if any options mentioned in the rule are selected
    if (!rule.expression) return false;
    
    // Extract option IDs from the rule expression (simple pattern matching)
    const optionPattern = /\b(opt_\w+|cpu_\w+|ram_\w+|storage_\w+)\b/g;
    const matches = rule.expression.match(optionPattern) || [];
    
    // Check if any of the condition options are selected
    return matches.some(optionId => this.selections[optionId] > 0);
  }

  // Extract required option IDs from a rule
  extractRequiredOptions(rule) {
    if (!rule.expression) return [];
    
    // Look for options after THEN in the expression
    const thenIndex = rule.expression.indexOf('THEN');
    if (thenIndex === -1) return [];
    
    const afterThen = rule.expression.substring(thenIndex + 4);
    const optionPattern = /\b(opt_\w+|cpu_\w+|ram_\w+|storage_\w+)\b/g;
    const matches = afterThen.match(optionPattern) || [];
    
    return matches;
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
        adjustments: this.adjustments,
        breakdown: this.pricingData?.breakdown || null,
        currency: this.pricingData?.currency || 'USD'
      },
      metadata: {
        created: this.configuration?.created_at,
        updated: this.configuration?.updated_at,
        saved: this.lastSaved
      }
    };
  }

  // Filter options based on availability from constraints
  updateVisibleOptions() {
    if (!this.availableOptions || this.availableOptions.length === 0) {
      // If no constraint info, show all options
      return;
    }
    
    // Track which options should be hidden vs disabled
    this.hiddenOptions = new Set();
    
    for (const option of this.options) {
      const availableOption = this.availableOptions.find(ao => 
        (ao.option && ao.option.id === option.id) || ao.id === option.id
      );
      
      if (availableOption && availableOption.is_selectable === false) {
        // If option is currently selected, disable but don't hide
        if (!this.selections[option.id]) {
          this.hiddenOptions.add(option.id);
        }
      }
    }
  }
  
  // Check if an option should be visible in the UI
  isOptionVisible(optionId) {
    if (!this.hiddenOptions) return true;
    return !this.hiddenOptions.has(optionId);
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
    this.hiddenOptions = new Set();
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