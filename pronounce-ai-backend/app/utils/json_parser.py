import json
import re
from typing import Dict, Any, Optional
from app.core.logging import logger


def extract_and_parse_json(text: str) -> Optional[Dict[str, Any]]:
    """
    Safely extracts and parses a JSON object from text output.
    Handles Markdown code blocks, leading/trailing prose, and minor JSON format anomalies.
    Never uses unsafe eval().
    """
    if not text:
        return None

    cleaned = text.strip()

    # 1. Try direct JSON parsing
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 2. Try extracting from ```json ... ``` code fence
    fence_pattern = r"```(?:json)?\s*(\{.*?\})\s*```"
    match = re.search(fence_pattern, cleaned, re.DOTALL | re.IGNORECASE)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # 3. Find first '{' and last '}'
    start_idx = cleaned.find("{")
    end_idx = cleaned.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        json_str = cleaned[start_idx : end_idx + 1]
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse extracted JSON block: {e}")

    return None
