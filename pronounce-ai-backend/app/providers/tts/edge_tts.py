import os
from abc import ABC, abstractmethod
from app.core.logging import logger
from app.core.exceptions import TTSError


class BaseTTSProvider(ABC):
    """Abstract base class for TTS provider implementations."""

    @abstractmethod
    async def generate_audio(
        self, text: str, voice: str, speed: float, output_path: str
    ) -> str:
        pass


class EdgeTTSProvider(BaseTTSProvider):
    """Edge-TTS provider implementation."""

    async def generate_audio(
        self, text: str, voice: str, speed: float, output_path: str
    ) -> str:
        try:
            import edge_tts
        except ImportError:
            logger.error("edge-tts library is not installed.")
            raise TTSError("Edge TTS engine is unavailable on the server.")

        # Convert float speed to edge-tts rate string e.g. 1.0 -> "+0%", 0.75 -> "-25%", 1.5 -> "+50%"
        rate_pct = int((speed - 1.0) * 100)
        rate_str = f"{rate_pct:+d}%"

        try:
            logger.info(f"Generating Edge-TTS audio for voice='{voice}', speed='{rate_str}' -> '{output_path}'")
            communicate = edge_tts.Communicate(text, voice, rate=rate_str)
            await communicate.save(output_path)

            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                raise TTSError("Generated audio file is empty or missing.")

            return output_path
        except TTSError:
            raise
        except Exception as e:
            logger.error(f"Edge-TTS audio generation failed: {str(e)}")
            raise TTSError(f"Failed to generate TTS audio: {str(e)}")


edge_tts_provider = EdgeTTSProvider()
