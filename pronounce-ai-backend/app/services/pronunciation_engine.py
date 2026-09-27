from typing import Dict, Any, Optional
from app.services.pronunciation_ai import pronunciation_ai_service, PronunciationAIService
from app.services.meaning_service import meaning_service
from app.core.logging import logger

# Extended knowledge base / dictionary lookup table for key words across languages
DICTIONARY_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    # English
    "entrepreneur": {
        "ipa": "/ˌɒn.trə.prəˈnɜːr/",
        "syllables": ["en", "tre", "pre", "neur"],
        "stressed_syllable": "neur",
        "beginner_guide": "ahn-truh-pruh-NUR",
        "meaning": "A person who organizes and operates a business or businesses, taking on greater than normal financial risks to do so.",
        "common_mistakes": ["Pronouncing as 'enter-prenner'", "Stress on the first syllable"],
        "pronunciation_tip": "Nasal 'en' start, emphasis on the final 'neur' syllable.",
    },
    "pronunciation": {
        "ipa": "/prəˌnʌn.siˈeɪ.ʃən/",
        "syllables": ["pro", "nun", "ci", "a", "tion"],
        "stressed_syllable": "a",
        "beginner_guide": "pruh-nun-see-AY-shun",
        "meaning": "The way in which a word or language is spoken, or the manner in which someone utters a word.",
        "common_mistakes": ["Saying 'pro-NOUN-ciation' instead of 'pro-NUN-ciation'"],
        "pronunciation_tip": "Note the second syllable is 'nun' (rhymes with sun), not 'noun'.",
    },
    "algorithm": {
        "ipa": "/ˈæl.ɡə.rɪ.ðəm/",
        "syllables": ["al", "go", "rithm"],
        "stressed_syllable": "al",
        "beginner_guide": "AL-guh-ri-thum",
        "meaning": "A process or set of rules to be followed in calculations or other problem-solving operations, especially by a computer.",
        "common_mistakes": ["Pronouncing the 'th' as a hard 't' or 'd'"],
        "pronunciation_tip": "Stress the first syllable 'AL' and voice the soft 'th' gently.",
    },
    "conscience": {
        "ipa": "/ˈkɒn.ʃəns/",
        "syllables": ["con", "science"],
        "stressed_syllable": "con",
        "beginner_guide": "KON-shuns",
        "meaning": "An inner feeling or voice viewed as acting as a guide to the rightness or wrongness of one's behavior.",
        "common_mistakes": ["Pronouncing like the word 'science' ('con-science')"],
        "pronunciation_tip": "The second syllable sounds like 'shuns', not 'science'.",
    },
    "phenomenon": {
        "ipa": "/fɪˈnɒm.ɪ.nən/",
        "syllables": ["phe", "nom", "e", "non"],
        "stressed_syllable": "nom",
        "beginner_guide": "fuh-NOM-uh-non",
        "meaning": "A fact or situation that is observed to exist or happen, especially one whose cause or explanation is in question.",
        "common_mistakes": ["Swapping syllables like 'phenomenom'", "Stress on the first syllable"],
        "pronunciation_tip": "Place primary stress firmly on the second syllable 'NOM'.",
    },
    "serendipity": {
        "ipa": "/ˌser.ənˈdɪp.ə.ti/",
        "syllables": ["ser", "en", "dip", "i", "ty"],
        "stressed_syllable": "dip",
        "beginner_guide": "seh-run-DIP-i-tee",
        "meaning": "The occurrence and development of events by chance in a happy or beneficial way.",
        "common_mistakes": ["Rushing through the middle syllables"],
        "pronunciation_tip": "Stress the 'DIP' syllable cleanly with light unstressed vowels around it.",
    },
    # Telugu
    "నమస్కారం": {
        "ipa": "/nəməskaːrəm/",
        "syllables": ["న", "మ", "స్కా", "రం"],
        "stressed_syllable": "స్కా",
        "beginner_guide": "nuh-mus-KAR-um",
        "meaning": "Traditional Indian respectful greeting meaning 'I bow to you' in Telugu.",
        "common_mistakes": ["Mispronouncing 'ska' as 'sa'", "Dropping the final 'm' sound"],
        "pronunciation_tip": "Roll the 'r' lightly and stress the 'KAR' syllable.",
    },
    "ధన్యవాదాలు": {
        "ipa": "/dʱənjəʋaːdaːlu/",
        "syllables": ["ధ", "న్య", "వా", "దా", "లు"],
        "stressed_syllable": "వా",
        "beginner_guide": "dhun-yuh-VAH-dah-loo",
        "meaning": "Thank you / gratitude in Telugu.",
        "common_mistakes": ["Dropping the aspirated 'dh' sound"],
        "pronunciation_tip": "Pronounce the opening 'dh' with gentle breath from the chest.",
    },
    # Hindi
    "नमस्ते": {
        "ipa": "/nəməsteː/",
        "syllables": ["न", "मस्", "ते"],
        "stressed_syllable": "ते",
        "beginner_guide": "nuh-mus-TAY",
        "meaning": "A respectful greeting said when meeting or parting in Hindi.",
        "common_mistakes": ["Pronouncing 'te' as 'tee'", "Hard 't' instead of soft dental 't'"],
        "pronunciation_tip": "Use a soft dental 't' where the tongue touches the back of the front upper teeth.",
    },
    "namaste": {
        "ipa": "/nəməsteː/",
        "syllables": ["na", "mas", "te"],
        "stressed_syllable": "te",
        "beginner_guide": "nuh-mus-TAY",
        "meaning": "A respectful greeting said when meeting or parting in Hindi.",
        "common_mistakes": ["Pronouncing 'te' as 'tee'", "Hard 't' instead of soft dental 't'"],
        "pronunciation_tip": "Use a soft dental 't' where the tongue touches the back of the front upper teeth.",
    },
    "dhanyavaad": {
        "ipa": "/dʱənjəʋaːd̪/",
        "syllables": ["dhan", "ya", "vaad"],
        "stressed_syllable": "vaad",
        "beginner_guide": "dhun-yuh-VAAD",
        "meaning": "Thank you / expressing gratitude in Hindi.",
        "common_mistakes": ["Saying hard English 'd' instead of soft dental 'dh'"],
        "pronunciation_tip": "Soft dental 'd' with gentle aspiration.",
    },
    "namaskaram": {
        "ipa": "/nəməskaːrəm/",
        "syllables": ["na", "mas", "ka", "ram"],
        "stressed_syllable": "ka",
        "beginner_guide": "nuh-mus-KAR-um",
        "meaning": "Traditional Indian respectful greeting meaning 'I bow to you' in Telugu.",
        "common_mistakes": ["Mispronouncing 'ska' as 'sa'", "Dropping the final 'm' sound"],
        "pronunciation_tip": "Roll the 'r' lightly and stress the 'KAR' syllable.",
    },
    "ధన్యవాదాలు": {

        "ipa": "/dʱənjəʋaːdaːlu/",
        "syllables": ["ధ", "న్య", "వా", "దా", "లు"],
        "stressed_syllable": "వా",
        "beginner_guide": "dhun-yuh-VAH-dah-loo",
        "meaning": "Thank you / gratitude in Telugu.",
        "common_mistakes": ["Dropping the aspirated 'dh' sound"],
        "pronunciation_tip": "Pronounce the opening 'dh' with gentle breath from the chest.",
    },
    "धन्यवाद": {
        "ipa": "/dʱənjəʋaːd̪/",
        "syllables": ["धन", "य", "वाद"],
        "stressed_syllable": "वाद",
        "beginner_guide": "dhun-yuh-VAAD",
        "meaning": "Thank you / expressing gratitude in Hindi.",
        "common_mistakes": ["Saying hard English 'd' instead of soft dental 'dh'"],
        "pronunciation_tip": "Soft dental 'd' with gentle aspiration.",
    },

    "shukriya": {
        "ipa": "/ʃʊk.riː.jaː/",
        "syllables": ["shuk", "ri", "ya"],
        "stressed_syllable": "shuk",
        "beginner_guide": "shook-REE-yah",
        "meaning": "Thank you in Hindi/Urdu.",
        "common_mistakes": ["Pronouncing 'shuk' as 'shuck'"],
        "pronunciation_tip": "Short 'oo' sound in the first syllable.",
    },
    # Tamil
    "வணக்கம்": {
        "ipa": "/ʋɐɳɐkːɐm/",
        "syllables": ["வ", "ணக்", "கம்"],
        "stressed_syllable": "ணக்",
        "beginner_guide": "vah-NUK-kum",
        "meaning": "Traditional greeting of respect in Tamil.",
        "common_mistakes": ["Using alveolar 'n' instead of retroflex 'ண'"],
        "pronunciation_tip": "Curl the tongue back slightly for the retroflex 'na'.",
    },
    "vanakkam": {
        "ipa": "/ʋɐɳɐkːɐm/",
        "syllables": ["va", "nak", "kam"],
        "stressed_syllable": "nak",
        "beginner_guide": "vah-NUK-kum",
        "meaning": "Traditional greeting of respect in Tamil.",
        "common_mistakes": ["Saying 'van-a-kam' with flat vowels"],
        "pronunciation_tip": "Emphasis on the double 'kk' sound in the middle.",
    },
    # Japanese
    "こんにちは": {
        "ipa": "/kon.ni.tɕi.wa/",
        "syllables": ["こ", "ん", "に", "ち", "は"],
        "stressed_syllable": "ち",
        "beginner_guide": "kohn-nee-chee-wah",
        "meaning": "Hello / Good afternoon in Japanese.",
        "common_mistakes": ["Slurring the double 'n' sound", "Pronouncing 'ha' as 'ha' instead of 'wa'"],
        "pronunciation_tip": "Hold the double 'n' sound slightly longer before transitioning to 'chi'.",
    },
    "konnichiwa": {
        "ipa": "/kon.ni.tɕi.wa/",
        "syllables": ["kon", "ni", "chi", "wa"],
        "stressed_syllable": "chi",
        "beginner_guide": "kohn-nee-chee-wah",
        "meaning": "Hello / Good afternoon in Japanese.",
        "common_mistakes": ["Skipping the second 'n'"],
        "pronunciation_tip": "Two clear 'n' beats (morae) in kon-ni.",
    },
    "arigato": {
        "ipa": "/a.ɾi.ɡa.toː/",
        "syllables": ["a", "ri", "ga", "to"],
        "stressed_syllable": "ga",
        "beginner_guide": "ah-ree-GAH-toh",
        "meaning": "Thank you in Japanese.",
        "common_mistakes": ["Hard English 'r' instead of Japanese tap 'r'"],
        "pronunciation_tip": "Light tap with the tip of the tongue for 'r'.",
    },
    # French
    "bonjour": {
        "ipa": "/bɔ̃.ʒuʁ/",
        "syllables": ["bon", "jour"],
        "stressed_syllable": "jour",
        "beginner_guide": "boh-ZHOOR",
        "meaning": "Hello / Good day in French.",
        "common_mistakes": ["Pronouncing the final 'r' too hard", "Pronouncing hard 'j' instead of soft 'zh'"],
        "pronunciation_tip": "Soft 'zh' sound like the 's' in 'measure', with a nasal 'bon'.",
    },
    "merci": {
        "ipa": "/mɛʁ.si/",
        "syllables": ["mer", "ci"],
        "stressed_syllable": "ci",
        "beginner_guide": "mair-SEE",
        "meaning": "Thank you in French.",
        "common_mistakes": ["Pronouncing English 'mer-see'"],
        "pronunciation_tip": "Open 'air' vowel in the first syllable and light uvular 'r'.",
    },
    "au revoir": {
        "ipa": "/o.ʁə.vwaʁ/",
        "syllables": ["au", "re", "voir"],
        "stressed_syllable": "voir",
        "beginner_guide": "oh ruh-VWAR",
        "meaning": "Goodbye / Until we meet again in French.",
        "common_mistakes": ["Pronouncing the 'v' like 'w'"],
        "pronunciation_tip": "Clear 'oh' start, soft 'ruh', and crisp 'vwar'.",
    },
    # Spanish
    "hola": {
        "ipa": "/ˈo.la/",
        "syllables": ["ho", "la"],
        "stressed_syllable": "ho",
        "beginner_guide": "OH-lah",
        "meaning": "Hello in Spanish.",
        "common_mistakes": ["Pronouncing the silent 'h'"],
        "pronunciation_tip": "The 'h' is completely silent in Spanish.",
    },
    "gracias": {
        "ipa": "/ˈɡɾa.sjas/",
        "syllables": ["gra", "cias"],
        "stressed_syllable": "gra",
        "beginner_guide": "GRAH-syahs",
        "meaning": "Thank you in Spanish.",
        "common_mistakes": ["Hard English 'r'"],
        "pronunciation_tip": "Light single tap 'r' with the tongue tip.",
    },
    # German
    "danke": {
        "ipa": "/ˈdaŋ.kə/",
        "syllables": ["dan", "ke"],
        "stressed_syllable": "dan",
        "beginner_guide": "DAHN-kuh",
        "meaning": "Thank you in German.",
        "common_mistakes": ["Pronouncing 'ke' as 'kee'"],
        "pronunciation_tip": "Short schwa 'uh' sound at the end.",
    },
    "guten tag": {
        "ipa": "/ˌɡuː.tn̩ ˈtaːk/",
        "syllables": ["gu", "ten", "tag"],
        "stressed_syllable": "tag",
        "beginner_guide": "GOO-ten TAHK",
        "meaning": "Good day / Hello in German.",
        "common_mistakes": ["Pronouncing 'tag' with a soft English 'g'"],
        "pronunciation_tip": "Final 'g' in 'tag' sounds like a crisp 'k'.",
    },
}


