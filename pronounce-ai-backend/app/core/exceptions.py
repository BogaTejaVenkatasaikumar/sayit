from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.logging import logger


class PronounceAIException(Exception):
    """Base exception for PronounceAI backend."""
    def __init__(self, message: str, code: str = "INTERNAL_SERVER_ERROR", status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code


class InvalidInputError(PronounceAIException):
    def __init__(self, message: str):
        super().__init__(message=message, code="INVALID_INPUT", status_code=status.HTTP_400_BAD_REQUEST)


class UnsupportedLanguageError(PronounceAIException):
    def __init__(self, message: str):
        super().__init__(message=message, code="UNSUPPORTED_LANGUAGE", status_code=status.HTTP_400_BAD_REQUEST)


class LanguageDetectionError(PronounceAIException):
    def __init__(self, message: str):
        super().__init__(message=message, code="LANGUAGE_DETECTION_ERROR", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


class AIProviderError(PronounceAIException):
    def __init__(self, message: str):
        super().__init__(message=message, code="AI_PROVIDER_ERROR", status_code=status.HTTP_502_BAD_GATEWAY)


class TTSError(PronounceAIException):
    def __init__(self, message: str):
        super().__init__(message=message, code="TTS_ERROR", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NotImplementedFeatureError(PronounceAIException):
    def __init__(self, message: str):
        super().__init__(message=message, code="NOT_IMPLEMENTED", status_code=status.HTTP_501_NOT_IMPLEMENTED)


async def pronounce_ai_exception_handler(request: Request, exc: PronounceAIException) -> JSONResponse:
    """Handles custom domain exceptions."""
    logger.error(f"Domain Exception [{exc.code}]: {exc.message} (Path: {request.url.path})")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
            }
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handles Pydantic validation errors."""
    error_msg = exc.errors()[0].get("msg", "Invalid request input") if exc.errors() else "Validation error"
    logger.warning(f"Validation Error: {error_msg} (Path: {request.url.path})")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "error": {
                "code": "INVALID_INPUT",
                "message": error_msg,
            }
        }
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handles unexpected server errors without leaking internal stack traces."""
    logger.exception(f"Unhandled Exception on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
            }
        }
    )
