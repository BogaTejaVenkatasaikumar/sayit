import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle, Play, Pause, Sparkles, BookOpen, Globe, Languages, Sun, Moon } from "lucide-react";
import { pronounce, translateText, audioUrl } from "../services/api";
import { LOGO_LIGHT, LOGO_DARK } from "../assets/logos";

// ── SayIt Brand Logo Component (Pixel-Perfect from uploaded brandmark) ────────
function SayItLogo({ isDark }) {
  return (
    <div className="flex items-center select-none py-0.5">
      <img
        src={isDark ? LOGO_DARK : LOGO_LIGHT}
        alt="sayit"
        className="h-7 w-auto object-contain pointer-events-none"
      />
    </div>
  );
}

// ── Audio Player for popup ───────────────────────────────────────────────────
function MiniPlayer({ src, text, langCode, isDark }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);

  const speakFallback = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (langCode) u.lang = langCode;
      u.rate = 0.9;
      u.onend = () => setPlaying(false);
      u.onerror = () => setPlaying(false);
      setPlaying(true);
      window.speechSynthesis.speak(u);
    }
  };

  const toggle = () => {
    if (src) {
      if (!ref.current) return;
      if (playing) {
        ref.current.pause();
        setPlaying(false);
      } else {
        const p = ref.current.play();
        if (p !== undefined) {
          p.then(() => setPlaying(true)).catch((err) => {
            console.warn("Audio element failed, falling back to speech synthesis:", err);
            speakFallback();
          });
        }
      }
    } else {
      speakFallback();
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onEnd = () => setPlaying(false);
    el.addEventListener("ended", onEnd);
    return () => el.removeEventListener("ended", onEnd);
  }, [src]);

  return (
    <div className="flex items-center gap-2.5">
      {src && <audio ref={ref} src={src} preload="metadata" />}
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 text-white text-xs font-bold px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm shadow-orange-500/20 active:scale-95"
      >
        {playing ? <Pause size={12} /> : <Play size={12} />}
        {playing ? "Pause" : "Play Voice"}
      </button>
      <span className={`text-xs font-medium ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
        {src ? "Native audio" : "Browser voice"}
      </span>
    </div>
  );
}

// ── Language list with Auto-Detect as default ────────────────────────────────
const LANGUAGES = [
  { code: "auto", name: "✨ Auto-Detect Language" },
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "te", name: "Telugu" },
  { code: "ta", name: "Tamil" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "bn", name: "Bengali" },
  { code: "ar", name: "Arabic" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
];

// ── Translatable Meaning Languages ──────────────────────────────────────────
const MEANING_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "es", name: "Español (Spanish)" },
  { code: "fr", name: "Français (French)" },
  { code: "de", name: "Deutsch (German)" },
  { code: "ja", name: "日本語 (Japanese)" },
  { code: "zh", name: "中文 (Chinese)" },
  { code: "ar", name: "العربية (Arabic)" },
];

// ── Main Popup ────────────────────────────────────────────────────────────────
export default function Popup() {
  const [word, setWord] = useState("");
  const [language, setLanguage] = useState("auto");
  const [status, setStatus] = useState("idle"); // idle | loading | result | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Theme state: dark (Orange & Black) | light (Orange & White)
  const [theme, setTheme] = useState(() => localStorage.getItem("sayit_theme") || "dark");
  const isDark = theme === "dark";

  // Translatable meaning state
  const [meaningLang, setMeaningLang] = useState("en");
  const [translatedMeaning, setTranslatedMeaning] = useState("");
  const [isTranslatingMeaning, setIsTranslatingMeaning] = useState(false);

  // Toggle Theme
  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("sayit_theme", next);
  };

  // On mount: check if a word was pre-selected via context menu
  useEffect(() => {
    try {
      if (typeof chrome !== "undefined" && chrome.storage?.session) {
        chrome.storage.session.get("pendingWord", ({ pendingWord }) => {
          if (pendingWord) {
            setWord(pendingWord);
            chrome.storage.session.remove("pendingWord");
            handlePronounce(pendingWord, "auto");
          }
        });
      }
    } catch {
      // Not in extension context
    }
  }, []);

  const handlePronounce = async (text = word, lang = language) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setStatus("loading");
    setError(null);
    setResult(null);
    setMeaningLang("en");
    setTranslatedMeaning("");
    try {
      const data = await pronounce({ text: trimmed, language: lang });
      setResult({ ...data, searchText: trimmed });
      setStatus("result");
    } catch (err) {
      setError(err.message || "Failed to analyze word");
      setStatus("error");
    }
  };

  const handleMeaningLanguageChange = async (targetLang) => {
    setMeaningLang(targetLang);
    const baseMeaning = result?.meaning;
    if (!baseMeaning) return;

    if (targetLang === "en") {
      setTranslatedMeaning("");
      return;
    }

    setIsTranslatingMeaning(true);
    try {
      const res = await translateText({
        text: baseMeaning,
        target_language: targetLang,
        source_language: "auto",
      });
      setTranslatedMeaning(res.translated_text || res.translated || "");
    } catch (err) {
      console.warn("Translation failed:", err);
    } finally {
      setIsTranslatingMeaning(false);
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setMeaningLang("en");
    setTranslatedMeaning("");
  };

  // Extract result fields
  const langName = typeof result?.language === "object" ? result.language?.name : (result?.language_name || result?.language);
  const langCode = typeof result?.language === "object" ? result.language?.code : result?.language_code;
  const ipa = result?.pronunciation?.ipa || result?.ipa;
  const syllables = result?.pronunciation?.syllables || result?.syllables || [];
  const stressedSyllable = result?.pronunciation?.stressed_syllable || result?.stressed_syllable;
  const beginnerGuide = result?.pronunciation?.beginner_guide || result?.beginner_guide;
  const meaning = result?.meaning;

  return (
    <div
      id="popup-root"
      className={`w-[400px] flex flex-col font-sans transition-colors duration-200 ${
        isDark ? "bg-[#0f0f11] text-white" : "bg-white text-neutral-900 border border-neutral-200"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b sticky top-0 z-10 ${
          isDark
            ? "border-neutral-800/90 bg-[#16161a]/95 backdrop-blur-sm"
            : "border-neutral-200 bg-neutral-50/95 backdrop-blur-sm"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <SayItLogo isDark={isDark} />
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            isDark
              ? "bg-neutral-800 text-amber-400 hover:bg-neutral-700 border border-neutral-700"
              : "bg-neutral-200/90 text-neutral-800 hover:bg-neutral-300 border border-neutral-300"
          }`}
          title={isDark ? "Switch to Orange & White" : "Switch to Orange & Black"}
        >
          {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-neutral-700" />}
          <span>{isDark ? "Light" : "Dark"}</span>
        </button>
      </div>

      {/* Search Input & Language Selector */}
      <div
        className={`px-4 py-3 flex flex-col gap-2.5 border-b ${
          isDark ? "border-neutral-800/90 bg-[#141417]" : "border-neutral-200 bg-neutral-50"
        }`}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={word}
            onChange={(e) => {
              setWord(e.target.value);
              if (status !== "idle") reset();
            }}
            onKeyDown={(e) => e.key === "Enter" && handlePronounce()}
            placeholder='Enter any word e.g. "entrepreneur", "bonjour"…'
            className={`flex-1 rounded-xl px-3.5 py-2 text-sm focus:outline-none transition-colors border ${
              isDark
                ? "bg-[#1d1d22] border-neutral-700 text-white placeholder-neutral-500 focus:border-orange-500"
                : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-orange-500"
            }`}
            autoFocus
          />
          <button
            onClick={() => handlePronounce()}
            disabled={!word.trim() || status === "loading"}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-orange-500/20 active:scale-95"
          >
            {status === "loading" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <span className="text-xs">🔊</span>
            )}
            {status === "loading" ? "Analyzing" : "SayIt"}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <Globe size={13} className={isDark ? "text-neutral-400 shrink-0" : "text-neutral-500 shrink-0"} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`w-full text-xs rounded-lg px-2.5 py-1.5 focus:outline-none transition-colors cursor-pointer border ${
              isDark
                ? "bg-[#1d1d22] border-neutral-700 text-neutral-200 focus:border-orange-500"
                : "bg-white border-neutral-300 text-neutral-800 focus:border-orange-500"
            }`}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin flex items-center justify-center">
            <Sparkles size={16} className="text-orange-400" />
          </div>
          <span className={`text-xs font-medium ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
            Detecting language &amp; pronunciation…
          </span>
        </div>
      )}

      {/* Error State */}
      {status === "error" && (
        <div className="px-4 py-4 flex flex-col gap-3">
          <div className="flex gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-rose-400 font-semibold">Could not analyze pronunciation</p>
              <p className="text-xs text-neutral-400 mt-0.5">{error}</p>
              <p className="text-[11px] text-neutral-500 mt-1">Make sure FastAPI is running at http://127.0.0.1:8000</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors text-center"
          >
            Try again
          </button>
        </div>
      )}

      {/* Result Display */}
      {status === "result" && result && (
        <div className="flex flex-col max-h-[420px] overflow-y-auto">
          {/* Word Header & Detected Language */}
          <div
            className={`px-4 py-3.5 flex flex-col gap-1.5 border-b ${
              isDark ? "border-neutral-800/90 bg-[#17171c]" : "border-neutral-200 bg-orange-50/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className={`text-xl font-extrabold tracking-tight truncate ${isDark ? "text-white" : "text-neutral-900"}`}>
                {result.text || result.word || result.searchText}
              </h2>
              {langName && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 border ${
                  isDark
                    ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                    : "bg-orange-100 text-orange-800 border-orange-200"
                }`}>
                  <Sparkles size={10} className="text-orange-500" />
                  {langName} {langCode && `(${langCode})`}
                </span>
              )}
            </div>

            {/* IPA & Guide */}
            <div className="flex items-center gap-3 flex-wrap">
              {ipa && (
                <span className="font-mono text-base font-bold text-orange-500">
                  {ipa}
                </span>
              )}
              {beginnerGuide && (
                <span className={`text-xs font-mono px-2 py-0.5 rounded-md border ${
                  isDark
                    ? "text-neutral-300 bg-neutral-800 border-neutral-700"
                    : "text-neutral-700 bg-white border-neutral-300"
                }`}>
                  {beginnerGuide}
                </span>
              )}
            </div>
          </div>

          {/* Audio Player */}
          <div className={`px-4 py-2.5 border-b ${isDark ? "border-neutral-800/90 bg-[#121215]" : "border-neutral-200 bg-white"}`}>
            <MiniPlayer
              src={result.audio?.url ? audioUrl(result.audio.url) : null}
              text={result.text || result.word || result.searchText}
              langCode={langCode}
              isDark={isDark}
            />
          </div>

          {/* Meaning / Definition with Translation */}
          {meaning && (
            <div className={`px-4 py-3 border-b ${isDark ? "border-neutral-800/90 bg-[#17171c]" : "border-neutral-200 bg-neutral-50/70"}`}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  <BookOpen size={12} className="text-orange-500" />
                  Meaning
                </div>
                {/* Language Switcher for Definition */}
                <div className="flex items-center gap-1">
                  <Languages size={11} className={isDark ? "text-neutral-400" : "text-neutral-500"} />
                  <select
                    value={meaningLang}
                    onChange={(e) => handleMeaningLanguageChange(e.target.value)}
                    className={`text-[11px] font-semibold rounded-md px-2.5 py-0.5 border focus:outline-none transition-colors cursor-pointer ${
                      isDark
                        ? "bg-[#1d1d22] text-orange-400 border-neutral-700 focus:border-orange-500"
                        : "bg-white text-orange-700 border-neutral-300 focus:border-orange-500"
                    }`}
                    title="Translate meaning to another language"
                  >
                    {MEANING_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isTranslatingMeaning ? (
                <div className="flex items-center gap-2 py-1 text-xs text-neutral-400">
                  <Loader2 size={12} className="animate-spin text-orange-400" />
                  <span>Translating meaning...</span>
                </div>
              ) : (
                <div>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
                    {translatedMeaning || meaning}
                  </p>
                  {translatedMeaning && meaningLang !== "en" && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-500">
                      <span>Translated to {MEANING_LANGUAGES.find((m) => m.code === meaningLang)?.name || meaningLang}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Syllables Breakdown */}
          {syllables?.length > 1 && (
            <div className={`px-4 py-2.5 border-b ${isDark ? "border-neutral-800/90" : "border-neutral-200"}`}>
              <div className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                Syllables
              </div>
              <div className="flex flex-wrap gap-1.5">
                {syllables.map((syl, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                      syl === stressedSyllable
                        ? isDark
                          ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                          : "bg-orange-100 text-orange-800 border border-orange-300"
                        : isDark
                          ? "bg-neutral-800 text-neutral-300 border border-neutral-700"
                          : "bg-neutral-100 text-neutral-700 border border-neutral-300"
                    }`}
                  >
                    {syl}
                    {syl === stressedSyllable && <span className="ml-1 text-[10px] text-amber-400">★</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pronunciation Tip */}
          {result.pronunciation_tip && (
            <div className={`px-4 py-3 text-xs leading-relaxed ${
              isDark
                ? "text-neutral-300 bg-orange-950/20 border-t border-orange-900/30"
                : "text-neutral-800 bg-orange-50/80 border-t border-orange-100"
            }`}>
              <span className="font-bold text-orange-500">Tip: </span>
              {result.pronunciation_tip}
            </div>
          )}
        </div>
      )}

      {/* Idle Placeholder */}
      {status === "idle" && !word && (
        <div className="px-4 py-8 text-center flex flex-col items-center gap-2.5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? "bg-neutral-800 text-orange-400" : "bg-orange-50 text-orange-600"}`}>
            <Sparkles size={18} />
          </div>
          <p className={`text-xs max-w-[280px] leading-relaxed ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
            Type any word above or <strong className={isDark ? "text-neutral-200" : "text-neutral-900"}>highlight text on any website</strong> to pronounce and get its translatable meaning.
          </p>
        </div>
      )}
    </div>
  );
}
