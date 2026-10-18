// SayIt — Full Movable Box Cursor-Following Engine with Cyber Glass / Light Mode Theme

(function () {
  if (window.__SAYIT_INITIALIZED__) return;
  window.__SAYIT_INITIALIZED__ = true;

  const API_BASE = "http://127.0.0.1:8000";
  const LOGO_LIGHT = "data:image/png;base64,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";
  const LOGO_DARK = "data:image/png;base64,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";


  const LANGUAGES = [
    { code: "auto", name: "✨ Auto-Detect Language" },
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "te", name: "Telugu" },
    { code: "ta", name: "Tamil" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "bn", name: "Bengali" },
    { code: "ar", name: "Arabic" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "es", name: "Spanish" },
  ];

  const MEANING_LANGUAGES = [
    { code: "en", name: "English" },
    { code: "te", name: "తెలుగు (Telugu)" },
    { code: "hi", name: "हिन्दी (Hindi)" },
    { code: "ta", name: "தமிழ் (Tamil)" },
    { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
    { code: "ml", name: "മലയാളം (Malayalam)" },
    { code: "bn", name: "বাংলা (Bengali)" },
    { code: "es", name: "Español (Spanish)" },
    { code: "fr", name: "Français (French)" },
    { code: "de", name: "Deutsch (German)" },
    { code: "ja", name: "日本語 (Japanese)" },
    { code: "zh", name: "中文 (Chinese)" },
    { code: "ar", name: "العربية (Arabic)" },
  ];

  // ── Theme State: 'dark' (Cyber Glass) | 'light' (Opal White) ───────────────
  let currentTheme = localStorage.getItem("sayit_theme") || "dark";

  // ── Host & Shadow DOM ──────────────────────────────────────────────────────
  const host = document.createElement("div");
  host.id = "sayit-extension-root";
  host.style.position = "fixed";
  host.style.zIndex = "2147483647";
  host.style.top = "0";
  host.style.left = "0";
  host.style.width = "0";
  host.style.height = "0";
  host.style.pointerEvents = "none";
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // ── Styles with Theme Variables ─────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      user-select: auto;
    }

    /* ── Dark Theme (Orange & Black) ─────────────────────────────────────── */
    .sayit-cursor-box.theme-dark {
      --bg-primary: #0f0f11;
      --bg-header: #16161a;
      --bg-section: #141417;
      --bg-input: #1d1d22;
      --border-card: #2a2a30;
      --border-subtle: #24242a;
      --text-main: #f9fafb;
      --text-muted: #9ca3af;
      --text-accent: #f97316;
      --accent-grad: linear-gradient(135deg, #f97316, #ea580c);
      --accent-grad-hover: linear-gradient(135deg, #ea580c, #c2410c);
      --badge-bg: rgba(249, 115, 22, 0.15);
      --badge-border: rgba(249, 115, 22, 0.35);
      --badge-text: #fb923c;
      --card-shadow: 0 20px 50px rgba(0,0,0,0.85), 0 0 20px rgba(249, 115, 22, 0.12);
      --chip-bg: #1f1f24;
      --chip-border: #33333a;
      --chip-text: #e4e4e7;
      --chip-active-bg: rgba(249, 115, 22, 0.22);
      --chip-active-border: #f97316;
      --chip-active-text: #fdba74;
      --tip-bg: rgba(249, 115, 22, 0.1);
      --tip-border: rgba(249, 115, 22, 0.25);
      --tip-text: #fdba74;
      --btn-icon-hover: #26262c;
    }

    /* ── Light Theme (Orange & White) ─────────────────────────────────────── */
    .sayit-cursor-box.theme-light {
      --bg-primary: #ffffff;
      --bg-header: #f8f9fa;
      --bg-section: #f3f4f6;
      --bg-input: #ffffff;
      --border-card: #e5e7eb;
      --border-subtle: #e5e7eb;
      --text-main: #111827;
      --text-muted: #6b7280;
      --text-accent: #ea580c;
      --accent-grad: linear-gradient(135deg, #f97316, #ea580c);
      --accent-grad-hover: linear-gradient(135deg, #ea580c, #c2410c);
      --badge-bg: #fff7ed;
      --badge-border: #ffedd5;
      --badge-text: #c2410c;
      --card-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
      --chip-bg: #ffffff;
      --chip-border: #e5e7eb;
      --chip-text: #374151;
      --chip-active-bg: #ffedd5;
      --chip-active-border: #f97316;
      --chip-active-text: #9a3412;
      --tip-bg: #fff7ed;
      --tip-border: #fed7aa;
      --tip-text: #9a3412;
      --btn-icon-hover: #e5e7eb;
    }

    /* Full Movable Box that tracks cursor */
    .sayit-cursor-box {
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: auto;
      width: 360px;
      max-width: calc(100vw - 20px);
      background: var(--bg-primary);
      color: var(--text-main);
      border: 1px solid var(--border-card);
      border-radius: 22px;
      box-shadow: var(--card-shadow);
      z-index: 2147483647;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      will-change: transform;
      transform: translate3d(20px, 20px, 0);
      animation: sayit-fade-in 0.15s ease-out;
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    @keyframes sayit-fade-in {
      from { opacity: 0; transform: scale(0.96) translate3d(20px, 20px, 0); }
      to { opacity: 1; transform: scale(1) translate3d(20px, 20px, 0); }
    }

    /* Header */
    .sayit-header {
      background: var(--bg-header);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
      user-select: none;
      cursor: grab;
      border-top-left-radius: 22px;
      border-top-right-radius: 22px;
    }
    .sayit-header:active {
      cursor: grabbing;
    }
    .sayit-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 13px;
      color: var(--text-main);
    }
    .sayit-logo-icon {
      width: 22px;
      height: 22px;
      border-radius: 7px;
      background: var(--accent-grad);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }
    .sayit-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sayit-header-badge {
      font-size: 10px;
      font-weight: 600;
      color: var(--badge-text);
      background: var(--badge-bg);
      padding: 3px 9px;
      border-radius: 9999px;
      border: 1px solid var(--badge-border);
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .sayit-header-badge:hover {
      transform: scale(1.03);
    }

    /* Icon Buttons */
    .sayit-icon-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      width: 26px;
      height: 26px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.15s, color 0.15s, transform 0.15s;
    }
    .sayit-icon-btn:hover {
      background: var(--btn-icon-hover);
      color: var(--text-main);
      transform: scale(1.06);
    }
    .sayit-icon-btn.active {
      color: var(--text-accent);
      background: var(--badge-bg);
    }

    /* Search bar */
    .sayit-search-bar {
      padding: 10px 14px;
      background: var(--bg-section);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .sayit-input-row {
      display: flex;
      gap: 7px;
    }
    .sayit-input {
      flex: 1;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      padding: 7px 11px;
      border-radius: 12px;
      font-size: 12px;
      outline: none;
      transition: border-color 0.15s;
    }
    .sayit-input:focus {
      border-color: var(--text-accent);
    }
    .sayit-primary-btn {
      background: var(--accent-grad);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 7px 14px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .sayit-primary-btn:hover {
      background: var(--accent-grad-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
    }
    .sayit-select {
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      border-radius: 10px;
      padding: 5px 9px;
      font-size: 11px;
      outline: none;
      cursor: pointer;
      width: 100%;
    }

    /* Body */
    .sayit-body {
      padding: 14px;
      max-height: 330px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 11px;
    }

    /* Word Details */
    .sayit-word-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .sayit-word-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--text-main);
      word-break: break-word;
      letter-spacing: -0.2px;
    }
    .sayit-lang-tag {
      font-size: 10px;
      font-weight: 600;
      background: var(--badge-bg);
      color: var(--badge-text);
      border: 1px solid var(--badge-border);
      padding: 2px 9px;
      border-radius: 9999px;
      white-space: nowrap;
    }
    .sayit-ipa-box {
      display: flex;
      align-items: center;
      gap: 7px;
      flex-wrap: wrap;
      margin-top: 3px;
    }
    .sayit-ipa-text {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: var(--text-accent);
      font-size: 14px;
      font-weight: 700;
    }
    .sayit-guide-text {
      font-size: 11px;
      font-family: monospace;
      color: var(--text-muted);
      background: var(--chip-bg);
      border: 1px solid var(--chip-border);
      padding: 2px 7px;
      border-radius: 7px;
    }

    /* Audio button */
    .sayit-audio-bar {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 8px 12px;
      background: var(--bg-section);
      border-radius: 12px;
      border: 1px solid var(--border-subtle);
    }
    .sayit-play-btn {
      background: var(--accent-grad);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 5px 11px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .sayit-play-btn:hover {
      transform: scale(1.04);
    }
    .sayit-audio-info {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Meaning with Translator */
    .sayit-meaning-card {
      background: var(--bg-section);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      padding: 10px 12px;
    }
    .sayit-meaning-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .sayit-sec-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .sayit-trans-dropdown {
      background: var(--bg-input);
      color: var(--text-accent);
      border: 1px solid var(--border-subtle);
      font-size: 10px;
      font-weight: 600;
      border-radius: 8px;
      padding: 3px 7px;
      outline: none;
      cursor: pointer;
      transition: border-color 0.15s;
    }
    .sayit-trans-dropdown:focus {
      border-color: var(--text-accent);
    }
    .sayit-meaning-val {
      font-size: 12px;
      color: var(--text-main);
      line-height: 1.5;
    }
    .sayit-trans-credit {
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 3px;
    }

    /* Syllables */
    .sayit-chips-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .sayit-syl-chip {
      font-family: monospace;
      font-size: 11px;
      padding: 3px 9px;
      border-radius: 9999px;
      background: var(--chip-bg);
      color: var(--chip-text);
      border: 1px solid var(--chip-border);
    }
    .sayit-syl-chip.active {
      background: var(--chip-active-bg);
      color: var(--chip-active-text);
      border-color: var(--chip-active-border);
      font-weight: 700;
    }

    /* Tip */
    .sayit-tip-banner {
      font-size: 11px;
      color: var(--tip-text);
      background: var(--tip-bg);
      border: 1px solid var(--tip-border);
      border-radius: 12px;
      padding: 8px 12px;
      line-height: 1.4;
    }

    /* Spinner */
    .sayit-loader {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(148, 163, 184, 0.2);
      border-top-color: var(--text-accent);
      border-radius: 50%;
      animation: sayit-spin 0.6s linear infinite;
    }
    @keyframes sayit-spin {
      to { transform: rotate(360deg); }
    }
  `;
  shadow.appendChild(style);

  // ── Global Coordinates & States ────────────────────────────────────────────
  let mouseX = window.innerWidth / 2 - 180;
  let mouseY = 80;
  let activeCard = null;
  let isMouseOverCard = false;
  let currentAudio = null;

  // Track cursor position only so when user selects text, we know where to open the box
  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    },
    { passive: true }
  );

  // Move the full box with the cursor smoothly
  function updateCardPosition(cx, cy) {
    if (!activeCard) return;

    const cardWidth = activeCard.offsetWidth || 360;
    const cardHeight = activeCard.offsetHeight || 300;
    const offset = 16;

    let posX = cx + offset;
    let posY = cy + offset;

    // Flip to left of cursor if near right viewport edge
    if (posX + cardWidth > window.innerWidth - 12) {
      posX = Math.max(12, cx - cardWidth - offset);
    }

    // Flip to above cursor if near bottom viewport edge
    if (posY + cardHeight > window.innerHeight - 12) {
      posY = Math.max(12, cy - cardHeight - offset);
    }

    activeCard.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
  }

  // Dragging support for header
  function makeDraggable(element, handle) {
    let isDragging = false;
    let startX, startY, initTransformX, initTransformY;

    handle.addEventListener("mousedown", (e) => {
      if (e.target.closest("button") || e.target.closest("select") || e.target.closest("input")) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = element.getBoundingClientRect();
      initTransformX = rect.left;
      initTransformY = rect.top;

      const onMouseMove = (mEvt) => {
        if (!isDragging) return;
        const dx = mEvt.clientX - startX;
        const dy = mEvt.clientY - startY;

        let nextX = Math.max(10, Math.min(window.innerWidth - element.offsetWidth - 10, initTransformX + dx));
        let nextY = Math.max(10, Math.min(window.innerHeight - 50, initTransformY + dy));

        element.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
      };

      const onMouseUp = () => {
        isDragging = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    });
  }

  // ── Show or Toggle Full Movable Box ─────────────────────────────────────────
  function showCursorCard(initialWord = "") {
    if (activeCard) {
      const searchInput = activeCard.querySelector("#sayit-search-input");
      if (searchInput && initialWord) {
        searchInput.value = initialWord;
      }
      updateCardPosition(mouseX, mouseY);
      if (initialWord) executeLookup(initialWord, "auto");
      return;
    }

    const card = document.createElement("div");
    card.className = `sayit-cursor-box theme-${currentTheme}`;

    card.innerHTML = `
      <div class="sayit-header">
        <div class="sayit-brand" style="display:flex;align-items:center;gap:8px;">
          <img id="sayit-header-logo-img" src="${currentTheme === 'dark' ? LOGO_DARK : LOGO_LIGHT}" alt="sayit" style="height:22px;width:auto;pointer-events:none;" />
        </div>
        <div class="sayit-header-actions">
          <button class="sayit-icon-btn" id="sayit-theme-btn" title="Toggle Dark / Light Mode">
            ${currentTheme === "dark" ? "☀️" : "🌙"}
          </button>
          <button class="sayit-icon-btn" id="sayit-close-btn" title="Close">✕</button>
        </div>
      </div>

      <div class="sayit-search-bar">
        <div class="sayit-input-row">
          <input type="text" class="sayit-input" id="sayit-search-input" placeholder='Enter word or phrase…' value="${initialWord ? initialWord.replace(/"/g, '&quot;') : ''}" />
          <button class="sayit-primary-btn" id="sayit-submit-btn">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            SayIt
          </button>
        </div>
        <select class="sayit-select" id="sayit-lang-select">
          ${LANGUAGES.map((l) => `<option value="${l.code}">${l.name}</option>`).join("")}
        </select>
      </div>

      <div class="sayit-body" id="sayit-body-content">
        <div style="text-align:center;padding:20px 0;color:var(--text-muted);font-size:11px;">
          Select any text on the page to hear it spoken and view definitions.
        </div>
      </div>
    `;

    shadow.appendChild(card);
    activeCard = card;

    const header = card.querySelector(".sayit-header");
    makeDraggable(card, header);

    // Pause audio when closing
    card.addEventListener("mouseenter", () => {
      isMouseOverCard = true;
    });
    card.addEventListener("mouseleave", () => {
      isMouseOverCard = false;
    });

    const closeBtn = card.querySelector("#sayit-close-btn");
    const themeBtn = card.querySelector("#sayit-theme-btn");
    const searchInput = card.querySelector("#sayit-search-input");
    const submitBtn = card.querySelector("#sayit-submit-btn");
    const langSelect = card.querySelector("#sayit-lang-select");

    closeBtn.addEventListener("click", () => {
      card.remove();
      activeCard = null;
      isMouseOverCard = false;
      if (currentAudio) currentAudio.pause();
    });

    // Theme Toggle Handler
    themeBtn.addEventListener("click", () => {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem("sayit_theme", currentTheme);
      card.className = `sayit-cursor-box theme-${currentTheme}`;
      themeBtn.textContent = currentTheme === "dark" ? "☀️" : "🌙";
      const logoImg = card.querySelector("#sayit-header-logo-img");
      if (logoImg) logoImg.src = currentTheme === "dark" ? LOGO_DARK : LOGO_LIGHT;
    });

    const triggerLookup = () => {
      const q = searchInput.value.trim();
      const l = langSelect.value;
      if (q) executeLookup(q, l);
    };

    submitBtn.addEventListener("click", triggerLookup);
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") triggerLookup();
    });

    updateCardPosition(mouseX, mouseY);

    if (initialWord) {
      executeLookup(initialWord, "auto");
    }
  }

  function toggleCard() {
    if (activeCard) {
      activeCard.remove();
      activeCard = null;
      isMouseOverCard = false;
      if (currentAudio) currentAudio.pause();
    } else {
      const selected = window.getSelection()?.toString()?.trim();
      showCursorCard(selected || "");
    }
  }

  // ── Lookup Pronunciation & Meaning ─────────────────────────────────────────
  async function executeLookup(word, language = "auto") {
    if (!activeCard) return;
    const bodyContent = activeCard.querySelector("#sayit-body-content");
    bodyContent.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:26px 0;gap:7px;">
        <div class="sayit-loader"></div>
        <span style="font-size:11px;color:var(--text-muted);font-weight:500;">Analyzing word…</span>
      </div>
    `;

    try {
      const res = await fetch(`${API_BASE}/api/v1/pronunciation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: word, language }),
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      renderResult(data);
    } catch (err) {
      bodyContent.innerHTML = `
        <div style="background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.3);border-radius:8px;padding:10px;font-size:11px;color:#fda4af;">
          <strong>Error analyzing word</strong>
          <p style="color:var(--text-muted);margin-top:3px;">${err.message || "Failed to reach backend"}</p>
        </div>
      `;
    }
  }

  // ── Render Result inside Movable Box ───────────────────────────────────────
  function renderResult(data) {
    if (!activeCard) return;
    const bodyContent = activeCard.querySelector("#sayit-body-content");

    const text = data.text || "";
    const langName = data.language?.name || "";
    const langCode = data.language?.code || "";
    const ipa = data.pronunciation?.ipa || "";
    const syllables = data.pronunciation?.syllables || [];
    const stressed = data.pronunciation?.stressed_syllable || "";
    const guide = data.pronunciation?.beginner_guide || "";
    const meaning = data.meaning || "";
    const audioUrl = data.audio?.url ? `${API_BASE}${data.audio.url}` : null;
    const tip = data.pronunciation_tip || "";

    bodyContent.innerHTML = `
      <div>
        <div class="sayit-word-row">
          <span class="sayit-word-title">${escapeHtml(text)}</span>
          ${langName ? `<span class="sayit-lang-tag">✨ ${escapeHtml(langName)} ${langCode ? `(${langCode})` : ''}</span>` : ''}
        </div>
        <div class="sayit-ipa-box">
          ${ipa ? `<span class="sayit-ipa-text">${escapeHtml(ipa)}</span>` : ''}
          ${guide ? `<span class="sayit-guide-text">${escapeHtml(guide)}</span>` : ''}
        </div>
      </div>

      <div class="sayit-audio-bar">
        <button class="sayit-play-btn" id="sayit-card-play-audio">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Play Voice
        </button>
        <span class="sayit-audio-info">${audioUrl ? "Native audio" : "Browser voice"}</span>
      </div>

      ${meaning ? `
        <div class="sayit-meaning-card">
          <div class="sayit-meaning-top">
            <div class="sayit-sec-label">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              Meaning
            </div>
            <select class="sayit-trans-dropdown" id="sayit-trans-dropdown" title="Translate meaning into another language">
              ${MEANING_LANGUAGES.map((l) => `<option value="${l.code}">${l.name}</option>`).join("")}
            </select>
          </div>
          <div id="sayit-meaning-text-container">
            <p class="sayit-meaning-val">${escapeHtml(meaning)}</p>
          </div>
        </div>
      ` : ''}

      ${syllables && syllables.length > 1 ? `
        <div>
          <div class="sayit-sec-label" style="margin-bottom:4px;">Syllables</div>
          <div class="sayit-chips-wrap">
            ${syllables.map((s) => `
              <span class="sayit-syl-chip ${s === stressed ? 'active' : ''}">
                ${escapeHtml(s)} ${s === stressed ? '★' : ''}
              </span>
            `).join("")}
          </div>
        </div>
      ` : ''}

      ${tip ? `
        <div class="sayit-tip-banner">
          <strong style="color:var(--text-accent);">Tip: </strong>${escapeHtml(tip)}
        </div>
      ` : ''}
    `;

    // Universal audio playback with browser speech fallback
    const playBtn = bodyContent.querySelector("#sayit-card-play-audio");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        playPronunciationAudio(text, audioUrl, langCode);
      });
    }

    // Meaning Translation Dropdown
    const transSelect = bodyContent.querySelector("#sayit-trans-dropdown");
    if (transSelect) {
      transSelect.addEventListener("change", async (e) => {
        const targetLang = e.target.value;
        const textContainer = bodyContent.querySelector("#sayit-meaning-text-container");

        if (targetLang === "en") {
          textContainer.innerHTML = `<p class="sayit-meaning-val">${escapeHtml(meaning)}</p>`;
          return;
        }

        textContainer.innerHTML = `
          <div style="display:flex;align-items:center;gap:5px;padding:3px 0;font-size:11px;color:var(--text-muted);">
            <div class="sayit-loader" style="width:9px;height:9px;"></div>
            Translating meaning...
          </div>
        `;

        try {
          const transRes = await fetch(`${API_BASE}/api/v1/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: meaning,
              target_language: targetLang,
              source_language: "auto",
            }),
          });
          const transData = await transRes.json();
          const translated = transData.translated_text || meaning;
          const targetLangName = MEANING_LANGUAGES.find((m) => m.code === targetLang)?.name || targetLang;

          textContainer.innerHTML = `
            <p class="sayit-meaning-val">${escapeHtml(translated)}</p>
            <div class="sayit-trans-credit">Translated to ${escapeHtml(targetLangName)}</div>
          `;
        } catch (err) {
          textContainer.innerHTML = `<p class="sayit-meaning-val">${escapeHtml(meaning)}</p>`;
        }
      });
    }
  }

  function playPronunciationAudio(text, audioUrl, langCode) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    if (audioUrl) {
      currentAudio = new Audio(audioUrl);
      const playPromise = currentAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("[SayIt] HTML Audio play failed, falling back to Web Speech:", err);
          speakWithBrowser(text, langCode);
        });
      }
    } else {
      speakWithBrowser(text, langCode);
    }
  }

  function speakWithBrowser(text, langCode) {
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (langCode) utterance.lang = langCode;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error("[SayIt] SpeechSynthesis error:", e);
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ── Highlight text to immediately show movable box ────────────────────────
  document.addEventListener("mouseup", (e) => {
    if (host.contains(e.target)) return;

    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString()?.trim();

      if (text && text.length > 0 && text.length <= 150) {
        showCursorCard(text);
      }
    }, 20);
  });

  // ── Keyboard Shortcut: Alt+S toggles movable box at cursor location ────────
  document.addEventListener("keydown", (e) => {
    if (e.altKey && (e.key === "s" || e.key === "S")) {
      const selected = window.getSelection()?.toString()?.trim();
      showCursorCard(selected || "");
    }
  });

  // ── Messages from Extension Toolbar Icon / Context Menu ───────────────────
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TOGGLE_CURSOR_WIDGET") {
      toggleCard();
      sendResponse({ ok: true });
    } else if (message.type === "SHOW_FLOATING_WIDGET") {
      showCursorCard(message.word || "");
      sendResponse({ ok: true });
    }
    return true;
  });

  console.log("[SayIt] Full movable box loaded with Dark & Light theme.");
})();
