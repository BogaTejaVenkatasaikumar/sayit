from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.repositories import PronunciationRepository
from app.schemas.pronunciation import (
    PronunciationRequest,
    PronunciationResponse,
    LanguageInfo,
    PronunciationDetail,
    AudioInfo,
    MetadataInfo,
    HistoryItem,
    TranslationRequest,
    TranslationResponse,
)
from app.services.language_detector import language_detector
from app.services.pronunciation_engine import pronunciation_engine
from app.services.meaning_service import meaning_service
from app.services.tts import tts_service
from app.core.logging import logger
from typing import List

router = APIRouter(prefix="/api/v1", tags=["Pronunciation"])


@router.post(
    "/pronunciation",
    response_model=PronunciationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get pronunciation, breakdown, guide, and TTS audio for word or phrase",
)
async def generate_pronunciation(
    payload: PronunciationRequest,
    db: Session = Depends(get_db),
):
    logger.info(f"Received pronunciation request for text='{payload.text}', lang='{payload.language}'")

    # 1. Detect / validate language
    lang_res = language_detector.detect_language(payload.text, payload.language)
    logger.info(f"Language resolved to '{lang_res.language}' ({lang_res.language_code}) via {lang_res.method}")

    # 2. Get pronunciation metadata from knowledge layer (dictionary -> AI -> fallback)
    p_meta = await pronunciation_engine.get_pronunciation(
        payload.text, lang_res.language_code, lang_res.language
    )

    # 3. Generate TTS audio (independent failure handling)
    audio_meta = await tts_service.synthesize(
        text=payload.text,
        language_code=lang_res.language_code,
        accent=payload.accent,
        speed=payload.speed,
    )

    # 4. Save to history repository
    repo = PronunciationRepository(db)
    audio_url = audio_meta["url"] if audio_meta else ""
    try:
        repo.add_history(
            text=payload.text,
            language=lang_res.language,
            language_code=lang_res.language_code,
            ipa=p_meta["ipa"],
            meaning=p_meta.get("meaning", ""),
            audio_path=audio_url,
        )
    except Exception as e:
        logger.error(f"Failed to record pronunciation history to database: {str(e)}")

    # 5. Build response
    audio_obj = None
    if audio_meta:
        audio_obj = AudioInfo(
            url=audio_meta["url"],
            speed=payload.speed,
            accent=payload.accent,
        )

    return PronunciationResponse(
        text=payload.text,
        language=LanguageInfo(
            name=lang_res.language,
            code=lang_res.language_code,
            confidence=lang_res.confidence,
        ),
        pronunciation=PronunciationDetail(
            ipa=p_meta["ipa"],
            syllables=p_meta["syllables"],
            stressed_syllable=p_meta["stressed_syllable"],
            beginner_guide=p_meta["beginner_guide"],
        ),
        meaning=p_meta.get("meaning", ""),
        common_mistakes=p_meta.get("common_mistakes", []),
        pronunciation_tip=p_meta.get("pronunciation_tip", ""),
        audio=audio_obj,
        metadata=MetadataInfo(
            pronunciation_source=p_meta["source"],
            tts_provider=audio_meta["provider"] if audio_meta else "none",
        ),
    )


@router.get(
    "/history",
    response_model=List[HistoryItem],
    summary="Get recent pronunciation request history",
)
def get_history(db: Session = Depends(get_db)):
    repo = PronunciationRepository(db)
    return repo.get_history(limit=50)


@router.delete(
    "/history/{history_id}",
    summary="Delete a history item by ID",
)
def delete_history(history_id: int, db: Session = Depends(get_db)):
    repo = PronunciationRepository(db)
    success = repo.delete_history(history_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"History record with ID {history_id} not found.")
    return {"success": True, "message": f"History item {history_id} deleted."}


@router.post(
    "/translate",
    response_model=TranslationResponse,
    status_code=status.HTTP_200_OK,
    summary="Translate meaning or text to any target language in real-time",
)
async def translate_meaning(payload: TranslationRequest):
    logger.info(f"Translating text to target_language='{payload.target_language}'")
    translated = await meaning_service.translate_text(
        text=payload.text,
        target_lang=payload.target_language,
        source_lang=payload.source_language,
    )
    return TranslationResponse(
        original_text=payload.text,
        translated_text=translated,
        target_language=payload.target_language,
        source_language=payload.source_language,
    )

