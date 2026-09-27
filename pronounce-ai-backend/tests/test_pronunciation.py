import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import init_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    init_db()



def test_validation_empty_text():
    response = client.post("/api/v1/pronunciation", json={"text": "   ", "language": "auto"})
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_INPUT"


def test_validation_over_500_chars():
    long_text = "a" * 501
    response = client.post("/api/v1/pronunciation", json={"text": long_text, "language": "auto"})
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False


def test_validation_invalid_speed():
    response = client.post(
        "/api/v1/pronunciation",
        json={"text": "hello", "language": "auto", "speed": 3.5},
    )
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False


def test_validation_unsupported_language():
    response = client.post(
        "/api/v1/pronunciation",
        json={"text": "hello", "language": "invalid_xyz"},
    )
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] in ["UNSUPPORTED_LANGUAGE", "INVALID_INPUT"]


@pytest.mark.asyncio
async def test_pronunciation_endpoint_dictionary_hit():
    with patch("app.services.tts.tts_service.synthesize", new_callable=AsyncMock) as mock_tts:
        mock_tts.return_value = {
            "url": "/audio/mock123.mp3",
            "file_path": "./audio/mock123.mp3",
            "speed": 1.0,
            "accent": "default",
            "provider": "edge-tts",
        }

        response = client.post(
            "/api/v1/pronunciation",
            json={"text": "entrepreneur", "language": "en"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["text"] == "entrepreneur"
        assert data["language"]["code"] == "en"
        assert data["pronunciation"]["ipa"] != ""
        assert data["metadata"]["pronunciation_source"] == "dictionary"
        assert data["audio"]["url"] == "/audio/mock123.mp3"



@pytest.mark.asyncio
async def test_pronunciation_telugu_acceptance():
    with patch("app.services.tts.tts_service.synthesize", new_callable=AsyncMock) as mock_tts:
        mock_tts.return_value = {
            "url": "/audio/mock_telugu.mp3",
            "file_path": "./audio/mock_telugu.mp3",
            "speed": 1.0,
            "accent": "default",
            "provider": "edge-tts",
        }

        response = client.post(
            "/api/v1/pronunciation",
            json={"text": "నమస్కారం", "language": "auto"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["text"] == "నమస్కారం"
        assert data["language"]["name"] == "Telugu"
        assert data["language"]["code"] == "te"
        assert data["audio"]["url"] == "/audio/mock_telugu.mp3"


def test_history_api():
    response = client.get("/api/v1/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_practice_endpoint_implemented():
    dummy_wav = b"RIFF" + b"\x00" * 36 + b"WAVEfmt " + b"\x00" * 50
    response = client.post(
        "/api/v1/practice",
        data={"expected_text": "hello", "language": "en"},
        files={"audio": ("sample.wav", dummy_wav, "audio/wav")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "scores" in data
    assert data["analysis"]["phoneme_analysis"] == "estimated"

