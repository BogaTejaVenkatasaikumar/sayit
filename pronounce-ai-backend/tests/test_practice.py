import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import init_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    init_db()


def test_practice_invalid_file_extension():
    response = client.post(
        "/api/v1/practice",
        data={"expected_text": "hello", "language": "en"},
        files={"audio": ("test.txt", b"invalid audio data", "text/plain")},
    )
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_INPUT"


def test_practice_empty_file():
    response = client.post(
        "/api/v1/practice",
        data={"expected_text": "hello", "language": "en"},
        files={"audio": ("empty.wav", b"", "audio/wav")},
    )
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False


@pytest.mark.asyncio
async def test_practice_endpoint_success_and_progress():
    fake_stt_result = {
        "transcript": "entrepreneur",
        "words": [
            {"word": "entrepreneur", "start": 0.2, "end": 1.1, "probability": 0.98}
        ],
        "confidence": 0.98,
        "engine": "faster-whisper",
        "status": "available",
    }

    with patch("app.services.speech_to_text.speech_to_text_service.transcribe", new_callable=AsyncMock) as mock_stt:
        mock_stt.return_value = fake_stt_result

        dummy_wav = b"RIFF" + b"\x00" * 36 + b"WAVEfmt " + b"\x00" * 50

        response = client.post(
            "/api/v1/practice",
            data={"expected_text": "entrepreneur", "language": "en"},
            files={"audio": ("recording.wav", dummy_wav, "audio/wav")},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["transcript"] == "entrepreneur"
        assert data["expected_text"] == "entrepreneur"
        assert "scores" in data
        assert data["scores"]["overall"] >= 0
        assert data["scores"]["word_accuracy"] == 100
        assert data["analysis"]["transcription_engine"] == "faster-whisper"
        assert data["analysis"]["transcription_status"] == "available"
        assert data["analysis"]["phoneme_analysis"] == "estimated"
        assert data["analysis"]["stress_analysis"] == "estimated"
        assert "report" in data
        assert "summary" in data["report"]

    # Test progress tracking endpoint
    progress_res = client.get("/api/v1/progress")
    assert progress_res.status_code == 200
    p_data = progress_res.json()
    assert p_data["total_attempts"] >= 1
    assert "average_score" in p_data
    assert "improvement" in p_data
