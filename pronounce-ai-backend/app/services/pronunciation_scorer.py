import re
from typing import Dict, Any, List
from app.core.config import settings
from app.services.phoneme_analyzer import phoneme_analyzer
from app.services.feedback_engine import feedback_engine
from app.schemas.practice import (
    PracticeResponse,
    ScoresDetail,
    FeedbackItem,
    FeedbackReport,
    AnalysisMetadata,
)


def compute_word_accuracy(expected: str, spoken: str) -> float:
    """Computes word-level accuracy using Levenshtein distance on word lists."""
    exp_words = re.sub(r"[^\w\s]", "", expected.lower()).split()
    spk_words = re.sub(r"[^\w\s]", "", spoken.lower()).split()

    if not exp_words:
        return 100.0
    if not spk_words:
        return 0.0

    m, n = len(exp_words), len(spk_words)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            cost = 0 if exp_words[i - 1] == spk_words[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)

    distance = dp[m][n]
    max_len = max(m, n)
    return max(0.0, min(100.0, round((1.0 - distance / max_len) * 100.0, 1)))


class PronunciationScorerService:
    """Pronunciation Scorer calculating weighted metrics and structured feedback."""

    def score_practice(
        self,
        expected_text: str,
        stt_result: Dict[str, Any],
        language: str = "en",
    ) -> PracticeResponse:
        spoken_transcript = stt_result.get("transcript", "")
        engine = stt_result.get("engine", "faster-whisper")
        status = stt_result.get("status", "available")

        # 1. Word Accuracy
        word_acc = compute_word_accuracy(expected_text, spoken_transcript)

        # 2. Phoneme Accuracy & Feedback Items
        phoneme_res = phoneme_analyzer.analyze(expected_text, spoken_transcript)
        phoneme_acc = phoneme_res["phoneme_accuracy"]
        feedback_raw = phoneme_res["feedback"]

        # 3. Stress Score (estimated text-level syllable stress heuristic)
        stress_score = max(50.0, min(100.0, round(word_acc * 0.8 + 20.0, 1)))

        # 4. Fluency Score (words-per-minute & duration calculation)
        words_data = stt_result.get("words", [])
        if words_data and len(words_data) > 1:
            total_duration = words_data[-1]["end"] - words_data[0]["start"]
            wpm = (len(words_data) / max(total_duration, 0.5)) * 60.0
            if 100 <= wpm <= 180:
                fluency_score = 95.0
            else:
                fluency_score = max(60.0, round(100.0 - abs(140.0 - wpm) * 0.3, 1))
        else:
            fluency_score = max(60.0, round(word_acc * 0.85, 1))

        # 5. Weighted Overall Score
        w_word = settings.WEIGHT_WORD_ACCURACY
        w_phoneme = settings.WEIGHT_PHONEME_ACCURACY
        w_stress = settings.WEIGHT_STRESS
        w_fluency = settings.WEIGHT_FLUENCY

        weighted_overall = (
            word_acc * w_word
            + phoneme_acc * w_phoneme
            + stress_score * w_stress
            + fluency_score * w_fluency
        )
        overall_int = int(round(weighted_overall))

        scores_dict = {
            "overall": overall_int,
            "word_accuracy": int(round(word_acc)),
            "phoneme_accuracy": int(round(phoneme_acc)),
            "stress": int(round(stress_score)),
            "fluency": int(round(fluency_score)),
        }

        # Build feedback list
        feedback_list: List[FeedbackItem] = [FeedbackItem(**fb) for fb in feedback_raw]

        # Generate structured AI feedback report
        report_dict = feedback_engine.generate_feedback_report(
            expected_text=expected_text,
            transcript=spoken_transcript,
            scores=scores_dict,
            phoneme_errors=feedback_raw,
            language=language,
        )

        return PracticeResponse(
            transcript=spoken_transcript or (expected_text if engine == "fallback" else spoken_transcript),
            expected_text=expected_text,
            scores=ScoresDetail(**scores_dict),
            feedback=feedback_list,
            report=FeedbackReport(**report_dict),
            analysis=AnalysisMetadata(
                transcription_engine=engine,
                transcription_status=status,
                scoring_method="deterministic",
                phoneme_analysis="estimated",
                stress_analysis="estimated",
            ),
        )


pronunciation_scorer_service = PronunciationScorerService()
