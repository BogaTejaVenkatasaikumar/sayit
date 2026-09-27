import os
import re
from app.core.exceptions import InvalidInputError


def sanitize_filename(filename: str) -> str:
    """Sanitizes filename to prevent directory traversal attacks."""
    basename = os.path.basename(filename)
    if not re.match(r"^[a-zA-Z0-9_\-]+\.mp3$", basename):
        raise InvalidInputError("Invalid audio filename requested.")
    return basename


def validate_text_input(text: str, max_length: int = 500) -> str:
    """Validates user text input."""
    clean = text.strip()
    if not clean:
        raise InvalidInputError("Text input cannot be empty.")
    if len(clean) > max_length:
        raise InvalidInputError(f"Text exceeds maximum allowed length of {max_length} characters.")
    return clean
