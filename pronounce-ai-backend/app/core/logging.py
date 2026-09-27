import logging
import sys
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """Configures structured logging for the application."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Avoid adding handlers repeatedly
    if not root_logger.handlers:
        root_logger.addHandler(handler)

    logger = logging.getLogger("pronounce_ai")
    logger.info(f"Logging initialized with level: {settings.LOG_LEVEL}")
    return logger


logger = setup_logging()
