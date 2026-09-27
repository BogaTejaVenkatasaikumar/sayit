import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import (
    PronounceAIException,
    pronounce_ai_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
    InvalidInputError,
)
from app.db.database import init_db
from app.api import health, pronunciation, practice
from app.utils.validation import sanitize_filename


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}...")
    os.makedirs(settings.AUDIO_DIR, exist_ok=True)
    init_db()
    logger.info("Database initialized successfully.")
    yield
    # Shutdown
    logger.info(f"Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-quality AI-Powered Multilingual Pronunciation Backend",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(PronounceAIException, pronounce_ai_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include API Routers
app.include_router(health.router)
app.include_router(pronunciation.router)
app.include_router(practice.router)


# Safe static audio serving route with path traversal protection
@app.get("/audio/{filename}", tags=["Audio"])
async def serve_audio(filename: str):
    safe_name = sanitize_filename(filename)
    file_path = os.path.abspath(os.path.join(settings.AUDIO_DIR, safe_name))
    audio_dir_abs = os.path.abspath(settings.AUDIO_DIR)

    if not file_path.startswith(audio_dir_abs) or not os.path.exists(file_path):
        return JSONResponse(
            status_code=404,
            content={"success": False, "error": {"code": "FILE_NOT_FOUND", "message": "Requested audio file was not found."}},
        )
    return FileResponse(file_path, media_type="audio/mpeg")
