/**
 * KAVACH360 AI - Video Inspection Controller
 * Manages video file upload (MP4/MOV), sample video presets, preview scrubbing,
 * site and zone selection, and inspection initiation.
 */

window.InspectionModule = {
  currentFile: null,
  videoElement: null,

  init() {
    this.videoElement = document.getElementById('inspection-video-player');
    this.bindEvents();
    this.updateSiteAndZoneSelectors();
  },

  bindEvents() {
    const dropzone = document.getElementById('video-dropzone');
    const fileInput = document.getElementById('video-file-input');
    const startBtn = document.getElementById('btn-start-inspection');

    if (dropzone && fileInput) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFileSelected(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileSelected(e.target.files[0]);
        }
      });
    }

    // Sample video preset buttons
    document.querySelectorAll('[data-sample-video]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sampleType = e.currentTarget.getAttribute('data-sample-video');
        this.loadSampleVideo(sampleType);
      });
    });

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.startInspection();
      });
    }

    // Site change listener
    const siteSelect = document.getElementById('inspection-site-select');
    if (siteSelect) {
      siteSelect.addEventListener('change', () => {
        this.updateZoneDropdown(siteSelect.value);
      });
    }
  },

  async updateSiteAndZoneSelectors() {
    const siteSelect = document.getElementById('inspection-site-select');
    if (!siteSelect) return;

    const sites = await window.apiService.getSites();
    siteSelect.innerHTML = sites.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

    if (sites.length > 0) {
      this.updateZoneDropdown(sites[0].id);
    }
  },

  async updateZoneDropdown(siteId) {
    const zoneSelect = document.getElementById('inspection-zone-select');
    if (!zoneSelect) return;

    const sites = await window.apiService.getSites();
    const site = sites.find(s => s.id === siteId) || sites[0];

    if (site && site.zones) {
      zoneSelect.innerHTML = site.zones.map(z => `<option value="${z.id}">${z.name} (${z.cameras} Cameras)</option>`).join('');
    } else {
      zoneSelect.innerHTML = `<option value="zone-default">General Site Perimeter</option>`;
    }
  },

  handleFileSelected(file) {
    // Validate format
    const validExtensions = ['.mp4', '.mov'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext)) || file.type.includes('mp4') || file.type.includes('quicktime');

    if (!isValid) {
      if (window.AppRouter) window.AppRouter.showToast('Please upload an MP4 or MOV construction CCTV video file.', 'danger');
      return;
    }

    this.currentFile = file;

    // Display file info
    const infoBox = document.getElementById('file-info-box');
    const nameEl = document.getElementById('file-info-name');
    const sizeEl = document.getElementById('file-info-size');
    const typeEl = document.getElementById('file-info-type');

    if (infoBox) infoBox.style.display = 'block';
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    if (typeEl) typeEl.textContent = file.type || 'video/mp4';

    // Play video preview
    const videoUrl = URL.createObjectURL(file);
    if (this.videoElement) {
      this.videoElement.src = videoUrl;
      this.videoElement.style.display = 'block';
      const placeholder = document.getElementById('video-placeholder');
      if (placeholder) placeholder.style.display = 'none';
    }

    const startBtn = document.getElementById('btn-start-inspection');
    if (startBtn) startBtn.disabled = false;

    if (window.AppRouter) window.AppRouter.showToast(`Loaded ${file.name} successfully. Ready for AI inspection.`, 'success');
  },

  loadSampleVideo(type) {
    let sampleMeta = {
      name: 'cctv_zone_b_tower_scaffold_morning.mp4',
      size: '18.4 MB',
      type: 'video/mp4',
      duration: '03:42',
      hazardHint: 'PPE Helmet & Fall Protection Violation'
    };

    if (type === 'electrical') {
      sampleMeta = {
        name: 'substation_pump_feeder_cam02.mp4',
        size: '12.8 MB',
        type: 'video/mp4',
        duration: '02:15',
        hazardHint: 'Trailing High-Voltage Cable in Water'
      };
    } else if (type === 'egress') {
      sampleMeta = {
        name: 'south_exit_corridor_rebar_staging.mp4',
        size: '22.1 MB',
        type: 'video/mp4',
        duration: '04:10',
        hazardHint: 'Blocked Emergency Exit Route'
      };
    }

    this.currentFile = {
      name: sampleMeta.name,
      size: 18400000,
      type: 'video/mp4',
      isSample: true,
      sampleType: type
    };

    const infoBox = document.getElementById('file-info-box');
    const nameEl = document.getElementById('file-info-name');
    const sizeEl = document.getElementById('file-info-size');
    const typeEl = document.getElementById('file-info-type');

    if (infoBox) infoBox.style.display = 'block';
    if (nameEl) nameEl.textContent = sampleMeta.name;
    if (sizeEl) sizeEl.textContent = sampleMeta.size;
    if (typeEl) typeEl.textContent = sampleMeta.type + ` (${sampleMeta.hazardHint})`;

    const startBtn = document.getElementById('btn-start-inspection');
    if (startBtn) startBtn.disabled = false;

    // Show simulated canvas preview in video player
    const placeholder = document.getElementById('video-placeholder');
    if (placeholder) {
      placeholder.innerHTML = `
        <i class="fas fa-play-circle" style="font-size: 48px; color: var(--primary);"></i>
        <div style="font-weight: 700; color: white;">${sampleMeta.name}</div>
        <div style="font-size: 12px; color: #94a3b8;">Preset Loaded: ${sampleMeta.hazardHint}</div>
      `;
    }

    if (window.AppRouter) window.AppRouter.showToast(`Sample preset "${sampleMeta.name}" loaded!`, 'info');
  },

  startInspection() {
    if (!this.currentFile) {
      if (window.AppRouter) window.AppRouter.showToast('Please select or upload a construction video first.', 'warning');
      return;
    }

    const siteId = document.getElementById('inspection-site-select').value;
    const zoneId = document.getElementById('inspection-zone-select').value;
    const shift = document.getElementById('inspection-shift-select').value;

    // Navigate to AI Analysis Page and start pipeline
    if (window.AppRouter) {
      window.AppRouter.navigate('analysis');
      if (window.AnalysisModule) {
        window.AnalysisModule.runPipeline({
          file: this.currentFile,
          siteId,
          zoneId,
          shift
        });
      }
    }
  }
};
