from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.repositories import PracticeRepository
from app.services.audio_processor import audio_processor
from app.services.speech_to_text import speech_to_text_service
from app.services.pronunciation_scorer import pronunciation_scorer_service
from app.schemas.practice import PracticeResponse
from app.core.logging import logger

router = APIRouter(prefix="/api/v1", tags=["Practice"])


@router.post(
    "/practice",
    response_model=PracticeResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit user audio recording for speech recognition and practice scoring",
)
async def evaluate_practice(
    audio: UploadFile = File(..., description="User recorded audio file (.mp3, .wav, .m4a, .webm, .ogg, .flac)"),
    expected_text: str = Form(..., description="Expected target word, phrase, or sentence"),
    language: str = Form("auto", description="Language code or 'auto'"),
    db: Session = Depends(get_db),
):
    logger.info(f"Received practice submission for expected_text='{expected_text}', lang='{language}'")

    # 1. Save temp audio and validate format/size
    temp_audio_path = await audio_processor.save_temp_audio(audio)

    try:
        # 2. Speech recognition via Faster-Whisper
        stt_result = await speech_to_text_service.transcribe(temp_audio_path, language=language)

        # 3. Pronunciation scoring & AI feedback generation
        response = pronunciation_scorer_service.score_practice(
            expected_text=expected_text,
            stt_result=stt_result,
            language=language,
        )

        # 4. Save practice attempt to database
        repo = PracticeRepository(db)
        try:
            repo.add_attempt(
                expected_text=expected_text,
                transcript=response.transcript,
                overall_score=response.scores.overall,
                word_accuracy=response.scores.word_accuracy,
                phoneme_accuracy=response.scores.phoneme_accuracy,
                stress_score=response.scores.stress,
                fluency_score=response.scores.fluency,
            )
        except Exception as e:
            logger.error(f"Failed to record practice attempt to database: {str(e)}")

        return response
    finally:
        # 5. Clean up temp audio file
        audio_processor.cleanup_temp_audio(temp_audio_path)


@router.get(
    "/progress",
    summary="Get user practice progress metrics and improvement history",
)
def get_user_progress(db: Session = Depends(get_db)):
    repo = PracticeRepository(db)
    return repo.get_progress()
