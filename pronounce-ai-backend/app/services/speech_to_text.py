from typing import Dict, Any, Optional
from app.providers.whisper.faster_whisper import faster_whisper_provider, FasterWhisperProvider
from app.core.logging import logger


class SpeechToTextService:
    """Service layer for Speech-To-Text audio transcription."""

    def __init__(self, provider: Optional[FasterWhisperProvider] = None):
        self.provider = provider or faster_whisper_provider

    async def transcribe(self, audio_path: str, language: str = "auto") -> Dict[str, Any]:
        logger.info(f"Transcribing audio file '{audio_path}', language='{language}'")
        res = await self.provider.transcribe(audio_path, language)
        return res


speech_to_text_service = SpeechToTextService()
