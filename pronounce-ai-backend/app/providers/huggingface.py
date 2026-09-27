import httpx
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod
from app.core.config import settings
from app.core.logging import logger
from app.utils.json_parser import extract_and_parse_json


class BaseAIProvider(ABC):
    """Abstract base class for AI Provider integrations."""

    @abstractmethod
    async def generate_pronunciation_analysis(
        self, text: str, language: str
    ) -> Optional[Dict[str, Any]]:
        pass


class HuggingFaceProvider(BaseAIProvider):
    """Hugging Face Inference API implementation."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.HF_API_KEY
        self.model = model or settings.HF_MODEL
        self.base_url = f"https://api-inference.huggingface.co/models/{self.model}"

    async def generate_pronunciation_analysis(
        self, text: str, language: str
    ) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            logger.info("HF_API_KEY is not set; skipping Hugging Face AI call and using knowledge fallback.")
            return None

        prompt = (
            f"You are an expert multilingual linguist.\n"
            f"Analyze the pronunciation for the text: '{text}' in language '{language}'.\n"
            f"Respond ONLY with a valid JSON object matching this exact schema:\n"
            f"{{\n"
            f'  "ipa": "IPA phonetic notation",\n'
            f'  "syllables": ["syllable1", "syllable2"],\n'
            f'  "stressed_syllable": "Primary stressed syllable or accent note",\n'
            f'  "beginner_pronunciation": "Beginner phonetic guide (e.g., nuh-mus-KAR-um)",\n'
            f'  "meaning": "Short English translation/meaning",\n'
            f'  "common_mistakes": ["mistake 1", "mistake 2"],\n'
            f'  "pronunciation_tip": "Practical tip for clear native-sounding pronunciation"\n'
            f"}}\n"
            f"Do not include any explanation outside of the JSON."
        )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 512,
                "temperature": 0.2,
                "return_full_text": False,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(self.base_url, headers=headers, json=payload)
                
                if response.status_code != 200:
                    logger.warning(
                        f"Hugging Face API returned status {response.status_code}: {response.text[:200]}"
                    )
                    return None

                res_data = response.json()
                generated_text = ""
                if isinstance(res_data, list) and len(res_data) > 0:
                    generated_text = res_data[0].get("generated_text", "")
                elif isinstance(res_data, dict):
                    generated_text = res_data.get("generated_text", str(res_data))

                parsed = extract_and_parse_json(generated_text)
                if parsed:
                    return parsed
                else:
                    logger.warning(f"Could not parse valid JSON from HF response: {generated_text[:100]}")
                    return None

        except Exception as e:
            logger.warning(f"Hugging Face API request failed: {str(e)}")
            return None


huggingface_provider = HuggingFaceProvider()
