// web/src/lib/api/client.js
class ConfiguratorApiClient {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl || 'http://localhost:8080/api/v1';
    this.modelId = options.modelId;
    this.authToken = options.authToken;
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 2; // Reduced from 3
    this.retryDelay = options.retryDelay || 1000;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': this.generateRequestId(),
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    let lastError;
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle different response statuses
        if (response.status === 401) {
          throw new Error('Authentication required');
        }

        if (response.status === 404) {
          const error = new Error('Resource not found');
          error.code = 'NOT_FOUND';
          throw error;
        }

        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new Error(`Rate limited. Retry after ${retryAfter}s`);
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle both wrapped and unwrapped responses
        return data.data !== undefined ? data : { data };

      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx) or abort errors
        if (error.message.includes('4') || error.name === 'AbortError' || response?.status >= 400 && response?.status < 500) {
          throw error;
        }

        // Exponential backoff for retries
        if (attempt < this.retryAttempts - 1) {
          await this.delay(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError;
  }

  generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Model endpoints
  async getModel() {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/models/${this.modelId}`);
  }

  async getModelOptions() {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/models/${this.modelId}/options`);
  }

  async getModelGroups() {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/models/${this.modelId}/groups`);
  }

  // Configuration endpoints
  async createConfiguration(selections = {}) {
    const body = {
      model_id: this.modelId,
      selections: this.formatSelections(selections)
    };

    return this.request('/configurations', {
      method: 'POST',
      body
    });
  }

  async updateConfiguration(configId, selections) {
    const body = {
      model_id: this.modelId,
      selections: this.formatSelections(selections)
    };

    return this.request(`/configurations/${configId}`, {
      method: 'PUT',
      body
    });
  }

  async validateConfiguration(selections) {
    const body = {
      model_id: this.modelId,
      selections: this.formatSelections(selections)
    };

    return this.request('/configurations/validate-selection', {
      method: 'POST',
      body
    });
  }

  async getConfiguration(configId) {
    return this.request(`/configurations/${configId}`);
  }

  async deleteConfiguration(configId) {
    return this.request(`/configurations/${configId}`, {
      method: 'DELETE'
    });
  }

  // Pricing endpoints
  async calculatePricing(selections, context = {}) {
    const body = {
      model_id: this.modelId,
      selections: this.formatSelections(selections),
      context
    };

    return this.request('/pricing/calculate', {
      method: 'POST',
      body
    });
  }

  async simulatePricing(scenarios) {
    const body = {
      model_id: this.modelId,
      scenarios: scenarios.map(s => ({
        ...s,
        selections: this.formatSelections(s.selections)
      }))
    };

    return this.request('/pricing/simulate', {
      method: 'POST',
      body
    });
  }

  async getVolumeTiers() {
    return this.request(`/pricing/volume-tiers/${this.modelId}`);
  }

  // Analytics endpoints
  async getConfigurationAnalytics(timeRange = '30d') {
    return this.request(`/analytics/configurations?model_id=${this.modelId}&range=${timeRange}`);
  }

  async getPricingAnalytics(timeRange = '30d') {
    return this.request(`/analytics/pricing?model_id=${this.modelId}&range=${timeRange}`);
  }

  // Utility methods
  formatSelections(selections) {
    if (Array.isArray(selections)) {
      return selections;
    }

    return Object.entries(selections)
        .filter(([_, quantity]) => quantity > 0)
        .map(([option_id, quantity]) => ({ option_id, quantity }));
  }

  setModelId(modelId) {
    this.modelId = modelId;
  }

  setAuthToken(token) {
    this.authToken = token;
  }
}

export default ConfiguratorApiClient;