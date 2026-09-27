# PronounceAI — AI-Powered Multilingual Pronunciation Backend

PronounceAI is a production-quality, modular Python FastAPI backend that helps users pronounce words, phrases, and sentences in multiple languages. It provides automatic language detection (with priority Unicode script recognition), IPA notation, syllable breakdown, stress placement, beginner-friendly phonetic guides, native-language Text-To-Speech (TTS) audio generation, and historical request tracking.

---

## Architecture

```text
                         ┌─────────────────────┐
                         │      FastAPI        │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
             Pronunciation      History           Practice
                API                API                API
                  │
                  ▼
        ┌──────────────────────┐
        │ Pronunciation Engine │
        └──────────┬───────────┘
                   │
          ┌────────┼─────────┐
          ▼        ▼         ▼
      Dictionary   AI       Fallback
          │        │
          │        ▼
          │   HuggingFace
          │
          └────────┬──────────┐
                   │          │
                   ▼          ▼
             Pronunciation   TTS
                Data          │
                              ▼
                         Edge-TTS
                              │
                              ▼
                         audio/*.mp3
```

---

## Features

- **Multilingual Support**: Supports English, Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Arabic, Japanese, Korean, Chinese, French, German, Spanish, and more.
- **Priority Script Detection**: Unicode character-range analysis prioritizes Indic (Telugu, Devanagari, Tamil, etc.), CJK, and Arabic scripts before statistical detection.
- **Dedicated Language Registry**: Centralized `app/core/languages.py` mapping languages, scripts, TTS voices, and accents.
- **Knowledge Layer & Provenance**: Integrates known dictionary rules, Hugging Face AI analysis, and rule fallbacks. Tracks provenance as `"dictionary"`, `"ai"`, or `"fallback"`.
- **Independent Failure Resilience**: Audio TTS and AI analysis operate independently — TTS failure returns pronunciation metadata, while AI failure returns fallback metadata with audio.
- **Native TTS Audio**: Edge-TTS integration with multi-accent support (`default`, `us`, `gb`, `in`).
- **History & Favorites**: Persistent request history using SQLite and SQLAlchemy.
- **Extensible Practice Interface**: Prepared `POST /api/v1/practice` interface ready for Faster-Whisper integration.

---

## Requirements

- Python 3.11+

---

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd pronounce-ai-backend
   ```

2. **Create and activate virtual environment**:
   - **Windows (PowerShell / CMD)**:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Available environment variables:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `APP_NAME` | `PronounceAI` | Application name |
| `APP_VERSION` | `1.0.0` | Application version |
| `DEBUG` | `True` | Debug mode (reloads server on edit) |
| `HOST` | `127.0.0.1` | Host address |
| `PORT` | `8000` | Server port |
| `HF_API_KEY` | `""` | Hugging Face API key (optional; triggers fallback if empty) |
| `HF_MODEL` | `Qwen/Qwen2.5-7B-Instruct` | Hugging Face LLM model |
| `DATABASE_URL` | `sqlite:///./pronounce_ai.db` | SQLAlchemy Database URL |
| `AUDIO_DIR` | `./audio` | Path to store generated audio files |
| `MAX_TEXT_LENGTH` | `500` | Max character length for input text |
| `LOG_LEVEL` | `INFO` | Logging level |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Allowed CORS origins |

---

## Running the Server

Start the application using `run.py`:

```bash
python run.py
```

Or using Uvicorn directly:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## API Endpoints

### 1. Health Check
- `GET /health` or `GET /api/v1/health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "app": "PronounceAI",
    "version": "1.0.0"
  }
  ```

### 2. Pronunciation API
- `POST /api/v1/pronunciation`
- **Request Body**:
  ```json
  {
    "text": "నమస్కారం",
    "language": "auto",
    "accent": "default",
    "speed": 1.0
  }
  ```
- **Response**:
  ```json
  {
    "text": "నమస్కారం",
    "language": {
      "name": "Telugu",
      "code": "te",
      "confidence": 1.0
    },
    "pronunciation": {
      "ipa": "/nəməskaːrəm/",
      "syllables": ["న", "మ", "స్కా", "రం"],
      "stressed_syllable": "స్కా",
      "beginner_guide": "nuh-mus-KAR-um"
    },
    "meaning": "Traditional Indian greeting meaning respect or bow to you in Telugu.",
    "common_mistakes": ["Mispronouncing 'ska' as 'sa'"],
    "pronunciation_tip": "Roll the 'r' lightly and stress the 'KAR' syllable.",
    "audio": {
      "url": "/audio/7d9e4c5a.mp3",
      "speed": 1.0,
      "accent": "default"
    },
    "metadata": {
      "pronunciation_source": "dictionary",
      "tts_provider": "edge-tts"
    }
  }
  ```

### 3. History API
- `GET /api/v1/history`: List recent pronunciation requests.
- `DELETE /api/v1/history/{id}`: Delete a history record by ID.

### 4. Practice API
- `POST /api/v1/practice`: Endpoint for voice practice evaluation. Returns HTTP 501 Not Implemented cleanly.

---

## Interactive Documentation

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## Running Tests

Run the full pytest suite:

```bash
pytest
```

---

## Future Roadmap

1. **Voice Practice Pipeline**: Integration with Faster-Whisper for audio transcription and acoustic/phoneme scoring (`overall_score`, `phoneme_accuracy`, `stress`, `fluency`).
2. **Additional TTS Providers**: Support for Google Cloud TTS, ElevenLabs, and Azure Speech.
3. **Camera / OCR Input**: Live text extraction from images for instant pronunciation lookup.
4. **User Accounts & Synced Favorites**: Authentication and personalized learning history.
