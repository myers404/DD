// web/src/lib/api/client.js
class ConfiguratorApiClient {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl || window.__API_BASE_URL__ || 'http://localhost:8080/api/v1';
    this.modelId = options.modelId;
    this.authToken = options.authToken || localStorage.getItem('auth_token');
    this.timeout = options.timeout || 30000;

    console.log('API Client initialized:', {
      baseUrl: this.baseUrl,
      modelId: this.modelId,
      hasAuth: !!this.authToken
    });
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // Debug logging for development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`API Response from ${endpoint}:`, result);
      }

      // Handle wrapped responses from backend
      if (result && typeof result === 'object' && result.success !== undefined && result.data !== undefined) {
        return result.data;
      }

      // Return result or empty array/object for safety
      return result ?? (endpoint.includes('/groups') || endpoint.includes('/options') || endpoint.includes('/rules') ? [] : {});
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Model Management
  async getModel() {
    if (!this.modelId) throw new Error('Model ID required');
    const model = await this.request(`/models/${this.modelId}`);

    // Ensure we have proper structure
    if (!model.option_groups && model.groups) {
      model.option_groups = model.groups;
    }

    // Log the model structure for debugging
    console.log('Model structure:', {
      hasGroups: !!model.groups,
      hasOptionGroups: !!model.option_groups,
      hasOptions: !!model.options,
      groupsCount: model.groups?.length || model.option_groups?.length || 0,
      optionsCount: model.options?.length || 0
    });

    return model;
  }

  async getModelGroups() {
    if (!this.modelId) throw new Error('Model ID required');
    const response = await this.request(`/models/${this.modelId}/groups`);
    // Ensure we return an array
    return Array.isArray(response) ? response : [];
  }

  async getModelOptions() {
    if (!this.modelId) throw new Error('Model ID required');
    const response = await this.request(`/models/${this.modelId}/options`);
    // Ensure we return an array
    return Array.isArray(response) ? response : [];
  }

  async getModelRules() {
    if (!this.modelId) throw new Error('Model ID required');
    const response = await this.request(`/models/${this.modelId}/rules`);
    // Ensure we return an array
    return Array.isArray(response) ? response : [];
  }

  async getModelPricingRules() {
    if (!this.modelId) throw new Error('Model ID required');
    const response = await this.request(`/models/${this.modelId}/pricing-rules`);
    // Ensure we return an array
    return Array.isArray(response) ? response : [];
  }

  async getModelStatistics() {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/models/${this.modelId}/statistics`);
  }

  // Configuration Management
  async createConfiguration(selections = []) {
    return this.request('/configurations', {
      method: 'POST',
      body: {
        model_id: this.modelId,
        name: `Configuration ${new Date().toISOString()}`,
      }
    });
  }

  async getConfiguration(configId) {
    return this.request(`/configurations/${configId}`);
  }

  async updateConfiguration(configId, updates) {
    return this.request(`/configurations/${configId}`, {
      method: 'PUT',
      body: {
        model_id: this.modelId,
        ...updates,
        selections: updates.selections ? this.formatSelections(updates.selections) : undefined
      }
    });
  }

  async deleteConfiguration(configId) {
    return this.request(`/configurations/${configId}`, {
      method: 'DELETE'
    });
  }

  async addSelections(configId, selections) {
    return this.request(`/configurations/${configId}/selections`, {
      method: 'POST',
      body: {
        model_id: this.modelId,
        selections: this.formatSelections(selections)
      }
    });
  }

  async removeSelection(configId, optionId) {
    return this.request(`/configurations/${configId}/selections/${optionId}`, {
      method: 'DELETE'
    });
  }

  async validateConfiguration(configId) {
    return this.request(`/configurations/${configId}/validate`, {
      method: 'POST'
    });
  }

  async validateSelections(selections) {
    return this.request('/configurations/validate-selection', {
      method: 'POST',
      body: {
        model_id: this.modelId,
        selections: this.formatSelections(selections)
      }
    });
  }

  async getAvailableOptions(configId) {
    return this.request(`/configurations/${configId}/available-options`);
  }

  async getConstraints(configId) {
    return this.request(`/configurations/${configId}/constraints`);
  }

  async getConfigurationSummary(configId) {
    return this.request(`/configurations/${configId}/summary`);
  }

  async cloneConfiguration(configId) {
    return this.request(`/configurations/${configId}/clone`, {
      method: 'POST'
    });
  }

  // Pricing Operations
  // async calculatePrice(selections, context = {}) {
  //   return this.request('/pricing/calculate', {
  //     method: 'POST',
  //     body: {
  //       model_id: this.modelId,
  //       selections: this.formatSelections(selections),
  //       context
  //     }
  //   });
  // }

  async calculatePrice(configurationId, context = {}) {
    try {
      const response = await this.request(`/pricing/calculate`, {
        method: 'POST',
        body: JSON.stringify({
          model_id: this.modelId,
          selections: context.selections || {},
          context: context.context || {},
          ...context
        })
      });
      return response.data || response;
    } catch (error) {
      console.error('Failed to calculate price:', error);
      throw error;
    }
  }

  async simulatePricing(scenarios) {
    return this.request('/pricing/simulate', {
      method: 'POST',
      body: {
        model_id: this.modelId,
        scenarios
      }
    });
  }

  async validatePricing(selections, expectedPrice) {
    return this.request('/pricing/validate', {
      method: 'POST',
      body: {
        model_id: this.modelId,
        selections: this.formatSelections(selections),
        expected_price: expectedPrice
      }
    });
  }

  async getPricingRules() {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/pricing/rules/${this.modelId}`);
  }

  async getVolumeTiers() {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/pricing/volume-tiers/${this.modelId}`);
  }

  // Model Builder Operations
  async validateModel() {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/models/${this.modelId}/validate`, {
      method: 'POST'
    });
  }

  async detectConflicts(ruleIds = []) {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/models/${this.modelId}/conflicts`, {
      method: 'POST',
      body: { rule_ids: ruleIds }
    });
  }

  async analyzeImpact(changes) {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/models/${this.modelId}/impact`, {
      method: 'POST',
      body: changes
    });
  }

  async getModelQuality() {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/models/${this.modelId}/quality`, {
      method: 'POST'
    });
  }

  async getOptimizationRecommendations() {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/models/${this.modelId}/optimize`, {
      method: 'POST'
    });
  }

  // Utility Methods
  formatSelections(selections) {
    if (Array.isArray(selections)) {
      return selections;
    }

    // Convert object format to array format
    return Object.entries(selections)
        .filter(([_, quantity]) => quantity > 0)
        .map(([option_id, quantity]) => ({
          option_id,
          quantity: parseInt(quantity) || 1
        }));
  }

  // Batch Operations
  async batchValidate(configurations) {
    return this.request('/configurations/validate', {
      method: 'POST',
      body: { configurations }
    });
  }

  async bulkCalculatePricing(configurations) {
    return this.request('/pricing/bulk-calculate', {
      method: 'POST',
      body: { configurations }
    });
  }

  // Health Check
  async checkHealth() {
    return this.request('/health');
  }

  async getStatus() {
    return this.request('/status');
  }
}

export default ConfiguratorApiClient;