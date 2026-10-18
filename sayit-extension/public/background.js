// SayIt — Background Service Worker (Manifest V3)

const API_BASE = "http://127.0.0.1:8000";

// ── Install: register context menu ──────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sayit-pronounce",
    title: 'Pronounce "%s" with SayIt',
    contexts: ["selection"],
  });

  console.log("[SayIt] Extension installed — registered context menus and commands");
});

// ── Keyboard Shortcuts (Chrome Commands: Alt+S) ─────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle_sayit") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || tab.url?.startsWith("chrome://") || tab.url?.startsWith("chrome-extension://")) return;

    try {
      await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_CURSOR_WIDGET" });
    } catch {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
        await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_CURSOR_WIDGET" });
      } catch (err) {
        console.warn("[SayIt] Could not trigger toggle on tab:", err);
      }
    }
  }
});

// ── Context menu click ───────────────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "sayit-pronounce" || !tab?.id) return;

  const word = info.selectionText?.trim().slice(0, 150);
  if (!word) return;

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: "SHOW_FLOATING_WIDGET",
      word: word,
    });
  } catch (e) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });
      await chrome.tabs.sendMessage(tab.id, {
        type: "SHOW_FLOATING_WIDGET",
        word: word,
      });
    } catch (err) {
      console.warn("[SayIt] Could not send message to tab:", err);
    }
  }
});

// ── Syllable & Phonetic Helpers for Standalone Mode ──────────────────────────
function extractSyllables(word, ipa) {
  if (!word) return [];
  const clean = word.toLowerCase().trim();

  // If IPA has explicit dot separations, use them
  if (ipa && ipa.includes(".")) {
    const parts = ipa.replace(/[\/\[\]ˈˌ]/g, "").split(".");
    const cleanParts = parts.filter((p) => p.trim().length > 0);
    if (cleanParts.length > 1) return cleanParts;
  }

  if (clean.length <= 4) return [clean];

  // Standard English vowel syllabification
  const matches = clean.match(/[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi);
  if (matches && matches.length > 0) {
    return matches;
  }
  return [clean];
}

function buildGuide(syllables, ipa) {
  if (!syllables || syllables.length === 0) return "";
  if (syllables.length === 1) return syllables[0].toUpperCase();
  const stressIdx = syllables.length > 2 ? 1 : 0;
  return syllables.map((s, i) => (i === stressIdx ? s.toUpperCase() : s.toLowerCase())).join("-");
}

// ── Standalone Dictionary Engine (Zero-server fallback) ─────────────────────
async function standaloneLookup(word, language = "auto") {
  const clean = word.toLowerCase().trim();

  // 1. Try Free Dictionary API first (Authoritative Oxford / Webster definitions + Native Audio)
  try {
    const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`);
    if (dictRes.ok) {
      const entries = await dictRes.json();
      if (Array.isArray(entries) && entries.length > 0) {
        const entry = entries[0];

        let ipa = entry.phonetic || "";
        let audioUrl = null;
        if (Array.isArray(entry.phonetics)) {
          for (const p of entry.phonetics) {
            if (!ipa && p.text) ipa = p.text;
            if (!audioUrl && p.audio && p.audio.trim().length > 0) {
              audioUrl = p.audio.startsWith("//") ? `https:${p.audio}` : p.audio;
            }
          }
        }

        let meaning = "";
        if (Array.isArray(entry.meanings)) {
          for (const m of entry.meanings) {
            if (m.definitions && m.definitions[0]?.definition) {
              const pos = m.partOfSpeech ? `(${m.partOfSpeech}) ` : "";
              meaning = `${pos}${m.definitions[0].definition}`;
              break;
            }
          }
        }

        const syllables = extractSyllables(clean, ipa);
        const guide = buildGuide(syllables, ipa);

        return {
          text: word,
          word: word,
          language: { code: "en", name: "English" },
          language_code: "en",
          language_name: "English",
          pronunciation: {
            ipa: ipa || `/${clean}/`,
            syllables: syllables,
            stressed_syllable: syllables[0] || clean,
            beginner_guide: guide,
          },
          audio: audioUrl ? { url: audioUrl, dataUrl: audioUrl } : null,
          meaning: meaning || "Definition found in Free Dictionary.",
        };
      }
    }
  } catch (e) {
    console.warn("[SayIt Background] Free Dictionary lookup warning:", e);
  }

  // 2. Google Lexical / Translation API fallback (Works across ALL languages)
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(word)}`;
    const gtxRes = await fetch(gtxUrl);
    if (gtxRes.ok) {
      const gtx = await gtxRes.json();
      const detectedLang = gtx[2] || "en";
      const translation = gtx[0]?.[0]?.[0] || word;

      let romanization = "";
      if (gtx[0] && gtx[0].length > 1 && gtx[0][1] && gtx[0][1][2]) {
        romanization = gtx[0][1][2];
      }

      let dictMeaning = "";
      if (Array.isArray(gtx[1])) {
        for (const cat of gtx[1]) {
          const pos = cat[0] ? `(${cat[0]}) ` : "";
          const terms = cat[1] ? cat[1].slice(0, 3).join(", ") : "";
          if (terms) {
            dictMeaning = `${pos}${terms}`;
            break;
          }
        }
      }

      const meaning = dictMeaning || (translation !== word ? `Translation: "${translation}"` : `Word: ${word}`);
      const syllables = extractSyllables(word, "");
      const guide = romanization || buildGuide(syllables, "");

      const langMap = {
        en: "English", es: "Spanish", fr: "French", de: "German", hi: "Hindi",
        te: "Telugu", ta: "Tamil", kn: "Kannada", ml: "Malayalam", bn: "Bengali",
        ja: "Japanese", zh: "Chinese", ko: "Korean", ar: "Arabic", it: "Italian",
        pt: "Portuguese", ru: "Russian"
      };

      return {
        text: word,
        word: word,
        language: { code: detectedLang, name: langMap[detectedLang] || detectedLang.toUpperCase() },
        language_code: detectedLang,
        language_name: langMap[detectedLang] || detectedLang.toUpperCase(),
        pronunciation: {
          ipa: romanization ? `[${romanization}]` : `/${word}/`,
          syllables: syllables,
          stressed_syllable: syllables[0] || word,
          beginner_guide: guide,
        },
        audio: null, // Browser Web Speech API handles voice smoothly
        meaning: meaning,
      };
    }
  } catch (err) {
    console.warn("[SayIt Background] Google GTX lookup warning:", err);
  }

  // 3. Clean baseline fallback
  return {
    text: word,
    word: word,
    language: { code: "auto", name: "Auto" },
    language_code: "auto",
    language_name: "Auto",
    pronunciation: {
      ipa: `/${word}/`,
      syllables: [word],
      stressed_syllable: word,
      beginner_guide: word,
    },
    audio: null,
    meaning: "Listen to pronunciation via browser voice.",
  };
}

// ── Standalone Translation Engine (Zero-server fallback) ────────────────────
async function standaloneTranslate(text, targetLang, sourceLang = "auto") {
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(gtxUrl);
    if (res.ok) {
      const gtx = await res.json();
      const translated = gtx[0]?.map((item) => item[0]).join("") || text;
      return {
        translated_text: translated,
        source_language: gtx[2] || sourceLang,
        target_language: targetLang,
      };
    }
  } catch (err) {
    console.warn("[SayIt Background] Standalone translation error:", err);
  }
  return { translated_text: text, target_language: targetLang };
}

