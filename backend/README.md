# KAVACH360 AI - Backend Service

This backend powers the KAVACH360 AI Multimodal Safety Intelligence platform.

## Architecture

- **Framework**: FastAPI (Python 3.10+)
- **Video Ingestion & Frame Extraction**: OpenCV (`cv2.VideoCapture` with structural difference sampling)
- **Local Vision Model**: Gemma 4 served locally via Ollama (`http://localhost:11434`)
- **Safety Standard Extraction**: PyMuPDF (`fitz`) for PDF SOP indexing and vector matching
- **Database**: SQLite with indexed spatial coordinates

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the local Ollama instance with Gemma 4:
```bash
ollama run gemma4:latest
```

3. Launch the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

4. Verify health status:
```bash
curl http://localhost:8000/api/health
```
