import { formatScore, getScoreColorClass } from "../utils/formatScore";
import MetricBar from "./MetricBar";

export default function ScoreCard({ scores }) {
  if (!scores) return null;

  const overall = scores.overall ?? 0;
  const colorClass = getScoreColorClass(overall);

  const label =
    overall >= 90
      ? "Excellent"
      : overall >= 80
      ? "Great"
      : overall >= 70
      ? "Good"
      : overall >= 60
      ? "Fair"
      : "Needs Practice";

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-6">
      {/* Overall score */}
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke="#1e293b"
              strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={overall >= 80 ? "#34d399" : overall >= 60 ? "#fbbf24" : "#f87171"}
              strokeWidth="3"
              strokeDasharray={`${overall} ${100 - overall}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${colorClass}`}>{overall}</span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
        </div>

        <div>
          <p className="text-lg font-semibold text-white">{label}</p>
          <p className="text-sm text-slate-400 mt-1">Overall pronunciation score</p>
          <p className="text-xs text-slate-500 mt-1 italic">
            Heuristic score — based on phoneme alignment &amp; fluency signals
          </p>
        </div>
      </div>

      {/* Metric breakdown */}
      <div className="flex flex-col gap-4">
        <MetricBar label="Word Accuracy" value={scores.word_accuracy} />
        <MetricBar label="Phoneme Accuracy" value={scores.phoneme_accuracy} />
        <MetricBar label="Stress" value={scores.stress} />
        <MetricBar label="Fluency" value={scores.fluency} />
      </div>
    </div>
  );
}
