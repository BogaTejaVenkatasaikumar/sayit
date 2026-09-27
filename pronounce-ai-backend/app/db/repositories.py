from typing import List, Optional
from sqlalchemy.orm import Session
from app.db.models import PronunciationHistory, Favorite, PracticeSession, PracticeAttempt



class PronunciationRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_history(
        self,
        text: str,
        language: str,
        language_code: str,
        ipa: str,
        meaning: Optional[str] = "",
        audio_path: Optional[str] = "",
    ) -> PronunciationHistory:
        item = PronunciationHistory(
            text=text,
            language=language,
            language_code=language_code,
            ipa=ipa,
            meaning=meaning or "",
            audio_path=audio_path or "",
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def get_history(self, limit: int = 50) -> List[PronunciationHistory]:
        return (
            self.db.query(PronunciationHistory)
            .order_by(PronunciationHistory.created_at.desc())
            .limit(limit)
            .all()
        )

    def delete_history(self, history_id: int) -> bool:
        item = self.db.query(PronunciationHistory).filter(PronunciationHistory.id == history_id).first()
        if not item:
            return False
        self.db.delete(item)
        self.db.commit()
        return True


class PracticeRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_attempt(
        self,
        expected_text: str,
        transcript: str,
        overall_score: int,
        word_accuracy: int,
        phoneme_accuracy: int,
        stress_score: int,
        fluency_score: int,
        session_identifier: Optional[str] = "default_session",
    ) -> PracticeAttempt:
        attempt = PracticeAttempt(
            expected_text=expected_text,
            transcript=transcript or "",
            overall_score=overall_score,
            word_accuracy=word_accuracy,
            phoneme_accuracy=phoneme_accuracy,
            stress_score=stress_score,
            fluency_score=fluency_score,
        )
        self.db.add(attempt)
        self.db.commit()
        self.db.refresh(attempt)
        return attempt

    def get_progress(self) -> dict:
        attempts = self.db.query(PracticeAttempt).order_by(PracticeAttempt.created_at.asc()).all()
        total_attempts = len(attempts)
        if total_attempts == 0:
            return {
                "average_score": 0,
                "latest_score": 0,
                "best_score": 0,
                "total_attempts": 0,
                "improvement": 0,
            }

        scores = [a.overall_score for a in attempts]
        average_score = int(round(sum(scores) / total_attempts))
        latest_score = scores[-1]
        best_score = max(scores)
        first_score = scores[0]
        improvement = latest_score - first_score

        return {
            "average_score": average_score,
            "latest_score": latest_score,
            "best_score": best_score,
            "total_attempts": total_attempts,
            "improvement": improvement,
        }

