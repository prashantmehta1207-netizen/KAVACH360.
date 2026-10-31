/**
 * KAVACH360 AI - API Integration Service
 * Configurable API Client with FastAPI Backend Support & Realistic Offline DEMO MODE Simulator.
 * Tagline: See the Risk. Understand the Danger. Prevent the Incident.
 */

// Global configuration
window.KAVACH_CONFIG = {
  API_BASE_URL: localStorage.getItem('kavach_api_url') || 'http://localhost:8000',
  OLLAMA_MODEL: localStorage.getItem('kavach_model') || 'gemma4:latest',
  DEMO_MODE: localStorage.getItem('kavach_demo_mode') !== 'false' // default true for instant hackathon showcase
};

/**
 * Built-in Sample Evidence Images (Generated inline SVG data URIs for crisp, reliable rendering)
 */
function createEvidenceSVG(hazardType, detailText, boundingBox = { x: 90, y: 35, w: 90, h: 100, label: 'MISSING PPE' }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="0.6"/>
      </pattern>
    </defs>
    <!-- Background Construction Site Simulation -->
    <rect width="640" height="360" fill="url(#bg)"/>
    <rect width="640" height="360" fill="url(#grid)"/>

    <!-- Structural Beams & Scaffold -->
    <line x1="40" y1="320" x2="600" y2="320" stroke="#475569" stroke-width="6"/>
    <line x1="80" y1="40" x2="80" y2="320" stroke="#64748b" stroke-width="4"/>
    <line x1="280" y1="40" x2="280" y2="320" stroke="#64748b" stroke-width="4"/>
    <line x1="480" y1="40" x2="480" y2="320" stroke="#64748b" stroke-width="4"/>
    <line x1="80" y1="140" x2="280" y2="140" stroke="#94a3b8" stroke-width="3"/>
    <line x1="80" y1="230" x2="280" y2="230" stroke="#94a3b8" stroke-width="3"/>

    <!-- Worker Silhouette / Hazard Object -->
    <circle cx="135" cy="70" r="16" fill="#f59e0b" opacity="0.9"/>
    <rect x="122" y="88" width="26" height="50" rx="4" fill="#3b82f6" opacity="0.9"/>
    <line x1="122" y1="100" x2="106" y2="125" stroke="#3b82f6" stroke-width="6" stroke-linecap="round"/>
    <line x1="148" y1="100" x2="164" y2="125" stroke="#3b82f6" stroke-width="6" stroke-linecap="round"/>

    <!-- Target AI Bounding Box -->
    <rect x="${boundingBox.x}" y="${boundingBox.y}" width="${boundingBox.w}" height="${boundingBox.h}" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="5 3"/>
    <rect x="${boundingBox.x}" y="${Math.max(10, boundingBox.y - 20)}" width="${Math.max(100, boundingBox.label.length * 8)}" height="18" fill="#ef4444" rx="2"/>
    <text x="${boundingBox.x + 6}" y="${Math.max(10, boundingBox.y - 20) + 13}" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff">${boundingBox.label}</text>

    <!-- Camera HUD Overlay -->
    <rect x="12" y="12" width="240" height="26" rx="4" fill="rgba(0,0,0,0.6)"/>
    <text x="22" y="29" font-family="monospace" font-size="11" fill="#38bdf8">CAM-04 | 1080P | 30FPS | ${hazardType}</text>
    <rect x="520" y="12" width="108" height="26" rx="4" fill="rgba(0,0,0,0.6)"/>
    <text x="532" y="29" font-family="monospace" font-size="11" fill="#ef4444">● REC 00:03:42</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Initial Mock Seed Data
const DEFAULT_SITES = [
  {
    id: 'site-skyline-b',
    name: 'Skyline Tower B - Metro Phase 3',
    location: 'Plot 41-B, North Avenue Tech Park',
    manager: 'Rajesh Kumar (Lead HSE)',
    totalInspections: 18,
    activeHazards: 4,
    cameraCount: 8,
    safetyScore: 84,
    zones: [
      { id: 'zone-building', name: 'Tower B Core & High-Rise Floors', risk: 'High', cameras: 4 },
      { id: 'zone-electrical', name: 'Substation & Main Distribution Unit', risk: 'Medium', cameras: 2 },
      { id: 'zone-storage', name: 'Material Staging & Heavy Rebar Yard', risk: 'Low', cameras: 2 }
    ]
  },
  {
    id: 'site-harbor-a',
    name: 'Harbor View Commercial Complex',
    location: 'Pier 9 Maritime District',
    manager: 'Marcus Vance (Civil Lead)',
    totalInspections: 12,
    activeHazards: 2,
    cameraCount: 6,
    safetyScore: 92,
    zones: [
      { id: 'zone-marine', name: 'Waterfront Piling Basin', risk: 'Medium', cameras: 3 },
      { id: 'zone-loading', name: 'Heavy Transit Loading Bay', risk: 'Low', cameras: 3 }
    ]
  },
  {
    id: 'site-apex-logistics',
    name: 'Apex Automated Logistics Hub',
    location: 'Gateway Industrial Corridor',
    manager: 'Elena Rostova (OSHA Auditor)',
    totalInspections: 14,
    activeHazards: 1,
    cameraCount: 10,
    safetyScore: 96,
    zones: [
      { id: 'zone-gantry', name: 'Automated Gantry Crane Bay', risk: 'Low', cameras: 5 },
      { id: 'zone-forklift', name: 'Material Sorting Ramp', risk: 'Low', cameras: 5 }
    ]
  }
];

const DEFAULT_OBSERVATIONS = [
  {
    id: 'OBS-1042',
    inspectionId: 'INSP-2026-08',
    siteId: 'site-skyline-b',
    zoneId: 'zone-building',
    category: 'PPE Compliance',
    title: 'Worker Operating at Height Without Safety Helmet',
    timestamp: '00:03:42',
    evidenceImage: createEvidenceSVG('PPE Violation', 'Missing Hardhat at 4th floor scaffold', { x: 105, y: 50, w: 80, h: 95, label: 'NO HELMET (CONF: 94%)' }),
    aiObservation: 'Detected person on scaffolding level 4 without hardhat or chin strap in an active overhead lift radius.',
    explanation: 'Overhead crane operations present direct risk of falling debris or tools. Failure to wear Class E/G industrial helmets violates mandatory high-rise PPE protocols.',
    uncertaintyStatus: 'Needs Human Review',
    verificationStatus: 'pending',
    suggestedPriority: 'Critical',
    sopCitation: 'OSHA 1926.100(a) Head Protection & IS 2925',
    recommendedAction: 'Issue immediate stop-work notice for Scaffold Bay 4; mandate helmet donning before re-entry.',
    actionStatus: 'pending_review',
    assignedTo: 'Rajesh Kumar',
    dueDate: '2026-11-02',
    dateCreated: '2026-10-30 14:15',
    mapCoords: { x: 260, y: 160 }
  },
  {
    id: 'OBS-1043',
    inspectionId: 'INSP-2026-08',
    siteId: 'site-skyline-b',
    zoneId: 'zone-building',
    category: 'Fall Protection',
    title: 'Missing Mid-Rail Guardrail on Scaffold Perimeter',
    timestamp: '00:05:18',
    evidenceImage: createEvidenceSVG('Fall Hazard', 'Missing guardrail section', { x: 270, y: 130, w: 120, h: 70, label: 'MISSING RAIL (CONF: 89%)' }),
    aiObservation: 'Scaffolding walkway lacks mid-rail barrier along east exterior facade at 12m height.',
    explanation: 'Workers transporting concrete forms face catastrophic fall risk through unguarded opening. Platform height exceeds the 1.8m trigger threshold.',
    uncertaintyStatus: 'Needs Human Review',
    verificationStatus: 'pending',
    suggestedPriority: 'High',
    sopCitation: 'OSHA 1926.451(g)(1) Guardrail Systems & Fall Arrest',
    recommendedAction: 'Install 42-inch top rail and 21-inch mid-rail with toe-boards before further masonry work.',
    actionStatus: 'confirmed',
    assignedTo: 'Vikas Patil (Scaffold Supv)',
    dueDate: '2026-11-01',
    dateCreated: '2026-10-30 14:18',
    mapCoords: { x: 380, y: 220 }
  },
  {
    id: 'OBS-1044',
    inspectionId: 'INSP-2026-07',
    siteId: 'site-skyline-b',
    zoneId: 'zone-electrical',
    category: 'Electrical Safety',
    title: 'Exposed Temporary 415V Power Cable Trailing Water Puddle',
    timestamp: '00:01:25',
    evidenceImage: createEvidenceSVG('Electrical Hazard', 'Cable across water pool', { x: 210, y: 220, w: 140, h: 60, label: 'SUBMERGED CABLE (CONF: 92%)' }),
    aiObservation: 'Three-phase electrical feeder line runs through standing water near concrete pump wash station.',
    explanation: 'Damaged sheath insulation in wet conductive environment creates severe electrocution and ground-fault arc risk for nearby personnel.',
    uncertaintyStatus: 'Needs Human Review',
    verificationStatus: 'pending',
    suggestedPriority: 'Critical',
    sopCitation: 'OSHA 1926.405(a)(2)(ii) Wiring Design & Protection',
    recommendedAction: 'De-energize main breaker, elevate feeder on insulated cable stands at least 2.4m off ground.',
    actionStatus: 'assigned',
    assignedTo: 'D. Subramaniam (Chief Electrician)',
    dueDate: '2026-10-31',
    dateCreated: '2026-10-29 09:40',
    mapCoords: { x: 580, y: 310 }
  },
  {
    id: 'OBS-1045',
    inspectionId: 'INSP-2026-06',
    siteId: 'site-skyline-b',
    zoneId: 'zone-storage',
    category: 'Blocked Emergency Exits',
    title: 'Stacked Timber Pallets Blocking South Fire Evacuation Route',
    timestamp: '00:08:44',
    evidenceImage: createEvidenceSVG('Exit Egress Blocked', 'Storage blocking door', { x: 420, y: 90, w: 110, h: 130, label: 'BLOCKED EXIT (CONF: 96%)' }),
    aiObservation: 'Emergency egress corridor constricted below 28 inches minimum clear width by scaffolding boards and pallets.',
    explanation: 'Obstruction impairs rapid evacuation in the event of fire, structural collapse, or gas leak.',
    uncertaintyStatus: 'Potential Issue',
    verificationStatus: 'verified',
    suggestedPriority: 'Medium',
    sopCitation: 'OSHA 1910.36 Design & Maintenance of Exit Routes',
    recommendedAction: 'Clear corridor immediately to standard 44-inch egress clearance; re-post evacuation signage.',
    actionStatus: 'in_progress',
    assignedTo: 'Anand Shinde (Logistics Lead)',
    dueDate: '2026-10-31',
    dateCreated: '2026-10-28 16:30',
    mapCoords: { x: 740, y: 120 }
  },
  {
    id: 'OBS-1046',
    inspectionId: 'INSP-2026-05',
    siteId: 'site-skyline-b',
    zoneId: 'zone-building',
    category: 'Heavy Machinery',
    title: 'Pedestrian Worker Inside 360-Degree Excavator Swing Radius',
    timestamp: '00:02:11',
    evidenceImage: createEvidenceSVG('Machinery Exclusion', 'Worker near tail swing', { x: 190, y: 180, w: 130, h: 90, label: 'SWING ZONE (CONF: 88%)' }),
    aiObservation: 'Unflagged laborer detected within 2.5 meters of operating 20-ton hydraulic excavator without spotter.',
    explanation: 'Operator blind spot during rotational swing creates severe crush and strike hazard.',
    uncertaintyStatus: 'Potential Issue',
    verificationStatus: 'verified',
    suggestedPriority: 'High',
    sopCitation: 'OSHA 1926.600 Motor Vehicles & Mechanized Equipment',
    recommendedAction: 'Erect barricade tape around rear swing radius and assign dedicated banksman/spotter.',
    actionStatus: 'resolved',
    assignedTo: 'Marcus Vance',
    dueDate: '2026-10-28',
    dateCreated: '2026-10-27 11:20',
    mapCoords: { x: 180, y: 380 }
  }
];

const DEFAULT_SOPS = [
  {
    id: 'SOP-OSHA-1926-100',
    standard: 'OSHA 1926.100',
    category: 'PPE Compliance',
    ruleTitle: 'Head Protection Against Impact & Penetration',
    pageRef: 14,
    mandatoryRequirement: 'Employees working in areas where there is a possible danger of head injury from impact, falling or flying objects, or electrical shock and burns shall be protected by protective helmets.',
    prescribedCorrectiveAction: 'Immediate issuance of ANSI Type I/II helmets; halt overhead lifting until ground buffer is cleared.'
  },
  {
    id: 'SOP-OSHA-1926-501',
    standard: 'OSHA 1926.501',
    category: 'Fall Protection',
    ruleTitle: 'Duty to Have Fall Protection on Walking/Working Surfaces',
    pageRef: 32,
    mandatoryRequirement: 'Each employee on a walking/working surface with an unprotected side or edge which is 6 feet (1.8 m) or more above a lower level shall be protected from falling by guardrail systems, safety net systems, or personal fall arrest systems.',
    prescribedCorrectiveAction: 'Install standard guardrail with top rail at 42 inches ± 3 inches and mid-rail halfway; tie-off required if guardrail absent.'
  },
  {
    id: 'SOP-OSHA-1926-405',
    standard: 'OSHA 1926.405',
    category: 'Electrical Safety',
    ruleTitle: 'Wiring Methods, Components, and Equipment for General Use',
    pageRef: 58,
    mandatoryRequirement: 'Flexible cords and cables shall be protected from damage. Unless suitable for location, cords shall not be immersed in standing water or run across pedestrian walkways without protective ramps.',
    prescribedCorrectiveAction: 'Elevate power lines with non-conductive hooks; enforce Class A GFCI circuit interrupters on all temporary power outlets.'
  },
  {
    id: 'SOP-OSHA-1910-36',
    standard: 'OSHA 1910.36',
    category: 'Blocked Emergency Exits',
    ruleTitle: 'Design and Maintenance of Emergency Exit Routes',
    pageRef: 74,
    mandatoryRequirement: 'Exit routes must be free and unobstructed. No materials or equipment may be placed, even temporarily, within the exit route. Minimum width of exit route must be at least 28 inches wide at all points.',
    prescribedCorrectiveAction: 'Immediate removal of storage materials; install photoluminescent exit signage and panic hardware.'
  },
  {
    id: 'SOP-OSHA-1926-600',
    standard: 'OSHA 1926.600',
    category: 'Heavy Machinery',
    ruleTitle: 'Heavy Machinery Swing Radius & Proximity Safeguards',
    pageRef: 91,
    mandatoryRequirement: 'The rotating superstructure of machinery capable of rotating shall have the area barricaded or otherwise guarded to prevent employees from being struck or crushed by the counterweight.',
    prescribedCorrectiveAction: 'Physical demarcations with warning cones/tape at 3-meter radius; mandatory two-way radio link between operator and spotter.'
  }
];

class KavachAPI {
  constructor() {
    this.sites = JSON.parse(localStorage.getItem('kavach_sites')) || DEFAULT_SITES;
    this.observations = JSON.parse(localStorage.getItem('kavach_observations')) || DEFAULT_OBSERVATIONS;
    this.sops = JSON.parse(localStorage.getItem('kavach_sops')) || DEFAULT_SOPS;
  }

  save() {
    localStorage.setItem('kavach_sites', JSON.stringify(this.sites));
    localStorage.setItem('kavach_observations', JSON.stringify(this.observations));
    localStorage.setItem('kavach_sops', JSON.stringify(this.sops));
  }

  // --- Sites API ---
  async getSites() {
    if (!window.KAVACH_CONFIG.DEMO_MODE) {
      try {
        const res = await fetch(`${window.KAVACH_CONFIG.API_BASE_URL}/api/sites`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, falling back to cached demo store');
      }
    }
    return this.sites;
  }

  async createSite(siteData) {
    const newSite = {
      id: 'site-' + Date.now(),
      name: siteData.name,
      location: siteData.location,
      manager: siteData.manager,
      totalInspections: 0,
      activeHazards: 0,
      cameraCount: siteData.cameraCount || 4,
      safetyScore: 100,
      zones: [
        { id: 'zone-main-' + Date.now(), name: 'Main Construction Deck', risk: 'Low', cameras: 2 }
      ]
    };

    if (!window.KAVACH_CONFIG.DEMO_MODE) {
      try {
        const res = await fetch(`${window.KAVACH_CONFIG.API_BASE_URL}/api/sites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteData)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, creating in local store');
      }
    }

    this.sites.unshift(newSite);
    this.save();
    return newSite;
  }

  // --- Observations API ---
  async getObservations(filterSiteId = null) {
    if (!window.KAVACH_CONFIG.DEMO_MODE) {
      try {
        const url = filterSiteId
          ? `${window.KAVACH_CONFIG.API_BASE_URL}/api/observations?site_id=${filterSiteId}`
          : `${window.KAVACH_CONFIG.API_BASE_URL}/api/observations`;
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using demo store');
      }
    }

    if (filterSiteId && filterSiteId !== 'all') {
      return this.observations.filter(o => o.siteId === filterSiteId);
    }
    return this.observations;
  }

  async updateObservationReview(id, status, notes = '') {
    const obs = this.observations.find(o => o.id === id);
    if (!obs) throw new Error('Observation not found');

    obs.verificationStatus = status;
    if (status === 'verified') {
      obs.actionStatus = 'confirmed';
      obs.uncertaintyStatus = 'Verified Incident';
    } else if (status === 'dismissed') {
      obs.actionStatus = 'resolved';
    }

    if (notes) obs.supervisorNotes = notes;

    this.save();
    return obs;
  }

  async updateActionStatus(id, newStatus, extra = {}) {
    const obs = this.observations.find(o => o.id === id);
    if (!obs) throw new Error('Action item not found');

    obs.actionStatus = newStatus;
    if (extra.assignedTo) obs.assignedTo = extra.assignedTo;
    if (extra.dueDate) obs.dueDate = extra.dueDate;
    if (extra.resolutionProof) obs.resolutionProof = extra.resolutionProof;

    this.save();
    return obs;
  }

  // --- SOPs API ---
  async getSOPs() {
    return this.sops;
  }

  async addSOP(sopData) {
    const newSop = {
      id: 'SOP-' + Date.now(),
      standard: sopData.standard || 'Site Custom Rule',
      category: sopData.category || 'General Safety',
      ruleTitle: sopData.ruleTitle,
      pageRef: sopData.pageRef || 1,
      mandatoryRequirement: sopData.mandatoryRequirement,
      prescribedCorrectiveAction: sopData.prescribedCorrectiveAction
    };
    this.sops.push(newSop);
    this.save();
    return newSop;
  }

  // Helper to add generated observation after simulated or live analysis
  addAnalyzedObservation(obs) {
    this.observations.unshift(obs);
    this.save();
  }
}

window.apiService = new KavachAPI();
