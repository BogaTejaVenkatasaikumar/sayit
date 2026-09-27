import os
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.logging import logger


_model_instance = None


def get_whisper_model():
    """Lazy loader for Faster-Whisper model using configuration settings."""
    global _model_instance
    if _model_instance is None:
        try:
            from faster_whisper import WhisperModel
            logger.info(
                f"Initializing Faster-Whisper model ('{settings.WHISPER_MODEL}', device='{settings.WHISPER_DEVICE}', compute_type='{settings.WHISPER_COMPUTE_TYPE}')..."
            )
            _model_instance = WhisperModel(
                settings.WHISPER_MODEL,
                device=settings.WHISPER_DEVICE,
                compute_type=settings.WHISPER_COMPUTE_TYPE,
            )
        except Exception as e:
            logger.warning(f"Could not initialize Faster-Whisper model '{settings.WHISPER_MODEL}': {str(e)}")
            _model_instance = False
    return _model_instance if _model_instance is not False else None



class FasterWhisperProvider:
    """Faster-Whisper STT Provider with explicit status reporting."""

    async def transcribe(self, audio_path: str, language: str = "auto") -> Dict[str, Any]:
        model = get_whisper_model()

        if not model:
            logger.warning("Faster-Whisper model unavailable. Utilizing degraded fallback transcript mode.")
            return {
                "transcript": "",
                "words": [],
                "confidence": 0.0,
                "engine": "fallback",
                "status": "degraded",
            }

        try:
            lang_param = None if language.lower() == "auto" else language.lower()
            segments, info = model.transcribe(
                audio_path,
                language=lang_param,
                word_timestamps=True,
                beam_size=5,
            )

            full_transcript_parts = []
            words_list: List[Dict[str, Any]] = []

            for segment in segments:
                full_transcript_parts.append(segment.text.strip())
                if segment.words:
                    for w in segment.words:
                        words_list.append({
                            "word": w.word.strip(),
                            "start": round(w.start, 2),
                            "end": round(w.end, 2),
                            "probability": round(w.probability, 2),
                        })

            transcript = " ".join(full_transcript_parts).strip()
            confidence = round(info.transcription_options if hasattr(info, "transcription_options") else 0.95, 2)

            return {
                "transcript": transcript,
                "words": words_list,
                "confidence": confidence if isinstance(confidence, float) else 0.9,
                "engine": "faster-whisper",
                "status": "available",
            }
        except Exception as e:
            logger.error(f"Faster-Whisper transcription failed: {str(e)}")
            return {
                "transcript": "",
                "words": [],
                "confidence": 0.0,
                "engine": "fallback",
                "status": "degraded",
            }


faster_whisper_provider = FasterWhisperProvider()
