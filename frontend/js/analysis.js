/**
 * KAVACH360 AI - AI Processing Pipeline Controller
 * Demonstrates the 6-stage multimodal vision inspection workflow:
 * 1. Video uploaded
 * 2. Extracting frames
 * 3. Sending selected frames to Gemma 4
 * 4. Analyzing visual observations
 * 5. Matching relevant safety rules
 * 6. Generating inspection results
 */

window.AnalysisModule = {
  isRunning: false,
  progress: 0,
  currentStage: 1,
  logInterval: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const rerunBtn = document.getElementById('btn-rerun-analysis');
    if (rerunBtn) {
      rerunBtn.addEventListener('click', () => {
        this.runPipeline({
          file: { name: 'cctv_live_stream_recheck.mp4', sampleType: 'scaffold' },
          siteId: 'site-skyline-b',
          zoneId: 'zone-building'
        });
      });
    }

    const viewHazardsBtn = document.getElementById('btn-view-analysis-hazards');
    if (viewHazardsBtn) {
      viewHazardsBtn.addEventListener('click', () => {
        if (window.AppRouter) window.AppRouter.navigate('hazards');
      });
    }

    const viewMapBtn = document.getElementById('btn-view-analysis-map');
    if (viewMapBtn) {
      viewMapBtn.addEventListener('click', () => {
        if (window.AppRouter) window.AppRouter.navigate('site-map');
      });
    }
  },

  async runPipeline(inspectionContext) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.progress = 0;
    this.currentStage = 1;

    const progressBar = document.getElementById('pipeline-progress-bar');
    const progressText = document.getElementById('pipeline-progress-text');
    const logConsole = document.getElementById('pipeline-console');
    const framesContainer = document.getElementById('extracted-frames-carousel');
    const resultsCard = document.getElementById('analysis-results-summary');

    if (resultsCard) resultsCard.style.display = 'none';
    if (logConsole) logConsole.innerHTML = '';
    if (framesContainer) framesContainer.innerHTML = '';

    const updateStageUI = (stageNum) => {
      this.currentStage = stageNum;
      for (let i = 1; i <= 6; i++) {
        const stepEl = document.getElementById(`pipeline-step-${i}`);
        if (!stepEl) continue;
        stepEl.classList.remove('active', 'completed');
        if (i < stageNum) {
          stepEl.classList.add('completed');
          stepEl.querySelector('.step-card-status-dot').innerHTML = '<i class="fas fa-check"></i>';
        } else if (i === stageNum) {
          stepEl.classList.add('active');
          stepEl.querySelector('.step-card-status-dot').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
          stepEl.querySelector('.step-card-status-dot').innerHTML = i;
        }
      }
    };

    const addLog = (message, highlight = false) => {
      if (!logConsole) return;
      const time = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.innerHTML = `<span class="terminal-time">[${time}]</span> ${highlight ? '<strong style="color:#67e8f9;">' + message + '</strong>' : message}`;
      logConsole.appendChild(line);
      logConsole.scrollTop = logConsole.scrollHeight;
    };

    const setProgress = (val) => {
      this.progress = val;
      if (progressBar) progressBar.style.width = `${val}%`;
      if (progressText) progressText.textContent = `${val}% Completed`;
    };

    // Stage 1: Video Uploaded & Ingested
    updateStageUI(1);
    setProgress(10);
    addLog(`Ingesting video stream: ${inspectionContext.file ? inspectionContext.file.name : 'cctv_feed.mp4'}`);
    addLog(`Target Site: ${inspectionContext.siteId} | Zone: ${inspectionContext.zoneId}`);
    addLog(`Video container validated: Codec H.264 / AAC Audio, 1080p @ 30.0 fps.`);
    await this.sleep(1200);

    // Stage 2: Extracting Frames
    updateStageUI(2);
    setProgress(28);
    addLog(`Initializing OpenCV frame extractor with adaptive interval (1.5s delta)...`);
    addLog(`Keyframe extraction commenced: 148 candidate frames captured.`);

    // Populate frame previews
    const sampleThumbnails = [
      { time: '00:01.5', tag: 'Clear Zone', color: '#10b981', border: false },
      { time: '00:03.4', tag: 'PPE ANOMALY', color: '#ef4444', border: true },
      { time: '00:05.1', tag: 'EDGE HAZARD', color: '#f59e0b', border: true },
      { time: '00:06.8', tag: 'Normal Egress', color: '#10b981', border: false }
    ];

    if (framesContainer) {
      framesContainer.innerHTML = sampleThumbnails.map((th, idx) => `
        <div class="frame-card">
          <div class="frame-thumb-box">
            <i class="fas fa-video" style="color:#64748b; font-size:20px;"></i>
            ${th.border ? `<div class="frame-overlay-box" style="top:18px; left:25px; width:70px; height:50px; border-color:${th.color};">${th.tag}</div>` : ''}
          </div>
          <div class="frame-caption">
            <span>Frame #${idx * 45 + 10}</span>
            <span style="font-weight:700; color:${th.color};">${th.time}</span>
          </div>
        </div>
      `).join('');
    }
    await this.sleep(1400);

    // Stage 3: Sending to Gemma 4 via Ollama
    updateStageUI(3);
    setProgress(50);
    const modelName = window.KAVACH_CONFIG ? window.KAVACH_CONFIG.OLLAMA_MODEL : 'gemma4:latest';
    addLog(`Connecting to local inference engine via Ollama (${modelName})...`);
    addLog(`Batching 4 high-priority keyframes to Multimodal Vision Transformer...`);
    addLog(`Prompt: "Analyze construction site frame for PPE non-compliance, unprotected scaffolding edges, electrical exposure, and blocked egress corridors."`);
    await this.sleep(1600);

    // Stage 4: Analyzing Visual Observations
    updateStageUI(4);
    setProgress(72);
    addLog(`Gemma 4 Vision Output: Token throughput 48 tokens/sec.`);
    addLog(`Detection 1: Object class "person" at coordinates [x:105, y:50, w:80, h:95]. Confidence: 94.2%. Missing hardhat in designated hardhat zone.`, true);
    addLog(`Detection 2: Object class "scaffold_edge" at [x:270, y:130, w:120, h:70]. Confidence: 89.1%. Missing mid-rail guardrail.`, true);
    addLog(`Detection 3: Object class "power_feeder" at [x:210, y:220, w:140, h:60]. Water accumulation detected within 0.8m perimeter.`, true);
    await this.sleep(1500);

    // Stage 5: Matching Relevant Safety Rules (SOPs)
    updateStageUI(5);
    setProgress(88);
    addLog(`Vector similarity search against OSHA Safety Code Database & Site SOPs...`);
    addLog(`Match found: OSHA 1926.100(a) [Head Protection] -> Similarity score 0.96`);
    addLog(`Match found: OSHA 1926.451(g)(1) [Scaffold Guardrails] -> Similarity score 0.92`);
    addLog(`Match found: OSHA 1926.405(a)(2)(ii) [Temporary Electrical Feeder] -> Similarity score 0.94`);
    await this.sleep(1300);

    // Stage 6: Generating Inspection Results
    updateStageUI(6);
    setProgress(100);
    addLog(`Synthesizing structured inspection payload...`);
    addLog(`Hazard risk scoring complete. 3 Potential Issues flagged for human supervisor sign-off.`, true);
    addLog(`STATUS: INSPECTION COMPLETED SUCCESSFULLY.`);

    for (let i = 1; i <= 6; i++) {
      const stepEl = document.getElementById(`pipeline-step-${i}`);
      if (stepEl) {
        stepEl.classList.remove('active');
        stepEl.classList.add('completed');
        stepEl.querySelector('.step-card-status-dot').innerHTML = '<i class="fas fa-check"></i>';
      }
    }

    if (resultsCard) {
      resultsCard.style.display = 'block';
      resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    this.isRunning = false;
    if (window.AppRouter) {
      window.AppRouter.showToast('Gemma 4 inspection complete! 3 potential hazards identified.', 'success');
    }
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};
