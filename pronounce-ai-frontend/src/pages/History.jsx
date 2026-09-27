import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, RefreshCw, Mic, ArrowRight } from "lucide-react";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { getHistory, deleteHistory } from "../services/api";

function HistoryItem({ item, onDelete, onClick }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    try {
      await onDelete(item.id);
    } catch {
      setDeleting(false);
    }
  };

  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 cursor-pointer transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white truncate">{item.word || item.text}</span>
          {item.language && (
            <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
              {item.language}
            </span>
          )}
        </div>
        {item.ipa && (
          <p className="text-sm font-mono text-slate-400 mt-0.5">/{item.ipa}/</p>
        )}
        {date && <p className="text-xs text-slate-500 mt-1">{date}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <ArrowRight size={14} className="text-slate-500 group-hover:text-sky-400 transition-colors" />
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-40"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function History() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await getHistory();
      setItems(data.items || data || []);
      setStatus("success");
    } catch (err) {
      setError(err.message || "Unable to load history.");
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    await deleteHistory(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClick = (item) => {
    navigate("/pronunciation", { state: { data: item, text: item.word || item.text } });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">History</h1>
          {status === "success" && (
            <button
              onClick={fetchHistory}
              className="text-slate-400 hover:text-sky-400 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>

        {status === "loading" && <LoadingState message="Loading history…" />}

        {status === "error" && (
          <ErrorState message={error} onRetry={fetchHistory} />
        )}

        {status === "success" && items.length === 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <span className="text-4xl">📖</span>
            <h2 className="font-semibold text-white">No history yet</h2>
            <p className="text-slate-400 text-sm max-w-sm">
              Words you look up will appear here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-sky-500 hover:bg-sky-400 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Look up a word
            </button>
          </div>
        )}

        {status === "success" && items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onClick={() => handleClick(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
