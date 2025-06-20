// web/src/lib/stores/configuration-session.svelte.js
// Session-based configuration store using the new v2 API

import SessionApiClient from '../api/session-client.js';

class ConfigurationSessionStore {
  constructor() {
    // Core session state
    this.modelId = $state(null);
    this.sessionId = $state(null);
    this.sessionToken = $state(null);
    this.sessionStatus = $state('draft');
    this.expiresAt = $state(null);
    
    // Model data - initialize with null instead of empty arrays
    this.model = $state(null);
    this.groups = $state(null);
    this.options = $state(null);
    this.rules = $state(null);
    this.selections = $state({});
    
    // Session state
    this.configuration = $state(null);
    this.validationResult = $state(null);
    this.pricingResult = $state(null);
    this.availableOptions = $state(null);
    
    // UI state
    this.isLoading = $state(false);
    this.isSaving = $state(false);
    this.error = $state(null);
    this.lastSaved = $state(null);
    this.isDirty = $state(false);
    
    this.api = null;
  }

  // Initialization
  async initialize(modelId, options = {}) {
    this.modelId = modelId;
    
    // Create API client with explicit v2 URL if not provided
    const apiUrl = options.apiUrl || (
      window.location.hostname === 'localhost' && window.location.port === '5173'
        ? '/api/v2'  // Use proxy in dev
        : 'http://localhost:8080/api/v2'
    );
    
    this.api = new SessionApiClient(apiUrl, {
      modelId,
      authToken: options.authToken,
      timeout: options.timeout || 30000
    });

    // Try to recover existing session
    const recovered = await this.recoverSession();
    
    if (!recovered) {
      // Create new session
      await this.createSession();
    }

    // Small delay to ensure selections are properly set
    await new Promise(resolve => setTimeout(resolve, 50));

    // Load model data after session is established
    // Important: This should not override the selections from createSession
    await this.loadModel();
    
    // Force a small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  async createSession() {
    if (!this.api || !this.modelId) return;

    try {
      this.isLoading = true;
      
      const result = await this.api.createSession(this.modelId);
      
      console.log('Create session response:', result);
      
      this.sessionId = result.session_id;
      this.sessionToken = result.session_token;
      this.sessionStatus = result.status;
      this.expiresAt = result.expires_at;
      this.configuration = result;
      
      // Update selections from the response (includes default selections)
      if (result.selections && Array.isArray(result.selections)) {
        console.log('Applying selections from response:', result.selections);
        const newSelections = {};
        for (const sel of result.selections) {
          // Handle both option_id and OptionID formats (backend might use either)
          const optionId = sel.option_id || sel.OptionID;
          const quantity = sel.quantity || sel.Quantity || 1;
          if (optionId) {
            newSelections[optionId] = quantity;
          }
        }
        // Ensure we create a new object for reactivity
        this.selections = { ...newSelections };
        console.log('Updated this.selections to:', this.selections);
        console.log('Store selections state after update:', JSON.stringify(this.selections));
      } else {
        console.log('No selections in create session response');
        console.log('Result keys:', Object.keys(result));
        console.log('Full result:', JSON.stringify(result, null, 2));
      }
      
      // Update validation and pricing state
      this.validationResult = result.validation_state || null;
      this.pricingResult = result.pricing_state || null;
      
      console.log('Session created:', {
        sessionId: this.sessionId,
        status: this.sessionStatus,
        expiresAt: this.expiresAt,
        selections: this.selections,
        isValid: result.is_valid,
        totalPrice: result.total_price
      });
      
    } catch (error) {
      console.error('Failed to create session:', error);
      this.error = {
        message: error.message || 'Failed to create session',
        code: error.code || 'SESSION_CREATE_ERROR',
        details: error
      };
    } finally {
      this.isLoading = false;
    }
  }

  async recoverSession() {
    if (!this.api) return false;

    try {
      const session = await this.api.recoverSession();
      
      if (session) {
        console.log('Recovering session:', session);
        
        this.sessionId = session.session_id || session.id;
        this.sessionToken = session.session_token;
        this.sessionStatus = session.status;
        this.expiresAt = session.expires_at;
        this.configuration = session;
        
        // Handle selections which might be in array format
        if (Array.isArray(session.selections)) {
          const newSelections = {};
          for (const sel of session.selections) {
            const optionId = sel.option_id || sel.OptionID;
            const quantity = sel.quantity || sel.Quantity || 1;
            if (optionId) {
              newSelections[optionId] = quantity;
            }
          }
          this.selections = newSelections;
        } else {
          // Ensure selections is a new object for reactivity
          this.selections = { ...(session.selections || {}) };
        }
        
        this.validationResult = session.validation_state;
        this.pricingResult = session.pricing_state;
        
        console.log('Session recovered:', {
          sessionId: this.sessionId,
          status: this.sessionStatus,
          selectionsCount: Object.keys(this.selections).length,
          selections: this.selections
        });
        
        return true;
      }
    } catch (error) {
      console.error('Failed to recover session:', error);
    }
    
    return false;
  }

