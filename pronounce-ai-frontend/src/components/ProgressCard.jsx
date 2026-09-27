import { getScoreColorClass } from "../utils/formatScore";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function StatBadge({ label, value, colorClass }) {
  return (
    <div className="flex flex-col items-center bg-slate-700/40 rounded-xl p-3 gap-1">
      <span className={`text-2xl font-bold ${colorClass}`}>{value ?? "—"}</span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

// Tiny SVG sparkline from an array of numbers (0-100)
function Sparkline({ values }) {
  if (!values || values.length < 2) return null;

  const W = 200;
  const H = 48;
  const pad = 4;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-12"
      preserveAspectRatio="none"
    >
      <polyline
        points={polyline}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((v, i) => {
        const [x, y] = points[i].split(",");
        return (
          <circle key={i} cx={x} cy={y} r="3" fill="#38bdf8" />
        );
      })}
    </svg>
  );
}

export default function ProgressCard({ progress }) {
  if (!progress) return null;

  const {
    average_score,
    latest_score,
    best_score,
    total_attempts,
    improvement,
    score_history,
  } = progress;

  const ImprovementIcon =
    improvement > 0 ? TrendingUp : improvement < 0 ? TrendingDown : Minus;
  const impColor =
    improvement > 0
      ? "text-emerald-400"
      : improvement < 0
      ? "text-rose-400"
      : "text-slate-400";

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Your Progress</h2>
        <div className={`flex items-center gap-1 text-sm font-medium ${impColor}`}>
          <ImprovementIcon size={16} />
          {improvement > 0 ? "+" : ""}{improvement ?? 0} pts
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBadge label="Average" value={average_score} colorClass={getScoreColorClass(average_score)} />
        <StatBadge label="Latest" value={latest_score} colorClass={getScoreColorClass(latest_score)} />
        <StatBadge label="Best" value={best_score} colorClass={getScoreColorClass(best_score)} />
        <StatBadge label="Attempts" value={total_attempts} colorClass="text-sky-400" />
      </div>

      {/* Sparkline */}
      {score_history?.length > 1 && (
        <div>
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Score history</p>
          <Sparkline values={score_history} />
        </div>
      )}
    </div>
  );
}
