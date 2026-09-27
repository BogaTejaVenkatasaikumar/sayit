import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import ProgressCard from "../components/ProgressCard";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { getProgress } from "../services/api";

export default function Progress() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  const fetchProgress = async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await getProgress();
      setProgress(data);
      setStatus("success");
    } catch (err) {
      setError(err.message || "Unable to load progress data.");
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Progress</h1>
          {status === "success" && (
            <button
              onClick={fetchProgress}
              className="text-slate-400 hover:text-sky-400 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>

        {status === "loading" && <LoadingState message="Loading your progress…" />}

        {status === "error" && (
          <ErrorState message={error} onRetry={fetchProgress} />
        )}

        {status === "success" && (
          <>
            {!progress || progress.total_attempts === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
                <span className="text-4xl">🎙️</span>
                <h2 className="font-semibold text-white">No practice sessions yet</h2>
                <p className="text-slate-400 text-sm max-w-sm">
                  Complete your first pronunciation practice to see your progress here.
                </p>
                <button
                  onClick={() => navigate("/practice")}
                  className="bg-sky-500 hover:bg-sky-400 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
                >
                  Start Practicing
                </button>
              </div>
            ) : (
              <ProgressCard progress={progress} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
