from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from app.db.database import Base


class PronunciationHistory(Base):
    __tablename__ = "pronunciation_history"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String(500), nullable=False)
    language = Column(String(100), nullable=False)
    language_code = Column(String(10), nullable=False, index=True)
    ipa = Column(String(255), nullable=False)
    meaning = Column(Text, nullable=True, default="")
    audio_path = Column(String(255), nullable=True, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    pronunciation_id = Column(Integer, ForeignKey("pronunciation_history.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_identifier = Column(String(100), nullable=True, index=True)
    user_id = Column(String(100), nullable=True, index=True)  # Nullable until Auth is added
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class PracticeAttempt(Base):
    __tablename__ = "practice_attempts"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("practice_sessions.id", ondelete="SET NULL"), nullable=True)
    expected_text = Column(String(500), nullable=False)
    transcript = Column(Text, nullable=True)
    overall_score = Column(Integer, nullable=False)
    word_accuracy = Column(Integer, nullable=False)
    phoneme_accuracy = Column(Integer, nullable=False)
    stress_score = Column(Integer, nullable=False)
    fluency_score = Column(Integer, nullable=False)
    wpm = Column(Integer, nullable=True, default=0)
    duration_ms = Column(Integer, nullable=True, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


