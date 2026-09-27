import { ChevronDown, Sparkles } from "lucide-react";

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

// Accents vary per language — for now only English has accent options
const ACCENTS = {
  en: [
    { code: "en-US", label: "American (US)" },
    { code: "en-GB", label: "British (UK)" },
    { code: "en-AU", label: "Australian" },
    { code: "en-IN", label: "Indian" },
  ],
};

function Select({ id, label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

export default function LanguageSelector({ language = "auto", accent, onLanguageChange, onAccentChange }) {
  const langOptions = LANGUAGES.map((l) => ({ value: l.code, label: l.name }));
  const accentOptions = ACCENTS[language] ?? [];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <Select
          id="language"
          label="Language"
          value={language}
          onChange={(val) => {
            onLanguageChange(val);
            // Reset accent if no accents for new language
            if (!ACCENTS[val] && onAccentChange) onAccentChange("");
          }}
          options={langOptions}
        />
      </div>

      {accentOptions.length > 0 && (
        <div className="flex-1">
          <Select
            id="accent"
            label="Accent"
            value={accent || accentOptions[0].code}
            onChange={onAccentChange}
            options={accentOptions}
          />
        </div>
      )}
    </div>
  );
}
