import os
import uuid
import urllib.request
import urllib.parse
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.languages import get_voice_for_language
from app.core.logging import logger
from app.providers.tts.edge_tts import BaseTTSProvider, edge_tts_provider


class TTSService:
    """TTS Service manager with resilient multi-provider fallback and instant audio caching."""

    def __init__(self, provider: Optional[BaseTTSProvider] = None):
        self.provider = provider or edge_tts_provider
        self._cache: Dict[str, Dict[str, Any]] = {}
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
        cache_key = f"{text.strip().lower()}:{language_code}:{speed}:{accent}"
        if cache_key in self._cache:
            cached = self._cache[cache_key]
            if os.path.exists(cached.get("file_path", "")):
                return cached

        filename = f"{uuid.uuid4().hex[:12]}.mp3"
        file_path = os.path.join(settings.AUDIO_DIR, filename)

        # 1. Attempt Primary Provider (Edge-TTS)
        try:
            try:
                voice = get_voice_for_language(language_code, accent)
            except Exception as e:
                logger.warning(f"Voice resolution warning for language '{language_code}', accent '{accent}': {str(e)}")
                voice = "en-US-AriaNeural"

            output_path = await self.provider.generate_audio(
                text=text,
                voice=voice,
                speed=speed,
                output_path=file_path,
            )

            relative_url = f"/audio/{os.path.basename(output_path)}"
            result = {
                "url": relative_url,
                "file_path": output_path,
                "speed": speed,
                "accent": accent,
                "provider": "edge-tts",
            }
            self._cache[cache_key] = result
            return result
        except Exception as e:
            logger.warning(f"Primary TTS provider failed ({str(e)}). Falling back to Google TTS...")

        # 2. Resilient Fallback Provider (Google TTS)
        try:
            clean_lang = language_code if language_code and len(language_code) == 2 else "en"
            tts_url = (
                f"https://translate.google.com/translate_tts"
                f"?ie=UTF-8&tl={clean_lang}&client=tw-ob&q={urllib.parse.quote(text)}"
            )
            req = urllib.request.Request(tts_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                audio_bytes = resp.read()
                if audio_bytes and len(audio_bytes) > 100:
                    with open(file_path, "wb") as f:
                        f.write(audio_bytes)

                    relative_url = f"/audio/{os.path.basename(file_path)}"
                    logger.info(f"Google TTS fallback succeeded for '{text}' ({len(audio_bytes)} bytes)")
                    result = {
                        "url": relative_url,
                        "file_path": file_path,
                        "speed": speed,
                        "accent": accent,
                        "provider": "google-tts",
                    }
                    self._cache[cache_key] = result
                    return result
        except Exception as fallback_err:
            logger.error(f"Fallback Google TTS failed: {str(fallback_err)}")

        return None


tts_service = TTSService()
