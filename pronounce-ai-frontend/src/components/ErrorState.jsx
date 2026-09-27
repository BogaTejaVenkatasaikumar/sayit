import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export function ErrorState({
  title = "Backend Unavailable",
  message = "Unable to connect to PronounceAI backend server. Please verify FastAPI is running.",
  onRetry,
  retryLabel = "Retry Connection",
}) {
  return (
    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 max-w-md mx-auto text-center my-8">
      <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-300 text-sm mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors shadow-lg shadow-rose-600/20"
        >
          <RotateCcw className="w-4 h-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export default ErrorState;
