import { Mic, MicOff, Square } from "lucide-react";
import { formatDuration } from "../utils/formatDuration";

export default function RecordButton({ isRecording, recordingTime, onStart, onStop, disabled }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? onStop : onStart}
        disabled={disabled}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
          ${isRecording
            ? "bg-rose-500 hover:bg-rose-400"
            : "bg-sky-500 hover:bg-sky-400"
          }`}
      >
        {/* Pulse ring during recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-30" />
        )}
        {isRecording ? <Square size={28} /> : <Mic size={28} />}
      </button>

      {isRecording ? (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-rose-400 font-mono text-sm font-medium">
            {formatDuration(recordingTime)}
          </span>
          <span className="text-slate-400 text-sm">recording…</span>
        </div>
      ) : (
        <p className="text-slate-400 text-sm">
          {disabled ? "Preparing microphone…" : "Tap to record your pronunciation"}
        </p>
      )}
    </div>
  );
}
