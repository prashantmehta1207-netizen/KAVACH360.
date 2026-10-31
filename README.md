# KAVACH360 AI
## Multimodal AI-Powered Construction Safety Intelligence Platform

> **Tagline**: *See the Risk. Understand the Danger. Prevent the Incident.*

KAVACH360 AI is an enterprise industrial safety intelligence system built to analyze construction CCTV videos, identify potential safety hazards, provide visual evidence, cross-reference observations against safety SOPs (OSHA 1926 & IS 3786), and assist site supervisors in managing corrective actions.

The primary AI reasoning engine utilizes **Gemma 4** through **Ollama**.

---

## Key Features

1. **Executive Safety Dashboard**:
   - High-level KPIs: Sites, Videos Analyzed, Potential Hazards, Pending Reviews, Verified Incidents, Resolved Actions.
   - Interactive Chart.js analytics: Safety Trends (Velocity) & Hazard Category Distribution (Doughnut).
   - Recent CCTV Inspection Runs table and real-time safety alerts feed.

2. **Video Inspection**:
   - Drag-and-drop video upload for `.mp4` and `.mov` container formats.
   - Built-in one-click demo presets (Scaffold PPE breach, Submerged cable, Blocked egress).
   - Video player with frame scrubber, metadata inspection, and zone assignment.

3. **6-Stage AI Vision Pipeline**:
   - Stage 1: Video Ingest & Container Validation
   - Stage 2: OpenCV Keyframe Extraction (1.5s delta)
   - Stage 3: Frame Dispatch to Gemma 4 via Ollama
   - Stage 4: Visual Observation Analysis & Danger Reasoning
   - Stage 5: Safety Rule & OSHA SOP Vector Cross-Referencing
   - Stage 6: Structured Inspection Results Generation
   - Live terminal log console & extracted frame carousel.

4. **Hazard Detection & Verification**:
   - Observation cards with visual evidence, simulated AI bounding boxes, and timestamp readouts.
   - Uncertainty tags: "Potential Issue" and "Needs Human Review" (ensures no AI hallucination is treated as fact without human signoff).
   - Multi-criteria filtering by category, priority, status, and search terms.
   - Human verification modal to verify, dismiss, or request additional video evidence.

5. **Smart Construction Site Map (2D Blueprint)**:
   - High-fidelity interactive 2D SVG construction blueprint.
   - Includes Building Zone (Tower Core), Electrical Substation Zone, Material Staging Yard, and Heavy Machinery Excavation.
   - Detailed safety infrastructure: Main Gate, Emergency Exits, First Aid Station, and Fire Extinguishers.
   - CCTV Camera locations with animated field-of-view (FoV) cones.
   - Interactive Hazard Pins with color coding:
     - 🔴 Red: High-Priority Verified Hazard
     - 🟠 Orange: Needs Human Review
     - 🟢 Green: Resolved
     - ⚪ Grey: Compliant Zone
   - Interactive flyout drawer displaying evidence, category, zone, and 1-click remediation.
   - GIS Satellite Map mode powered by Leaflet.js.

6. **Safety SOP Intelligence**:
   - OSHA 1926 and IS 3786 safety regulations catalog.
   - Extracted rules with page number citations and prescribed corrective actions.
   - PDF upload dropzone for custom company safety manuals.

7. **Action Center (Kanban Workflow)**:
   - 5-column board: *Pending Review &rarr; Confirmed &rarr; Assigned &rarr; In Progress &rarr; Resolved*.
   - Supervisor assignment modal with due date picker and instructions.

8. **Compliance Audit Reports**:
   - Official industrial safety inspection record with site compliance score and letter grade.
   - Complete table of observations, timestamps, and OSHA SOP references.
   - Download / Print PDF report with dedicated clean print styling.
   - Export CSV capability.

9. **Site Management**:
   - Multi-site registry with active hazard tallies and CCTV camera counts.
   - Modal to add new construction projects and assign safety leads.

---

## Technology Stack

- **Frontend**: Pure HTML5, Modern CSS3, Vanilla JavaScript (ES2022). Zero frontend frameworks (No React, Vue, Angular, or Tailwind CSS).
- **Libraries via CDN**: Font Awesome 6.5.2 (Icons), Chart.js 4.4.1 (Analytics), Leaflet 1.9.4 (Maps).
- **Backend**: Python, FastAPI, SQLite, OpenCV, PyMuPDF, Ollama (Gemma 4).

---

## How to Run Locally

### Frontend:
Run the development server using Vite or any static HTTP server (e.g. `npx serve` or Python `http.server`):
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Backend (Optional for live Ollama inference):
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

*Note: KAVACH360 AI includes an automatic offline **DEMO MODE** simulator with realistic data, so the entire application runs smoothly out-of-the-box even without a live Ollama or Python server.*

---

## License
Apache-2.0 License.
