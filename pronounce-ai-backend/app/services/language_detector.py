import re
from typing import NamedTuple, Optional, Dict
from langdetect import detect_langs
from app.core.languages import LANGUAGES, get_language_info
from app.core.logging import logger
from app.core.exceptions import LanguageDetectionError, UnsupportedLanguageError


class LanguageDetectionResult(NamedTuple):
    language: str
    language_code: str
    confidence: float
    method: str


SCRIPT_PATTERNS = [
    (re.compile(r"[\u0C00-\u0C7F]"), "te", "Telugu"),
    (re.compile(r"[\u0B80-\u0BFF]"), "ta", "Tamil"),
    (re.compile(r"[\u0C80-\u0CFF]"), "kn", "Kannada"),
    (re.compile(r"[\u0D00-\u0D7F]"), "ml", "Malayalam"),
    (re.compile(r"[\u0900-\u097F]"), "hi", "Hindi"),
    (re.compile(r"[\u0980-\u09FF]"), "bn", "Bengali"),
    (re.compile(r"[\u0600-\u06FF]"), "ar", "Arabic"),
    (re.compile(r"[\u3040-\u309F\u30A0-\u30FF]"), "ja", "Japanese"),
    (re.compile(r"[\uAC00-\uD7AF\u1100-\u11FF]"), "ko", "Korean"),
    (re.compile(r"[\u4E00-\u9FFF]"), "zh", "Chinese"),
]

# Common distinctive words in various languages to avoid single-word statistical misclassification
COMMON_MULTILINGUAL_VOCABULARY: Dict[str, str] = {
    # French
    "bonjour": "fr",
    "bonsoir": "fr",
    "merci": "fr",
    "au revoir": "fr",
    "s'il vous plait": "fr",
    "oui": "fr",
    "non": "fr",
    "rendezvous": "fr",
    "croissant": "fr",
    "baguette": "fr",
    "château": "fr",
    "monsieur": "fr",
    "madame": "fr",
    # Spanish
    "hola": "es",
    "adios": "es",
    "adiós": "es",
    "gracias": "es",
    "por favor": "es",
    "amigo": "es",
    "buenos dias": "es",
    "buenas noches": "es",
    "señor": "es",
    "fiesta": "es",
    "hasta luego": "es",
    # German
    "danke": "de",
    "bitte": "de",
    "guten tag": "de",
    "guten morgen": "de",
    "auf wiedersehen": "de",
    "tschüss": "de",
    "schön": "de",
    "jawohl": "de",
    "gesundheit": "de",
    "zeitgeist": "de",
    "wunderbar": "de",
    # Hindi (Latin / Transliterated)
    "namaste": "hi",
    "namaskar": "hi",
    "shukriya": "hi",
    "dhanyavaad": "hi",
    "dhanyawad": "hi",
    "kya hal hai": "hi",
    "aap kaise hain": "hi",
    "bahut accha": "hi",
    # Telugu (Latin / Transliterated)
    "namaskaram": "te",
    "namaskaramu": "te",
    "dhanyavadalu": "te",
    "bagunnara": "te",
    "meeru ela unnaru": "te",
    # Tamil (Latin / Transliterated)
    "vanakkam": "ta",
    "nandri": "ta",
    "eppadi irukkinga": "ta",
    # Japanese (Romaji)
    "konnichiwa": "ja",
    "arigato": "ja",
    "arigatou": "ja",
    "sayonara": "ja",
    "ohayo": "ja",
    "ohayou": "ja",
    "sumimasen": "ja",
    "kawaii": "ja",
    "itadakimasu": "ja",
    # Korean (Romaja)
    "annyeong": "ko",
    "annyeonghaseyo": "ko",
    "kamsahamnida": "ko",
    "gamsahamnida": "ko",
    "saranghae": "ko",
    # Arabic (Transliterated)
    "marhaban": "ar",
    "shukran": "ar",
    "salam": "ar",
    "salaam": "ar",
    "ahlan": "ar",
}


