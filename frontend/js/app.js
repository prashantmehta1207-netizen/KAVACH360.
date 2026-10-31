/**
 * KAVACH360 AI - Core Application Router & Shell Controller
 * Vanilla JavaScript Single-Page Application Router
 * Tagline: See the Risk. Understand the Danger. Prevent the Incident.
 */

window.AppRouter = {
  currentRoute: 'dashboard',
  currentSiteId: 'site-skyline-b',

  init() {
    this.bindGlobalEvents();
    this.initSiteSelector();
    this.initSettingsModal();
    this.handleInitialRoute();
  },

  bindGlobalEvents() {
    // Nav items click handler
    document.querySelectorAll('.sidebar-nav-container .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.getAttribute('data-route');
        if (route) {
          this.navigate(route);
          this.closeMobileSidebar();
        }
      });
    });

    // Mobile sidebar toggle
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('sidebar-close-btn');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.openMobileSidebar();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeMobileSidebar();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        this.closeMobileSidebar();
      });
    }

    // Hash change listener
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.navigate(hash, false);
    });
  },

  async initSiteSelector() {
    const selector = document.getElementById('global-site-selector');
    if (!selector) return;

    const sites = await window.apiService.getSites();
    selector.innerHTML = `
      <option value="all">All Sites Overview</option>
      ${sites.map(s => `<option value="${s.id}" ${s.id === this.currentSiteId ? 'selected' : ''}>${s.name}</option>`).join('')}
    `;

    selector.addEventListener('change', (e) => {
      this.currentSiteId = e.target.value;
      this.showToast(`Switched active inspection view to: ${selector.options[selector.selectedIndex].text}`, 'info');
      this.refreshCurrentView();
    });
  },

  handleInitialRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigate(hash);
  },

  navigate(route, updateHash = true) {
    const validRoutes = [
      'dashboard', 'inspection', 'analysis', 'hazards',
      'site-map', 'safety-sops', 'action-center', 'reports', 'sites'
    ];

    if (!validRoutes.includes(route)) {
      route = 'dashboard';
    }

    this.currentRoute = route;
    if (updateHash) {
      window.location.hash = route;
    }

    // Update active nav link
    document.querySelectorAll('.sidebar-nav-container .nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-route') === route);
    });

    // Show/hide view sections
    document.querySelectorAll('.view-section').forEach(section => {
      section.classList.remove('active');
    });

    const activeSection = document.getElementById(`view-${route}`);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    // Update Topbar Title & Breadcrumbs
    this.updateHeaderTitles(route);

    // Trigger module lifecycle
    this.refreshCurrentView();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  },

  updateHeaderTitles(route) {
    const titles = {
      'dashboard': { title: 'Executive Safety Dashboard', crumb: 'Overview / Live Safety Metrics' },
      'inspection': { title: 'Video Stream Inspection', crumb: 'CCTV Feeds / Upload & Ingest' },
      'analysis': { title: 'AI Processing Engine (Gemma 4)', crumb: 'Inference / Multimodal Analysis Pipeline' },
      'hazards': { title: 'Hazard Detection & Observations', crumb: 'Incidents / Visual Evidence & Review' },
      'site-map': { title: 'Smart Construction Site Blueprint', crumb: 'Spatial GIS / 2D Hazard Blueprint' },
      'safety-sops': { title: 'Safety SOP Intelligence Manuals', crumb: 'Compliance / OSHA & IS Rules' },
      'action-center': { title: 'Corrective Action Center', crumb: 'Remediation / Supervisor Kanban Workflow' },
      'reports': { title: 'Compliance Audit & Inspection Reports', crumb: 'Audits / Regulatory Documentation' },
      'sites': { title: 'Construction Site Management', crumb: 'Operations / Facilities & Zones' }
    };

    const info = titles[route] || { title: 'KAVACH360 AI', crumb: 'Safety Intelligence Platform' };
    const mainTitleEl = document.getElementById('header-main-title');
    const crumbEl = document.getElementById('header-breadcrumbs');

    if (mainTitleEl) mainTitleEl.textContent = info.title;
    if (crumbEl) crumbEl.textContent = info.crumb;
  },

  async refreshCurrentView() {
    switch (this.currentRoute) {
      case 'dashboard':
        if (window.DashboardModule) await window.DashboardModule.render();
        break;
      case 'hazards':
        if (window.HazardsModule) await window.HazardsModule.render();
        break;
      case 'site-map':
        if (window.SiteMapModule) await window.SiteMapModule.render();
        break;
      case 'action-center':
        if (window.ActionsModule) await window.ActionsModule.render();
        break;
      case 'reports':
        if (window.ReportsModule) await window.ReportsModule.render();
        break;
      case 'sites':
        this.renderSitesPage();
        break;
      case 'safety-sops':
        this.renderSOPsPage();
        break;
    }
  },

  openMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  },

  closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    else if (type === 'danger') icon = 'fa-triangle-exclamation';
    else if (type === 'warning') icon = 'fa-circle-exclamation';

    toast.innerHTML = `
      <i class="fas ${icon}" style="font-size: 16px;"></i>
      <div style="flex:1;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  async renderSitesPage() {
    const container = document.getElementById('sites-management-grid');
    if (!container) return;

    const sites = await window.apiService.getSites();
    container.innerHTML = sites.map(site => `
      <div class="card" style="padding: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <h3 style="font-size:16px; font-weight:700; color:var(--text-main);">${site.name}</h3>
            <p style="font-size:12px; color:var(--text-muted);"><i class="fas fa-location-dot"></i> ${site.location}</p>
          </div>
          <span class="badge badge-success"><span class="badge-dot-indicator"></span>Active Site</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:#f8fafc; border-radius:var(--radius-sm); padding:12px; margin-bottom:14px; font-size:12px;">
          <div>Safety Manager: <strong style="display:block; color:var(--text-main);">${site.manager}</strong></div>
          <div>CCTV Cameras: <strong style="display:block; color:var(--primary);">${site.cameraCount} Deployed</strong></div>
          <div>Inspections: <strong style="display:block; color:var(--text-main);">${site.totalInspections} Runs</strong></div>
          <div>Active Hazards: <strong style="display:block; color:${site.activeHazards > 0 ? '#ef4444' : '#10b981'};">${site.activeHazards} Issues</strong></div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-outline btn-sm" onclick="AppRouter.showToast('Inspecting CCTV camera telemetry for ${site.name}', 'info')">
            <i class="fas fa-video"></i> View Cameras
          </button>
          <button class="btn btn-primary btn-sm" onclick="AppRouter.currentSiteId='${site.id}'; AppRouter.navigate('site-map');">
            <i class="fas fa-map"></i> Open Blueprint
          </button>
        </div>
      </div>
    `).join('');
  },

  async renderSOPsPage() {
    const container = document.getElementById('sops-catalog-grid');
    if (!container) return;

    const sops = await window.apiService.getSOPs();
    container.innerHTML = sops.map(sop => `
      <div class="sop-card">
        <div class="sop-card-header">
          <span class="sop-rule-id">${sop.standard}</span>
          <span class="badge badge-info">${sop.category}</span>
        </div>
        <div class="sop-title">${sop.ruleTitle}</div>
        <div class="sop-requirement"><strong>Mandatory Requirement:</strong> ${sop.mandatoryRequirement}</div>
        <div class="sop-action-box">
          <div style="font-weight:700; color:var(--text-main); margin-bottom:2px;"><i class="fas fa-wrench"></i> Prescribed Corrective Action:</div>
          <div>${sop.prescribedCorrectiveAction}</div>
        </div>
        <div style="font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between; margin-top:auto; padding-top:6px;">
          <span>Safety Code Manual Ref.</span>
          <span><strong>Page ${sop.pageRef}</strong></span>
        </div>
      </div>
    `).join('');
  },

  initSettingsModal() {
    const settingsBtn = document.getElementById('header-settings-btn');
    const modal = document.getElementById('modal-settings');
    const form = document.getElementById('settings-form');
    const closeBtn = document.getElementById('modal-settings-close');

    if (settingsBtn && modal) {
      settingsBtn.addEventListener('click', () => {
        document.getElementById('settings-api-url').value = window.KAVACH_CONFIG.API_BASE_URL;
        document.getElementById('settings-model-name').value = window.KAVACH_CONFIG.OLLAMA_MODEL;
        document.getElementById('settings-demo-toggle').checked = window.KAVACH_CONFIG.DEMO_MODE;
        modal.classList.add('active');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (form && modal) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        window.KAVACH_CONFIG.API_BASE_URL = document.getElementById('settings-api-url').value;
        window.KAVACH_CONFIG.OLLAMA_MODEL = document.getElementById('settings-model-name').value;
        window.KAVACH_CONFIG.DEMO_MODE = document.getElementById('settings-demo-toggle').checked;

        localStorage.setItem('kavach_api_url', window.KAVACH_CONFIG.API_BASE_URL);
        localStorage.setItem('kavach_model', window.KAVACH_CONFIG.OLLAMA_MODEL);
        localStorage.setItem('kavach_demo_mode', window.KAVACH_CONFIG.DEMO_MODE);

        modal.classList.remove('active');
        this.showToast('Platform preferences updated successfully.', 'success');
      });
    }
  }
};

// Auto-boot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.AppRouter.init();
  if (window.DashboardModule) window.DashboardModule.init();
  if (window.InspectionModule) window.InspectionModule.init();
  if (window.AnalysisModule) window.AnalysisModule.init();
  if (window.HazardsModule) window.HazardsModule.init();
  if (window.SiteMapModule) window.SiteMapModule.init();
  if (window.ActionsModule) window.ActionsModule.init();
  if (window.ReportsModule) window.ReportsModule.init();
});
