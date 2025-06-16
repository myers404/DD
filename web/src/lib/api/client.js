class ConfiguratorApiClient {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl || __API_BASE_URL__;
    this.modelId = options.modelId;
    this.authToken = options.authToken;
    this.timeout = options.timeout || 10000;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // Model Management
  async getModel() {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/models/${this.modelId}`);
  }

  async getModelOptions() {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/models/${this.modelId}/options`);
  }

  // Configuration Management
  async createConfiguration(selections = {}) {
    return this.request('/configurations', {
      method: 'POST',
      body: {
        model_id: this.modelId,
        selections: Object.entries(selections).map(([optionId, quantity]) => ({
          option_id: optionId,
          quantity: quantity
        }))
      }
    });
  }

  async updateConfiguration(configId, selections) {
    return this.request(`/configurations/${configId}`, {
      method: 'PUT',
      body: {
        model_id: this.modelId,
        selections: Object.entries(selections).map(([optionId, quantity]) => ({
          option_id: optionId,
          quantity: quantity
        }))
      }
    });
  }

  async validateConfiguration(selections) {
    return this.request('/configurations/validate-selection', {
      method: 'POST',
      body: {
        model_id: this.modelId,
        selections: Object.entries(selections).map(([optionId, quantity]) => ({
          option_id: optionId,
          quantity: quantity
        }))
      }
    });
  }

  // Pricing
  async calculatePricing(selections, context = {}) {
    return this.request('/pricing/calculate', {
      method: 'POST',
      body: {
        model_id: this.modelId,
        selections: Object.entries(selections).map(([optionId, quantity]) => ({
          option_id: optionId,
          quantity: quantity
        })),
        context
      }
    });
  }

  async getVolumeTiers() {
    return this.request(`/pricing/volume-tiers/${this.modelId}`);
  }
}

export default ConfiguratorApiClient;