import urllib.request
import urllib.parse
import json
import asyncio
from typing import Optional, Dict, Any, List
from app.core.logging import logger

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Extended local meanings for immediate sub-millisecond response
MULTILINGUAL_MEANINGS: Dict[str, str] = {
    # French
    "bonjour": "Hello / Good day in French.",
    "bonsoir": "Good evening in French.",
    "merci": "Thank you in French.",
    "au revoir": "Goodbye / Until we meet again in French.",
    "s'il vous plait": "Please in French.",
    "oui": "Yes in French.",
    "non": "No in French.",
    "croissant": "A buttery, flaky, crescent-shaped French pastry.",
    "baguette": "A long, thin loaf of French bread with a crisp crust.",
    "rendezvous": "A meeting at an agreed time and place.",
    "château": "A large French country house or castle.",
    "monsieur": "A title or form of address used to a French-speaking man (Mister/Sir).",
    "madame": "A title or form of address used to a married French-speaking woman.",
    "cliché": "A phrase or opinion that is overused and betrays a lack of original thought.",
    "déjà vu": "A feeling of having already experienced the present situation.",
    
    # Spanish
    "hola": "Hello in Spanish.",
    "adios": "Goodbye in Spanish.",
    "adiós": "Goodbye in Spanish.",
    "gracias": "Thank you in Spanish.",
    "por favor": "Please in Spanish.",
    "amigo": "Friend in Spanish.",
    "buenos dias": "Good morning in Spanish.",
    "buenas noches": "Good night in Spanish.",
    "señor": "Mister, sir, or a gentleman in Spanish.",
    "fiesta": "A festival, party, or celebration.",
    "hasta luego": "See you later in Spanish.",
    "de nada": "You're welcome / No problem in Spanish.",
    
    # German
    "danke": "Thank you in German.",
    "bitte": "Please / You're welcome in German.",
    "guten tag": "Good day / Hello in German.",
    "guten morgen": "Good morning in German.",
    "auf wiedersehen": "Goodbye in German.",
    "tschüss": "Bye / See you in German.",
    "schön": "Beautiful, lovely, or nice in German.",
    "gesundheit": "Used to wish good health to someone who has sneezed.",
    "zeitgeist": "The defining spirit or mood of a particular period of history.",
    "wunderbar": "Wonderful / marvelous in German.",
    
    # Italian
    "ciao": "Hello or goodbye in Italian.",
    "grazie": "Thank you in Italian.",
    "prego": "You're welcome / Please in Italian.",
    "buongiorno": "Good morning / Good day in Italian.",
    "arrivederci": "Goodbye in Italian.",
    
    # Hindi / Urdu
    "नमस्ते": "A respectful greeting meaning 'I bow to the divine in you' in Hindi.",
    "namaste": "A respectful greeting meaning 'I bow to the divine in you' in Hindi.",
    "धन्यवाद": "Thank you / expressing sincere gratitude in Hindi.",
    "dhanyavaad": "Thank you / expressing sincere gratitude in Hindi.",
    "shukriya": "Thank you in Hindi/Urdu.",
    "kya hal hai": "How are you? in Hindi.",
    "aap kaise hain": "How are you? (formal/respectful) in Hindi.",
    "bahut accha": "Very good / excellent in Hindi.",
    "alvida": "Goodbye / farewell in Hindi/Urdu.",
    
    # Telugu
    "నమస్కారం": "Traditional Indian respectful greeting meaning 'I bow to you' in Telugu.",
    "namaskaram": "Traditional Indian respectful greeting meaning 'I bow to you' in Telugu.",
    "ధన్యవాదాలు": "Thank you / sincere expression of gratitude in Telugu.",
    "dhanyavadalu": "Thank you / sincere expression of gratitude in Telugu.",
    "బాగున్నారా": "Are you doing well? in Telugu.",
    "bagunnara": "Are you doing well? in Telugu.",
    "మీరు ఎలా ఉన్నారు": "How are you? (formal/polite) in Telugu.",
    "selavu": "Goodbye / taking leave in Telugu.",
    
    # Tamil
    "வணக்கம்": "Traditional greeting of respect in Tamil.",
    "vanakkam": "Traditional greeting of respect in Tamil.",
    "நன்றி": "Thank you in Tamil.",
    "nandri": "Thank you in Tamil.",
    
    # Japanese
    "こんにちは": "Hello / Good afternoon in Japanese.",
    "konnichiwa": "Hello / Good afternoon in Japanese.",
    "ありがとう": "Thank you in Japanese.",
    "arigato": "Thank you in Japanese.",
    "arigatou": "Thank you in Japanese.",
    "さようなら": "Goodbye / Farewell in Japanese.",
    "sayonara": "Goodbye / Farewell in Japanese.",
    "kawaii": "Cute, lovely, or charming in Japanese.",
    
    # Korean
    "안녕하세요": "Hello / Good day (polite) in Korean.",
    "annyeonghaseyo": "Hello / Good day (polite) in Korean.",
    "감사합니다": "Thank you (formal/polite) in Korean.",
    "kamsahamnida": "Thank you (formal/polite) in Korean.",
    "saranghae": "I love you in Korean.",
    
    # Arabic
    "مرحبا": "Hello / Welcome in Arabic.",
    "marhaban": "Hello / Welcome in Arabic.",
    "شكرا": "Thank you in Arabic.",
    "shukran": "Thank you in Arabic.",
    "salam": "Peace / Hello in Arabic.",
}