// ── Proxy API Requests with Automatic Standalone Fallback ───────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "API_PRONUNCIATION") {
    (async () => {
      // 1. Try local/cloud backend first with a fast 1.5s timeout
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1500);

        const res = await fetch(`${API_BASE}/api/v1/pronunciation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: message.text, language: message.language || "auto" }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();

          // Convert audio to data URL if available
          if (data.audio?.url && data.audio.url.startsWith("/")) {
            try {
              const audioFetch = await fetch(`${API_BASE}${data.audio.url}`);
              if (audioFetch.ok) {
                const arrayBuffer = await audioFetch.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);
                let binary = "";
                const chunkSize = 8192;
                for (let i = 0; i < bytes.length; i += chunkSize) {
                  binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
                }
                data.audio.dataUrl = `data:audio/mp3;base64,${btoa(binary)}`;
              }
            } catch (audioErr) {
              console.warn("[SayIt Background] Audio conversion warning:", audioErr);
            }
          }

          sendResponse({ success: true, data });
          return;
        }
      } catch (err) {
        console.info("[SayIt Background] Local backend unavailable; smoothly using Standalone Engine.");
      }

      // 2. Standalone Fallback (Instant, 100% reliable for public users)
      try {
        const fallbackData = await standaloneLookup(message.text, message.language);
        sendResponse({ success: true, data: fallbackData });
      } catch (fatalErr) {
        sendResponse({ success: false, error: fatalErr.message || "Failed to analyze word" });
      }
    })();

    return true; // Keep message channel open for async response
  } else if (message.type === "API_TRANSLATE") {
    (async () => {
      // 1. Try backend first with 1.5s timeout
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1500);

        const res = await fetch(`${API_BASE}/api/v1/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: message.text,
            target_language: message.target_language,
            source_language: message.source_language || "auto",
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          sendResponse({ success: true, data });
          return;
        }
      } catch {}

      // 2. Standalone Google GTX fallback
      const translatedData = await standaloneTranslate(
        message.text,
        message.target_language,
        message.source_language
      );
      sendResponse({ success: true, data: translatedData });
    })();

    return true;
  } else if (message.type === "TEXT_SELECTED") {
    chrome.storage.session.set({ pendingWord: message.text });
    sendResponse({ ok: true });
    return true;
  }

  return true;
});
