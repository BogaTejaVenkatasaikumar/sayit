import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Volume2 } from "lucide-react";
import RecordButton from "../components/RecordButton";
import ScoreCard from "../components/ScoreCard";
import PhonemeFeedback from "../components/PhonemeFeedback";
import AudioPlayer from "../components/AudioPlayer";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useRecorder } from "../hooks/useRecorder";
import { submitPractice, pronounce } from "../services/api";

// States: idle | listening | recording | analyzing | result | error
export default function Practice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const expectedText = searchParams.get("text") || "";
  const language = searchParams.get("language") || "en";

  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [referenceAudio, setReferenceAudio] = useState(null);

  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording: resetRecorder,
  } = useRecorder();

  // Fetch reference audio when page loads
  useEffect(() => {
    if (!expectedText) return;
    pronounce({ text: expectedText, language })
      .then((data) => {
        if (data?.audio?.url) {
          setReferenceAudio(`${import.meta.env.VITE_API_BASE_URL}${data.audio.url}`);
        }
      })
      .catch(() => {}); // not critical — just nice to have
  }, [expectedText, language]);

  // When audioBlob becomes available after recording stops, submit
  useEffect(() => {
    if (audioBlob && status === "recording") {
      handleSubmit(audioBlob);
    }
  }, [audioBlob]);

  const handleStartRecording = async () => {
    setStatus("recording");
    setResult(null);
    setError(null);
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording(); // triggers audioBlob update → useEffect submits
    setStatus("analyzing");
  };

  const handleSubmit = async (blob) => {
    setStatus("analyzing");
    try {
      const data = await submitPractice({
        audio: blob,
        expected_text: expectedText,
        language,
      });
      setResult(data);
      setStatus("result");
    } catch (err) {
      setError(err.message || "Failed to analyze your pronunciation.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    resetRecorder();
    setResult(null);
    setError(null);
    setStatus("idle");
  };

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

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Pronunciation Practice</h1>
          {expectedText && (
            <p className="text-slate-400 mt-1">
              Say:{" "}
              <span className="text-sky-300 font-semibold">"{expectedText}"</span>
            </p>
          )}
        </div>

        {/* Reference audio */}
        {referenceAudio && (
          <AudioPlayer audioUrl={referenceAudio} label="Listen first (native pronunciation)" />
        )}

        {/* Recording section */}
        {(status === "idle" || status === "recording") && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center gap-6">
            <RecordButton
              isRecording={isRecording}
              recordingTime={recordingTime}
              onStart={handleStartRecording}
              onStop={handleStopRecording}
            />

            {!expectedText && (
              <p className="text-slate-500 text-sm text-center">
                No word selected — go to{" "}
                <button
                  className="text-sky-400 underline"
                  onClick={() => navigate("/")}
                >
                  Home
                </button>{" "}
                and search for a word first.
              </p>
            )}
          </div>
        )}

        {/* Analyzing */}
        {status === "analyzing" && (
          <LoadingState message="Analyzing your pronunciation…" />
        )}

        {/* Error */}
        {status === "error" && (
          <ErrorState message={error} onRetry={handleReset} retryLabel="Try Again" />
        )}

        {/* Result */}
        {status === "result" && result && (
          <div className="flex flex-col gap-6">
            {/* Transcription metadata */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                  What we heard
                </span>
                {result.engine?.status && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      result.engine.status === "ok"
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                        : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                    }`}
                  >
                    {result.engine.name || "whisper"} · {result.engine.status}
                  </span>
                )}
              </div>
              <p className="text-white font-medium">
                "{result.transcription || result.transcribed_text || "—"}"
              </p>
              {result.expected_text && result.expected_text !== result.transcription && (
                <p className="text-slate-400 text-sm">
                  Expected: "{result.expected_text}"
                </p>
              )}
            </div>

            {/* Your recording */}
            {audioUrl && (
              <AudioPlayer audioUrl={audioUrl} label="Your recording" />
            )}

            {/* Scores */}
            {result.scores && <ScoreCard scores={result.scores} />}

            {/* Phoneme feedback */}
            <PhonemeFeedback
              feedback={result.phoneme_errors || []}
              report={result.feedback}
            />

            {/* Analysis metadata */}
            {result.analysis_metadata && (
              <p className="text-xs text-slate-500 italic text-center">
                Phoneme analysis: {result.analysis_metadata.phoneme_analysis} ·{" "}
                Stress analysis: {result.analysis_metadata.stress_analysis}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-2xl py-3 transition-colors"
              >
                <RotateCcw size={16} /> Try Again
              </button>
              <button
                onClick={() => navigate("/progress")}
                className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-2xl py-3 transition-colors"
              >
                View Progress
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