  async loadModel() {
    if (!this.api || !this.modelId) return;

    this.isLoading = true;

    try {
      const [model, groups, options, rules] = await Promise.all([
        this.api.getModel(),
        this.api.getModelGroups(),
        this.api.getModelOptions(),
        this.api.getModelRules()
      ]);

      // Ensure arrays are properly assigned
      this.model = model;
      this.groups = Array.isArray(groups) ? groups : [];
      this.options = Array.isArray(options) ? options : [];
      this.rules = Array.isArray(rules) ? rules : [];

      console.log('Model loaded:', {
        modelId: this.modelId,
        groupsCount: this.groups.length,
        optionsCount: this.options.length,
        rulesCount: this.rules.length,
        groups: this.groups,
        currentSelections: this.selections,
        selectionsKeys: Object.keys(this.selections)
      });
      
      // Debug: Check if groups have default_option_id and if they're selected
      console.log('Groups with defaults:');
      this.groups.forEach(group => {
        if (group.default_option_id) {
          const isSelected = this.selections[group.default_option_id] > 0;
          console.log(`  - ${group.name}: default = ${group.default_option_id}, selected = ${isSelected}`);
        }
      });

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

  // Selection management
  updateSelection(optionId, quantity) {
    if (!optionId) return;

    const newQuantity = quantity > 0 ? 1 : 0;
    
    // Find the option and its group to check selection type
    const option = this.options.find(o => o.id === optionId);
    if (!option) return;
    
    const group = this.groups.find(g => g.id === option.group_id);
    if (!group) return;
    
    console.log(`updateSelection called: ${option.name} (${optionId}) = ${newQuantity}, Group: ${group.name}`);

    // IMPORTANT: We need to handle single-select groups to avoid sending multiple selections
    // This is required because the backend expects only one selection per single-select group
    const isSingleSelect = group.selection_type === 'single' || 
                          group.selection_type === 'single_required' || 
                          group.selection_type === 'radio' ||
                          group.selection_type === 'dropdown' ||
                          group.type === 'single-select' ||
                          group.type === 'single';
    
    // Update the selection - create new object for reactivity
    const newSelections = { ...this.selections };
    
    if (isSingleSelect && newQuantity > 0) {
      // Clear other selections in the same group
      const groupOptions = this.options.filter(o => o.group_id === group.id);
      groupOptions.forEach(opt => {
        if (opt.id !== optionId && newSelections[opt.id]) {
          console.log(`Clearing previous selection: ${opt.name} from group ${group.name}`);
          delete newSelections[opt.id];
        }
      });
    }

    if (newQuantity > 0) {
      newSelections[optionId] = newQuantity;
    } else {
      delete newSelections[optionId];
    }
    this.selections = newSelections;

    this.isDirty = true;

    // Debounce backend update
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      this.updateSelectionsOnBackend();
    }, 300);
  }

  async updateSelectionsOnBackend() {
    if (!this.api || !this.sessionId) return;

    try {
      // Format selections for API
      const formattedSelections = Object.entries(this.selections)
        .filter(([_, quantity]) => quantity > 0)
        .map(([option_id, quantity]) => ({
          option_id,
          quantity: parseInt(quantity) || 1
        }));

      console.log('Sending selections to backend:', formattedSelections);

      // Update session with selections
      const result = await this.api.updateSelections(formattedSelections);

      // Update state with results
      this.configuration = result.configuration || result.updated_config;
      this.validationResult = result.validation_result;
      this.pricingResult = result.price_breakdown;
      this.availableOptions = Array.isArray(result.available_options) ? result.available_options : [];
      
      // IMPORTANT: Sync selections with backend response
      // The backend handles single-select group logic, so we need to update our local state
      if (this.configuration && this.configuration.selections) {
        const backendSelections = {};
        for (const sel of this.configuration.selections) {
          backendSelections[sel.option_id] = sel.quantity;
        }
        console.log('Syncing selections - Before:', this.selections);
        console.log('Syncing selections - After:', backendSelections);
        // Create new object for reactivity
        this.selections = { ...backendSelections };
        console.log('Validation result:', this.validationResult);
        console.log('Available options with impact:', this.availableOptions?.slice(0, 5).map(opt => ({
          name: opt.option?.name || opt.name,
          impact: opt.impact,
          helps: opt.helps_resolve,
          is_selectable: opt.is_selectable
        })));
        this.selections = backendSelections;
      }
      
      // DISABLED: Auto-deselect for testing
      // this.checkAndDeselectInvalidOptions(this.availableOptions);

      this.lastSaved = new Date();
      this.isDirty = false;

      console.log('Session updated:', {
        sessionId: this.sessionId,
        selectionsCount: formattedSelections.length,
        isValid: this.validationResult?.is_valid,
        totalPrice: this.pricingResult?.total_price,
        fullResult: result,
        configIsValid: this.configuration?.is_valid
      });

    } catch (error) {
      console.error('Failed to update session:', error);
      this.error = {
        message: error.message || 'Failed to update selections',
        code: error.code || 'UPDATE_ERROR',
        details: error
      };
    }
  }

