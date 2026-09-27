import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, BookOpen, ArrowRight, Volume2 } from "lucide-react";
import LanguageSelector from "../components/LanguageSelector";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { pronounce } from "../services/api";

const EXAMPLES = ["entrepreneur", "pronunciation", "algorithm", "conscience", "phenomenon"];

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [text, setText] = useState(location.state?.prefillWord || "");
  const [language, setLanguage] = useState("auto");
  const [accent, setAccent] = useState("en-US");

  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState(null);

  // Auto-pronounce when a word is pre-filled from context menu
  useEffect(() => {
    if (location.state?.prefillWord) {
      handlePronounce(null, location.state.prefillWord);
    }
  }, []);

  const handlePronounce = async (e, textOverride) => {
    if (e) e.preventDefault();
    const trimmed = (textOverride || text).trim();
    if (!trimmed) return;

    setStatus("loading");
    setError(null);

    try {
      const data = await pronounce({ text: trimmed, language, accent });
      setStatus("idle");
      navigate("/pronunciation", { state: { data, text: trimmed } });
    } catch (err) {
      setStatus("error");
      setError(err.message || "Unable to connect to SayIt backend.");
    }
  };

  const handlePractice = () => {
    const trimmed = text.trim();
    if (trimmed) {
      navigate(`/practice?text=${encodeURIComponent(trimmed)}&language=${language}`);
    } else {
      navigate("/practice");
    }
  };

  if (status === "loading") return <LoadingState message="Analyzing pronunciation…" />;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center gap-6">
        <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm px-4 py-1.5 rounded-full">
          <Volume2 size={14} />
          AI-powered pronunciation feedback
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white max-w-2xl leading-tight">
          Speak with{" "}
          <span className="text-sky-400">confidence</span>
        </h1>
        <p className="text-slate-400 max-w-md text-lg">
          Enter any word or phrase to hear the correct pronunciation, then practice and get real-time feedback.
        </p>

        {/* Input form */}
        <form
          onSubmit={handlePronounce}
          className="w-full max-w-xl flex flex-col gap-4"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Try "entrepreneur" or "conscience"…'
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-sky-500 transition-colors"
          />

          <LanguageSelector
            language={language}
            accent={accent}
            onLanguageChange={setLanguage}
            onAccentChange={setAccent}
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-3 transition-colors"
            >
              <BookOpen size={18} />
              Listen &amp; Learn
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handlePractice}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-2xl px-5 py-3 transition-colors"
            >
              <Mic size={18} />
              Practice
            </button>
          </div>
        </form>

        {/* Error */}
        {status === "error" && (
          <ErrorState
            message={error}
            onRetry={() => {
              setStatus("idle");
              setError(null);
            }}
          />
        )}

        {/* Examples */}
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          <span className="text-slate-500 text-sm">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setText(ex)}
              className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: "🔊", title: "IPA + Audio", desc: "Hear native pronunciation with IPA transcription for every word." },
            { icon: "🎙️", title: "Record & Analyze", desc: "Record your voice and get instant phoneme-level feedback." },
            { icon: "📈", title: "Track Progress", desc: "Watch your scores improve over time with session history." },
          ].map((f) => (
            <div key={f.title} className="bg-slate-800/40 rounded-2xl p-6 flex flex-col gap-3">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
