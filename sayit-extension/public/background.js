// SayIt — Background Service Worker (Manifest V3)

// ── Install: register context menu ──────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sayit-pronounce",
    title: 'Pronounce "%s" with SayIt',
    contexts: ["selection"],
  });

  console.log("[SayIt] Extension installed — registered context menus");
});

// ── Extension Action (Toolbar Icon) Click: Open movable box on active page ───
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  // Ignore chrome:// internal pages
  if (tab.url?.startsWith("chrome://") || tab.url?.startsWith("chrome-extension://")) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_CURSOR_WIDGET" });
  } catch (e) {
    // If content script was not ready, inject it and retry
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });
      await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_CURSOR_WIDGET" });
    } catch (err) {
      console.warn("[SayIt] Could not inject content script into tab:", err);
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

// ── Messages from content script ─────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "TEXT_SELECTED") {
    chrome.storage.session.set({ pendingWord: message.text });
    sendResponse({ ok: true });
  }
  return true;
});
