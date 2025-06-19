// web/src/lib/api/session-client.js
// Session-based API client for the new v2 endpoints

class SessionApiClient {
  constructor(baseUrl, options = {}) {
    // For development, use relative URL to leverage Vite proxy
    // For production, use full URL
    let defaultUrl;
    if (typeof window !== 'undefined') {
      const isDev = window.location.hostname === 'localhost' && window.location.port === '5173';
      defaultUrl = isDev ? '/api/v2' : 'http://localhost:8080/api/v2';
    } else {
      defaultUrl = 'http://localhost:8080/api/v2';
    }
    
    this.baseUrl = baseUrl || window.__API_BASE_URL__?.replace('/v1', '/v2') || defaultUrl;
    this.modelId = options.modelId;
    this.authToken = options.authToken || localStorage.getItem('auth_token');
    this.sessionToken = options.sessionToken || localStorage.getItem('session_token');
    this.sessionId = options.sessionId || localStorage.getItem('session_id');
    this.timeout = options.timeout || 30000;

    console.log('Session API Client initialized:', {
      baseUrl: this.baseUrl,
      modelId: this.modelId,
      hasAuth: !!this.authToken,
      hasSession: !!this.sessionId
    });
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`Session API Request: ${options.method || 'GET'} ${url}`);

    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        ...(this.sessionToken && { 'X-Session-Token': this.sessionToken }),
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
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: response.statusText };
        }
        
        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        console.error(`Session API Error Response from ${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url
        });
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      const result = await response.json();

      // Debug logging for development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`Session API Response from ${endpoint}:`, result);
      }

      // Handle wrapped responses from backend
      if (result && typeof result === 'object' && result.success !== undefined && result.data !== undefined) {
        return result.data;
      }

      return result ?? {};
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      console.error(`Session API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Session Management
  async createSession(modelId = null) {
    const response = await this.request('/configurations', {
      method: 'POST',
      body: {
        model_id: modelId || this.modelId,
        name: `Configuration ${new Date().toISOString()}`,
        description: 'New configuration session'
      }
    });

    // Store session info
    if (response.session_id) {
      this.sessionId = response.session_id;
      localStorage.setItem('session_id', response.session_id);
    }
    if (response.session_token) {
      this.sessionToken = response.session_token;
      localStorage.setItem('session_token', response.session_token);
    }

    return response;
  }

  async getSession(sessionId = null) {
    const id = sessionId || this.sessionId;
    if (!id) throw new Error('Session ID required');
    
    return this.request(`/configurations/${id}`);
  }

  async updateSession(updates, sessionId = null) {
    const id = sessionId || this.sessionId;
    if (!id) throw new Error('Session ID required');

    return this.request(`/configurations/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  async updateSelections(selections, sessionId = null) {
    const id = sessionId || this.sessionId;
    if (!id) throw new Error('Session ID required');

    return this.request(`/configurations/${id}`, {
      method: 'PUT',
      body: {
        selections: this.formatSelections(selections)
      }
    });
  }

  async addSelections(selections, sessionId = null) {
    const id = sessionId || this.sessionId;
    if (!id) throw new Error('Session ID required');

    return this.request(`/configurations/${id}/selections`, {
      method: 'POST',
      body: {
        selections: this.formatSelections(selections)
      }
    });
  }

  async validateSession(sessionId = null) {
    const id = sessionId || this.sessionId;
    if (!id) throw new Error('Session ID required');

    return this.request(`/configurations/${id}/validate`, {
      method: 'POST'
    });
  }

  async calculatePrice(sessionId = null) {
    const id = sessionId || this.sessionId;
    if (!id) throw new Error('Session ID required');

    return this.request(`/configurations/${id}/price`, {
      method: 'POST'
    });
  }

  async completeSession(sessionId = null) {
    const id = sessionId || this.sessionId;
    if (!id) throw new Error('Session ID required');

    return this.request(`/configurations/${id}/complete`, {
      method: 'POST'
    });
  }

  async extendSession(days = 30, sessionId = null) {
    const id = sessionId || this.sessionId;
    if (!id) throw new Error('Session ID required');

    return this.request(`/configurations/${id}/extend`, {
      method: 'POST',
      body: { days }
    });
  }

  async getUserSessions() {
    return this.request('/configurations/user-sessions');
  }

  // Model Management (same as v1)
  async getModel(modelId = null) {
    const id = modelId || this.modelId;
    if (!id) throw new Error('Model ID required');
    
    const model = await this.request(`/models/${id}`);

    // Ensure we have proper structure
    if (!model.option_groups && model.groups) {
      model.option_groups = model.groups;
    }

    return model;
  }

  async getModelGroups(modelId = null) {
    const id = modelId || this.modelId;
    if (!id) throw new Error('Model ID required');
    
    const response = await this.request(`/models/${id}/groups`);
    
    // Handle wrapped response format
    if (response && typeof response === 'object') {
      if (response.groups && Array.isArray(response.groups)) {
        return response.groups;
      }
      if (response.data && response.data.groups && Array.isArray(response.data.groups)) {
        return response.data.groups;
      }
    }
    
    return Array.isArray(response) ? response : [];
  }

  async getModelOptions(modelId = null) {
    const id = modelId || this.modelId;
    if (!id) throw new Error('Model ID required');
    
    const response = await this.request(`/models/${id}/options`);
    
    // Handle wrapped response format
    if (response && typeof response === 'object') {
      if (response.options && Array.isArray(response.options)) {
        return response.options;
      }
      if (response.data && response.data.options && Array.isArray(response.data.options)) {
        return response.data.options;
      }
    }
    
    return Array.isArray(response) ? response : [];
  }

  async getModelRules(modelId = null) {
    const id = modelId || this.modelId;
    if (!id) throw new Error('Model ID required');
    
    const response = await this.request(`/models/${id}/rules`);
    
    // Handle wrapped response format
    if (response && typeof response === 'object') {
      if (response.rules && Array.isArray(response.rules)) {
        return response.rules;
      }
      if (response.data && response.data.rules && Array.isArray(response.data.rules)) {
        return response.data.rules;
      }
    }
    
    return Array.isArray(response) ? response : [];
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

  // Session recovery
  async recoverSession() {
    const sessionId = localStorage.getItem('session_id');
    const sessionToken = localStorage.getItem('session_token');
    
    if (!sessionId) return null;

    try {
      // Try to recover the session
      const session = await this.getSession(sessionId);
      
      // Check if session is still valid
      if (session && session.status !== 'abandoned' && new Date(session.expires_at) > new Date()) {
        this.sessionId = sessionId;
        this.sessionToken = sessionToken;
        return session;
      }
    } catch (error) {
      // If it's a 404, the session doesn't exist anymore
      if (error.status === 404) {
        console.log('Session not found, will create new one');
      } else {
        console.error('Failed to recover session:', error);
      }
    }

    // Clear invalid session data
    this.clearSession();
    return null;
  }

  clearSession() {
    this.sessionId = null;
    this.sessionToken = null;
    localStorage.removeItem('session_id');
    localStorage.removeItem('session_token');
  }

  // Health Check
  async checkHealth() {
    return this.request('/health');
  }

  async getStatus() {
    return this.request('/status');
  }
}

export default SessionApiClient;