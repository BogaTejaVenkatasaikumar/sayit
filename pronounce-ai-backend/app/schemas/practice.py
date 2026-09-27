from typing import List, Optional
from pydantic import BaseModel, Field


class ScoresDetail(BaseModel):
    overall: int = Field(..., ge=0, le=100, description="Weighted overall pronunciation score (0-100)")
    word_accuracy: int = Field(..., ge=0, le=100, description="Word accuracy percentage (0-100)")
    phoneme_accuracy: int = Field(..., ge=0, le=100, description="Phoneme accuracy percentage (0-100)")
    stress: int = Field(..., ge=0, le=100, description="Stress pattern score (0-100)")
    fluency: int = Field(..., ge=0, le=100, description="Speaking fluency & rate score (0-100)")


class FeedbackItem(BaseModel):
    type: str = Field("substitution", description="Feedback type: 'substitution', 'deletion', 'insertion', or 'correct'")
    expected: str = Field("", description="Expected phoneme or word")
    detected: str = Field("", description="Detected phoneme or word")
    position: Optional[int] = Field(None, description="Index or character position")
    severity: str = Field("moderate", description="Severity: 'minor', 'moderate', or 'severe'")
    message: str = Field(..., description="Beginner-friendly explanation and guidance")


class FeedbackReport(BaseModel):
    summary: str = Field(..., description="Overall constructive performance summary")
    strengths: List[str] = Field(default_factory=list, description="List of detected pronunciation strengths")
    weaknesses: List[str] = Field(default_factory=list, description="List of areas needing improvement")
    tips: List[str] = Field(default_factory=list, description="Actionable pronunciation tips")
    practice_targets: List[str] = Field(default_factory=list, description="Target phonemes or words for practice")


class AnalysisMetadata(BaseModel):
    transcription_engine: str = Field(..., description="Transcription engine used: 'faster-whisper' or 'fallback'")
    transcription_status: str = Field(..., description="Status: 'available' or 'degraded'")
    scoring_method: str = Field("deterministic", description="Scoring method: 'deterministic' or 'acoustic'")
    phoneme_analysis: str = Field("estimated", description="Phoneme provenance: 'estimated' or 'acoustic'")
    stress_analysis: str = Field("estimated", description="Stress provenance: 'estimated' or 'acoustic'")


class PracticeResponse(BaseModel):
    transcript: str = Field(..., description="Transcribed spoken text")
    expected_text: str = Field(..., description="Expected target text")
    scores: ScoresDetail
    feedback: List[FeedbackItem] = Field(default_factory=list)
    report: Optional[FeedbackReport] = None
    analysis: AnalysisMetadata
