/**
 * KAVACH360 AI - Inspection Reports & Compliance Audit Controller
 * Generates official HSE compliance audit reports with executive summary,
 * observation evidence breakdown, OSHA references, and Print/PDF export.
 */

window.ReportsModule = {
  async init() {
    this.bindEvents();
    await this.render();
  },

  bindEvents() {
    const printBtn = document.getElementById('btn-download-pdf-report');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    const exportCsvBtn = document.getElementById('btn-export-csv-report');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        this.exportCSV();
      });
    }
  },

  async render() {
    const currentSiteId = window.AppRouter ? window.AppRouter.currentSiteId : 'site-skyline-b';
    const sites = await window.apiService.getSites();
    const site = sites.find(s => s.id === currentSiteId) || sites[0];
    const observations = await window.apiService.getObservations(currentSiteId);

    // Compute metrics
    const totalObs = observations.length;
    const verified = observations.filter(o => o.verificationStatus === 'verified').length;
    const pending = observations.filter(o => o.verificationStatus === 'pending').length;
    const critical = observations.filter(o => o.suggestedPriority === 'Critical').length;

    // Safety Score calculation
    let penalty = 0;
    observations.forEach(o => {
      if (o.verificationStatus === 'dismissed') return;
      if (o.suggestedPriority === 'Critical') penalty += 12;
      else if (o.suggestedPriority === 'High') penalty += 8;
      else if (o.suggestedPriority === 'Medium') penalty += 4;
    });
    const safetyScore = Math.max(0, 100 - penalty);

    // Update Report Header & Meta
    const setEl = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };

    setEl('report-site-name', site ? site.name : 'Skyline Tower B');
    setEl('report-site-location', site ? site.location : 'Plot 41-B North Avenue');
    setEl('report-site-manager', site ? site.manager : 'Rajesh Kumar (Lead HSE)');
    setEl('report-audit-date', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
    setEl('report-safety-score', safetyScore);

    const gradeEl = document.getElementById('report-safety-grade');
    if (gradeEl) {
      gradeEl.textContent = safetyScore >= 90 ? 'Grade A+' : safetyScore >= 80 ? 'Grade A' : safetyScore >= 70 ? 'Grade B' : 'Grade C';
    }

    setEl('report-stat-total', totalObs);
    setEl('report-stat-critical', critical);
    setEl('report-stat-verified', verified);
    setEl('report-stat-pending', pending);

    // Populate Report Observation Table
    const tbody = document.getElementById('report-observations-tbody');
    if (!tbody) return;

    tbody.innerHTML = observations.map((obs, index) => {
      const prioClass = obs.suggestedPriority === 'Critical' ? 'badge-danger' : 'badge-warning';
      const statusClass = obs.verificationStatus === 'verified' ? 'badge-success' : 'badge-warning';

      return `
        <tr>
          <td><strong style="font-family:monospace; color:var(--primary);">${obs.id}</strong></td>
          <td>
            <div style="font-weight:700; color:var(--text-main);">${obs.title}</div>
            <div style="font-size:11px; color:var(--text-muted);">${obs.aiObservation}</div>
          </td>
          <td><span class="badge ${prioClass}">${obs.suggestedPriority}</span></td>
          <td><span style="font-family:monospace; font-size:11px;">${obs.timestamp}</span></td>
          <td><span style="font-size:11px; font-weight:600; color:#334155;">${obs.sopCitation}</span></td>
          <td><span class="badge ${statusClass}">${obs.verificationStatus.toUpperCase()}</span></td>
          <td style="font-size:11px; color:#475569;">${obs.recommendedAction}</td>
        </tr>
      `;
    }).join('');
  },

  async exportCSV() {
    const currentSiteId = window.AppRouter ? window.AppRouter.currentSiteId : 'all';
    const observations = await window.apiService.getObservations(currentSiteId);

    const headers = ['ID', 'Category', 'Priority', 'Timestamp', 'SOP Citation', 'AI Observation', 'Verification Status', 'Action Status', 'Assigned To'];
    const rows = observations.map(o => [
      o.id,
      `"${o.category}"`,
      `"${o.suggestedPriority}"`,
      `"${o.timestamp}"`,
      `"${o.sopCitation}"`,
      `"${o.aiObservation.replace(/"/g, '""')}"`,
      `"${o.verificationStatus}"`,
      `"${o.actionStatus}"`,
      `"${o.assignedTo || 'Unassigned'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KAVACH360_Safety_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.AppRouter) {
      window.AppRouter.showToast('Inspection report exported to CSV successfully.', 'success');
    }
  }
};