class PronunciationEngine:
    """
    Pronunciation Knowledge Layer.
    Priority:
    1. Known pronunciation dictionary
    2. AI pronunciation analysis
    3. Rule-based fallback
    """

    def __init__(self, ai_service: Optional[PronunciationAIService] = None):
        self.ai_service = ai_service or pronunciation_ai_service

    async def get_pronunciation(self, text: str, language_code: str, language_name: str) -> Dict[str, Any]:
        clean_text = text.strip()
        lower_text = clean_text.lower()

        # 1. Check dictionary knowledge base (case-insensitive and exact)
        if lower_text in DICTIONARY_KNOWLEDGE_BASE:
            logger.info(f"Pronunciation dictionary match found for '{clean_text}'")
            entry = DICTIONARY_KNOWLEDGE_BASE[lower_text]
            return {
                "ipa": entry["ipa"],
                "syllables": entry["syllables"],
                "stressed_syllable": entry["stressed_syllable"],
                "beginner_guide": entry["beginner_guide"],
                "meaning": entry.get("meaning", f"Commonly used word/expression in {language_name}."),
                "common_mistakes": entry.get("common_mistakes", []),
                "pronunciation_tip": entry.get("pronunciation_tip", ""),
                "source": "dictionary",
            }
        elif clean_text in DICTIONARY_KNOWLEDGE_BASE:
            logger.info(f"Pronunciation dictionary exact match found for '{clean_text}'")
            entry = DICTIONARY_KNOWLEDGE_BASE[clean_text]
            return {
                "ipa": entry["ipa"],
                "syllables": entry["syllables"],
                "stressed_syllable": entry["stressed_syllable"],
                "beginner_guide": entry["beginner_guide"],
                "meaning": entry.get("meaning", f"Commonly used word/expression in {language_name}."),
                "common_mistakes": entry.get("common_mistakes", []),
                "pronunciation_tip": entry.get("pronunciation_tip", ""),
                "source": "dictionary",
            }

        # 2. Try AI Pronunciation analysis (handles meaning & phonetic breakdown for any arbitrary word)
        logger.info(f"Requesting AI pronunciation analysis for '{clean_text}' ({language_name})")
        ai_res = await self.ai_service.analyze(clean_text, language_name)
        if ai_res and ai_res.get("ipa"):
            meaning = ai_res.get("meaning", "").strip() or f"Word or phrase in {language_name}."
            return {
                "ipa": ai_res["ipa"],
                "syllables": ai_res["syllables"],
                "stressed_syllable": ai_res["stressed_syllable"],
                "beginner_guide": ai_res["beginner_guide"],
                "meaning": meaning,
                "common_mistakes": ai_res.get("common_mistakes", []),
                "pronunciation_tip": ai_res.get("pronunciation_tip", ""),
                "source": "ai",
            }

        # 3. Rule-based fallback if dictionary & AI are unavailable
        logger.warning(f"Using rule fallback for '{clean_text}' ({language_name})")
        syllable_chunks = [clean_text[i:i+3] for i in range(0, len(clean_text), 3)]
        resolved_meaning = await meaning_service.get_meaning(clean_text, language_code, language_name)
        return {
            "ipa": f"/{clean_text}/",
            "syllables": syllable_chunks if syllable_chunks else [clean_text],
            "stressed_syllable": syllable_chunks[0] if syllable_chunks else clean_text,
            "beginner_guide": "-".join(syllable_chunks) if syllable_chunks else clean_text,
            "meaning": resolved_meaning,
            "common_mistakes": [f"Pay attention to native cadence and vowel sounds in {language_name}."],
            "pronunciation_tip": f"Listen to the audio player to hear native pitch and intonation.",
            "source": "fallback",
        }


pronunciation_engine = PronunciationEngine()
