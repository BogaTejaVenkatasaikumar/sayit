# Privacy Policy for SayIt Chrome Extension

*Last updated: October 19, 2026*

SayIt ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy describes how your information is handled when you use the **SayIt** browser extension.

---

### 1. Information We Collect

SayIt operates on a **privacy-first** design principle:
- **No Personal Identifiable Information (PII)**: SayIt does **not** collect your name, email address, IP address, browsing history, passwords, or personal credentials.
- **Highlighted Text**: When you highlight a word or phrase on a webpage, or type a word into the extension popup, that specific text snippet is processed solely to look up its pronunciation, syllables, phonetic IPA, and definitions.
- **Local Preferences**: Your preferred theme (Orange & Black or Orange & White) is stored locally on your device via standard browser `localStorage`. It is never uploaded to any remote tracking server.

---

### 2. How Information is Used

The text you select or type is used exclusively to:
1. Retrieve dictionary definitions and phonetic transcriptions (via the Free Dictionary API).
2. Generate multilingual translations when you explicitly request them.
3. Synthesize pronunciation audio for speech playback.

We **do not**:
- Sell, rent, or monetize your data.
- Track your browsing behavior across websites.
- Use analytics or tracking cookies.

---

### 3. Third-Party Services

To provide dictionary definitions, SayIt queries:
- **Free Dictionary API** (`api.dictionaryapi.dev`): For open-source dictionary definitions and native audio pronunciations.
- **Google Translation API**: For real-time lexical translation when you switch definition languages.

These queries only transmit the specific word or phrase being defined.

---

### 4. Permissions Used

- `storage`: Used solely to remember your chosen theme preference and temporary word selections.
- `contextMenus`: Used to display the right-click option ("Pronounce with SayIt").
- `activeTab` & `scripting`: Used to display the interactive floating pronunciation card on the current tab when you select text or press `Alt+S`.

---

### 5. Security

All external API lookups are transmitted securely over encrypted HTTPS connections. No data is retained on remote servers after your lookup request is completed.

---

### 6. Contact & Open Source

SayIt is an open-source project hosted on GitHub:
- **Repository**: [https://github.com/BogaTejaVenkatasaikumar/sayit](https://github.com/BogaTejaVenkatasaikumar/sayit)
- If you have questions about this policy, please open an issue on the GitHub repository.
