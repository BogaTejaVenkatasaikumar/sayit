import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Home from "../pages/Home";
import Pronunciation from "../pages/Pronunciation";
import Practice from "../pages/Practice";
import Progress from "../pages/Progress";
import History from "../pages/History";

export default function SidePanel() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  // On mount: check if background worker set a pendingWord / pendingRoute
  useEffect(() => {
    try {
      chrome.storage.session.get(["pendingWord", "pendingRoute"], ({ pendingWord, pendingRoute }) => {
        if (pendingWord) {
          chrome.storage.session.remove(["pendingWord", "pendingRoute"]);
          if (pendingRoute === "/practice") {
            navigate(`/practice?text=${encodeURIComponent(pendingWord)}`);
          } else {
            // Navigate to home with word pre-filled — we pass via state
            navigate("/", { state: { prefillWord: pendingWord } });
          }
        }
        setReady(true);
      });
    } catch {
      // Outside extension context (dev mode)
      setReady(true);
    }
  }, []);

  // Also listen for runtime messages while side panel is open
  useEffect(() => {
    try {
      const listener = (message) => {
        if (message.type === "PRONOUNCE_WORD" && message.word) {
          navigate("/", { state: { prefillWord: message.word } });
        }
      };
      chrome.runtime.onMessage.addListener(listener);
      return () => chrome.runtime.onMessage.removeListener(listener);
    } catch {
      return () => {};
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <Navbar appName="SayIt" />
      {ready && (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pronunciation" element={<Pronunciation />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
}
