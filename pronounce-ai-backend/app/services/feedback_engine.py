from typing import Dict, Any, List


class FeedbackEngine:
    """Generates structured, actionable feedback summaries."""

    def generate_feedback_report(
        self,
        expected_text: str,
        transcript: str,
        scores: Dict[str, int],
        phoneme_errors: List[Dict[str, Any]],
        language: str = "en",
    ) -> Dict[str, Any]:
        overall = scores.get("overall", 0)
        word_acc = scores.get("word_accuracy", 0)
        phoneme_acc = scores.get("phoneme_accuracy", 0)
        fluency = scores.get("fluency", 0)

        strengths: List[str] = []
        weaknesses: List[str] = []
        tips: List[str] = []
        practice_targets: List[str] = []

        # 1. Evaluate Strengths
        if word_acc >= 90:
            strengths.append("High word recognition accuracy across the target phrase.")
        if phoneme_acc >= 85:
            strengths.append("Clear phoneme articulation and vowel clarity.")
        if fluency >= 85:
            strengths.append("Natural speaking speed and continuous rhythm.")

        if not strengths:
            strengths.append("Good effort submitting the target pronunciation.")

        # 2. Evaluate Weaknesses & Errors
        if word_acc < 80:
            weaknesses.append("Some target words were omitted or transcribed differently.")
        if phoneme_acc < 80:
            weaknesses.append("Pronunciation of specific vowel/consonant phonemes needs refining.")
        if fluency < 70:
            weaknesses.append("Speaking rate had noticeable pauses or hesitation.")

        # 3. Process Phoneme Errors into Practice Targets
        for error in phoneme_errors:
            exp_p = error.get("expected", "")
            det_p = error.get("detected", "")
            err_type = error.get("type", "substitution")

            if exp_p and exp_p not in practice_targets:
                practice_targets.append(f"/{exp_p}/")

            if err_type == "substitution" and exp_p and det_p:
                tips.append(f"Focus on the sound /{exp_p}/: avoid substituting it with /{det_p}/.")
            elif err_type == "deletion" and exp_p:
                tips.append(f"Ensure the final/medial consonant /{exp_p}/ is fully articulated.")

        if not tips:
            tips.append("Maintain steady breath support and light tongue contact on stressed syllables.")

        if not practice_targets:
            practice_targets = [expected_text]

        # 4. Generate Overall Summary
        if overall >= 85:
            summary = f"Excellent pronunciation of '{expected_text}'! Speech rhythm and phoneme clarity are near-native."
        elif overall >= 70:
            summary = f"Good attempt at '{expected_text}'. Minor adjustments to phoneme articulation will boost your score."
        else:
            summary = f"Practice required for '{expected_text}'. Focus on target phonemes and continuous flow."

        return {
            "summary": summary,
            "strengths": strengths,
            "weaknesses": weaknesses if weaknesses else ["Minor rhythm variation"],
            "tips": tips,
            "practice_targets": practice_targets[:5],
        }


feedback_engine = FeedbackEngine()
