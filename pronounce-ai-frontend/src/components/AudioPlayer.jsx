import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

export default function AudioPlayer({ audioUrl, label = "Listen" }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const speeds = [0.5, 0.75, 1.0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () =>
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    audio.currentTime = ratio * duration;
  };

  const changeSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const idx = speeds.indexOf(speed);
    const next = speeds[(idx + 1) % speeds.length];
    audio.playbackRate = next;
    setSpeed(next);
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (!audioUrl) return null;

  return (
    <div className="flex flex-col gap-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-3">
        <Volume2 size={16} className="text-sky-400 shrink-0" />
        <span className="text-sm text-slate-300 font-medium">{label}</span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-2 bg-slate-700 rounded-full cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="h-2 bg-sky-400 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? "Pause" : "Play"}
        </button>

        <span className="text-xs text-slate-500">
          {formatTime(audioRef.current?.currentTime)} / {formatTime(duration)}
        </span>

        <button
          onClick={changeSpeed}
          className="text-xs text-slate-400 hover:text-sky-400 border border-slate-600 hover:border-sky-500 rounded-lg px-3 py-1.5 transition-colors"
        >
          {speed}x
        </button>
      </div>
    </div>
  );
}
