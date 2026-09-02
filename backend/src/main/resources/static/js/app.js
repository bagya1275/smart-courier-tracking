/**
 * SMART COURIER TRACKING & DELIVERY ROUTE MANAGEMENT PLATFORM
 * Main SPA Controller, Role Manager, Event Handlers & View Orchestrator.
 */

document.addEventListener('DOMContentLoaded', () => {
  const App = {
    currentUser: null,
    currentRole: 'ROLE_ADMIN', // 'ROLE_ADMIN' | 'ROLE_DRIVER' | 'ROLE_CUSTOMER'
    activeView: 'dashboard',
    routeMapInstance: null,
    selectedRouteId: 1,

    async init() {
      this.bindAuthEvents();
      this.bindNavEvents();
      this.bindShipmentEvents();
      this.bindRouteEvents();
      this.bindCourierEvents();
      this.bindCustomerTrackerEvents();
      this.bindDriverConsoleEvents();
      this.bindGlobalModals();

      // Restore the saved session. In production, verify the JWT with the API
      // before opening the authenticated workspace.
      const savedUser = localStorage.getItem('smart_courier_user');
      const savedToken = localStorage.getItem('smart_courier_jwt_token');
      if (savedUser && savedToken) {
        try {
          const user = await window.apiClient.request('/auth/me');
          this.currentUser = user;
          this.currentRole = user.role;
          localStorage.setItem('smart_courier_user', JSON.stringify(user));
          this.showApp();
        } catch (e) {
          // Keep the local demo/offline experience available during local development.
          if (window.location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
            try {
              this.currentUser = JSON.parse(savedUser);
              this.currentRole = this.currentUser.role;
              this.showApp();
            } catch (_) {
              this.showAuth();
            }
          } else {
            localStorage.removeItem('smart_courier_user');
            localStorage.removeItem('smart_courier_jwt_token');
            this.showAuth();
          }
        }
      } else {
        this.showAuth();
      }

      // Live activity periodic ticker
      this.startActivitySimulation();
    },

    // =========================================================================
    // AUTHENTICATION & ROLE SWITCHING
    // =========================================================================
    bindAuthEvents() {
      // Role selection buttons on Login Form
      const roleBtns = document.querySelectorAll('.role-btn');
      roleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          roleBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const role = btn.getAttribute('data-role');
          document.getElementById('login-role-input').value = role;
        });
      });

      // Login Form Submit
      const loginForm = document.getElementById('login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const usernameOrEmail = document.getElementById('login-email').value;
          const password = document.getElementById('login-password').value;
          const role = document.getElementById('login-role-input').value || 'ROLE_ADMIN';

          try {
            const res = await window.apiClient.login(usernameOrEmail, password, role);
            this.currentUser = res;
            this.currentRole = res.role;
            localStorage.setItem('smart_courier_user', JSON.stringify(res));
            this.showToast(`Welcome back, ${res.fullName || res.username}!`, 'success');
            this.showApp();
          } catch (err) {
            this.showToast(err.message || 'Login failed', 'error');
          }
        });
      }

      // Quick Demo Preset Logins
      window.demoLogin = async (roleType) => {
        let creds = { email: 'admin@courier.com', pass: 'admin123', role: 'ROLE_ADMIN' };
        if (roleType === 'driver') {
          creds = { email: 'driver@courier.com', pass: 'driver123', role: 'ROLE_DRIVER' };
        } else if (roleType === 'customer') {
          creds = { email: 'customer@courier.com', pass: 'customer123', role: 'ROLE_CUSTOMER' };
        }

        document.getElementById('login-email').value = creds.email;
        document.getElementById('login-password').value = creds.pass;
        document.getElementById('login-role-input').value = creds.role;

        roleBtns.forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-role') === creds.role);
        });

        try {
          const res = await window.apiClient.login(creds.email, creds.pass, creds.role);
          this.currentUser = res;
          this.currentRole = res.role;
          localStorage.setItem('smart_courier_user', JSON.stringify(res));
          this.showToast(`Logged in as ${res.fullName} (${creds.role.replace('ROLE_', '')})`, 'success');
          this.showApp();
        } catch (err) {
          this.showToast(err.message || 'Demo login failed', 'error');
        }
      };

      // Switch between Login and Register tabs
      const toRegisterLink = document.getElementById('link-to-register');
      const toLoginLink = document.getElementById('link-to-login');
      const loginCard = document.getElementById('auth-login-card');
      const registerCard = document.getElementById('auth-register-card');

      if (toRegisterLink && toLoginLink) {
        toRegisterLink.addEventListener('click', (e) => {
          e.preventDefault();
          loginCard.style.display = 'none';
          registerCard.style.display = 'block';
        });
        toLoginLink.addEventListener('click', (e) => {
          e.preventDefault();
          registerCard.style.display = 'none';
          loginCard.style.display = 'block';
        });
      }

      // Register Form Submit
      const registerForm = document.getElementById('register-form');
      if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const username = document.getElementById('reg-username').value;
          const email = document.getElementById('reg-email').value;
          const password = document.getElementById('reg-password').value;
          const fullName = document.getElementById('reg-fullname').value;
          const role = document.getElementById('reg-role').value;
          const phone = document.getElementById('reg-phone').value;

          try {
            const res = await window.apiClient.register({ username, email, password, fullName, role, phone });
            this.currentUser = res;
            this.currentRole = res.role;
            localStorage.setItem('smart_courier_user', JSON.stringify(res));
            this.showToast('Account created successfully!', 'success');
            this.showApp();
          } catch (err) {
            this.showToast(err.message || 'Registration failed', 'error');
          }
        });
      }

      // Logout button
      const logoutBtn = document.getElementById('nav-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          this.currentUser = null;
          localStorage.removeItem('smart_courier_user');
          localStorage.removeItem('smart_courier_jwt_token');
          this.showToast('Signed out successfully.', 'info');
          this.showAuth();
        });
      }
    },

    showAuth() {
      document.getElementById('auth-container').style.display = 'flex';
      document.getElementById('app-container').style.display = 'none';
    },

    showApp() {
      document.getElementById('auth-container').style.display = 'none';
      document.getElementById('app-container').style.display = 'flex';

      // Update User profile badge in navbar
      const nameEl = document.getElementById('nav-user-name');
      const roleEl = document.getElementById('nav-user-role');
      const avatarEl = document.getElementById('nav-user-avatar');

      if (this.currentUser) {
        nameEl.textContent = this.currentUser.fullName || this.currentUser.username;
        roleEl.textContent = this.currentUser.role.replace('ROLE_', '');
        const initials = (this.currentUser.fullName || this.currentUser.username)
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        avatarEl.textContent = initials;
      }

      // Adjust views based on role
      this.adaptUIPerRole();
    },

    adaptUIPerRole() {
      const navLinks = document.querySelectorAll('.nav-link');
      const adminNavItems = document.querySelectorAll('.admin-nav-item');
      const driverNavItems = document.querySelectorAll('.driver-nav-item');
      const customerNavItems = document.querySelectorAll('.customer-nav-item');

      if (this.currentRole === 'ROLE_ADMIN') {
        adminNavItems.forEach(el => el.style.display = 'flex');
        driverNavItems.forEach(el => el.style.display = 'none');
        customerNavItems.forEach(el => el.style.display = 'none');
        this.switchView('dashboard');
      } else if (this.currentRole === 'ROLE_DRIVER') {
        adminNavItems.forEach(el => el.style.display = 'none');
        driverNavItems.forEach(el => el.style.display = 'flex');
        customerNavItems.forEach(el => el.style.display = 'none');
        this.switchView('driver-console');
      } else if (this.currentRole === 'ROLE_CUSTOMER') {
        adminNavItems.forEach(el => el.style.display = 'none');
        driverNavItems.forEach(el => el.style.display = 'none');
        customerNavItems.forEach(el => el.style.display = 'flex');
        this.switchView('customer-tracker');
      }
    },

    // =========================================================================
    // NAVIGATION & VIEW SWITCHING
    // =========================================================================
    bindNavEvents() {
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          const targetView = link.getAttribute('data-view');
          if (targetView) {
            this.switchView(targetView);
          }
        });
      });

      // Role quick-switcher in header dropdown/profile
      const roleSwitcher = document.getElementById('role-switcher-select');
      if (roleSwitcher) {
        roleSwitcher.addEventListener('change', (e) => {
          const newRole = e.target.value;
          this.currentRole = newRole;
          if (this.currentUser) this.currentUser.role = newRole;
          this.showToast(`Switched view to ${newRole.replace('ROLE_', '')}`, 'info');
          this.adaptUIPerRole();
        });
      }
    },

    switchView(viewName) {
      this.activeView = viewName;

      // Update Nav active pills
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-view') === viewName);
      });

      // Hide all view sections, show target
      document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.remove('active');
      });

      const targetSection = document.getElementById(`view-${viewName}`);
      if (targetSection) {
        targetSection.classList.add('active');
      }

      // View-specific loader logic
      if (viewName === 'dashboard') {
        this.loadDashboardData();
      } else if (viewName === 'shipments') {
        this.loadShipmentsTable();
      } else if (viewName === 'routes-3d') {
        this.load3DRouteScene();
      } else if (viewName === 'couriers') {
        this.loadCouriersGrid();
      } else if (viewName === 'customer-tracker') {
        this.trackCustomerParcel('TRK-2026-8821');
      } else if (viewName === 'driver-console') {
        this.loadDriverConsole();
      }
    },

    // =========================================================================
    // DASHBOARD VIEW
    // =========================================================================
    async loadDashboardData() {
      const stats = await window.apiClient.getDashboardStats();

      // Animate Stat Counters
      this.animateCounter('stat-total-shipments', stats.totalShipments);
      this.animateCounter('stat-in-transit', stats.inTransitShipments);
      this.animateCounter('stat-delivered-today', stats.deliveredToday);
      this.animateCounter('stat-active-couriers', stats.activeCouriers);

      // Render Charts
      if (window.chartsManager) {
        window.chartsManager.initWeeklyVolumeChart('weekly-volume-chart', stats.weeklyVolume);
        window.chartsManager.initStatusDistributionChart('status-dist-chart', stats);
      }

      // Render Activity Feed
      const feedContainer = document.getElementById('dashboard-activity-feed');
      if (feedContainer && stats.recentActivity) {
        feedContainer.innerHTML = stats.recentActivity.map(act => `
          <div class="activity-item">
            <div class="activity-icon-box" style="background:${this.getStatusBgColor(act.status)}">
              <span class="status-dot" style="background:${this.getStatusColor(act.status)}"></span>
            </div>
            <div class="activity-info">
              <div class="activity-msg">${act.message}</div>
              <div class="activity-meta">
                <span>Destination: <strong>${act.destination}</strong></span>
                <span>•</span>
                <span>${act.time}</span>
              </div>
            </div>
            <span class="status-pill status-${act.status.toLowerCase().replace('_', '-')}">${act.status.replace('_', ' ')}</span>
          </div>
        `).join('');
      }
    },

    animateCounter(elementId, targetVal) {
      const el = document.getElementById(elementId);
      if (!el) return;

      let start = 0;
      const duration = 900;
      const stepTime = 20;
      const steps = duration / stepTime;
      const increment = targetVal / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= targetVal) {
          el.textContent = targetVal;
          clearInterval(timer);
        } else {
          el.textContent = Math.round(start);
        }
      }, stepTime);
    },

    // =========================================================================
    // SHIPMENT MANAGEMENT MODULE
    // =========================================================================
    bindShipmentEvents() {
      // Search input filter
      const searchInput = document.getElementById('shipment-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', () => this.loadShipmentsTable());
      }

      // Status filter selector
      const statusFilter = document.getElementById('shipment-status-filter');
      if (statusFilter) {
        statusFilter.addEventListener('change', () => this.loadShipmentsTable());
      }

      // "New Shipment" Modal Trigger
      const openModalBtn = document.getElementById('btn-open-new-shipment-modal');
      const modal = document.getElementById('new-shipment-modal');
      if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', async () => {
          // Auto-generate tracking ID
          const trackingId = await window.apiClient.generateTrackingId();
          document.getElementById('new-shipment-tracking-id').value = trackingId;
          
          // Populate Driver Dropdown
          const drivers = await window.apiClient.getDrivers();
          const driverSelect = document.getElementById('new-shipment-driver');
          if (driverSelect) {
            driverSelect.innerHTML = `<option value="">-- Auto-Assign Nearest Courier --</option>` +
              drivers.map(d => `<option value="${d.id}">${d.fullName} (${d.vehicleNumber}) - ${d.status}</option>`).join('');
          }

          modal.classList.add('open');
        });
      }

      // Regenerate Tracking ID button inside modal
      const regenBtn = document.getElementById('btn-regenerate-tracking-id');
      if (regenBtn) {
        regenBtn.addEventListener('click', async () => {
          const trackingId = await window.apiClient.generateTrackingId();
          document.getElementById('new-shipment-tracking-id').value = trackingId;
          this.showToast('Generated new Tracking ID', 'info');
        });
      }

      // New Shipment Form Submit
      const newShipmentForm = document.getElementById('new-shipment-form');
      if (newShipmentForm) {
        newShipmentForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const shipmentData = {
            trackingId: document.getElementById('new-shipment-tracking-id').value,
            senderName: document.getElementById('new-shipment-sender-name').value,
            senderAddress: document.getElementById('new-shipment-sender-addr').value,
            receiverName: document.getElementById('new-shipment-receiver-name').value,
            receiverAddress: document.getElementById('new-shipment-receiver-addr').value,
            destinationName: document.getElementById('new-shipment-dest-name').value,
            weightKg: document.getElementById('new-shipment-weight').value,
            priority: document.getElementById('new-shipment-priority').value,
            assignedDriverId: document.getElementById('new-shipment-driver').value || null,
            routeId: 1
          };

          try {
            await window.apiClient.createShipment(shipmentData);
            this.showToast(`Shipment ${shipmentData.trackingId} created!`, 'success');
            modal.classList.remove('open');
            newShipmentForm.reset();
            this.loadShipmentsTable();
          } catch (err) {
            this.showToast(err.message || 'Error creating shipment', 'error');
          }
        });
      }
    },

    async loadShipmentsTable() {
      const search = document.getElementById('shipment-search-input')?.value || '';
      const status = document.getElementById('shipment-status-filter')?.value || 'ALL';

      const shipments = await window.apiClient.getShipments({ search, status });
      const tbody = document.getElementById('shipments-table-body');
      if (!tbody) return;

      if (shipments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">No shipments found matching filters.</td></tr>`;
        return;
      }

      tbody.innerHTML = shipments.map(s => `
        <tr>
          <td>
            <span class="tracking-tag" onclick="window.copyTracking('${s.trackingId}')" title="Click to copy Tracking ID">
              ${s.trackingId}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </span>
          </td>
          <td>
            <div style="font-weight:600;color:#FFFFFF;">${s.senderName}</div>
            <div style="font-size:0.75rem;color:var(--text-dim);">${s.originName || 'Depot'}</div>
          </td>
          <td>
            <div style="font-weight:600;color:#FFFFFF;">${s.receiverName}</div>
            <div style="font-size:0.75rem;color:var(--text-dim);">${s.destinationName}</div>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:6px;">
              <span class="status-dot" style="background:${s.assignedDriverId ? '#10B981' : '#6B7280'};"></span>
              <span>${s.assignedDriverName || 'Unassigned'}</span>
            </div>
            <div style="font-size:0.72rem;color:var(--text-dim);font-family:var(--font-mono);">${s.assignedDriverVehicle || ''}</div>
          </td>
          <td>
            <span class="priority-badge priority-${s.priority.toLowerCase()}">${s.priority}</span>
          </td>
          <td>
            <span class="status-pill status-${s.status.toLowerCase().replace('_', '-')}">
              <span class="status-dot"></span>
              ${s.status.replace('_', ' ')}
            </span>
          </td>
          <td>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="window.viewShipmentOnMap(${s.id})" title="View on 3D Route Map">
                🗺️ 3D Map
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.quickUpdateStatus(${s.id}, '${s.status}')" title="Change Status">
                ⚙️ Status
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    // =========================================================================
    // 3D ROUTE OPTIMIZATION MODULE
    // =========================================================================
    bindRouteEvents() {
      // Auto-orbit toggle
      const autoRotateBtn = document.getElementById('map-btn-auto-rotate');
      if (autoRotateBtn) {
        autoRotateBtn.addEventListener('click', () => {
          if (this.routeMapInstance) {
            const isRotating = this.routeMapInstance.toggleAutoRotate();
            autoRotateBtn.style.color = isRotating ? 'var(--accent-cyan)' : 'var(--text-muted)';
          }
        });
      }

      // Reset Camera button
      const resetCamBtn = document.getElementById('map-btn-reset-cam');
      if (resetCamBtn) {
        resetCamBtn.addEventListener('click', () => {
          if (this.routeMapInstance) {
            this.routeMapInstance.resetCamera();
          }
        });
      }

      // Theme toggle button
      const themeBtn = document.getElementById('map-btn-theme');
      if (themeBtn) {
        themeBtn.addEventListener('click', () => {
          if (this.routeMapInstance) {
            this.routeMapInstance.toggleThemeMode();
          }
        });
      }
    },

    async load3DRouteScene() {
      const routes = await window.apiClient.getRoutes();

      // Initialize 3D Engine if not yet created
      if (!this.routeMapInstance) {
        this.routeMapInstance = new window.RouteMap3D('three-canvas-container');
      }

      this.routeMapInstance.loadRoutesData(routes);

      // Render Route List Panel
      const routeListEl = document.getElementById('routes-list-container');
      if (routeListEl) {
        routeListEl.innerHTML = routes.map((r, idx) => `
          <div class="glass-panel glass-panel-hover route-card ${idx === 0 ? 'active' : ''}" id="route-card-${r.id}" onclick="window.selectRoute(${r.id})">
            <div class="route-card-top">
              <span class="route-code-tag">${r.routeCode}</span>
              <span class="status-pill status-${r.status.toLowerCase().replace('_', '-')}">
                <span class="status-dot"></span>
                ${r.status}
              </span>
            </div>
            <div class="route-endpoints">
              <div class="endpoint-row">
                <span class="endpoint-dot origin"></span>
                <span>${r.originName}</span>
              </div>
              <div class="endpoint-row">
                <span class="endpoint-dot dest"></span>
                <span>${r.destinationName}</span>
              </div>
            </div>
            <div class="route-metrics-bar">
              <div>
                <div class="metric-box-val">${r.totalDistanceKm} km</div>
                <div class="metric-box-lbl">Distance</div>
              </div>
              <div>
                <div class="metric-box-val">${r.estimatedDurationMin} min</div>
                <div class="metric-box-lbl">Est. Time</div>
              </div>
              <div>
                <div class="metric-box-val">${r.activeDeliveriesCount || 2}</div>
                <div class="metric-box-lbl">Parcels</div>
              </div>
            </div>
            <div style="margin-top:12px;display:flex;gap:8px;">
              <button class="btn btn-outline-cyan btn-sm" style="flex:1;" onclick="window.optimizeRouteAction(event, ${r.id})">
                ⚡ Optimize Shortest Path
              </button>
            </div>
          </div>
        `).join('');
      }

      // Default select first route
      if (routes.length > 0) {
        this.selectRoute(routes[0].id);
      }
    },

    selectRoute(routeId) {
      this.selectedRouteId = routeId;

      // Update active card styling
      document.querySelectorAll('.route-card').forEach(card => card.classList.remove('active'));
      const activeCard = document.getElementById(`route-card-${routeId}`);
      if (activeCard) activeCard.classList.add('active');

      if (this.routeMapInstance) {
        this.routeMapInstance.selectRoute(routeId);
      }
    },

    async optimizeRouteAction(routeId) {
      try {
        const optimized = await window.apiClient.optimizeRoute(routeId);
        this.showToast(`Route ${optimized.routeCode} optimized! Saved 15% distance.`, 'success');
        this.load3DRouteScene();
      } catch (err) {
        this.showToast('Route optimization failed', 'error');
      }
    },

    // =========================================================================
    // DELIVERY & COURIER ROSTER MODULE
    // =========================================================================
    bindCourierEvents() {
      // "+ Add Courier" Modal Trigger
      const openAddCourierBtn = document.getElementById('btn-open-add-courier-modal');
      const modal = document.getElementById('add-courier-modal');
      if (openAddCourierBtn && modal) {
        openAddCourierBtn.addEventListener('click', () => {
          modal.classList.add('open');
        });
      }

      // Add Courier Form Submit
      const form = document.getElementById('add-courier-form');
      if (form && modal) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const driverData = {
            fullName: document.getElementById('new-courier-name').value,
            email: document.getElementById('new-courier-email').value,
            phone: document.getElementById('new-courier-phone').value,
            vehicleNumber: document.getElementById('new-courier-vehicle-no').value,
            vehicleType: document.getElementById('new-courier-vehicle-type').value,
            zoneName: document.getElementById('new-courier-zone').value,
            status: 'AVAILABLE'
          };

          try {
            await window.apiClient.createDriver(driverData);
            this.showToast(`Courier ${driverData.fullName} added to fleet!`, 'success');
            modal.classList.remove('open');
            form.reset();
            this.loadCouriersGrid();
          } catch (err) {
            this.showToast(err.message || 'Error adding courier', 'error');
          }
        });
      }
    },

    async loadCouriersGrid() {
      const drivers = await window.apiClient.getDrivers();
      const grid = document.getElementById('couriers-roster-grid');
      if (!grid) return;

      grid.innerHTML = drivers.map(d => {
        const initials = d.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        return `
          <div class="glass-panel glass-panel-hover courier-card">
            <div class="courier-header">
              <div class="courier-avatar-large">${initials}</div>
              <div class="courier-meta">
                <h3>${d.fullName}</h3>
                <div class="courier-vehicle-tag">${d.vehicleType} • ${d.vehicleNumber}</div>
              </div>
            </div>

            <div class="courier-stats-row">
              <div>
                <div style="font-size:1.1rem;font-weight:800;color:#FBBF24;">⭐ ${d.rating}</div>
                <div style="font-size:0.68rem;color:var(--text-dim);">Rating</div>
              </div>
              <div>
                <div style="font-size:1.1rem;font-weight:800;color:#FFFFFF;">${d.totalDeliveries}</div>
                <div style="font-size:0.68rem;color:var(--text-dim);">Completed</div>
              </div>
              <div>
                <div style="font-size:1.1rem;font-weight:800;color:var(--accent-cyan);">${d.activeDeliveriesCount}</div>
                <div style="font-size:0.68rem;color:var(--text-dim);">Active Parcels</div>
              </div>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
              <span class="status-pill status-${d.status.toLowerCase().replace('_', '-')}">
                <span class="status-dot"></span>
                ${d.status.replace('_', ' ')}
              </span>
              <button class="btn btn-secondary btn-sm" onclick="window.toggleCourierStatus(${d.id}, '${d.status}')">
                Toggle Status
              </button>
            </div>
          </div>
        `;
      }).join('');
    },

    // =========================================================================
    // CUSTOMER TRACKING PORTAL VIEW
    // =========================================================================
    bindCustomerTrackerEvents() {
      const form = document.getElementById('customer-tracking-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const trkInput = document.getElementById('customer-tracking-input').value;
          if (trkInput) {
            this.trackCustomerParcel(trkInput.trim());
          }
        });
      }
    },

    async trackCustomerParcel(trackingId) {
      try {
        const shipment = await window.apiClient.trackShipment(trackingId);
        document.getElementById('customer-tracking-input').value = shipment.trackingId;

        // Populate shipment summary
        document.getElementById('track-res-tracking-id').textContent = shipment.trackingId;
        document.getElementById('track-res-status-pill').textContent = shipment.status.replace('_', ' ');
        document.getElementById('track-res-status-pill').className = `status-pill status-${shipment.status.toLowerCase().replace('_', '-')}`;
        document.getElementById('track-res-sender').textContent = shipment.senderName;
        document.getElementById('track-res-receiver').textContent = shipment.receiverName;
        document.getElementById('track-res-destination').textContent = shipment.destinationName;
        document.getElementById('track-res-courier').textContent = shipment.assignedDriverName || 'Assigned Courier Alpha';
        document.getElementById('track-res-vehicle').textContent = shipment.assignedDriverVehicle || 'EV-SPRINT-409';
        document.getElementById('track-res-eta').textContent = shipment.estimatedDelivery || 'Today, 14:30 EST';

        // Update Stepper Progress
        const steps = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        let activeIdx = 2; // default in_transit
        if (shipment.status === 'PENDING') activeIdx = 0;
        else if (shipment.status === 'IN_TRANSIT') activeIdx = 2;
        else if (shipment.status === 'DELIVERED') activeIdx = 4;
        else if (shipment.status === 'DELAYED') activeIdx = 2;

        const nodes = document.querySelectorAll('.milestone-stepper .step-node');
        nodes.forEach((node, idx) => {
          node.classList.toggle('completed', idx < activeIdx);
          node.classList.toggle('active', idx === activeIdx);
        });

        const progressPercent = (activeIdx / 4) * 100;
        document.getElementById('stepper-progress-bar').style.width = `${progressPercent}%`;

        document.getElementById('customer-tracking-results').style.display = 'block';
      } catch (err) {
        this.showToast(err.message || 'Tracking ID not found', 'error');
      }
    },

    // =========================================================================
    // DRIVER CONSOLE VIEW
    // =========================================================================
    bindDriverConsoleEvents() {},

    async loadDriverConsole() {
      const shipments = await window.apiClient.getShipments();
      const driverShipments = shipments.filter(s => s.status !== 'DELIVERED').slice(0, 4);

      const listContainer = document.getElementById('driver-tasks-list');
      if (!listContainer) return;

      if (driverShipments.length === 0) {
        listContainer.innerHTML = `<div class="glass-panel" style="padding:24px;text-align:center;color:var(--text-muted);">All assigned deliveries completed for this shift! Good work.</div>`;
        return;
      }

      listContainer.innerHTML = driverShipments.map(s => `
        <div class="glass-panel driver-task-card">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <span class="tracking-tag">${s.trackingId}</span>
              <span class="priority-badge priority-${s.priority.toLowerCase()}">${s.priority}</span>
              <span class="status-pill status-${s.status.toLowerCase().replace('_', '-')}">${s.status.replace('_', ' ')}</span>
            </div>
            <div style="font-size:1.05rem;font-weight:700;color:#FFFFFF;margin-bottom:4px;">${s.receiverName}</div>
            <div style="font-size:0.85rem;color:var(--text-muted);">${s.destinationName} (${s.receiverAddress})</div>
          </div>
          <div style="display:flex;gap:8px;">
            ${s.status === 'PENDING' ? `
              <button class="btn btn-primary btn-sm" onclick="window.driverPickUp(${s.id})">📦 Pick Up</button>
            ` : ''}
            ${s.status === 'IN_TRANSIT' ? `
              <button class="btn btn-emerald btn-sm" onclick="window.driverMarkDelivered(${s.id})">✅ Mark Delivered</button>
            ` : ''}
          </div>
        </div>
      `).join('');
    },

    // =========================================================================
    // GLOBAL MODALS & UTILITIES
    // =========================================================================
    bindGlobalModals() {
      // Close modal on click outside or close buttons
      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) overlay.classList.remove('open');
        });
      });

      document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
          const modal = btn.closest('.modal-overlay');
          if (modal) modal.classList.remove('open');
        });
      });
    },

    showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        <span style="font-size:1.1rem;">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span>${message}</span>
      `;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = '0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    },

    getStatusColor(status) {
      switch (status) {
        case 'IN_TRANSIT': return '#00F0FF';
        case 'DELIVERED': return '#10B981';
        case 'PENDING': return '#F59E0B';
        case 'DELAYED': return '#EF4444';
        default: return '#00F0FF';
      }
    },

    getStatusBgColor(status) {
      switch (status) {
        case 'IN_TRANSIT': return 'rgba(0, 240, 255, 0.12)';
        case 'DELIVERED': return 'rgba(16, 185, 129, 0.12)';
        case 'PENDING': return 'rgba(245, 158, 11, 0.12)';
        case 'DELAYED': return 'rgba(239, 68, 68, 0.12)';
        default: return 'rgba(0, 240, 255, 0.12)';
      }
    },

    startActivitySimulation() {
      // Periodically update random statuses or simulated courier pings
      setInterval(() => {
        const feed = document.getElementById('dashboard-activity-feed');
        if (feed && this.activeView === 'dashboard') {
          const events = [
            'Courier EV-SPRINT-409 completed waypoint 2 (Skyline Plaza)',
            'Package TRK-2026-8821 arrived in Midtown sector',
            'Route RT-METRO-ALPHA real-time flow speed: 42 km/h',
            'Courier Elena Rostova picked up batch #49',
            'Smart Mesh telemetry synced 24 active nodes'
          ];
          const randomEv = events[Math.floor(Math.random() * events.length)];
          const nowTime = new Date().toLocaleTimeString();

          const newEl = document.createElement('div');
          newEl.className = 'activity-item';
          newEl.innerHTML = `
            <div class="activity-icon-box" style="background:rgba(0,240,255,0.12);">
              <span class="status-dot" style="background:#00F0FF;"></span>
            </div>
            <div class="activity-info">
              <div class="activity-msg">${randomEv}</div>
              <div class="activity-meta"><span>Telemetric Ping</span><span>•</span><span>${nowTime}</span></div>
            </div>
            <span class="status-pill status-in-transit">Live</span>
          `;
          feed.prepend(newEl);
          if (feed.children.length > 8) {
            feed.removeChild(feed.lastChild);
          }
        }
      }, 9000);
    }
  };

  // Expose global helper actions for inline onclick attributes
  window.app = App;

  window.copyTracking = (trackingId) => {
    navigator.clipboard.writeText(trackingId).then(() => {
      App.showToast(`Tracking ID ${trackingId} copied to clipboard!`, 'info');
    });
  };

  window.viewShipmentOnMap = (shipmentId) => {
    App.switchView('routes-3d');
  };

  window.selectRoute = (routeId) => {
    App.selectRoute(routeId);
  };

  window.optimizeRouteAction = (e, routeId) => {
    e.stopPropagation();
    App.optimizeRouteAction(routeId);
  };

  window.toggleCourierStatus = async (driverId, currentStatus) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'ON_ROUTE' : 'AVAILABLE';
    await window.apiClient.updateDriverStatus(driverId, nextStatus);
    App.showToast(`Courier status set to ${nextStatus}`, 'info');
    App.loadCouriersGrid();
  };

  window.quickUpdateStatus = async (shipmentId, currentStatus) => {
    const statuses = ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'DELAYED'];
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];
    await window.apiClient.updateShipmentStatus(shipmentId, nextStatus);
    App.showToast(`Shipment updated to ${nextStatus}`, 'info');
    App.loadShipmentsTable();
  };

  window.driverPickUp = async (shipmentId) => {
    await window.apiClient.updateShipmentStatus(shipmentId, 'IN_TRANSIT');
    App.showToast('Package picked up and in transit!', 'success');
    App.loadDriverConsole();
  };

  window.driverMarkDelivered = async (shipmentId) => {
    await window.apiClient.updateShipmentStatus(shipmentId, 'DELIVERED');
    App.showToast('Delivery marked as completed with electronic signature!', 'success');
    App.loadDriverConsole();
  };

  // Start Application
  App.init();
});
