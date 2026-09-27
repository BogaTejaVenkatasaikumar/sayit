# SayIt — AI-Powered Universal Pronunciation & Translation Suite

<div align="center">
  <img src="sayit-extension/public/icons/icon128.png" width="96" height="96" alt="SayIt Logo" />
  <h3>Universal Pronunciation, Phonetic Breakdown, and Live Multilingual Meaning Lookup</h3>
</div>

---

## 🌟 Key Features

- 🔊 **Native & Syllable Pronunciation**: High-clarity native pronunciation with IPA transcription and syllable stress guide.
- 🌐 **Multilingual & Universal Meanings**: Instant word definitions with one-click live translation into Telugu, Hindi, Tamil, Spanish, French, German, Japanese, Chinese, Arabic, and more.
- 🎯 **Cursor-Following Chrome Extension**: An in-page floating widget that seamlessly follows the cursor across any website when text is selected.
- 🎨 **Adaptive Themes**: Orange & Black (Dark Mode) and Orange & White (Light Mode).
- ⚡ **High-Performance FastAPI Engine**: Multilingual fallback pronunciation synthesis with gTTS and lexical analyzers.

---

## 📁 Repository Structure

```
sayit/
├── sayit-extension/        # Chrome Extension (Manifest V3, Vite + React, Tailwind CSS)
├── pronounce-ai-backend/   # High-Performance Backend API (FastAPI, gTTS, IPA Engine)
└── pronounce-ai-frontend/  # Web Application (React, Tailwind CSS, Lucide)
```

---

## 🚀 Getting Started

### 1. Backend Setup (FastAPI)
```bash
cd pronounce-ai-backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
*API will run at `http://127.0.0.1:8000`.*

---

### 2. Chrome Extension (SayIt)
```bash
cd sayit-extension
npm install
npm run build
```

**To Load into Chrome:**
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked** and select the `sayit-extension/dist` folder.
4. Pin **SayIt** to your toolbar.

---

### 3. Web App (Frontend)
```bash
cd pronounce-ai-frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

## 📄 License
MIT License. Free for open-source use and contributions.
