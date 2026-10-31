/**
 * KAVACH360 AI - Smart Construction Site Map Controller
 * Interactive 2D Blueprint Architecture with SVG Zones, CCTV FoV Cones,
 * Interactive Hazard Pins, Flyout Inspector, and Leaflet Satellite Fallback.
 */

window.SiteMapModule = {
  activeMarker: null,
  leafletMap: null,
  currentMode: 'blueprint', // 'blueprint' or 'satellite'

  async init() {
    this.bindEvents();
    await this.render();
  },

  bindEvents() {
    const tabBlueprint = document.getElementById('map-tab-blueprint');
    const tabSatellite = document.getElementById('map-tab-satellite');

    if (tabBlueprint && tabSatellite) {
      tabBlueprint.addEventListener('click', () => {
        this.switchMode('blueprint');
      });
      tabSatellite.addEventListener('click', () => {
        this.switchMode('satellite');
      });
    }

    const drawerCloseBtn = document.getElementById('marker-drawer-close');
    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', () => {
        this.closeFlyout();
      });
    }

    // Layer filter toggles
    document.querySelectorAll('[data-map-layer]').forEach(cb => {
      cb.addEventListener('change', () => {
        this.applyLayerFilters();
      });
    });
  },

  switchMode(mode) {
    this.currentMode = mode;
    const tabBlueprint = document.getElementById('map-tab-blueprint');
    const tabSatellite = document.getElementById('map-tab-satellite');
    const blueprintSvg = document.getElementById('blueprint-svg-container');
    const leafletContainer = document.getElementById('leaflet-map-container');

    if (mode === 'blueprint') {
      tabBlueprint.classList.add('active');
      tabSatellite.classList.remove('active');
      blueprintSvg.style.display = 'block';
      leafletContainer.style.display = 'none';
    } else {
      tabSatellite.classList.add('active');
      tabBlueprint.classList.remove('active');
      blueprintSvg.style.display = 'none';
      leafletContainer.style.display = 'block';
      this.initLeaflet();
    }
  },

  initLeaflet() {
    if (typeof L === 'undefined') return;
    const container = document.getElementById('leaflet-map-container');
    if (!container) return;

    if (!this.leafletMap) {
      // Default to construction site coordinates (e.g. realistic commercial expansion hub)
      this.leafletMap = L.map('leaflet-map-container').setView([28.5355, 77.3910], 17);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | KAVACH360 Site GIS'
      }).addTo(this.leafletMap);

      // Add sample construction zones to Leaflet
      const buildingPolygon = L.polygon([
        [28.5360, 77.3900],
        [28.5365, 77.3915],
        [28.5355, 77.3920],
        [28.5350, 77.3905]
      ], { color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.25 }).addTo(this.leafletMap);
      buildingPolygon.bindPopup('<b>Tower B Main High-Rise Core</b><br>4 Active Cranes | 4 Hazards');

      const electricalPolygon = L.polygon([
        [28.5348, 77.3918],
        [28.5352, 77.3925],
        [28.5345, 77.3928],
        [28.5342, 77.3920]
      ], { color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.3 }).addTo(this.leafletMap);
      electricalPolygon.bindPopup('<b>Electrical Substation Yard</b><br>415V Temporary Feeders');

      // Add pins
      L.marker([28.5358, 77.3910]).addTo(this.leafletMap)
        .bindPopup('<b>OBS-1042: PPE Violation</b><br>Scaffold worker missing helmet.');
      L.marker([28.5347, 77.3922]).addTo(this.leafletMap)
        .bindPopup('<b>OBS-1044: Electrical Cable in Water</b><br>Critical Submersible hazard.');
    } else {
      setTimeout(() => this.leafletMap.invalidateSize(), 200);
    }
  },

  async render() {
    const currentSiteId = window.AppRouter ? window.AppRouter.currentSiteId : 'all';
    const observations = await window.apiService.getObservations(currentSiteId);
    this.renderBlueprintPins(observations);
    this.renderZoneStats(observations);
  },

  renderBlueprintPins(observations) {
    const pinGroup = document.getElementById('blueprint-hazard-pins');
    if (!pinGroup) return;

    pinGroup.innerHTML = observations.map(obs => {
      const coords = obs.mapCoords || { x: 250, y: 150 };
      const isCritical = obs.suggestedPriority === 'Critical';
      const isVerified = obs.verificationStatus === 'verified';
      const isResolved = obs.actionStatus === 'resolved';

      let pinColor = '#f59e0b'; // orange: needs review
      if (isResolved) pinColor = '#10b981'; // green: resolved
      else if (isCritical || isVerified) pinColor = '#ef4444'; // red: critical/verified

      return `
        <g class="site-marker-pin" onclick="SiteMapModule.openFlyout('${obs.id}')" transform="translate(${coords.x}, ${coords.y})">
          ${!isResolved ? `<circle cx="0" cy="0" r="16" fill="${pinColor}" opacity="0.3" class="marker-pulse"/>` : ''}
          <circle cx="0" cy="0" r="10" fill="${pinColor}" stroke="#ffffff" stroke-width="2"/>
          <text x="0" y="3.5" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">!</text>
        </g>
      `;
    }).join('');
  },

  renderZoneStats(observations) {
    const container = document.getElementById('zone-statistics-container');
    if (!container) return;

    const zones = [
      { id: 'zone-building', name: 'Tower B High-Rise Core', color: '#3b82f6', maxPersonnel: 65, icon: 'fa-building' },
      { id: 'zone-electrical', name: 'Electrical Substation Deck', color: '#f59e0b', maxPersonnel: 14, icon: 'fa-bolt' },
      { id: 'zone-storage', name: 'Material & Rebar Staging', color: '#10b981', maxPersonnel: 22, icon: 'fa-boxes-stacked' },
      { id: 'zone-machinery', name: 'Excavation & Earthmoving', color: '#8b5cf6', maxPersonnel: 8, icon: 'fa-truck-monster' }
    ];

    container.innerHTML = zones.map(zone => {
      const zoneObs = observations.filter(o => o.zoneId === zone.id && o.actionStatus !== 'resolved');
      const hasCritical = zoneObs.some(o => o.suggestedPriority === 'Critical');
      const statusBadge = hasCritical
        ? '<span class="badge badge-danger">High Risk</span>'
        : zoneObs.length > 0
        ? '<span class="badge badge-warning">Moderate</span>'
        : '<span class="badge badge-success">Compliant</span>';

      return `
        <div class="zone-stat-card" onclick="SiteMapModule.focusZone('${zone.id}')">
          <div class="zone-stat-header">
            <div class="zone-stat-name">
              <i class="fas ${zone.icon}" style="color:${zone.color}; margin-right:6px;"></i> ${zone.name}
            </div>
            ${statusBadge}
          </div>
          <div class="zone-stat-metrics">
            <span>Hazards: <strong>${zoneObs.length} active</strong></span>
            <span>Workers: <strong>~${zone.maxPersonnel} on duty</strong></span>
          </div>
        </div>
      `;
    }).join('');
  },

  async openFlyout(obsId) {
    const currentSiteId = window.AppRouter ? window.AppRouter.currentSiteId : 'all';
    const observations = await window.apiService.getObservations(currentSiteId);
    const obs = observations.find(o => o.id === obsId);
    if (!obs) return;

    const drawer = document.getElementById('blueprint-marker-flyout');
    if (!drawer) return;

    document.getElementById('flyout-obs-id').textContent = obs.id;
    document.getElementById('flyout-obs-category').textContent = obs.category;
    document.getElementById('flyout-obs-title').textContent = obs.title;
    document.getElementById('flyout-obs-time').textContent = obs.timestamp;
    document.getElementById('flyout-obs-zone').textContent = obs.zoneId;
    document.getElementById('flyout-obs-evidence').src = obs.evidenceImage;
    document.getElementById('flyout-obs-action').textContent = obs.recommendedAction;
    document.getElementById('flyout-obs-sop').textContent = obs.sopCitation;

    const prioEl = document.getElementById('flyout-obs-prio');
    if (prioEl) {
      prioEl.textContent = obs.suggestedPriority;
      prioEl.className = `badge ${obs.suggestedPriority === 'Critical' ? 'badge-danger' : 'badge-warning'}`;
    }

    const actionBtn = document.getElementById('flyout-btn-action');
    if (actionBtn) {
      actionBtn.onclick = () => {
        HazardsModule.quickAssignAction(obs.id);
      };
    }

    drawer.classList.add('open');
  },

  closeFlyout() {
    const drawer = document.getElementById('blueprint-marker-flyout');
    if (drawer) drawer.classList.remove('open');
  },

  focusZone(zoneId) {
    if (window.AppRouter) {
      window.AppRouter.showToast(`Inspecting blueprints for ${zoneId}`, 'info');
    }
  },

  applyLayerFilters() {
    const showCCTV = document.getElementById('filter-layer-cctv')?.checked ?? true;
    const showSafetyEquip = document.getElementById('filter-layer-safety')?.checked ?? true;
    const showHazards = document.getElementById('filter-layer-hazards')?.checked ?? true;

    const cctvGroup = document.getElementById('blueprint-cctv-cameras');
    const safetyGroup = document.getElementById('blueprint-safety-facilities');
    const pinsGroup = document.getElementById('blueprint-hazard-pins');

    if (cctvGroup) cctvGroup.style.display = showCCTV ? 'inline' : 'none';
    if (safetyGroup) safetyGroup.style.display = showSafetyEquip ? 'inline' : 'none';
    if (pinsGroup) pinsGroup.style.display = showHazards ? 'inline' : 'none';
  }
};
