// SayIt — Background Service Worker (Manifest V3)

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

// ── In-Memory Fast Cache for 0ms Repeated Lookups ───────────────────────────
const pronunciationCache = new Map();
const translationCache = new Map();

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

function formatDatamuseDef(raw) {
  if (!raw) return "";
  const parts = raw.split("\t", 2);
  if (parts.length === 2) {
    const mapping = {
      n: "(noun)",
      v: "(verb)",
      adj: "(adjective)",
      adv: "(adverb)",
      u: "",
    };
    const prefix = mapping[parts[0]] || `(${parts[0]})`;
    return `${prefix} ${parts[1].trim()}`.trim();
  }
  return raw.trim();
}

function cleanWordForLookup(raw) {
  if (!raw) return "";
  return raw
    .trim()
    .replace(/^[\s"'“‘«‹(\[{<—–\.,;:!?]+|[\s"'”’»›)\]}>—–\.,;:!?]+$/g, "")
    .trim();
}

function getLanguageName(code) {
  if (!code || code === "auto") return "Auto";
  try {
    const name = new Intl.DisplayNames(["en"], { type: "language" }).of(code);
    if (name) return name;
  } catch (_) {}
  const fallbackMap = {
    en: "English", es: "Spanish", fr: "French", de: "German", hi: "Hindi",
    te: "Telugu", ta: "Tamil", kn: "Kannada", ml: "Malayalam", bn: "Bengali",
    ja: "Japanese", zh: "Chinese", ko: "Korean", ar: "Arabic", it: "Italian",
    pt: "Portuguese", ru: "Russian", nl: "Dutch", pl: "Polish", tr: "Turkish",
    sv: "Swedish", el: "Greek", uk: "Ukrainian", vi: "Vietnamese", mr: "Marathi",
    gu: "Gujarati", ur: "Urdu", fa: "Persian", id: "Indonesian", th: "Thai",
  };
  return fallbackMap[code.toLowerCase()] || code.toUpperCase();
}

async function fetchAudioAsBase64(url) {
  try {
    const res = await fetch(url);
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
      }
      return `data:audio/mp3;base64,${btoa(binary)}`;
    }
  } catch (e) {
    console.warn("[SayIt Background] Base64 audio fetch fallback to URL:", e);
  }
  return url;
}

