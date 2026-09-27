from typing import Dict, Any, Optional

LANGUAGES: Dict[str, Dict[str, Any]] = {
    "en": {
        "name": "English",
        "scripts": ["Latin"],
        "dictionary_available": True,
        "voices": {
            "default": "en-US-AriaNeural",
            "us": "en-US-AriaNeural",
            "gb": "en-GB-SoniaNeural",
            "in": "en-IN-NeerjaNeural",
            "au": "en-AU-NatashaNeural",
        },
    },
    "hi": {
        "name": "Hindi",
        "scripts": ["Devanagari"],
        "dictionary_available": False,
        "voices": {
            "default": "hi-IN-SwaraNeural",
            "in": "hi-IN-SwaraNeural",
            "male": "hi-IN-MadhurNeural",
        },
    },
    "te": {
        "name": "Telugu",
        "scripts": ["Telugu"],
        "dictionary_available": False,
        "voices": {
            "default": "te-IN-ShrutiNeural",
            "in": "te-IN-ShrutiNeural",
            "male": "te-IN-MohanNeural",
        },
    },
    "ta": {
        "name": "Tamil",
        "scripts": ["Tamil"],
        "dictionary_available": False,
        "voices": {
            "default": "ta-IN-PallaviNeural",
            "in": "ta-IN-PallaviNeural",
            "male": "ta-IN-ValluvarNeural",
        },
    },
    "kn": {
        "name": "Kannada",
        "scripts": ["Kannada"],
        "dictionary_available": False,
        "voices": {
            "default": "kn-IN-SapnaNeural",
            "in": "kn-IN-SapnaNeural",
            "male": "kn-IN-GaganNeural",
        },
    },
    "ml": {
        "name": "Malayalam",
        "scripts": ["Malayalam"],
        "dictionary_available": False,
        "voices": {
            "default": "ml-IN-SobhanaNeural",
            "in": "ml-IN-SobhanaNeural",
            "male": "ml-IN-MidhunNeural",
        },
    },
    "bn": {
        "name": "Bengali",
        "scripts": ["Bengali"],
        "dictionary_available": False,
        "voices": {
            "default": "bn-IN-TanishaaNeural",
            "in": "bn-IN-TanishaaNeural",
            "bd": "bn-BD-NabanitaNeural",
        },
    },
    "ar": {
        "name": "Arabic",
        "scripts": ["Arabic"],
        "dictionary_available": False,
        "voices": {
            "default": "ar-SA-ZariyahNeural",
            "sa": "ar-SA-ZariyahNeural",
            "eg": "ar-EG-SalmaNeural",
        },
    },
    "ja": {
        "name": "Japanese",
        "scripts": ["Hiragana", "Katakana", "Han"],
        "dictionary_available": False,
        "voices": {
            "default": "ja-JP-NanamiNeural",
            "jp": "ja-JP-NanamiNeural",
            "male": "ja-JP-KeitaNeural",
        },
    },
    "ko": {
        "name": "Korean",
        "scripts": ["Hangul"],
        "dictionary_available": False,
        "voices": {
            "default": "ko-KR-SunHiNeural",
            "kr": "ko-KR-SunHiNeural",
            "male": "ko-KR-InJoonNeural",
        },
    },
    "zh": {
        "name": "Chinese",
        "scripts": ["Han"],
        "dictionary_available": False,
        "voices": {
            "default": "zh-CN-XiaoxiaoNeural",
            "cn": "zh-CN-XiaoxiaoNeural",
            "tw": "zh-TW-HsiaoChenNeural",
        },
    },
    "fr": {
        "name": "French",
        "scripts": ["Latin"],
        "dictionary_available": False,
        "voices": {
            "default": "fr-FR-DeniseNeural",
            "fr": "fr-FR-DeniseNeural",
            "ca": "fr-CA-SylvieNeural",
        },
    },
    "de": {
        "name": "German",
        "scripts": ["Latin"],
        "dictionary_available": False,
        "voices": {
            "default": "de-DE-KatjaNeural",
            "de": "de-DE-KatjaNeural",
            "at": "de-AT-IngridNeural",
        },
    },
    "es": {
        "name": "Spanish",
        "scripts": ["Latin"],
        "dictionary_available": False,
        "voices": {
            "default": "es-ES-ElviraNeural",
            "es": "es-ES-ElviraNeural",
            "mx": "es-MX-DaliaNeural",
        },
    },
}


def get_language_info(code: str) -> Optional[Dict[str, Any]]:
    """Retrieve language information by ISO code."""
    return LANGUAGES.get(code.lower())


def get_voice_for_language(code: str, accent: str = "default") -> str:
    """Get the appropriate TTS voice for a language code and accent."""
    lang_info = get_language_info(code)
    if not lang_info or "voices" not in lang_info:
        raise ValueError(f"Unsupported language code for TTS: '{code}'")

    voices = lang_info["voices"]
    accent_clean = accent.lower().replace("-", "_")
    
    # Try exact accent match, then 'default', then first available voice
    if accent in voices:
        return voices[accent]
    elif accent_clean in voices:
        return voices[accent_clean]
    elif "default" in voices:
        return voices["default"]
    else:
        return next(iter(voices.values()))
