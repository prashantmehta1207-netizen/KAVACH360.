/**
 * KAVACH360 AI - Hazard Detection & Observation Controller
 * Manages safety observation cards, evidence visualizer, category/priority filters,
 * and human verification workflows.
 */

window.HazardsModule = {
  currentFilter: {
    category: 'all',
    priority: 'all',
    status: 'all',
    search: ''
  },
  activeObservationId: null,

  async init() {
    this.bindEvents();
    await this.render();
  },

  bindEvents() {
    // Filter controls
    const categorySelect = document.getElementById('hazard-filter-category');
    const prioritySelect = document.getElementById('hazard-filter-priority');
    const statusSelect = document.getElementById('hazard-filter-status');
    const searchInput = document.getElementById('hazard-search-input');

    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.currentFilter.category = e.target.value;
        this.render();
      });
    }

    if (prioritySelect) {
      prioritySelect.addEventListener('change', (e) => {
        this.currentFilter.priority = e.target.value;
        this.render();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.currentFilter.status = e.target.value;
        this.render();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilter.search = e.target.value.toLowerCase();
        this.render();
      });
    }

    // Modal submit listeners
    const modalForm = document.getElementById('review-observation-form');
    if (modalForm) {
      modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitObservationReview();
      });
    }
  },

  async render() {
    const grid = document.getElementById('hazard-observations-grid');
    if (!grid) return;

    const currentSiteId = window.AppRouter ? window.AppRouter.currentSiteId : 'all';
    let observations = await window.apiService.getObservations(currentSiteId);

    // Apply filters
    if (this.currentFilter.category !== 'all') {
      observations = observations.filter(o => o.category === this.currentFilter.category);
    }
    if (this.currentFilter.priority !== 'all') {
      observations = observations.filter(o => o.suggestedPriority === this.currentFilter.priority);
    }
    if (this.currentFilter.status !== 'all') {
      observations = observations.filter(o => o.verificationStatus === this.currentFilter.status);
    }
    if (this.currentFilter.search) {
      observations = observations.filter(o =>
        o.title.toLowerCase().includes(this.currentFilter.search) ||
        o.aiObservation.toLowerCase().includes(this.currentFilter.search) ||
        o.sopCitation.toLowerCase().includes(this.currentFilter.search)
      );
    }

    // Update count indicator
    const countEl = document.getElementById('hazard-count-badge');
    if (countEl) countEl.textContent = `${observations.length} Observations`;

    if (observations.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: white; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
          <i class="fas fa-shield-check" style="font-size: 42px; color: var(--success); margin-bottom: 12px;"></i>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main);">No Observations Matching Filter</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Adjust your filters or upload a new site inspection video.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = observations.map(obs => {
      const isCritical = obs.suggestedPriority === 'Critical';
      const isHigh = obs.suggestedPriority === 'High';
      const prioBadge = isCritical ? 'badge-danger' : isHigh ? 'badge-warning' : 'badge-info';

      const statusBadge = obs.verificationStatus === 'verified'
        ? '<span class="badge badge-success"><span class="badge-dot-indicator"></span>Human Verified</span>'
        : obs.verificationStatus === 'dismissed'
        ? '<span class="badge badge-neutral"><span class="badge-dot-indicator"></span>Dismissed</span>'
        : '<span class="badge badge-warning"><span class="badge-dot-indicator"></span>Needs Human Review</span>';

      return `
        <div class="hazard-card" data-id="${obs.id}">
          <div class="hazard-card-evidence">
            <img src="${obs.evidenceImage}" alt="Hazard Evidence" class="evidence-image" />
            <div class="evidence-timestamp-pill">
              <i class="fas fa-clock"></i> ${obs.timestamp}
            </div>
            <div class="evidence-category-badge">
              <span class="badge ${prioBadge}">${obs.category}</span>
            </div>
            <div class="evidence-uncertainty-badge">
              <span class="badge badge-neutral" style="background: rgba(15, 23, 42, 0.85); color: #e2e8f0; border: none;">
                <i class="fas fa-microchip"></i> ${obs.uncertaintyStatus}
              </span>
            </div>
          </div>

          <div class="hazard-card-content">
            <div class="hazard-title-row">
              <h4 class="hazard-name">${obs.title}</h4>
              <span class="badge ${prioBadge}">${obs.suggestedPriority}</span>
            </div>

            <p class="hazard-desc">${obs.aiObservation}</p>

            <div style="font-size: 12px; color: #475569; background: #fffbeb; padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid #fef3c7;">
              <strong>Danger Rationale:</strong> ${obs.explanation}
            </div>

            <div class="sop-match-box">
              <div class="sop-match-header">
                <i class="fas fa-book-bookmark"></i> Safety Rule Cross-Reference
              </div>
              <div style="font-weight: 600; color: #0f172a;">${obs.sopCitation}</div>
              <div style="color: #64748b; font-size: 11px; margin-top: 2px;">
                <strong>Corrective Action:</strong> ${obs.recommendedAction}
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 6px;">
              <span style="font-size: 11px; color: var(--text-muted);">
                <i class="fas fa-location-dot"></i> Zone: <strong>${obs.zoneId}</strong>
              </span>
              ${statusBadge}
            </div>
          </div>

          <div class="hazard-card-footer">
            <button class="btn btn-outline btn-sm" onclick="HazardsModule.openReviewModal('${obs.id}')">
              <i class="fas fa-user-check"></i> Human Verification
            </button>
            <button class="btn btn-primary btn-sm" onclick="HazardsModule.quickAssignAction('${obs.id}')">
              <i class="fas fa-bolt"></i> Corrective Action
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  async openReviewModal(obsId) {
    this.activeObservationId = obsId;
    const currentSiteId = window.AppRouter ? window.AppRouter.currentSiteId : 'all';
    const observations = await window.apiService.getObservations(currentSiteId);
    const obs = observations.find(o => o.id === obsId);
    if (!obs) return;

    const modal = document.getElementById('modal-review-observation');
    if (!modal) return;

    document.getElementById('modal-obs-id-title').textContent = `${obs.id}: ${obs.title}`;
    document.getElementById('modal-obs-desc').textContent = obs.aiObservation;
    document.getElementById('modal-obs-sop').textContent = obs.sopCitation;
    document.getElementById('modal-obs-evidence-img').src = obs.evidenceImage;

    const statusRadios = document.getElementsByName('verification_decision');
    statusRadios.forEach(r => {
      if (r.value === obs.verificationStatus) r.checked = true;
    });

    modal.classList.add('active');
  },

  closeReviewModal() {
    const modal = document.getElementById('modal-review-observation');
    if (modal) modal.classList.remove('active');
    this.activeObservationId = null;
  },

  async submitObservationReview() {
    if (!this.activeObservationId) return;

    const selectedDecision = document.querySelector('input[name="verification_decision"]:checked');
    const decision = selectedDecision ? selectedDecision.value : 'verified';
    const notes = document.getElementById('modal-review-notes').value;

    try {
      await window.apiService.updateObservationReview(this.activeObservationId, decision, notes);
      this.closeReviewModal();
      await this.render();

      if (window.AppRouter) {
        window.AppRouter.showToast(`Observation ${this.activeObservationId} marked as ${decision.toUpperCase()}.`, 'success');
        // Refresh dashboard numbers too if present
        if (window.DashboardModule) window.DashboardModule.render();
      }
    } catch (err) {
      if (window.AppRouter) window.AppRouter.showToast('Failed to update review status.', 'danger');
    }
  },

  async quickAssignAction(obsId) {
    if (window.AppRouter) {
      window.AppRouter.navigate('action-center');
      if (window.ActionsModule) {
        window.ActionsModule.highlightOrOpenAction(obsId);
      }
    }
  }
};
