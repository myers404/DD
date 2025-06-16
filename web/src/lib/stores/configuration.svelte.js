// web/src/lib/stores/configuration.svelte.js
import ConfiguratorApiClient from '../api/client.js';

class ConfigurationStore {
  constructor() {
    // Core state
    this.modelId = $state('');
    this.model = $state(null);
    this.selections = $state({});
    this.validationResults = $state([]);
    this.pricingData = $state(null);
    this.availableOptions = $state([]);

    // Loading states
    this.isLoading = $state(false);
    this.isValidating = $state(false);
    this.isPricing = $state(false);

    // Error handling
    this.error = $state(null);
    this.retryCount = $state(0);

    // Configuration management
    this.configurationId = $state(null);
    this.lastSaved = $state(null);
    this.isDirty = $state(false);

    // UI state
    this.currentStep = $state(0);

    // API client
    this.api = null;

    // Internal state
    this._initialized = false;
    this._debounceTimers = new Map();
    this._loadingPromise = null;
  }

  // Initialize store and effects
  initialize() {
    if (this._initialized) return;
    this._initialized = true;

    console.log('🔧 ConfigurationStore initialized');

    // Test API connection
    this._testConnection();

    // Initialize API client when modelId changes
    $effect(() => {
      if (this.modelId && !this._loadingPromise) {
        this.api = new ConfiguratorApiClient(window.__API_BASE_URL__, {
          modelId: this.modelId
        });
        this.loadModel();
      }
    });

    // Auto-validate selections
    $effect(() => {
      if (this.api && Object.keys(this.selections).length > 0 && this.model) {
        this._debounce('validate', () => this.validateSelections(), 300);
      }
    });

    // Auto-calculate pricing
    $effect(() => {
      if (this.api && this.isValid && Object.keys(this.selections).length > 0 && this.model) {
        this._debounce('pricing', () => this.calculatePricing(), 500);
      }
    });

    // Auto-save
    $effect(() => {
      if (this.isDirty && this.configurationId) {
        this._debounce('save', () => this.saveConfiguration(), 30000);
      }
    });
  }

  // Derived state
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
    if (!this.model?.option_groups || !Array.isArray(this.model.option_groups)) return [];

