"""
KAVACH360 AI - Backend Configuration
Configuration parameters for FastAPI server, Ollama Gemma 4 model, OpenCV, and SQLite.
"""

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "KAVACH360 AI Safety Engine"
    API_V1_PREFIX: str = "/api"
    
    # Host & Port
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # Ollama AI Configuration
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "gemma4:latest")
    
    # Storage & DB
    SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", "./kavach360.db")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./storage/uploads")
    FRAMES_DIR: str = os.getenv("FRAMES_DIR", "./storage/frames")
    
    # Video Processing
    FRAME_SAMPLE_INTERVAL_SECONDS: float = 1.5
    MAX_UPLOAD_SIZE_MB: int = 500

    class Config:
        env_file = ".env"

settings = Settings()
