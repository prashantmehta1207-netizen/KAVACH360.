/**
 * KAVACH360 AI - Dashboard Controller
 * Handles KPIs, Chart.js Visualizations, Recent Inspections, and Alerts Feed.
 */

window.DashboardModule = {
  trendChart: null,
  categoryChart: null,

  async init() {
    this.bindEvents();
    await this.render();
  },

  bindEvents() {
    // Quick action buttons
    document.querySelectorAll('[data-quick-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = e.currentTarget.getAttribute('data-quick-action');
        if (window.AppRouter) window.AppRouter.navigate(targetView);
      });
    });
  },

  async render() {
    const currentSiteId = window.AppRouter ? window.AppRouter.currentSiteId : 'all';
    const observations = await window.apiService.getObservations(currentSiteId);
    const sites = await window.apiService.getSites();

    // Calculate metrics
    const totalSites = sites.length;
    const totalVideos = 42; // cumulative across sites
    const potentialHazards = observations.filter(o => o.verificationStatus !== 'dismissed').length;
    const pendingReviews = observations.filter(o => o.verificationStatus === 'pending').length;
    const verifiedIncidents = observations.filter(o => o.verificationStatus === 'verified').length;
    const resolvedActions = observations.filter(o => o.actionStatus === 'resolved').length;

    // Update KPI UI elements
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('kpi-total-sites', totalSites);
    setVal('kpi-total-videos', totalVideos);
    setVal('kpi-potential-hazards', potentialHazards);
    setVal('kpi-pending-reviews', pendingReviews);
    setVal('kpi-verified-incidents', verifiedIncidents);
    setVal('kpi-resolved-actions', resolvedActions);

    // Render Charts
    this.renderTrendsChart();
    this.renderCategoryChart(observations);

    // Render Tables & Feeds
    this.renderRecentInspections();
    this.renderRecentAlerts(observations);
  },

  renderTrendsChart() {
    const canvas = document.getElementById('safetyTrendsChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.trendChart) this.trendChart.destroy();

    const ctx = canvas.getContext('2d');
    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon 24', 'Tue 25', 'Wed 26', 'Thu 27', 'Fri 28', 'Sat 29', 'Today'],
        datasets: [
          {
            label: 'Videos Inspected',
            data: [4, 6, 8, 5, 7, 3, 9],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            tension: 0.35,
            fill: true,
            borderWidth: 2.5,
            pointBackgroundColor: '#2563eb',
            pointRadius: 4
          },
          {
            label: 'Hazards Flagged',
            data: [2, 4, 3, 1, 5, 2, 3],
            borderColor: '#ef4444',
            backgroundColor: 'transparent',
            tension: 0.35,
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: '#ef4444',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 12 }, boxWidth: 14 }
          },
          tooltip: {
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { stepSize: 2 }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  },

  renderCategoryChart(observations) {
    const canvas = document.getElementById('hazardCategoryChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.categoryChart) this.categoryChart.destroy();

    // Group observations by category
    const categoryCounts = {};
    observations.forEach(o => {
      if (o.verificationStatus === 'dismissed') return;
      categoryCounts[o.category] = (categoryCounts[o.category] || 0) + 1;
    });

    const labels = Object.keys(categoryCounts).length > 0
      ? Object.keys(categoryCounts)
      : ['PPE Compliance', 'Fall Protection', 'Electrical Safety', 'Blocked Exits', 'Heavy Machinery'];

    const data = Object.keys(categoryCounts).length > 0
      ? Object.values(categoryCounts)
      : [4, 3, 2, 1, 1];

    const ctx = canvas.getContext('2d');
    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#2563eb', // Blue
            '#ef4444', // Red
            '#f59e0b', // Amber
            '#8b5cf6', // Purple
            '#06b6d4', // Cyan
            '#10b981'  // Emerald
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 11 }, padding: 12 }
          }
        },
        cutout: '68%'
      }
    });
  },

  renderRecentInspections() {
    const tbody = document.getElementById('recent-inspections-tbody');
    if (!tbody) return;

    const mockInspections = [
      { id: 'INSP-2026-08', site: 'Skyline Tower B', zone: 'High-Rise Core', date: 'Today, 14:15', duration: '08m 42s', hazards: 3, status: 'Reviewed' },
      { id: 'INSP-2026-07', site: 'Skyline Tower B', zone: 'Substation Deck', date: 'Yesterday, 09:40', duration: '12m 10s', hazards: 1, status: 'Needs Review' },
      { id: 'INSP-2026-06', site: 'Harbor View Complex', zone: 'Waterfront Piling', date: '28 Oct, 16:30', duration: '15m 04s', hazards: 2, status: 'Actioned' },
      { id: 'INSP-2026-05', site: 'Apex Logistics Hub', zone: 'Gantry Crane Bay', date: '27 Oct, 11:20', duration: '06m 55s', hazards: 0, status: 'Compliant' }
    ];

    tbody.innerHTML = mockInspections.map(row => {
      const badgeClass = row.hazards > 2 ? 'badge-danger' : row.hazards > 0 ? 'badge-warning' : 'badge-success';
      return `
        <tr>
          <td><strong style="color:var(--primary); font-family:monospace;">${row.id}</strong></td>
          <td>${row.site}</td>
          <td><span style="color:var(--text-muted);">${row.zone}</span></td>
          <td>${row.date}</td>
          <td>${row.duration}</td>
          <td><span class="badge ${badgeClass}"><span class="badge-dot-indicator"></span>${row.hazards} Flagged</span></td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="AppRouter.navigate('hazards')">
              <i class="fas fa-eye"></i> Details
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderRecentAlerts(observations) {
    const container = document.getElementById('recent-alerts-feed');
    if (!container) return;

    const activeAlerts = observations.filter(o => o.verificationStatus !== 'dismissed').slice(0, 4);

    if (activeAlerts.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding: 20px; color:var(--text-muted);">No critical alerts pending review.</div>`;
      return;
    }

    container.innerHTML = activeAlerts.map(alert => {
      const isCritical = alert.suggestedPriority === 'Critical';
      const iconClass = isCritical ? 'critical' : 'warning';
      const iconName = isCritical ? 'fa-triangle-exclamation' : 'fa-circle-exclamation';

      return `
        <div class="alert-feed-item">
          <div class="alert-icon ${iconClass}">
            <i class="fas ${iconName}"></i>
          </div>
          <div class="alert-content">
            <div class="alert-title-row">
              <div class="alert-title">${alert.title}</div>
              <div class="alert-time">${alert.timestamp}</div>
            </div>
            <div class="alert-desc">${alert.aiObservation}</div>
            <div class="alert-meta">
              <span class="badge ${isCritical ? 'badge-danger' : 'badge-warning'}">${alert.category}</span>
              <span style="color:var(--text-muted);"><i class="fas fa-book-bookmark"></i> ${alert.sopCitation}</span>
              <button class="btn btn-outline btn-sm" style="margin-left:auto; padding: 2px 8px; font-size:11px;" onclick="HazardsModule.openReviewModal('${alert.id}')">
                Review Now
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
};
