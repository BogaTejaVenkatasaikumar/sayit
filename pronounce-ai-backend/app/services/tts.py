import os
import uuid
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.languages import get_voice_for_language
from app.core.logging import logger
from app.providers.tts.edge_tts import BaseTTSProvider, edge_tts_provider


class TTSService:
    """TTS Service manager."""

    def __init__(self, provider: Optional[BaseTTSProvider] = None):
        self.provider = provider or edge_tts_provider
        os.makedirs(settings.AUDIO_DIR, exist_ok=True)

    async def synthesize(
        self,
        text: str,
        language_code: str,
        accent: str = "default",
        speed: float = 1.0,
    ) -> Optional[Dict[str, Any]]:
        """
        Synthesizes TTS audio for text and language.
        Returns dictionary with audio metadata and relative URL, or None if TTS fails.
        """
        try:
            voice = get_voice_for_language(language_code, accent)
        except Exception as e:
            logger.warning(f"Voice resolution warning for language '{language_code}', accent '{accent}': {str(e)}")
            # Fallback to English voice if specified language voice cannot be resolved
            voice = "en-US-AriaNeural"

        filename = f"{uuid.uuid4().hex[:12]}.mp3"
        file_path = os.path.join(settings.AUDIO_DIR, filename)

        try:
            output_path = await self.provider.generate_audio(
                text=text,
                voice=voice,
                speed=speed,
                output_path=file_path,
            )

            relative_url = f"/audio/{os.path.basename(output_path)}"
            return {
                "url": relative_url,
                "file_path": output_path,
                "speed": speed,
                "accent": accent,
                "provider": "edge-tts",
            }
        except Exception as e:
            logger.error(f"TTSService synthesis error (independent failure handling): {str(e)}")
            return None


tts_service = TTSService()
