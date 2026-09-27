export function formatScore(score) {
  if (score === undefined || score === null) return '0%';
  return `${Math.round(score)}%`;
}

export function getScoreColorClass(score) {
  if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (score >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
}
