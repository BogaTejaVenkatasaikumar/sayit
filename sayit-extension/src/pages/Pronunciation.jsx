import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, ChevronRight, BookOpen, Sparkles, Lightbulb, AlertTriangle } from "lucide-react";
import AudioPlayer from "../components/AudioPlayer";
import ErrorState from "../components/ErrorState";
import { audioUrl } from "../services/api";

export default function Pronunciation() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state?.data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <ErrorState
          message="No pronunciation data found. Please go back and search for a word."
          onRetry={() => navigate("/")}
          retryLabel="Go Home"
        />
      </div>
    );
  }

  const { data, text } = state;

  // Safe field extractors (supports both direct API response and history item structure)
  const langName = typeof data.language === "object" ? data.language?.name : (data.language_name || data.language);
  const langCode = typeof data.language === "object" ? data.language?.code : (data.language_code || "en");
  const ipa = data.pronunciation?.ipa || data.ipa;
  const syllables = data.pronunciation?.syllables || data.syllables || [];
  const stressedSyllable = data.pronunciation?.stressed_syllable || data.stressed_syllable;
  const beginnerGuide = data.pronunciation?.beginner_guide || data.beginner_guide;
  const meaning = data.meaning;
  const commonMistakes = data.common_mistakes || [];
  const pronunciationTip = data.pronunciation_tip;

  // Audio URL resolver
  const rawAudioUrl = data.audio?.url || data.audio_path;
  const audioSrc = rawAudioUrl ? audioUrl(rawAudioUrl) : null;

  const wordDisplay = data.text || data.word || text;

  const goToPractice = () => {
    navigate(`/practice?text=${encodeURIComponent(wordDisplay)}&language=${langCode}`);
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        {Icon && <Icon size={14} className="text-sky-400" />}
        <span>{title}</span>
      </div>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors w-fit"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Word header & Language */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{wordDisplay}</h1>
            {ipa && (
              <p className="font-mono text-xl sm:text-2xl text-sky-300 font-medium">{ipa}</p>
            )}
          </div>
          {langName && (
            <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
              <Sparkles size={14} className="text-sky-400" />
              <span>{langName}</span>
              {langCode && <span className="text-sky-400/80">({langCode})</span>}
            </div>
          )}
        </div>

        {/* Meaning Section (Prominent) */}
        {meaning && (
          <Section title="Definition & Meaning" icon={BookOpen}>
            <p className="text-slate-200 text-base leading-relaxed font-normal">{meaning}</p>
          </Section>
        )}

        {/* Syllables Breakdown */}
        {syllables?.length > 0 && (
          <Section title="Syllable Stress Breakdown">
            <div className="flex flex-wrap gap-2">
              {syllables.map((syl, i) => (
                <span
                  key={i}
                  className={`px-3 py-1.5 rounded-xl text-sm font-mono font-medium ${
                    syl === stressedSyllable
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold shadow-sm"
                      : "bg-slate-700/60 text-slate-300 border border-slate-700"
                  }`}
                >
                  {syl}
                  {syl === stressedSyllable && (
                    <span className="ml-1 text-sky-400 text-xs">★ Primary Stress</span>
                  )}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Native Audio Player */}
        {audioSrc && (
          <AudioPlayer audioUrl={audioSrc} label={`Native pronunciation: "${wordDisplay}"`} />
        )}

        {/* Beginner Phonetic Guide */}
        {beginnerGuide && (
          <Section title="Beginner Pronunciation Guide">
            <p className="font-mono text-lg text-amber-300 tracking-wide">{beginnerGuide}</p>
          </Section>
        )}

        {/* Pronunciation Tip */}
        {pronunciationTip && (
          <Section title="Pro Tip for Native Accent" icon={Lightbulb}>
            <p className="text-slate-300 text-sm leading-relaxed">{pronunciationTip}</p>
          </Section>
        )}

        {/* Common Mistakes */}
        {commonMistakes?.length > 0 && (
          <Section title="Common Mistakes to Avoid" icon={AlertTriangle}>
            <ul className="flex flex-col gap-2">
              {commonMistakes.map((m, i) => (
                <li key={i} className="text-sm text-slate-300 flex gap-2 items-start">
                  <span className="text-rose-400 shrink-0 font-bold">✗</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* CTA */}
        <button
          onClick={goToPractice}
          className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-2xl py-4 transition-colors shadow-lg shadow-sky-500/20"
        >
          <Mic size={18} />
          Practice Speaking This Word
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
