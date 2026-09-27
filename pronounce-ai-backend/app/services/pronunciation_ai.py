from typing import Dict, Any, Optional
from app.providers.huggingface import BaseAIProvider, huggingface_provider
from app.core.logging import logger


class PronunciationAIService:
    """Service layer for AI-driven pronunciation analysis."""

    def __init__(self, provider: Optional[BaseAIProvider] = None):
        self.provider = provider or huggingface_provider

    async def analyze(self, text: str, language: str) -> Optional[Dict[str, Any]]:
        """
        Calls AI provider for pronunciation analysis.
        Returns validated dictionary if successful, or None if unavailable/failed.
        """
        try:
            raw_analysis = await self.provider.generate_pronunciation_analysis(text, language)
            if not raw_analysis:
                return None

            # Validate basic structure
            ipa = str(raw_analysis.get("ipa", "")).strip()
            syllables = raw_analysis.get("syllables", [])
            if isinstance(syllables, str):
                syllables = [s.strip() for s in syllables.split("-") if s.strip()]

            stressed_syllable = str(raw_analysis.get("stressed_syllable", "")).strip()
            beginner = str(raw_analysis.get("beginner_pronunciation", "")).strip()
            meaning = str(raw_analysis.get("meaning", "")).strip()
            mistakes = raw_analysis.get("common_mistakes", [])
            if isinstance(mistakes, str):
                mistakes = [mistakes]
            tip = str(raw_analysis.get("pronunciation_tip", "")).strip()

            return {
                "ipa": ipa or text,
                "syllables": syllables or [text],
                "stressed_syllable": stressed_syllable,
                "beginner_guide": beginner or text,
                "meaning": meaning,
                "common_mistakes": mistakes,
                "pronunciation_tip": tip,
            }
        except Exception as e:
            logger.warning(f"PronunciationAIService error: {str(e)}")
            return None


pronunciation_ai_service = PronunciationAIService()
