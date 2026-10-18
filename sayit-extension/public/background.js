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

// ── Proxy API Requests from Content Script (Bypasses Mixed Content / CORS) ──
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "API_PRONUNCIATION") {
    fetch(`${API_BASE}/api/v1/pronunciation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message.text, language: message.language || "auto" }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Convert audio to data URL if available to prevent Mixed Content audio blocking
        if (data.audio?.url) {
          try {
            const audioFetch = await fetch(`${API_BASE}${data.audio.url}`);
            if (audioFetch.ok) {
              const blob = await audioFetch.blob();
              const reader = new FileReader();
              reader.onloadend = () => {
                data.audio.dataUrl = reader.result;
                sendResponse({ success: true, data });
              };
              reader.readAsDataURL(blob);
              return;
            }
          } catch (audioErr) {
            console.warn("[SayIt Background] Audio conversion warning:", audioErr);
          }
        }

        sendResponse({ success: true, data });
      })
      .catch((err) => {
        console.error("[SayIt Background] Pronunciation API error:", err);
        sendResponse({ success: false, error: err.message || "Failed to reach backend API" });
      });

    return true; // Keep message channel open for async response
  } else if (message.type === "API_TRANSLATE") {
    fetch(`${API_BASE}/api/v1/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: message.text,
        target_language: message.target_language,
        source_language: message.source_language || "auto",
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        sendResponse({ success: true, data });
      })
      .catch((err) => {
        console.error("[SayIt Background] Translate API error:", err);
        sendResponse({ success: false, error: err.message || "Failed to translate" });
      });

    return true;
  } else if (message.type === "TEXT_SELECTED") {
    chrome.storage.session.set({ pendingWord: message.text });
    sendResponse({ ok: true });
    return true;
  }

  return true;
});
