import re
from typing import List, Tuple, Dict, Any
from app.services.pronunciation_engine import DICTIONARY_KNOWLEDGE_BASE


def text_to_simple_phonemes(text: str) -> List[str]:
    """
    Converts text to an ordered list of phoneme/syllable strings.
    Utilizes known dictionary entries if available, or rule-based grapheme-to-phoneme chunks.
    """
    clean = re.sub(r"[^\w\s]", "", text.strip().lower())
    if not clean:
        return []

    words = clean.split()
    phonemes: List[str] = []

    for word in words:
        if word in DICTIONARY_KNOWLEDGE_BASE:
            ipa = DICTIONARY_KNOWLEDGE_BASE[word].get("ipa", "")
            # Extract clean IPA characters
            cleaned_ipa = re.sub(r"[/\.\ˈ\ˌ]", "", ipa)
            if cleaned_ipa:
                phonemes.extend(list(cleaned_ipa))
                continue

        # Rule fallback: grapheme chunks as phoneme units
        for char in word:
            phonemes.append(char)

    return phonemes


def align_phonemes(expected_phonemes: List[str], spoken_phonemes: List[str]) -> Tuple[float, List[Dict[str, Any]]]:
    """
    Performs dynamic programming Levenshtein alignment between expected and spoken phonemes.
    Returns (similarity_score_percentage, list_of_mismatch_feedback).
    """
    if not expected_phonemes:
        return 100.0, []

    if not spoken_phonemes:
        # User spoke nothing
        mismatches = [
            {
                "type": "phoneme",
                "expected": expected_phonemes[0] if expected_phonemes else "",
                "detected": "",
                "position": 0,
                "severity": "severe",
                "message": "No spoken audio detected for expected phrase.",
            }
        ]
        return 0.0, mismatches

    m = len(expected_phonemes)
    n = len(spoken_phonemes)

    # DP matrix for Levenshtein distance
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if expected_phonemes[i - 1] == spoken_phonemes[j - 1]:
                cost = 0
            else:
                cost = 1
            dp[i][j] = min(
                dp[i - 1][j] + 1,      # Deletion
                dp[i][j - 1] + 1,      # Insertion
                dp[i - 1][j - 1] + cost  # Substitution
            )

    distance = dp[m][n]
    max_len = max(m, n)
    accuracy = max(0.0, min(100.0, round((1.0 - distance / max_len) * 100, 1)))

    mismatches: List[Dict[str, Any]] = []
    # Traceback mismatch locations
    i, j = m, n
    while i > 0 or j > 0:
        if i > 0 and j > 0 and expected_phonemes[i - 1] == spoken_phonemes[j - 1]:
            i -= 1
            j -= 1
        elif i > 0 and j > 0 and dp[i][j] == dp[i - 1][j - 1] + 1:
            exp_p = expected_phonemes[i - 1]
            det_p = spoken_phonemes[j - 1]
            mismatches.append({
                "type": "substitution",
                "expected": exp_p,
                "detected": det_p,
                "position": i - 1,
                "severity": "moderate",
                "message": f"Sound substitution: Expected '{exp_p}', but detected '{det_p}'. Focus on correct tongue placement.",
            })
            i -= 1
            j -= 1
        elif i > 0 and (j == 0 or dp[i][j] == dp[i - 1][j] + 1):
            exp_p = expected_phonemes[i - 1]
            mismatches.append({
                "type": "deletion",
                "expected": exp_p,
                "detected": "",
                "position": i - 1,
                "severity": "severe",
                "message": f"Omitted sound: Expected '{exp_p}' was not clearly pronounced.",
            })
            i -= 1
        else:
            det_p = spoken_phonemes[j - 1]
            mismatches.append({
                "type": "insertion",
                "expected": "",
                "detected": det_p,
                "position": i,
                "severity": "minor",
                "message": f"Extra sound '{det_p}' inserted.",
            })
            j -= 1

    mismatches.reverse()
    return accuracy, mismatches[:3]  # Top actionable feedback items



class PhonemeAnalyzer:
    """Service for phoneme representation and alignment."""

    def analyze(self, expected_text: str, spoken_transcript: str) -> Dict[str, Any]:
        exp_phonemes = text_to_simple_phonemes(expected_text)
        spoken_phonemes = text_to_simple_phonemes(spoken_transcript)

        accuracy, feedback_items = align_phonemes(exp_phonemes, spoken_phonemes)

        return {
            "phoneme_accuracy": accuracy,
            "feedback": feedback_items,
            "expected_phonemes": exp_phonemes,
            "spoken_phonemes": spoken_phonemes,
        }


phoneme_analyzer = PhonemeAnalyzer()