  checkAndDeselectInvalidOptions(availableOptions) {
    let anyDeselected = false;
    
    if (Array.isArray(availableOptions)) {
      for (const availableOption of availableOptions) {
        const option = availableOption.option || availableOption;
        const optionId = option.id;
        
        // If option is currently selected but no longer selectable, deselect it
        if (this.selections[optionId] && availableOption.is_selectable === false) {
          delete this.selections[optionId];
          anyDeselected = true;
          console.log(`Auto-deselected invalid option: ${option.name} (${optionId})`);
        }
      }
    }
    
    if (anyDeselected) {
      this.isDirty = true;
    }
    
    return anyDeselected;
  }

  async validateConfiguration() {
    if (!this.api || !this.sessionId) return;

    try {
      const result = await this.api.validateSession();
      this.validationResult = result;
      return result;
    } catch (error) {
      console.error('Failed to validate session:', error);
      this.error = error;
    }
  }

  async calculatePricing() {
    if (!this.api || !this.sessionId) return;

    try {
      const result = await this.api.calculatePrice();
      this.pricingResult = result.breakdown || result;
      return result;
    } catch (error) {
      console.error('Failed to calculate price:', error);
      this.error = error;
    }
  }

  async completeSession() {
    if (!this.api || !this.sessionId) return;

    try {
      const result = await this.api.completeSession();
      this.sessionStatus = 'completed';
      return result;
    } catch (error) {
      console.error('Failed to complete session:', error);
      this.error = error;
    }
  }

  async extendSession(days = 30) {
    if (!this.api || !this.sessionId) return;

    try {
      const result = await this.api.extendSession(days);
      if (result.expires_at) {
        this.expiresAt = result.expires_at;
      }
      return result;
    } catch (error) {
      console.error('Failed to extend session:', error);
      this.error = error;
    }
  }

  // Getters
  get selectedOptions() {
    return Object.entries(this.selections)
      .filter(([_, quantity]) => quantity > 0)
      .map(([optionId]) => this.options.find(o => o.id === optionId))
      .filter(Boolean);
  }

  get selectedCount() {
    return Object.keys(this.selections).filter(id => this.selections[id] > 0).length;
  }

  get totalPrice() {
    return this.pricingResult?.total_price || 0;
  }

  get isValid() {
    // Explicitly check the validation result
    if (this.validationResult && typeof this.validationResult.is_valid === 'boolean') {
      return this.validationResult.is_valid;
    }
    // If no validation result yet, check if we have selections
    return this.selectedCount === 0;
  }

  get violations() {
    return this.validationResult?.violations || [];
  }

  get hasActiveViolations() {
    return this.violations.some(v => v.severity === 'error' || v.severity === 'Error');
  }

  get sessionTimeRemaining() {
    if (!this.expiresAt) return null;
    
    const now = new Date();
    const expires = new Date(this.expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days`;
    return `${hours} hours`;
  }

  // Utility methods
  reset() {
    this.selections = {};
    this.validationResult = null;
    this.pricingResult = null;
    this.availableOptions = [];
    this.isDirty = false;
    this.error = null;
  }

  clearError() {
    this.error = null;
  }

  clearSession() {
    if (this.api) {
      this.api.clearSession();
    }
    this.sessionId = null;
    this.sessionToken = null;
    this.sessionStatus = 'draft';
    this.expiresAt = null;
    this.reset();
  }
}

// Factory function to create store instance
export function createConfigurationSessionStore() {
  return new ConfigurationSessionStore();
}