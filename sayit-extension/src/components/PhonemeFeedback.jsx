const SEVERITY_STYLES = {
  minor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  moderate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  severe: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

function PhonemeError({ error }) {
  const style = SEVERITY_STYLES[error.severity] ?? SEVERITY_STYLES.minor;

  return (
    <div className="flex flex-col gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${style}`}>
          {error.severity}
        </span>
        <span className="text-xs text-slate-400 uppercase tracking-wide font-medium">
          {error.error_type}
        </span>
      </div>

      <div className="flex gap-4 text-sm">
        {error.expected && (
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Expected</p>
            <p className="font-mono text-emerald-400">/{error.expected}/</p>
          </div>
        )}
        {error.detected && error.detected !== error.expected && (
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Detected</p>
            <p className="font-mono text-rose-400">/{error.detected}/</p>
          </div>
        )}
      </div>

      {error.message && (
        <p className="text-sm text-slate-300">{error.message}</p>
      )}
    </div>
  );
}

export default function PhonemeFeedback({ feedback = [], report }) {
  if (!feedback.length && !report) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Phoneme errors */}
      {feedback.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Phoneme Analysis
          </h3>
          {feedback.map((err, i) => (
            <PhonemeError key={i} error={err} />
          ))}
        </div>
      )}

      {/* Feedback report */}
      {report && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-4">
          {report.summary && (
            <p className="text-slate-300 text-sm leading-relaxed">{report.summary}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.strengths?.length > 0 && (
              <div>
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wide mb-2">
                  ✓ Strengths
                </p>
                <ul className="space-y-1">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-emerald-400 shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.weaknesses?.length > 0 && (
              <div>
                <p className="text-xs text-rose-400 font-semibold uppercase tracking-wide mb-2">
                  ✗ Areas to improve
                </p>
                <ul className="space-y-1">
                  {report.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-rose-400 shrink-0">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {report.tips?.length > 0 && (
            <div>
              <p className="text-xs text-sky-400 font-semibold uppercase tracking-wide mb-2">
                💡 Tips
              </p>
              <ul className="space-y-1">
                {report.tips.map((t, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-sky-400 shrink-0">→</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.practice_targets?.length > 0 && (
            <div>
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-2">
                🎯 Practice targets
              </p>
              <div className="flex flex-wrap gap-2">
                {report.practice_targets.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-lg"
                  >
                    /{t}/
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
