import os
import tempfile
import uuid
from typing import Generator
from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import InvalidInputError
from app.core.logging import logger

ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".ogg", ".webm", ".flac"}
ALLOWED_MIME_TYPES = {
    "audio/wav", "audio/x-wav", "audio/wave",
    "audio/mpeg", "audio/mp3",
    "audio/m4a", "audio/x-m4a", "audio/mp4",
    "audio/ogg", "application/ogg",
    "audio/webm", "video/webm",
    "audio/flac", "audio/x-flac",
    "application/octet-stream",
}


class AudioProcessor:
    """Handles audio upload validation, MIME checking, and temporary file management."""

    def validate_audio_file(self, file: UploadFile) -> str:
        filename = file.filename or "recording.wav"
        ext = os.path.splitext(filename)[1].lower()
        if not ext or ext not in ALLOWED_EXTENSIONS:
            raise InvalidInputError(
                f"Unsupported audio extension '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            )

        content_type = (file.content_type or "").lower()
        if content_type and content_type not in ALLOWED_MIME_TYPES:
            logger.warning(f"Audio content-type '{content_type}' for '{filename}' is unconventional but proceeding.")
        return ext


    async def save_temp_audio(self, file: UploadFile) -> str:
        ext = self.validate_audio_file(file)

        # Read content and check size limit (10MB)
        content = await file.read()
        max_bytes = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise InvalidInputError(
                f"Audio file size ({len(content) / (1024*1024):.1f}MB) exceeds maximum limit of {settings.MAX_AUDIO_SIZE_MB}MB."
            )

        if len(content) == 0:
            raise InvalidInputError("Uploaded audio file is empty.")

        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"practice_{uuid.uuid4().hex}{ext}")
        with open(temp_path, "wb") as f:
            f.write(content)

        logger.info(f"Saved temp audio file ({len(content)} bytes) -> {temp_path}")
        return temp_path

    def cleanup_temp_audio(self, temp_path: str):
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
                logger.info(f"Cleaned up temp audio -> {temp_path}")
            except Exception as e:
                logger.warning(f"Failed to remove temp audio '{temp_path}': {str(e)}")


audio_processor = AudioProcessor()