class MeaningService:
    """Universal Meaning & Translation Engine supporting all languages and translatable definitions."""

    def __init__(self):
        self.timeout = 3.5

    def translate_text_sync(self, text: str, target_lang: str = "en", source_lang: str = "auto") -> str:
        """Synchronously translate any text into target_lang using Google Translate GTX."""
        if not text or not text.strip() or target_lang == source_lang or target_lang == "auto":
            return text
        
        clean = text.strip()
        url = (
            f"https://translate.googleapis.com/translate_a/single?client=gtx&sl={source_lang}&tl={target_lang}&dt=t&q="
            + urllib.parse.quote(clean)
        )
        req = urllib.request.Request(url, headers=HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data and data[0]:
                    translated = "".join([part[0] for part in data[0] if part and part[0]]).strip()
                    if translated:
                        return translated
        except Exception as e:
            logger.warning(f"Translation to '{target_lang}' failed: {str(e)}")
        return text

    async def translate_text(self, text: str, target_lang: str = "en", source_lang: str = "auto") -> str:
        """Asynchronously translate any text into target_lang."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.translate_text_sync, text, target_lang, source_lang)

    def _resolve_meaning_sync(self, word: str, language_code: str = "auto", language_name: str = "English", target_lang: str = "en") -> str:
        clean = word.strip()
        if not clean:
            return ""

        lower = clean.lower()

        # 1. Check local high-priority dictionary for instant response
        if lower in MULTILINGUAL_MEANINGS:
            val = MULTILINGUAL_MEANINGS[lower]
            if target_lang != "en":
                return self.translate_text_sync(val, target_lang=target_lang, source_lang="en")
            return val
        if clean in MULTILINGUAL_MEANINGS:
            val = MULTILINGUAL_MEANINGS[clean]
            if target_lang != "en":
                return self.translate_text_sync(val, target_lang=target_lang, source_lang="en")
            return val

        definition_found: Optional[str] = None

        # 2. Universal Dictionary & Translation Resolution (Google GTX)
        url = (
            f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&dt=bd&dt=md&dt=ss&dt=ex&q="
            + urllib.parse.quote(clean)
        )
        req = urllib.request.Request(url, headers=HEADERS)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))

                # Check direct dictionary definitions (Section 11/12)
                for section in data:
                    if isinstance(section, list) and section and isinstance(section[0], list):
                        if len(section[0]) >= 2 and isinstance(section[0][0], str) and section[0][0] in (
                            "noun", "verb", "adjective", "adverb", "interjection", "pronoun", "preposition", "conjunction"
                        ):
                            for pos_entry in section:
                                if len(pos_entry) >= 2 and isinstance(pos_entry[1], list) and pos_entry[1]:
                                    for def_item in pos_entry[1]:
                                        if isinstance(def_item, list) and def_item and isinstance(def_item[0], str):
                                            d = def_item[0].strip()
                                            if d and len(d) > 5:
                                                definition_found = d[0].upper() + d[1:].rstrip(".") + "."
                                                break
                                if definition_found:
                                    break
                    if definition_found:
                        break

                # Check translated meaning if source was non-English
                if not definition_found:
                    translated_en = "".join([part[0] for part in data[0] if part and part[0]]).strip()
                    detected_src = data[2] if len(data) > 2 and isinstance(data[2], str) else ""

                    if translated_en and (translated_en.lower() != clean.lower() or (detected_src and detected_src not in ("en", ""))):
                        lang_label = language_name if language_name and language_name.lower() != "auto" else (detected_src.upper() if detected_src else "original language")
                        definition_found = f'"{clean}" means "{translated_en}" in {lang_label}.'
                    elif len(data) > 1 and data[1]:
                        parts = []
                        for item in data[1][:2]:
                            pos = item[0]
                            terms = ", ".join(item[1][:3])
                            parts.append(f"({pos}) {terms}")
                        if parts:
                            definition_found = "; ".join(parts) + "."

        except Exception as e:
            logger.debug(f"Universal dictionary lookup error for '{clean}': {str(e)}")

        # 3. Datamuse / WordNet English fallback
        if not definition_found:
            try:
                dm_url = f"https://api.datamuse.com/words?sp={urllib.parse.quote(clean)}&md=d&max=1"
                dm_req = urllib.request.Request(dm_url, headers=HEADERS)
                with urllib.request.urlopen(dm_req, timeout=2.0) as resp:
                    dm_data = json.loads(resp.read().decode("utf-8"))
                    if dm_data and dm_data[0].get("defs"):
                        raw = dm_data[0]["defs"][0]
                        d_str = raw.split("\t", 1)[1] if "\t" in raw else raw
                        definition_found = d_str.strip().rstrip(".") + "."
            except Exception:
                pass

        # 4. Fallback description
        if not definition_found:
            if language_name and language_name.lower() != "english":
                definition_found = f"Vocabulary term or expression in {language_name}."
            else:
                definition_found = f"A word or expression in English."

        # Translate the definition if target language is specified
        if target_lang != "en":
            return self.translate_text_sync(definition_found, target_lang=target_lang, source_lang="en")

        return definition_found

    async def get_meaning(self, text: str, language_code: str = "auto", language_name: str = "English", target_lang: str = "en") -> str:
        """Asynchronously resolve meaning for any word in any language, translatable to target_lang."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._resolve_meaning_sync, text, language_code, language_name, target_lang)


meaning_service = MeaningService()
