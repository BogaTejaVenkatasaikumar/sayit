from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "PronounceAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    HOST: str = "127.0.0.1"
    PORT: int = 8000

    HF_API_KEY: str = ""
    HF_MODEL: str = "Qwen/Qwen2.5-7B-Instruct"

    DATABASE_URL: str = "sqlite:///./pronounce_ai.db"

    AUDIO_DIR: str = "./audio"

    MAX_TEXT_LENGTH: int = 500
    MAX_AUDIO_SIZE_MB: int = 10

    DEFAULT_LANGUAGE: str = "auto"

    LOG_LEVEL: str = "INFO"

    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://localhost:5173"

    # Practice Scoring Weights
    WEIGHT_WORD_ACCURACY: float = 0.30
    WEIGHT_PHONEME_ACCURACY: float = 0.35
    WEIGHT_STRESS: float = 0.15
    WEIGHT_FLUENCY: float = 0.20

    # Whisper STT Configuration
    WHISPER_MODEL: str = "base"
    WHISPER_DEVICE: str = "cpu"
    WHISPER_COMPUTE_TYPE: str = "int8"



    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v


settings = Settings()
