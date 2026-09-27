from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict


class PronunciationRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Text to pronounce (max 500 characters)",
        examples=["entrepreneur", "నమస్కారం", "नमस्ते", "こんにちは"],
    )
    language: str = Field(
        default="auto",
        description="Language code (e.g., 'en', 'hi', 'te', 'ta', 'fr', 'ja') or 'auto' for automatic detection.",
        examples=["auto", "en", "te", "hi"],
    )
    accent: str = Field(
        default="default",
        description="Voice accent (e.g., 'default', 'us', 'gb', 'in').",
        examples=["default", "us", "gb", "in"],
    )
    speed: float = Field(
        default=1.0,
        description="Audio playback speed multiplier.",
        examples=[1.0, 0.75, 0.5],
    )

    @field_validator("speed")
    @classmethod
    def validate_speed(cls, v: float) -> float:
        allowed_speeds = [0.5, 0.75, 1.0, 1.25, 1.5]
        if v not in allowed_speeds:
            raise ValueError(f"Invalid speed {v}. Allowed values: {allowed_speeds}")
        return v

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Text cannot be empty or blank whitespace.")
        return clean


class LanguageInfo(BaseModel):
    name: str = Field(..., description="Full language name")
    code: str = Field(..., description="ISO 639-1 language code")
    confidence: Optional[float] = Field(None, description="Detection confidence score")


class PronunciationDetail(BaseModel):
    ipa: str = Field(..., description="International Phonetic Alphabet (IPA) representation")
    syllables: List[str] = Field(default_factory=list, description="Syllable breakdown")
    stressed_syllable: str = Field("", description="Primary stressed syllable or accent guidance")
    beginner_guide: str = Field("", description="Beginner-friendly phonetic pronunciation guide")


class AudioInfo(BaseModel):
    url: str = Field(..., description="Relative URL to fetch generated audio file")
    speed: float = Field(1.0, description="Playback speed")
    accent: str = Field("default", description="Selected voice accent")


class MetadataInfo(BaseModel):
    pronunciation_source: str = Field(..., description="Source of pronunciation metadata: 'dictionary', 'ai', or 'fallback'")
    tts_provider: str = Field(..., description="TTS provider name, e.g., 'edge-tts'")


class PronunciationResponse(BaseModel):
    text: str
    language: LanguageInfo
    pronunciation: PronunciationDetail
    meaning: Optional[str] = ""
    common_mistakes: List[str] = Field(default_factory=list)
    pronunciation_tip: Optional[str] = ""
    audio: Optional[AudioInfo] = None
    metadata: MetadataInfo


class HistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    text: str
    language: str
    language_code: str
    ipa: str
    meaning: Optional[str] = ""
    audio_path: Optional[str] = ""
    created_at: datetime


class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1500, description="Text to translate")
    target_language: str = Field(..., description="Target ISO language code, e.g., 'te', 'hi', 'en', 'es'")
    source_language: str = Field(default="auto", description="Source ISO language code or 'auto'")


class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    target_language: str
    source_language: str


