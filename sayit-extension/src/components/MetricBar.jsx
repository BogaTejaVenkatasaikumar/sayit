import { getScoreColorClass } from "../utils/formatScore";

export default function MetricBar({ label, value }) {
  const colorClass = getScoreColorClass(value);

  // Map colorClass to hex-based Tailwind bg classes (needed for dynamic width)
  const barColor =
    value >= 80
      ? "bg-emerald-400"
      : value >= 60
      ? "bg-amber-400"
      : "bg-rose-400";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          {label}
        </span>
        <span className={`text-sm font-bold ${colorClass}`}>{value ?? "—"}</span>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${value ?? 0}%` }}
        />
      </div>
    </div>
  );
}
