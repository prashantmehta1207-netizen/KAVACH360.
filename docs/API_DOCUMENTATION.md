# KAVACH360 AI - API Documentation

## Base URL
Default: `http://localhost:8000/api` (Configurable in frontend Settings modal)

## Endpoints Summary

### Sites
- `GET /api/sites` — Returns list of registered construction sites and zones.
- `POST /api/sites` — Registers a new construction job site with safety supervisor credentials.
- `GET /api/sites/{id}/map` — Returns spatial metadata and 2D blueprint configuration for a site.

### Video Inspections & AI Pipeline
- `POST /api/inspections` — Initializes a new safety inspection run.
- `POST /api/inspections/{id}/video` — Multipart upload of CCTV footage (`.mp4` / `.mov`).
- `POST /api/inspections/{id}/analyze` — Triggers OpenCV frame extraction and dispatches keyframes to Gemma 4 via Ollama.
- `GET /api/inspections/{id}` — Returns status of the 6-stage AI inspection pipeline.
- `GET /api/inspections/{id}/observations` — Returns visual hazard detections with bounding boxes.

### Human Review & Corrective Actions
- `PATCH /api/observations/{id}/review` — Submits human safety supervisor verification (`verified`, `dismissed`, `pending`).
- `POST /api/observations/{id}/actions` — Creates corrective action item in Kanban board.
- `PATCH /api/actions/{id}` — Updates remediation lifecycle (`confirmed`, `assigned`, `in_progress`, `resolved`).

### Compliance Audit Reports
- `POST /api/inspections/{id}/report` — Compiles official compliance report against OSHA 1926 standards.