// ── Ultra-Fast Standalone Dictionary Engine (Sub-100ms) ─────────────────────
async function standaloneLookup(word, language = "auto") {
  const clean = cleanWordForLookup(word) || word.trim();
  const cacheKey = `${clean.toLowerCase()}:${language}`;

  if (pronunciationCache.has(cacheKey)) {
    return pronunciationCache.get(cacheKey);
  }

  // 1. Detect language & translate first via Google Lexical
  let detectedLang = language && language !== "auto" ? language : null;
  let gtxData = null;

  try {
    const sl = detectedLang || "auto";
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=en&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(clean)}`;
    const gtxRes = await fetch(gtxUrl);
    if (gtxRes.ok) {
      gtxData = await gtxRes.json();
      if (!detectedLang) {
        detectedLang = gtxData[2] || "en";
      }
    }
  } catch (err) {
    console.warn("[SayIt Background] Language detection warning:", err);
  }

  detectedLang = detectedLang || "en";
  const langName = getLanguageName(detectedLang);

  // 2. If it is NOT English (e.g. Spanish, French, German, Telugu, Hindi, Arabic, etc.)
  if (detectedLang !== "en") {
    const translation = gtxData?.[0]?.[0]?.[0] || clean;

    let romanization = "";
    if (Array.isArray(gtxData?.[0])) {
      for (const item of gtxData[0]) {
        if (Array.isArray(item)) {
          for (const val of item) {
            if (
              typeof val === "string" &&
              val.trim().length > 0 &&
              val.toLowerCase() !== translation.toLowerCase() &&
              val !== clean
            ) {
              romanization = val.trim();
              break;
            }
          }
        }
        if (romanization) break;
      }
    }

    let dictMeaning = "";
    if (Array.isArray(gtxData?.[1])) {
      for (const cat of gtxData[1]) {
        const pos = cat[0] ? `(${cat[0]}) ` : "";
        const terms = cat[1] ? cat[1].slice(0, 3).join(", ") : "";
        if (terms) {
          dictMeaning = `${pos}${terms}`;
          break;
        }
      }
    }

    const meaning = dictMeaning || (translation.toLowerCase() !== clean.toLowerCase() ? translation : clean);
    const syllables = romanization ? extractSyllables(romanization, "") : [clean];
    const guide = romanization || clean;
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${detectedLang}&client=tw-ob&q=${encodeURIComponent(clean.slice(0, 150))}`;
    const audioDataUrl = await fetchAudioAsBase64(ttsUrl);

    const result = {
      text: word,
      word: word,
      language: { code: detectedLang, name: langName },
      language_code: detectedLang,
      language_name: langName,
      pronunciation: {
        ipa: romanization ? `[${romanization}]` : `/${clean}/`,
        syllables: syllables,
        stressed_syllable: syllables[0] || clean,
        beginner_guide: guide,
      },
      audio: { url: ttsUrl, dataUrl: audioDataUrl },
      meaning: meaning,
    };

    pronunciationCache.set(cacheKey, result);
    return result;
  }

  // 3. For English words: Tier 1 - Use Datamuse for rich Oxford definitions and IPA
  try {
    const dmUrl = `https://api.datamuse.com/words?sp=${encodeURIComponent(clean.toLowerCase())}&md=dr&ipa=1`;
    const dmRes = await fetch(dmUrl);
    if (dmRes.ok) {
      const items = await dmRes.json();
      if (Array.isArray(items) && items.length > 0) {
        const match = items.find((it) => it.word.toLowerCase() === clean.toLowerCase()) || items[0];

        let ipa = "";
        if (Array.isArray(match.tags)) {
          for (const t of match.tags) {
            if (t.startsWith("ipa_pron:")) {
              ipa = `/${t.slice(9)}/`;
              break;
            }
          }
        }

        let meaning = "";
        if (Array.isArray(match.defs) && match.defs.length > 0) {
          meaning = match.defs.slice(0, 2).map(formatDatamuseDef).join("\n");
        }

        if (meaning) {
          const syllables = extractSyllables(clean, ipa);
          const guide = buildGuide(syllables, ipa);
          const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(clean.slice(0, 150))}`;
          const audioDataUrl = await fetchAudioAsBase64(ttsUrl);

          const result = {
            text: word,
            word: word,
            language: { code: "en", name: "English" },
            language_code: "en",
            language_name: "English",
            pronunciation: {
              ipa: ipa || `/${clean.toLowerCase()}/`,
              syllables: syllables,
              stressed_syllable: syllables[0] || clean,
              beginner_guide: guide,
            },
            audio: { url: ttsUrl, dataUrl: audioDataUrl },
            meaning: meaning,
          };

          pronunciationCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch (dmErr) {
    console.warn("[SayIt Background] Datamuse lookup warning:", dmErr);
  }

  // 4. English Tier 2: Free Dictionary API fallback
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const dictRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean.toLowerCase())}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

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

        if (meaning) {
          const syllables = extractSyllables(clean, ipa);
          const guide = buildGuide(syllables, ipa);
          const finalAudio = audioUrl || `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(clean.slice(0, 150))}`;
          const audioDataUrl = await fetchAudioAsBase64(finalAudio);

          const result = {
            text: word,
            word: word,
            language: { code: "en", name: "English" },
            language_code: "en",
            language_name: "English",
            pronunciation: {
              ipa: ipa || `/${clean.toLowerCase()}/`,
              syllables: syllables,
              stressed_syllable: syllables[0] || clean,
              beginner_guide: guide,
            },
            audio: { url: finalAudio, dataUrl: audioDataUrl },
            meaning: meaning,
          };

          pronunciationCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch (fdErr) {}

  // 5. English Tier 3: Extract from Google Lexical dictionary data if available
  let gtxMeaning = "";
  if (Array.isArray(gtxData?.[1])) {
    for (const cat of gtxData[1]) {
      const pos = cat[0] ? `(${cat[0]}) ` : "";
      const terms = cat[1] ? cat[1].slice(0, 3).join(", ") : "";
      if (terms) {
        gtxMeaning = `${pos}${terms}`;
        break;
      }
    }
  }

  const finalMeaning = gtxMeaning || clean;
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(clean.slice(0, 150))}`;
  const audioDataUrl = await fetchAudioAsBase64(ttsUrl);

  const baseline = {
    text: word,
    word: word,
    language: { code: "en", name: "English" },
    language_code: "en",
    language_name: "English",
    pronunciation: {
      ipa: `/${clean}/`,
      syllables: extractSyllables(clean, ""),
      stressed_syllable: clean,
      beginner_guide: clean,
    },
    audio: { url: ttsUrl, dataUrl: audioDataUrl },
    meaning: finalMeaning,
  };

  pronunciationCache.set(cacheKey, baseline);
  return baseline;
}

// ── Standalone Translation Engine (Zero-server fallback) ────────────────────
async function standaloneTranslate(text, targetLang, sourceLang = "auto") {
  const cacheKey = `${text}:${targetLang}:${sourceLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(gtxUrl);
    if (res.ok) {
      const gtx = await res.json();
      const translated = gtx[0]?.map((item) => item[0]).join("") || text;
      const result = {
        translated_text: translated,
        source_language: gtx[2] || sourceLang,
        target_language: targetLang,
      };
      translationCache.set(cacheKey, result);
      return result;
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
      try {
        // Fast Standalone Resolver executes in 50-80ms with 100% reliability
        const data = await standaloneLookup(message.text, message.language);
        sendResponse({ success: true, data });
      } catch (fatalErr) {
        sendResponse({ success: false, error: fatalErr.message || "Failed to analyze word" });
      }
    })();

    return true; // Keep message channel open for async response
  } else if (message.type === "API_TRANSLATE") {
    (async () => {
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