class LanguageDetector:
    """Language detection service using script inspection, multilingual vocabulary dictionary, and langdetect."""

    def detect_by_script(self, text: str) -> Optional[LanguageDetectionResult]:
        """Detect language using unique Unicode character ranges (script priority)."""
        for pattern, code, default_name in SCRIPT_PATTERNS:
            matches = pattern.findall(text)
            if matches:
                # Count ratio of script characters to non-whitespace
                clean_text = "".join(text.split())
                ratio = len(matches) / max(len(clean_text), 1)
                if ratio > 0.1:  # Significant presence of script
                    lang_info = get_language_info(code)
                    name = lang_info["name"] if lang_info else default_name
                    logger.info(f"Script-based language detection matched '{name}' ({code}) with ratio {ratio:.2f}")
                    return LanguageDetectionResult(
                        language=name,
                        language_code=code,
                        confidence=min(1.0, round(ratio * 1.2, 2)),
                        method="script_inspection",
                    )
        return None

    def detect_by_vocabulary(self, text: str) -> Optional[LanguageDetectionResult]:
        """Detect language by known distinctive multilingual vocabulary."""
        lower = text.strip().lower()
        if lower in COMMON_MULTILINGUAL_VOCABULARY:
            code = COMMON_MULTILINGUAL_VOCABULARY[lower]
            lang_info = get_language_info(code)
            if lang_info:
                logger.info(f"Vocabulary-based language detection matched '{lang_info['name']}' ({code}) for '{text}'")
                return LanguageDetectionResult(
                    language=lang_info["name"],
                    language_code=code,
                    confidence=0.98,
                    method="vocabulary_lookup",
                )
        return None

    def detect_language(self, text: str, requested_lang: Optional[str] = None) -> LanguageDetectionResult:
        """
        Detects or validates language for given text.
        If requested_lang is specified (and != 'auto'), user's requested language is used after validation.
        Otherwise, script inspection is tried first, then vocabulary lookup, followed by langdetect.
        """
        clean_text = text.strip()
        if not clean_text:
            raise LanguageDetectionError("Cannot detect language for empty text.")

        # 1. Explicit user language override
        if requested_lang and requested_lang.lower() not in ("auto", "default", ""):
            code = requested_lang.lower()
            lang_info = get_language_info(code)
            if not lang_info:
                # Support common 2-letter codes or throw controlled error
                raise UnsupportedLanguageError(f"Requested language '{requested_lang}' is not supported.")
            return LanguageDetectionResult(
                language=lang_info["name"],
                language_code=code,
                confidence=1.0,
                method="user_specified",
            )

        # 2. Priority Script-based Unicode detection (Indic, CJK, Arabic)
        script_res = self.detect_by_script(clean_text)
        if script_res:
            return script_res

        # 3. Known Distinctive Vocabulary lookup (for short words like 'bonjour', 'gracias', 'konnichiwa')
        vocab_res = self.detect_by_vocabulary(clean_text)
        if vocab_res:
            return vocab_res

        # 4. Statistical detection via langdetect
        try:
            predictions = detect_langs(clean_text)
            if predictions:
                top_pred = predictions[0]
                code = top_pred.lang.lower()
                confidence = round(top_pred.prob, 2)

                lang_info = get_language_info(code)
                if lang_info:
                    return LanguageDetectionResult(
                        language=lang_info["name"],
                        language_code=code,
                        confidence=confidence,
                        method="langdetect",
                    )
                else:
                    # Fallback to English if code is not in registry but valid text
                    logger.warning(f"langdetect returned '{code}' not in language registry. Falling back to English.")
                    return LanguageDetectionResult(
                        language="English",
                        language_code="en",
                        confidence=confidence,
                        method="langdetect_fallback",
                    )
        except Exception as e:
            logger.warning(f"langdetect failed on text '{clean_text[:20]}...': {str(e)}")

        # 5. Ultimate fallback to English if detection fails
        return LanguageDetectionResult(
            language="English",
            language_code="en",
            confidence=0.5,
            method="default_fallback",
        )


language_detector = LanguageDetector()
