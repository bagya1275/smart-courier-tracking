/**
 * SMART COURIER PLATFORM - API ADAPTER
 * REST API Client connecting to Spring Boot 3 backend with JWT & smart offline fallback.
 */

const LOCAL_HOSTS = ['localhost', '127.0.0.1'];
const IS_LOCAL = LOCAL_HOSTS.includes(window.location.hostname) || window.location.protocol === 'file:';
const ENABLE_OFFLINE_FALLBACK = false;
const API_BASE_URL = window.SMART_COURIER_API_BASE_URL || (IS_LOCAL ? 'http://localhost:8080/api/v1' : '/api/v1');

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('smart_courier_jwt_token') || null;
    this.isLiveBackend = false;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('smart_courier_jwt_token', token);
    } else {
      localStorage.removeItem('smart_courier_jwt_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const fetchOptions = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `API Error: ${response.status}`);
      }
      this.isLiveBackend = true;
      this.updateConnectionStatus(true);
      const resJson = await response.json();
      return resJson.data !== undefined ? resJson.data : resJson;
    } catch (error) {
      console.warn(`[API] Request failed at ${url}.`, error.message);
      this.isLiveBackend = false;
      this.updateConnectionStatus(false);
      throw error;
    }
  }

  updateConnectionStatus(isLive) {
    const badge = document.getElementById('api-status-indicator');
    if (badge) {
      if (isLive) {
        badge.innerHTML = `<span class="status-dot" style="background:#10B981;box-shadow:0 0 8px #10B981;"></span> Live REST API`;
        badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        badge.style.color = '#10B981';
      } else {
        badge.innerHTML = `<span class="status-dot" style="background:#00F0FF;box-shadow:0 0 8px #00F0FF;"></span> Backend Unavailable`;
        badge.style.borderColor = 'rgba(0, 240, 255, 0.3)';
        badge.style.color = '#00F0FF';
      }
    }
  }

  // ==========================================
  // AUTH MODULE
  // ==========================================
  async login(usernameOrEmail, password, role) {
    try {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail, password, role })
      });
      this.setToken(data.token);
      return data;
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      // Offline fallback: find matching mock user
      const user = window.dataStore.users.find(u => 
        (u.email.toLowerCase() === usernameOrEmail.toLowerCase() || u.username.toLowerCase() === usernameOrEmail.toLowerCase())
      ) || {
        id: 99,
        username: usernameOrEmail.split('@')[0],
        email: usernameOrEmail,
        fullName: usernameOrEmail.split('@')[0],
        role: role || 'ROLE_ADMIN'
      };

      const mockResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: role || user.role,
        driverId: (role === 'ROLE_DRIVER' || user.role === 'ROLE_DRIVER') ? 1 : null
      };
      this.setToken(mockResponse.token);
      return mockResponse;
    }
  }

  async register(registerData) {
    try {
      const data = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData)
      });
      this.setToken(data.token);
      return data;
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      const mockResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        id: Date.now(),
        username: registerData.username,
        email: registerData.email,
        fullName: registerData.fullName,
        role: registerData.role || 'ROLE_CUSTOMER',
        driverId: null
      };
      this.setToken(mockResponse.token);
      return mockResponse;
    }
  }

  // ==========================================
  // SHIPMENT MODULE
  // ==========================================
  async getShipments(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      return await this.request(`/shipments${query ? '?' + query : ''}`);
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      return window.dataStore.getShipments(params);
    }
  }

  async trackShipment(trackingId) {
    try {
      return await this.request(`/shipments/track/${encodeURIComponent(trackingId)}`);
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      const found = window.dataStore.getShipmentByTracking(trackingId);
      if (!found) throw new Error(`Tracking ID "${trackingId}" not found in system.`);
      return found;
    }
  }

  async createShipment(shipmentData) {
    try {
      return await this.request('/shipments', {
        method: 'POST',
        body: JSON.stringify(shipmentData)
      });
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      return window.dataStore.addShipment(shipmentData);
    }
  }

  async updateShipmentStatus(id, status) {
    try {
      return await this.request(`/shipments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      return window.dataStore.updateShipmentStatus(id, status);
    }
  }

  async deleteShipment(id) {
    try {
      return await this.request(`/shipments/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      window.dataStore.deleteShipment(id);
      return true;
    }
  }

  async generateTrackingId() {
    try {
      const res = await this.request('/shipments/generate-tracking-id');
      return res.trackingId;
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      return window.dataStore.generateTrackingId();
    }
  }

  // ==========================================
  // ROUTE MODULE
  // ==========================================
  async getRoutes() {
    try {
      return await this.request('/routes');
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      return window.dataStore.routes;
    }
  }

  async optimizeRoute(routeId) {
    try {
      return await this.request(`/routes/${routeId}/optimize`, {
        method: 'POST'
      });
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      return window.dataStore.optimizeRoute(routeId);
    }
  }

  // ==========================================
  // DRIVER MODULE
  // ==========================================
  async getDrivers() {
    try {
      return await this.request('/drivers');
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      return window.dataStore.drivers;
    }
  }

  async createDriver(driverData) {
    try {
      return await this.request('/drivers', {
        method: 'POST',
        body: JSON.stringify(driverData)
      });
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      return window.dataStore.addDriver(driverData);
    }
  }

  async updateDriverStatus(driverId, status) {
    try {
      return await this.request(`/drivers/${driverId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      return window.dataStore.updateDriverStatus(driverId, status);
    }
  }

  // ==========================================
  // DASHBOARD STATS
  // ==========================================
  async getDashboardStats() {
    try {
      return await this.request('/dashboard/stats');
    } catch (e) {
      if (!ENABLE_OFFLINE_FALLBACK) throw e;
      return window.dataStore.getDashboardStats();
    }
  }
}

window.apiClient = new ApiClient();
