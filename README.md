# SayIt — AI-Powered Universal Pronunciation & Translation Suite

<p align="center">
  <img src="sayit-extension/public/icons/icon128.png" width="100" height="100" alt="SayIt Logo" />
</p>

<p align="center">
  <strong>Native Audio Pronunciation, Phonetic Breakdown, and Live Multilingual Meaning Lookup</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-orange?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5+-646CFF?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3+-38B2AC?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License" />
</p>

---

## 📌 Overview

**SayIt** is a full-stack AI pronunciation and language assistant designed to make language learning, reading, and vocabulary acquisition effortless. It includes:

1. **Chrome Extension (Manifest V3)**:
   - 🎯 **Cursor-Following Mode**: Floating box follows your mouse across any webpage when text is highlighted.
   - 📌 **Pin / Move Mode**: Drag, pin, or float the box anywhere.
   - 🔊 **One-Click Native Audio**: Instant pitch and intonation playback.
   - 📖 **Universal Multilingual Meanings**: Real-time translations of word definitions into **Telugu, Hindi, Tamil, Spanish, French, German, Japanese, Chinese, Arabic**, and more.
   - 🌓 **Orange & Black (Dark)** and **Orange & White (Light)** adaptive themes.

2. **Backend API (FastAPI)**:
   - Resilient pronunciation synthesis engine with gTTS and edge-tts fallbacks.
   - Comprehensive IPA phonetic guides and syllable stress indicators.
   - Universal meaning lookup with Google Translate GTX integration.

3. **Web Application (React + Vite)**:
   - Full-featured browser practice studio with voice recording and AI phoneme accuracy scoring.

---

## 🏗️ Architecture

```
sayit/
├── sayit-extension/         # Manifest V3 Chrome Extension (React + Vite + Tailwind)
│   ├── public/              # Background script, Content script, Icons, Manifest
│   ├── src/                 # Popup & SidePanel UI components
│   └── package_extension.py # Chrome Web Store one-click packager
├── pronounce-ai-backend/    # FastAPI Backend Service
│   ├── app/                 # Routers, TTS, Meaning & Phoneme Services
│   └── run.py               # Entry point (port 8000)
└── pronounce-ai-frontend/   # Web Application Studio
    └── src/                 # Interactive practice app
```

---

## 🚀 Quick Start

### 1. Backend Server (FastAPI)

```bash
cd pronounce-ai-backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies and start server
pip install -r requirements.txt
python run.py
```
> Server will be running at `http://127.0.0.1:8000`  
> API Docs available at `http://127.0.0.1:8000/docs`

---

### 2. Chrome Extension

```bash
cd sayit-extension

# Install dependencies and build
npm install
npm run build
```

**Load into Google Chrome:**
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked** and select the `sayit-extension/dist` directory.
4. Pin **SayIt** to your browser toolbar!

---

### 3. Web App Studio

```bash
cd pronounce-ai-frontend
npm install
npm run dev
```
> Web studio available at `http://localhost:3000`

---

## 🌐 Supported Languages

| Language | Code | Pronunciation | Live Meaning Translation |
|---|---|---|---|
| English | `en` | ✅ | ✅ |
| Telugu | `te` | ✅ | ✅ |
| Hindi | `hi` | ✅ | ✅ |
| Tamil | `ta` | ✅ | ✅ |
| Kannada | `kn` | ✅ | ✅ |
| Malayalam | `ml` | ✅ | ✅ |
| Bengali | `bn` | ✅ | ✅ |
| Spanish | `es` | ✅ | ✅ |
| French | `fr` | ✅ | ✅ |
| German | `de` | ✅ | ✅ |
| Japanese | `ja` | ✅ | ✅ |
| Chinese | `zh` | ✅ | ✅ |
| Arabic | `ar` | ✅ | ✅ |

---

## 📦 Publishing to the Chrome Web Store

To generate a production-ready `.zip` package for the Chrome Web Store:
```bash
cd sayit-extension
npm run build
python package_extension.py
```
Upload the generated `sayit-extension.zip` directly to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
