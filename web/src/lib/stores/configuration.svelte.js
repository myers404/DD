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

    // Model data - ensure arrays are initialized
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

    // Ensure arrays are initialized
    if (!Array.isArray(this.groups)) this.groups = [];
    if (!Array.isArray(this.options)) this.options = [];
    if (!Array.isArray(this.rules)) this.rules = [];
    if (!Array.isArray(this.pricingRules)) this.pricingRules = [];
    if (!Array.isArray(this.volumeTiers)) this.volumeTiers = [];
    if (!Array.isArray(this.availableOptions)) this.availableOptions = [];
    if (!Array.isArray(this.validationErrors)) this.validationErrors = [];

    // Setup effects for reactive updates
    $effect(() => {
      if (this.modelId && !this.api) {
        this.api = new ConfiguratorApiClient(window.__API_BASE_URL__, {
          modelId: this.modelId
        });
        this.loadModel();
      }
    });

    // Auto-validate on selection changes
    $effect(() => {
      if (this.api && Object.keys(this.selections).length > 0) {
        this._debounce('validate', () => this.validateSelections(), 500);
      }
    });

    // Auto-calculate pricing after validation
    $effect(() => {
      if (this.api && this.isValid && Object.keys(this.selections).length > 0) {
        this._debounce('pricing', () => this.calculatePricing(), 300);
      }
    });

    // Track dirty state
    $effect(() => {
      if (this.configuration && Object.keys(this.selections).length > 0) {
        this.isDirty = true;
      }
    });
  }

  // Computed values
  get isValid() {
    return !this.validationResults || this.validationResults.is_valid;
  }

  get hasViolations() {
    return this.validationResults?.violations?.length > 0;
  }

  get totalPrice() {
    return this.pricingData?.total_price || 0;
  }

  get basePrice() {
    return this.pricingData?.base_price || 0;
  }

  get discounts() {
    return this.pricingData?.discounts || [];
  }

  get selectedCount() {
    return Object.values(this.selections).reduce((sum, qty) => sum + qty, 0);
  }

  // Safe getters for arrays
  get safeGroups() {
    return Array.isArray(this.groups) ? this.groups : [];
  }

  get safeOptions() {
    return Array.isArray(this.options) ? this.options : [];
  }

  get safeRules() {
    return Array.isArray(this.rules) ? this.rules : [];
  }

  get safePricingRules() {
    return Array.isArray(this.pricingRules) ? this.pricingRules : [];
  }

  get safeVolumeTiers() {
    return Array.isArray(this.volumeTiers) ? this.volumeTiers : [];
  }

  get progress() {
    if (!this.model || !this._modelLoaded) return 0;
    const groups = this.safeGroups;
    if (groups.length === 0) return 0;

    const requiredGroups = groups.filter(g => g && g.required).length;
    if (requiredGroups === 0) return 100; // No required groups means complete

    const selectedGroups = groups.filter(g => g && g.id && this.hasGroupSelection(g.id)).length;
    return Math.round((selectedGroups / requiredGroups) * 100);
  }

  // Model Management
  async loadModel() {
    if (!this.api) return;

    this.isLoading = true;
    this.error = null;

    try {
      // Load model with all related data
      const [model, groupsResponse, optionsResponse, rulesResponse, pricingRulesResponse] = await Promise.all([
        this.api.getModel(),
        this.api.getModelGroups(),
        this.api.getModelOptions(),
        this.api.getModelRules().catch(() => ({ data: [] })),
        this.api.getModelPricingRules().catch(() => ({ data: [] }))
      ]);

      // Ensure we have the model data
      this.model = model;

      // Extract arrays from responses, handling different response formats
      this.groups = Array.isArray(groupsResponse) ? groupsResponse :
          (groupsResponse && typeof groupsResponse === 'object' && groupsResponse.data) ? groupsResponse.data :
              (groupsResponse && typeof groupsResponse === 'object' && groupsResponse.groups) ? groupsResponse.groups :
                  (model && model.option_groups && Array.isArray(model.option_groups)) ? model.option_groups :
                      (model && model.groups && Array.isArray(model.groups)) ? model.groups :
                          [];

      this.options = Array.isArray(optionsResponse) ? optionsResponse :
          (optionsResponse && typeof optionsResponse === 'object' && optionsResponse.data) ? optionsResponse.data :
              (optionsResponse && typeof optionsResponse === 'object' && optionsResponse.options) ? optionsResponse.options :
                  (model && model.options && Array.isArray(model.options)) ? model.options :
                      [];

      this.rules = Array.isArray(rulesResponse) ? rulesResponse :
          (rulesResponse && typeof rulesResponse === 'object' && rulesResponse.data) ? rulesResponse.data :
              (rulesResponse && typeof rulesResponse === 'object' && rulesResponse.rules) ? rulesResponse.rules :
                  [];

      this.pricingRules = Array.isArray(pricingRulesResponse) ? pricingRulesResponse :
          (pricingRulesResponse && typeof pricingRulesResponse === 'object' && pricingRulesResponse.data) ? pricingRulesResponse.data :
              (pricingRulesResponse && typeof pricingRulesResponse === 'object' && pricingRulesResponse.pricing_rules) ? pricingRulesResponse.pricing_rules :
                  [];

      // Clean up any function strings in descriptions
      this.groups = this.groups.map(group => ({
        ...group,
        description: (typeof group.description === 'string' &&
            (group.description.includes('=>') ||
                group.description.includes('function') ||
                group.description.includes('$props')))
            ? '' : group.description
      }));

      this.options = this.options.map(option => ({
        ...option,
        description: (typeof option.description === 'string' &&
            (option.description.includes('=>') ||
                option.description.includes('function') ||
                option.description.includes('$props')))
            ? '' : option.description
      }));

      // Final safety check - ensure everything is an array
      if (!Array.isArray(this.groups)) this.groups = [];
      if (!Array.isArray(this.options)) this.options = [];
      if (!Array.isArray(this.rules)) this.rules = [];
      if (!Array.isArray(this.pricingRules)) this.pricingRules = [];

      // If groups/options are empty, try to get them from the model itself
      if (this.groups.length === 0 && model.option_groups) {
        console.log('Using groups from model.option_groups');
        this.groups = Array.isArray(model.option_groups) ? model.option_groups : [];
      }
      if (this.groups.length === 0 && model.groups) {
        console.log('Using groups from model.groups');
        this.groups = Array.isArray(model.groups) ? model.groups : [];
      }

      if (this.options.length === 0 && model.options) {
        console.log('Using options from model.options');
        this.options = Array.isArray(model.options) ? model.options : [];
      }

      // If we still don't have options but have groups, try to extract from groups
      if (this.options.length === 0 && this.groups.length > 0) {
        const extractedOptions = [];
        this.groups.forEach(group => {
          if (Array.isArray(group.options)) {
            group.options.forEach(opt => {
              extractedOptions.push({
                ...opt,
                group_id: group.id
              });
            });
          }
        });
        if (extractedOptions.length > 0) {
          console.log('Extracted options from groups:', extractedOptions.length);
          this.options = extractedOptions;
        }
      }

      // Log what we got for debugging
      console.log('Model loaded:', {
        model: model,
        groups: this.groups,
        options: this.options,
        groupsCount: this.groups.length,
        optionsCount: this.options.length
      });

      // Debug: Check for any function strings in the data
      this.groups.forEach((group, index) => {
        if (group.description && typeof group.description === 'string' &&
            (group.description.includes('=>') || group.description.includes('function'))) {
          console.warn(`Group ${index} (${group.name}) has function code in description:`, group.description);
        }
        if (group.name && typeof group.name === 'string' &&
            (group.name.includes('=>') || group.name.includes('function'))) {
          console.warn(`Group ${index} has function code in name:`, group.name);
        }
      });

      this.options.forEach((option, index) => {
        if (option.description && typeof option.description === 'string' &&
            (option.description.includes('=>') || option.description.includes('function'))) {
          console.warn(`Option ${index} (${option.name}) has function code in description:`, option.description);
        }
        if (option.name && typeof option.name === 'string' &&
            (option.name.includes('=>') || option.name.includes('function'))) {
          console.warn(`Option ${index} has function code in name:`, option.name);
        }
      });

      // Load volume tiers
      try {
        const tiersResponse = await this.api.getVolumeTiers();
        this.volumeTiers = Array.isArray(tiersResponse) ? tiersResponse :
            (tiersResponse && typeof tiersResponse === 'object' && tiersResponse.data) ? tiersResponse.data :
                (tiersResponse && typeof tiersResponse === 'object' && tiersResponse.tiers) ? tiersResponse.tiers :
                    [];
      } catch (e) {
        console.warn('Volume tiers not available');
        this.volumeTiers = [];
      }

      // Final check for volume tiers
      if (!Array.isArray(this.volumeTiers)) this.volumeTiers = [];

      // Create initial configuration
      if (this.groups.length > 0 || this.options.length > 0) {
        this._modelLoaded = true;
        await this.createConfiguration();
      } else {
        console.warn('No groups or options loaded - skipping configuration creation');
      }

    } catch (error) {
      this.error = error.message;
      console.error('Failed to load model:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Configuration Management
  async createConfiguration() {
    if (!this.api || this.configuration) return;

    try {
      const config = await this.api.createConfiguration([]);
      this.configuration = config;
      this.configurationId = config.id;
      console.log('Configuration created:', config.id);
    } catch (error) {
      this.error = error.message;
      console.error('Failed to create configuration:', error);
    }
  }

  async loadConfiguration(configId) {
    if (!this.api) return;

    this.isLoading = true;

    try {
      const config = await this.api.getConfiguration(configId);
      this.configuration = config;
      this.configurationId = config.id;

      // Convert selections to object format
      const selectionsObj = {};
      config.selections?.forEach(sel => {
        selectionsObj[sel.option_id] = sel.quantity;
      });
      this.selections = selectionsObj;

      // Validate and price
      await Promise.all([
        this.validateConfiguration(),
        this.calculatePricing()
      ]);

    } catch (error) {
      this.error = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  async saveConfiguration() {
    if (!this.api || !this.configurationId || !this.isDirty) return;

    this.isSaving = true;

    try {
      await this.api.updateConfiguration(this.configurationId, {
        selections: this.selections,
        name: `Configuration ${new Date().toLocaleDateString()}`
      });

      this.lastSaved = new Date();
      this.isDirty = false;

    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      this.isSaving = false;
    }
  }

  // Selection Management
  async updateSelection(optionId, quantity) {
    // Ensure we have data loaded
    const options = this.safeOptions;
    const groups = this.safeGroups;

    if (options.length === 0) {
      console.warn('Cannot update selection - options not loaded');
      return;
    }

    const newSelections = { ...this.selections };

    if (quantity > 0) {
      newSelections[optionId] = quantity;
    } else {
      delete newSelections[optionId];
    }

    // Check group constraints
    const option = options.find(o => o.id === optionId);
    if (option) {
      const group = groups.find(g => g.id === option.group_id);

      if (group?.selection_type === 'single') {
        // Clear other selections in the group
        options
            .filter(o => o.group_id === group.id && o.id !== optionId)
            .forEach(o => delete newSelections[o.id]);
      }

      if (group?.max_selections) {
        // Check max selections
        const groupSelections = options
            .filter(o => o.group_id === group.id && newSelections[o.id])
            .length;

        if (groupSelections > group.max_selections) {
          this.error = `Maximum ${group.max_selections} selections allowed in ${group.name}`;
          return;
        }
      }
    }

    this.selections = newSelections;

    // Update backend
    if (this.configurationId) {
      try {
        if (quantity > 0) {
          await this.api.addSelections(this.configurationId, newSelections);
        } else {
          await this.api.removeSelection(this.configurationId, optionId);
        }
      } catch (error) {
        this.error = error.message;
      }
    }
  }

  toggleOption(optionId) {
    const currentQty = this.selections[optionId] || 0;
    return this.updateSelection(optionId, currentQty > 0 ? 0 : 1);
  }

  // Validation
  async validateSelections() {
    if (!this.api || this.isValidating) return;

    this.isValidating = true;
    this.validationErrors = [];

    try {
      const result = await this.api.validateSelections(this.selections);
      this.validationResults = result;

      if (result.available_options) {
        this.availableOptions = result.available_options;
      }

      if (result.violations) {
        this.validationErrors = result.violations;
      }

    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      this.isValidating = false;
    }
  }

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
    if (!this.api || this.isPricing) return;

    this.isPricing = true;

    try {
      const result = await this.api.calculatePrice(this.selections, context);
      this.pricingData = result;
    } catch (error) {
      console.error('Pricing calculation failed:', error);
    } finally {
      this.isPricing = false;
    }
  }

  // Helper Methods
  hasGroupSelection(groupId) {
    const options = this.safeOptions;
    return options
        .filter(o => o.group_id === groupId)
        .some(o => this.selections[o.id] > 0);
  }

  getGroupSelections(groupId) {
    const options = this.safeOptions;
    return options
        .filter(o => o.group_id === groupId && this.selections[o.id] > 0)
        .map(o => ({ ...o, quantity: this.selections[o.id] }));
  }

  isOptionAvailable(optionId) {
    if (!this.availableOptions.length) return true;
    return this.availableOptions.includes(optionId);
  }

  isOptionSelected(optionId) {
    return this.selections[optionId] > 0;
  }

  getOptionQuantity(optionId) {
    return this.selections[optionId] || 0;
  }

  // Group UI Management
  toggleGroup(groupId) {
    const expanded = new Set(this.expandedGroups);
    if (expanded.has(groupId)) {
      expanded.delete(groupId);
    } else {
      expanded.add(groupId);
    }
    this.expandedGroups = expanded;
  }

  isGroupExpanded(groupId) {
    return this.expandedGroups.has(groupId);
  }

  // Export configuration
  exportConfiguration() {
    const options = this.safeOptions;
    const selectedOptions = Object.entries(this.selections)
        .filter(([_, qty]) => qty > 0)
        .map(([optionId, quantity]) => {
          const option = options.find(o => o.id === optionId);
          return {
            option_id: optionId,
            option_name: option?.name,
            quantity,
            unit_price: option?.price || 0,
            total_price: (option?.price || 0) * quantity
          };
        });

    return {
      id: this.configurationId,
      model_id: this.modelId,
      model_name: this.model?.name,
      selections: selectedOptions,
      validation: {
        is_valid: this.isValid,
        violations: this.validationResults?.violations || []
      },
      pricing: {
        base_price: this.basePrice,
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

  // Step navigation
  canProceedToStep(step) {
    switch (step) {
      case 1: // Validate
        return this.selectedCount > 0;
      case 2: // Price
        return this.isValid;
      case 3: // Summary
        return this.isValid && this.pricingData;
      default:
        return true;
    }
  }

  nextStep() {
    if (this.currentStep < 3 && this.canProceedToStep(this.currentStep + 1)) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(step) {
    if (step >= 0 && step <= 3 && this.canProceedToStep(step)) {
      this.currentStep = step;
    }
  }

  // Model setter
  setModelId(modelId) {
    if (this.modelId !== modelId) {
      this.reset();
      this.modelId = modelId;
    }
  }
}

// Create singleton instance
export const configStore = new ConfigurationStore();

// Export for component usage with safe getters
export default configStore;