import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 60000, // longer for Whisper model first-load
});

// Unwrap .data so callers get plain objects
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Network error";
    return Promise.reject(new Error(msg));
  }
);

/** POST /api/v1/pronunciation */
export const pronounce = (data) => api.post("/api/v1/pronunciation", data);

/**
 * POST /api/v1/practice  (multipart/form-data)
 * @param {{ audio: Blob, expected_text: string, language: string }} params
 */
export const submitPractice = ({ audio, expected_text, language }) => {
  const form = new FormData();
  form.append("audio", audio, "recording.webm");
  form.append("expected_text", expected_text);
  if (language) form.append("language", language);
  return api.post("/api/v1/practice", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** GET /api/v1/progress */
export const getProgress = () => api.get("/api/v1/progress");

/** GET /api/v1/history */
export const getHistory = () => api.get("/api/v1/history");

/** DELETE /api/v1/history/:id */
export const deleteHistory = (id) => api.delete(`/api/v1/history/${id}`);

export default api;