    const selected = [];
    for (const group of this.model.option_groups) {
      if (!group.options || !Array.isArray(group.options)) continue;

      for (const option of group.options) {
        if (this.selections[option.id] > 0) {
          selected.push({
            ...option,
            quantity: this.selections[option.id],
            group_name: group.name,
            group_id: group.id
          });
        }
      }
    }
    return selected;
  }

  get completionPercentage() {
    if (!this.model?.option_groups || !Array.isArray(this.model.option_groups)) return 0;

    const requiredGroups = this.model.option_groups.filter(g => g.required);
    if (requiredGroups.length === 0) return 100;

    const completedGroups = requiredGroups.filter(group =>
        group.options && Array.isArray(group.options) &&
        group.options.some(option => this.selections[option.id] > 0)
    );

    return Math.round((completedGroups.length / requiredGroups.length) * 100);
  }

  get canProceedToNextStep() {
    return this.completionPercentage >= 100 && this.isValid;
  }

  // Core methods
  setModelId(modelId) {
    console.log('setModelId called with:', modelId);
    if (this.modelId !== modelId) {
      this.modelId = modelId;
      this.reset();
    }
  }

  async loadModel() {
    if (!this.api || this._loadingPromise) return;

    // This method tries multiple approaches to load model data since
    // different backends may structure their responses differently.
    // It will try to find groups and options in various locations
    // and log detailed information to help debug API integration issues.

    this._loadingPromise = this._executeWithRetry(async () => {
      this.isLoading = true;
      this.error = null;

      try {
        // First, try to get the model
        let model;
        try {
          model = await this.api.getModel();
          console.log('Raw model response:', model);
        } catch (error) {
          // If model not found, provide helpful error message
          if (error.message.includes('404')) {
            throw new Error(
                `Model "${this.modelId}" not found. ` +
                `Use the debug test page to list available models, ` +
                `or check /api/v1/models endpoint.`
            );
          }
          throw error;
        }

        if (!model || typeof model !== 'object') {
          throw new Error('Invalid model data received');
        }

        // Initialize the model structure
        this.model = {
          id: model.id || model.ID || model.model_id,
          name: model.name || model.Name || 'Configuration',
          description: model.description || model.Description,
          option_groups: []
        };

        // Check different possible structures for groups/options
        if (model.option_groups && Array.isArray(model.option_groups)) {
          // Model already has option_groups with options
          this.model.option_groups = model.option_groups;
          console.log('Using option_groups from model');
        } else if (model.groups && Array.isArray(model.groups)) {
          // Model has groups (different property name)
          this.model.option_groups = model.groups;
          console.log('Using groups from model');
        } else if (model.data?.groups && Array.isArray(model.data.groups)) {
          // Groups might be nested in data
          this.model.option_groups = model.data.groups;
          console.log('Using groups from model.data');
        } else {
          // Need to fetch groups separately
          console.log('Fetching groups separately...');
          try {
            const groupsData = await this.api.getModelGroups();
            console.log('Groups API response:', groupsData);

            if (Array.isArray(groupsData)) {
              this.model.option_groups = groupsData;
            } else if (groupsData.groups) {
              this.model.option_groups = groupsData.groups;
            } else if (groupsData.option_groups) {
              this.model.option_groups = groupsData.option_groups;
            } else if (groupsData.data && Array.isArray(groupsData.data)) {
              this.model.option_groups = groupsData.data;
            } else if (groupsData.data?.groups) {
              this.model.option_groups = groupsData.data.groups;
            }
          } catch (e) {
            console.error('Failed to load groups:', e);
          }
        }

        // If still no groups, check if model has flat options array
        if ((!this.model.option_groups || this.model.option_groups.length === 0) &&
            (model.options || model.Options)) {
          console.log('No groups found, but model has flat options array');
          const flatOptions = model.options || model.Options;

          // Group options by their group_id
          const groupMap = new Map();
          flatOptions.forEach(opt => {
            const groupId = opt.group_id || opt.groupId || opt.group || 'default';
            if (!groupMap.has(groupId)) {
              groupMap.set(groupId, {
                id: groupId,
                name: opt.group_name || opt.groupName || groupId,
                options: []
              });
            }
            groupMap.get(groupId).options.push(opt);
          });

          this.model.option_groups = Array.from(groupMap.values());
          console.log('Created groups from flat options:', this.model.option_groups);
        }

        // Log what we have so far
        console.log('Groups loaded:', this.model.option_groups?.length || 0, 'groups');
        if (this.model.option_groups?.length > 0) {
          console.log('First group structure:', this.model.option_groups[0]);
          console.log('Group properties:', Object.keys(this.model.option_groups[0]));
        }

        // Check if any group has options
        const hasAnyOptions = this.model.option_groups.some(g =>
            (g.options && Array.isArray(g.options) && g.options.length > 0) ||
            (g.Options && Array.isArray(g.Options) && g.Options.length > 0) ||
            (g.items && Array.isArray(g.items) && g.items.length > 0) ||
            (g.choices && Array.isArray(g.choices) && g.choices.length > 0)
        );

        if (!hasAnyOptions && this.model.option_groups.length > 0) {
          console.log('No options found in groups, fetching options separately...');

          // Try to get options separately
          try {
            const optionsData = await this.api.getModelOptions();
            console.log('Options API response:', optionsData);

            let allOptions = [];
            if (Array.isArray(optionsData)) {
              allOptions = optionsData;
            } else if (optionsData.options) {
              allOptions = optionsData.options;
            } else if (optionsData.data && Array.isArray(optionsData.data)) {
              allOptions = optionsData.data;
            } else if (optionsData.data?.options) {
              allOptions = optionsData.data.options;
            }

            console.log('Total options found:', allOptions.length);

            // Log structure of first option to help debug
            if (allOptions.length > 0) {
              console.log('First option structure:', allOptions[0]);
              console.log('Option properties:', Object.keys(allOptions[0]));
            }

            // Assign options to their groups
            if (allOptions.length > 0) {
              this.model.option_groups = this.model.option_groups.map(group => {
                const groupOptions = allOptions.filter(opt => {
                  // Try different ways to match options to groups
                  return opt.group_id === group.id ||
                      opt.groupId === group.id ||
                      opt.group === group.id ||
                      opt.group_name === group.name ||
                      opt.groupName === group.name ||
                      opt.group_id === group.name ||
                      // Also check if group has a different ID property
                      (group.group_id && (opt.group_id === group.group_id ||
                          opt.group === group.group_id));
                });

                console.log(`Group "${group.name}" matched ${groupOptions.length} options`);

                // If no options matched and this is the only group, show all options
                if (groupOptions.length === 0 && this.model.option_groups.length === 1) {
                  console.warn('No options matched group criteria, showing all options in single group');
                  return {
                    ...group,
                    options: allOptions
                  };
                }

                return {
                  ...group,
                  options: groupOptions
                };
              });
            }
          } catch (e) {
            console.error('Failed to load options:', e);
          }
        }

        // Ensure all groups have options array and normalize structure
        this.model.option_groups = this.model.option_groups.map(group => {
          let options = [];

          // Check various possible locations for options
          if (Array.isArray(group.options)) {
            options = group.options;
          } else if (Array.isArray(group.Options)) {
            options = group.Options;
          } else if (Array.isArray(group.items)) {
            options = group.items;
          } else if (Array.isArray(group.choices)) {
            options = group.choices;
          } else if (group.data?.options && Array.isArray(group.data.options)) {
            options = group.data.options;
          }

          return {
            ...group,
            options: options
          };
        });

        // If no options were found at all, create demo options for testing
        const totalOptions = this.model.option_groups.reduce((sum, g) =>
            sum + (g.options?.length || 0), 0
        );

        if (totalOptions === 0 && this.model.option_groups.length > 0) {
          console.warn('No options found in any group. Creating demo options for testing...');
          this.usingDemoData = true;

          // Create demo options for each group
          this.model.option_groups = this.model.option_groups.map((group, groupIndex) => ({
            ...group,
            options: this._createDemoOptions(group, groupIndex)
          }));
        } else {
          this.usingDemoData = false;
        }

        // Final logging
        console.log('=== Final Model Structure ===');
        console.log('Model:', this.model);
        console.log('Groups summary:', this.model.option_groups.map(g => ({
          id: g.id,
          name: g.name,
          optionsCount: g.options?.length || 0,
          options: g.options?.slice(0, 2) // Show first 2 options
        })));

        // Initialize selections for preselected options
        this._initializeSelections();

      } finally {
        this.isLoading = false;
        this._loadingPromise = null;
      }
    });

    return this._loadingPromise;
  }

  updateSelection(optionId, quantity) {
    quantity = Math.max(0, quantity);

    // Check group constraints
    const group = this._getGroupForOption(optionId);
    if (group) {
      if (group.selection_type === 'single' && quantity > 0 && group.options && Array.isArray(group.options)) {
        // Clear other selections in single-select groups
        for (const option of group.options) {
          if (option.id !== optionId) {
            this.selections[option.id] = 0;
          }
        }
      }

      // Enforce max selections
      if (group.max_selections && quantity > group.max_selections) {
        quantity = group.max_selections;
      }
    }

    // Update selection
    if (quantity === 0) {
      delete this.selections[optionId];
    } else {
      this.selections[optionId] = quantity;
    }

    this.isDirty = true;
  }

  async validateSelections() {
    if (!this.api || this.isValidating) return;

    // Skip validation if no selections
    if (Object.keys(this.selections).length === 0) {
      this.validationResults = [];
      return;
    }

    await this._executeWithRetry(async () => {
      this.isValidating = true;
      try {
        const response = await this.api.validateSelections(this.selections);
        this.validationResults = response.validation_errors || [];
        this.availableOptions = response.available_options || [];
      } finally {
        this.isValidating = false;
      }
    });
  }

  async calculatePricing(context = {}) {
    if (!this.api || this.isPricing || !this.isValid) return;

    await this._executeWithRetry(async () => {
      this.isPricing = true;
      try {
        const response = await this.api.calculatePricing(this.selections, context);
        this.pricingData = response;
      } finally {
        this.isPricing = false;
      }
    });
  }

  async createConfiguration() {
    if (!this.api) return;

    const response = await this.api.createConfiguration(this.selections);
    this.configurationId = response.id;
    this.isDirty = false;
    this.lastSaved = new Date();
    return response;
  }

  async saveConfiguration() {
    if (!this.api || !this.configurationId || !this.isDirty) return;

    try {
      await this.api.updateConfiguration(this.configurationId, this.selections);
      this.isDirty = false;
      this.lastSaved = new Date();
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  async loadConfiguration(configId) {
    if (!this.api) return;

    await this._executeWithRetry(async () => {
      this.isLoading = true;
      try {
        const config = await this.api.getConfiguration(configId);
        this.configurationId = config.id;
        this.selections = this._parseSelections(config.selections);
        this.isDirty = false;

        await Promise.all([
          this.validateSelections(),
          this.calculatePricing()
        ]);
      } finally {
        this.isLoading = false;
      }
    });
  }

  async loadAvailableOptions() {
    if (!this.api || !this.configurationId) return;

    try {
      const response = await this.api.getAvailableOptions(this.configurationId);
      this.availableOptions = response.available_options || [];
    } catch (error) {
      console.error('Failed to load available options:', error);
    }
  }

  exportConfiguration() {
    return {
      model_id: this.modelId,
      selections: this.selections,
      timestamp: new Date().toISOString(),
      total_price: this.totalPrice,
      is_valid: this.isValid
    };
  }

  importConfiguration(config) {
    if (config.model_id !== this.modelId) {
      throw new Error('Configuration is for a different model');
    }
    this.selections = config.selections || {};
    this.isDirty = true;
  }

  reset() {
    this.selections = {};
    this.validationResults = [];
    this.pricingData = null;
    this.availableOptions = [];
    this.error = null;
    this.configurationId = null;
    this.isDirty = false;
    this.currentStep = 0;
    this._clearAllTimers();
  }

  // Test API connection
  async _testConnection() {
    if (!window.__API_BASE_URL__) return;

    try {
      const response = await fetch(`${window.__API_BASE_URL__}/health`);
      if (response.ok) {
        console.log('✅ API connection successful');
      } else {
        console.warn('⚠️ API health check returned:', response.status);
      }
    } catch (error) {
      console.error('❌ API connection failed:', error.message);
    }
  }

  // Utility methods
  _debounce(key, fn, delay) {
    this._clearTimer(key);
    const timer = setTimeout(fn, delay);
    this._debounceTimers.set(key, timer);
  }

  _clearTimer(key) {
    const timer = this._debounceTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this._debounceTimers.delete(key);
    }
  }

  _clearAllTimers() {
    for (const timer of this._debounceTimers.values()) {
      clearTimeout(timer);
    }
    this._debounceTimers.clear();
  }

  _getGroupForOption(optionId) {
    if (!this.model?.option_groups || !Array.isArray(this.model.option_groups)) return null;

    for (const group of this.model.option_groups) {
      if (group.options && Array.isArray(group.options) &&
          group.options.some(opt => opt.id === optionId)) {
        return group;
      }
    }
    return null;
  }

  _initializeSelections() {
    if (!this.model?.option_groups || !Array.isArray(this.model.option_groups)) return;

    for (const group of this.model.option_groups) {
      if (!group.options || !Array.isArray(group.options)) continue;

      for (const option of group.options) {
        if (option.preselected && !this.selections[option.id]) {
          this.selections[option.id] = 1;
        }
      }
    }
  }

  _parseSelections(selections) {
    const parsed = {};
    for (const sel of selections) {
      if (sel.quantity > 0) {
        parsed[sel.option_id] = sel.quantity;
      }
    }
    return parsed;
  }

  async _executeWithRetry(fn, maxRetries = 3) {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        this.error = error.message;
        this.retryCount = i;

        if (i === maxRetries || error.message.includes('401') || error.message.includes('404')) {
          console.error('API call failed after retries:', error.message);
          throw error;
        }

        // Exponential backoff
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  }
}

// Export singleton instance
export const configStore = new ConfigurationStore();