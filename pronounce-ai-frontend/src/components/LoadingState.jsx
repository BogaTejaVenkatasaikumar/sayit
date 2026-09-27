import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Props:
 *   message  – main text shown under the spinner (default: "Analyzing speech…")
 *   title    – bold headline (defaults to message if omitted)
 */
export function LoadingState({
  message = "Analyzing speech…",
  title,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin absolute top-4 left-4" />
      </div>
      {title && (
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      )}
      <p className="text-slate-400 text-sm max-w-sm">{message}</p>
    </div>
  );
}

export default LoadingState;
