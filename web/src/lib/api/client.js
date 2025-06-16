// web/src/lib/api/client.js
class ConfiguratorApiClient {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl || window.__API_BASE_URL__ || 'http://localhost:8080/api/v1';
    this.modelId = options.modelId;
    this.authToken = options.authToken || localStorage.getItem('auth_token');
    this.timeout = options.timeout || 10000;

    console.log('API Client initialized:', {
      baseUrl: this.baseUrl,
      modelId: this.modelId,
      hasAuth: !!this.authToken
    });
  }

  async request(endpoint, options = {}) {
    // Ensure endpoint starts with /
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }

    const url = `${this.baseUrl}${endpoint}`;
    console.log('API Request:', options.method || 'GET', url);

    const config = {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
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
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch (e) {
          // If not JSON, use the text if it's not HTML
          if (!errorText.includes('<html')) {
            errorMessage = errorText || errorMessage;
          }
        }

        console.error(`API Error from ${endpoint}:`, errorMessage);

        if (response.status === 404) {
          throw new Error(`Endpoint not found: ${url}. Please check if the backend server is running and the API path is correct.`);
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(`API Response from ${endpoint}:`, result);

      // Extract data from response wrapper
      // Backend returns { success: true, data: {...}, meta: {...} }
      if (result.success !== undefined) {
        // This is a wrapped response
        if (result.success && result.data !== undefined) {
          return result.data;
        } else if (!result.success) {
          throw new Error(result.error || result.message || 'Request failed');
        }
      }

      // Some endpoints might return data directly or in different structures
      // Log what we got to help debug
      if (endpoint.includes('/groups') || endpoint.includes('/options')) {
        console.log(`Note: ${endpoint} returned unwrapped response, structure:`,
            Array.isArray(result) ? 'Array' : typeof result,
            'Keys:', result ? Object.keys(result).slice(0, 5) : 'none'
        );
      }

      // For endpoints that might return unwrapped data
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  setAuthToken(token) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Authentication
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { username, password }
    });
    if (response.token) {
      this.setAuthToken(response.token);
    }
    return response;
  }

  async validateToken() {
    return this.request('/auth/validate', { method: 'POST' });
  }

  // Model Management
  async getModel() {
    if (!this.modelId) throw new Error('Model ID required');
    const response = await this.request(`/models/${this.modelId}`);
    console.log('getModel response:', response);

    // If the model doesn't have option_groups but has an ID, try to fetch them
    if (response && response.id && !response.option_groups && !response.groups) {
      try {
        const options = await this.getModelOptions();
        response.options = options;
      } catch (e) {
        console.warn('Failed to fetch model options separately:', e);
      }
    }

    return response;
  }

  async getModelOptions() {
    if (!this.modelId) throw new Error('Model ID required');
    const response = await this.request(`/models/${this.modelId}/options`);
    console.log('getModelOptions response:', response);
    return response;
  }

  async getModelGroups() {
    if (!this.modelId) throw new Error('Model ID required');
    // Try to get groups with options included
    const response = await this.request(`/models/${this.modelId}/groups?include=options`);
    console.log('getModelGroups response:', response);
    return response;
  }

  async getModelStatistics() {
    if (!this.modelId) throw new Error('Model ID required');
    return this.request(`/models/${this.modelId}/statistics`);
  }

  // Configuration Management
  async createConfiguration(selections = {}) {
    return this.request('/configurations', {
      method: 'POST',
      body: {
        model_id: this.modelId,
        selections: this.formatSelections(selections)
      }
    });
  }

  async getConfiguration(configId) {
    return this.request(`/configurations/${configId}?model_id=${this.modelId}`);
  }

  async updateConfiguration(configId, selections) {
    return this.request(`/configurations/${configId}`, {
      method: 'PUT',
      body: {
        model_id: this.modelId,
        selections: this.formatSelections(selections)
      }
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
    return this.request(`/configurations/${configId}/available-options?model_id=${this.modelId}`);
  }

  // Pricing
  async calculatePricing(selections, context = {}) {
    return this.request('/pricing/calculate', {
      method: 'POST',
      body: {
        model_id: this.modelId,
        selections: this.formatSelections(selections),
        context
      }
    });
  }

  async getVolumeTiers() {
    return this.request(`/pricing/volume-tiers/${this.modelId}`);
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

  // Utility methods
  formatSelections(selections) {
    return Object.entries(selections)
        .filter(([_, quantity]) => quantity > 0)
        .map(([option_id, quantity]) => ({
          option_id,
          quantity
        }));
  }
}

export default ConfiguratorApiClient;