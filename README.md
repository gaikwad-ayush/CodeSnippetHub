# CodeSnippet Hub 🚀
> **An Open-Source Developer Snippet Manager**  
> *Lightweight • Offline-First • Zero Backend • Browser-Native*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com)
[![Prism.js](https://img.shields.io/badge/Syntax-Prism.js-orange.svg)](https://prismjs.com)

**CodeSnippet Hub** is a lightweight, offline-first, browser-based developer utility that allows programmers to store, organize, search, syntax-highlight, and backup reusable code snippets. It is designed as an open-source collaborative project under the **MIT License** that runs 100% in the client browser without requiring user accounts or external cloud databases.

---

## ✨ Key Features

- **⚡ Offline-First Architecture**: Powered by the HTML5 `localStorage` API. No cloud login required; your snippets stay on your machine.
- **🎨 Multi-Language Syntax Highlighting**: Real-time syntax colorization powered by **Prism.js** across:
  - JavaScript (`.js`)
  - TypeScript (`.ts`)
  - Python (`.py`)
  - C++ (`.cpp`)
  - HTML5 (`.html`)
  - CSS3 (`.css`)
  - PostgreSQL / SQL (`.sql`)
  - Bash / Shell (`.sh`)
  - JSON (`.json`)
  - Rust (`.rs`), Go (`.go`), and Java (`.java`)
- **🔍 Full-Text Search Engine**: Real-time case-insensitive keyword search matching across titles, code content, tags, and descriptions.
- **🏷️ Interactive Tag System**: Clickable tag chips, preset tag suggestions, and tag-filtered dashboards.
- **📋 One-Click Productivity**:
  - Quick copy to clipboard with toast notification.
  - Copy formatted as Markdown code block (` ```python ... ``` `).
  - Download single snippets directly as code files (e.g. `script.py`, `query.sql`).
- **💾 Full Backup & Restore (Data Portability)**:
  - Export all saved snippets into a downloadable JSON backup.
  - Import JSON backups with conflict resolution options: **Merge** or **Overwrite**.
- **📊 Storage Health & Usage**: Live meter displaying memory usage against browser quota limits.
- **⌨️ Keyboard Shortcuts**: Built-in developer ergonomics (`N` for new snippet, `/` for search, `Ctrl+Enter` to save, `Esc` to close, `G` to toggle layout).

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **HTML5 & CSS3** | Semantic structure and custom glassmorphism dark theme tokens |
| **Tailwind CSS** | Responsive grid, flexbox layouts, modals, and utility styling |
| **Vanilla JavaScript (ES6+)** | State management, DOM rendering, LocalStorage CRUD |
| **Prism.js** | Multi-language syntax parsing and code colorization |
| **HTML5 LocalStorage API** | Client-side persistence and zero-backend storage |

---

## 📂 Project Structure

```text
codesnippet-hub/
├── index.html              # Main HTML5 application entry point
├── css/
│   └── styles.css          # Design system, JetBrains Mono typography, custom scrollbars, Prism dark theme
├── js/
│   ├── sample-snippets.js  # Pre-loaded default code snippets across 8+ languages
│   ├── storage.js          # StorageManager: LocalStorage CRUD, export/import validation, storage quota
│   ├── state.js            # AppState: Reactive filter state, event emitter, search & sorting
│   ├── ui.js               # UIRenderer & ToastManager: DOM cards, modals, language badges
│   └── app.js              # Application controller: Event listeners, keyboard shortcuts, bootstrapping
├── README.md               # Project documentation
├── CONTRIBUTING.md         # Open-source contribution guidelines & git workflow
├── LICENSE                 # MIT License
└── .gitignore              # Git ignore rules
```

---

## 🚀 Getting Started

### Prerequisites
Any modern web browser (Google Chrome, Firefox, Safari, Microsoft Edge). No Node.js or backend server is strictly required.

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/codesnippet-hub.git
   cd codesnippet-hub
   ```

2. **Open `index.html` in your browser:**
   - Double click `index.html` directly, or
   - Use a lightweight local server:
     ```bash
     # Python 3
     python -m http.server 8080

     # Or Node.js
     npx serve .
     ```
   - Navigate to `http://localhost:8080` in your browser.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>N</kbd> | Open New Snippet Modal |
| <kbd>/</kbd> | Focus Search Bar |
| <kbd>G</kbd> | Toggle between Grid and List view |
| <kbd>Ctrl</kbd> + <kbd>Enter</kbd> | Save Snippet (while in editor) |
| <kbd>Esc</kbd> | Close any active modal or clear search focus |
| <kbd>?</kbd> | Open Keyboard Shortcuts modal |

---

## 🤝 Contributing

We welcome contributions from developers worldwide! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, development guidelines, and pull request workflow.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.
