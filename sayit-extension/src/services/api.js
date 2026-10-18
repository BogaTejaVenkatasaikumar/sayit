import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

// Unwrap .data; normalize errors
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Network error";
    return Promise.reject(new Error(msg));
  }
);

export const pronounce = async (data) => {
  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "API_PRONUNCIATION", text: data.text, language: data.language || "auto" },
        (res) => {
          if (chrome.runtime.lastError || !res || !res.success) {
            reject(new Error(res?.error || chrome.runtime.lastError?.message || "Failed to analyze word"));
          } else {
            resolve(res.data);
          }
        }
      );
    });
  }
  return api.post("/api/v1/pronunciation", data);
};

export const submitPractice = ({ audio, expected_text, language }) => {
  const form = new FormData();
  form.append("audio", audio, "recording.webm");
  form.append("expected_text", expected_text);
  if (language) form.append("language", language);
  return api.post("/api/v1/practice", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const translateText = async ({ text, target_language, source_language = "auto" }) => {
  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "API_TRANSLATE", text, target_language, source_language },
        (res) => {
          if (chrome.runtime.lastError || !res || !res.success) {
            reject(new Error(res?.error || chrome.runtime.lastError?.message || "Failed to translate"));
          } else {
            resolve(res.data);
          }
        }
      );
    });
  }
  return api.post("/api/v1/translate", {
    text,
    target_language,
    source_language,
  });
};

export const getProgress = () => api.get("/api/v1/progress");
export const getHistory = () => api.get("/api/v1/history");
export const deleteHistory = (id) => api.delete(`/api/v1/history/${id}`);

/** Full URL for audio served by the backend or standalone */
export const audioUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  return `${BASE_URL}${path}`;
};

export default api;

