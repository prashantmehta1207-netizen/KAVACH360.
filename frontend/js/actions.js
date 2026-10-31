/**
 * KAVACH360 AI - Corrective Action Center Controller
 * Kanban workflow for:
 * 1. Pending Reviews
 * 2. Confirmed Observations
 * 3. Assigned Actions
 * 4. In Progress
 * 5. Resolved Actions
 */

window.ActionsModule = {
  activeActionId: null,

  async init() {
    this.bindEvents();
    await this.render();
  },

  bindEvents() {
    // Action modal assignment form
    const assignForm = document.getElementById('assign-action-form');
    if (assignForm) {
      assignForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitAssignment();
      });
    }

    const modalClose = document.getElementById('modal-assign-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        this.closeAssignModal();
      });
    }
  },

  async render() {
    const currentSiteId = window.AppRouter ? window.AppRouter.currentSiteId : 'all';
    const observations = await window.apiService.getObservations(currentSiteId);

    const columns = {
      pending_review: document.getElementById('kanban-col-pending'),
      confirmed: document.getElementById('kanban-col-confirmed'),
      assigned: document.getElementById('kanban-col-assigned'),
      in_progress: document.getElementById('kanban-col-inprogress'),
      resolved: document.getElementById('kanban-col-resolved')
    };

    const counters = {
      pending_review: document.getElementById('kanban-count-pending'),
      confirmed: document.getElementById('kanban-count-confirmed'),
      assigned: document.getElementById('kanban-count-assigned'),
      in_progress: document.getElementById('kanban-count-inprogress'),
      resolved: document.getElementById('kanban-count-resolved')
    };

    // Reset column contents
    Object.keys(columns).forEach(key => {
      if (columns[key]) columns[key].innerHTML = '';
    });

    const tallies = { pending_review: 0, confirmed: 0, assigned: 0, in_progress: 0, resolved: 0 };

    observations.forEach(item => {
      const status = item.actionStatus || 'pending_review';
      if (tallies[status] !== undefined) tallies[status]++;

      const colEl = columns[status];
      if (!colEl) return;

      const isCritical = item.suggestedPriority === 'Critical';
      const prioClass = isCritical ? 'badge-danger' : 'badge-warning';

      const card = document.createElement('div');
      card.className = 'action-card';
      card.id = `action-card-${item.id}`;

      // Build status buttons depending on current column
      let actionButtons = '';
      if (status === 'pending_review') {
        actionButtons = `
          <button class="btn btn-outline btn-sm" onclick="ActionsModule.advanceStatus('${item.id}', 'confirmed')"><i class="fas fa-check"></i> Confirm</button>
          <button class="btn btn-outline btn-sm" onclick="ActionsModule.advanceStatus('${item.id}', 'resolved', { dismissed: true })"><i class="fas fa-xmark"></i> Dismiss</button>
        `;
      } else if (status === 'confirmed') {
        actionButtons = `
          <button class="btn btn-primary btn-sm" onclick="ActionsModule.openAssignModal('${item.id}')"><i class="fas fa-user-plus"></i> Assign</button>
          <button class="btn btn-outline btn-sm" onclick="ActionsModule.advanceStatus('${item.id}', 'in_progress')"><i class="fas fa-play"></i> Start</button>
        `;
      } else if (status === 'assigned') {
        actionButtons = `
          <button class="btn btn-primary btn-sm" onclick="ActionsModule.advanceStatus('${item.id}', 'in_progress')"><i class="fas fa-play"></i> Begin Fix</button>
        `;
      } else if (status === 'in_progress') {
        actionButtons = `
          <button class="btn btn-success btn-sm" onclick="ActionsModule.advanceStatus('${item.id}', 'resolved')"><i class="fas fa-circle-check"></i> Mark Resolved</button>
        `;
      } else if (status === 'resolved') {
        actionButtons = `
          <span class="badge badge-success" style="font-size:11px;"><i class="fas fa-check-double"></i> Completed</span>
          <button class="btn btn-outline btn-sm" style="margin-left:auto; padding:2px 6px; font-size:10px;" onclick="ActionsModule.advanceStatus('${item.id}', 'in_progress')">Reopen</button>
        `;
      }

      card.innerHTML = `
        <div class="action-card-header">
          <span style="font-family:monospace; font-weight:700; color:var(--primary); font-size:11px;">${item.id}</span>
          <span class="badge ${prioClass}">${item.suggestedPriority}</span>
        </div>
        <div class="action-card-title">${item.title}</div>
        <div style="font-size:11.5px; color:var(--text-muted); line-height:1.35; margin-bottom:6px;">
          ${item.recommendedAction}
        </div>
        <div class="action-card-assignee">
          <i class="fas fa-user-gear"></i>
          <span>${item.assignedTo || 'Unassigned'}</span>
          ${item.dueDate ? `<span style="margin-left:auto; color:var(--text-muted);"><i class="fas fa-calendar"></i> ${item.dueDate}</span>` : ''}
        </div>
        <div class="action-controls-row">
          ${actionButtons}
        </div>
      `;

      colEl.appendChild(card);
    });

    // Update counters
    Object.keys(counters).forEach(key => {
      if (counters[key]) counters[key].textContent = tallies[key];
    });
  },

  async advanceStatus(id, newStatus, extra = {}) {
    try {
      await window.apiService.updateActionStatus(id, newStatus, extra);
      await this.render();
      if (window.AppRouter) {
        window.AppRouter.showToast(`Action ${id} status moved to ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');
        if (window.DashboardModule) window.DashboardModule.render();
      }
    } catch (err) {
      if (window.AppRouter) window.AppRouter.showToast('Could not update action status', 'danger');
    }
  },

  openAssignModal(id) {
    this.activeActionId = id;
    const modal = document.getElementById('modal-assign-action');
    if (!modal) return;

    document.getElementById('modal-assign-obs-id').textContent = id;
    modal.classList.add('active');
  },

  closeAssignModal() {
    const modal = document.getElementById('modal-assign-action');
    if (modal) modal.classList.remove('active');
    this.activeActionId = null;
  },

  async submitAssignment() {
    if (!this.activeActionId) return;

    const supervisor = document.getElementById('assign-supervisor-select').value;
    const dueDate = document.getElementById('assign-due-date').value;
    const notes = document.getElementById('assign-instructions').value;

    await window.apiService.updateActionStatus(this.activeActionId, 'assigned', {
      assignedTo: supervisor,
      dueDate: dueDate,
      notes: notes
    });

    this.closeAssignModal();
    await this.render();

    if (window.AppRouter) {
      window.AppRouter.showToast(`Action assigned to ${supervisor} with deadline ${dueDate}.`, 'success');
    }
  },

  highlightOrOpenAction(obsId) {
    setTimeout(() => {
      const card = document.getElementById(`action-card-${obsId}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.outline = '2px solid #2563eb';
        setTimeout(() => { card.style.outline = 'none'; }, 3000);
      }
    }, 150);
  }
};
