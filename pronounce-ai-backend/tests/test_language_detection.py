import pytest
from app.services.language_detector import language_detector


def test_language_detection_indic_telugu():
    res = language_detector.detect_language("నమస్కారం", "auto")
    assert res.language_code == "te"
    assert res.language == "Telugu"
    assert res.method == "script_inspection"


def test_language_detection_indic_hindi():
    res = language_detector.detect_language("नमस्ते", "auto")
    assert res.language_code == "hi"
    assert res.language == "Hindi"
    assert res.method == "script_inspection"


def test_language_detection_cjk_japanese():
    res = language_detector.detect_language("こんにちは", "auto")
    assert res.language_code == "ja"
    assert res.language == "Japanese"
    assert res.method == "script_inspection"


def test_language_detection_french():
    res = language_detector.detect_language("Bonjour tout le monde", "auto")
    assert res.language_code == "fr"
    assert res.language == "French"


def test_language_detection_user_specified_override():
    res = language_detector.detect_language("Hello", requested_lang="te")
    assert res.language_code == "te"
    assert res.method == "user_specified"
