/**
 * CodeSnippet Hub - UI & Renderer Module
 * Handles DOM generation, card rendering, Prism highlighting, modals, toasts, and interactions
 */

const LANGUAGE_CONFIG = {
  javascript: { name: 'JavaScript', prismLang: 'javascript', ext: '.js', color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)', border: 'rgba(250, 204, 21, 0.3)' },
  typescript: { name: 'TypeScript', prismLang: 'typescript', ext: '.ts', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', border: 'rgba(96, 165, 250, 0.3)' },
  python:     { name: 'Python',     prismLang: 'python',     ext: '.py', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)' },
  cpp:        { name: 'C++',        prismLang: 'cpp',        ext: '.cpp',color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: 'rgba(192, 132, 252, 0.3)' },
  html:       { name: 'HTML5',      prismLang: 'markup',     ext: '.html',color: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.3)' },
  css:        { name: 'CSS3',       prismLang: 'css',        ext: '.css', color: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)', border: 'rgba(244, 114, 182, 0.3)' },
  sql:        { name: 'SQL',        prismLang: 'sql',        ext: '.sql', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)' },
  bash:       { name: 'Bash',       prismLang: 'bash',       ext: '.sh',  color: '#a3e635', bg: 'rgba(163, 230, 53, 0.15)', border: 'rgba(163, 230, 53, 0.3)' },
  json:       { name: 'JSON',       prismLang: 'json',       ext: '.json',color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)' },
  rust:       { name: 'Rust',       prismLang: 'rust',       ext: '.rs',  color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.3)' },
  go:         { name: 'Go',         prismLang: 'go',         ext: '.go',  color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)', border: 'rgba(34, 211, 238, 0.3)' },
  java:       { name: 'Java',       prismLang: 'java',       ext: '.java',color: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)', border: 'rgba(251, 113, 133, 0.3)' }
};

class ToastManager {
  static container = null;

  static init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show a toast message
   * @param {string} message 
   * @param {'success'|'error'|'info'|'warning'} type 
   * @param {number} duration ms
   */
  static show(message, type = 'success', duration = 3200) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast-item pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-medium transition-all duration-300 transform translate-y-3 opacity-0`;
    
    let iconSvg = '';
    let borderClass = '';
    let bgClass = 'bg-slate-900/95 text-slate-100';

    if (type === 'success') {
      borderClass = 'border-emerald-500/40 shadow-emerald-950/40';
      iconSvg = `<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>`;
    } else if (type === 'error') {
      borderClass = 'border-rose-500/40 shadow-rose-950/40';
      iconSvg = `<svg class="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>`;
    } else if (type === 'warning') {
      borderClass = 'border-amber-500/40 shadow-amber-950/40';
      iconSvg = `<svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>`;
    } else {
      borderClass = 'border-cyan-500/40 shadow-cyan-950/40';
      iconSvg = `<svg class="w-5 h-5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>`;
    }

    toast.className += ` ${borderClass} ${bgClass}`;
    toast.innerHTML = `
      ${iconSvg}
      <span class="flex-1">${this.escapeHTML(message)}</span>
      <button type="button" class="text-slate-400 hover:text-slate-200 ml-2 focus:outline-none" aria-label="Dismiss toast">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    `;

    toast.querySelector('button').addEventListener('click', () => {
      this.dismiss(toast);
    });

    this.container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Auto dismiss timer
    const timer = setTimeout(() => {
      this.dismiss(toast);
    }, duration);

    toast._dismissTimer = timer;
  }

  static dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    clearTimeout(toast._dismissTimer);
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-3', 'opacity-0');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }

  static escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

class UIRenderer {
  /**
   * Format relative time string ("5 mins ago", "yesterday", etc.)
   */
  static formatRelativeTime(dateString) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);

      if (seconds < 60) return 'Just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days}d ago`;
      const months = Math.floor(days / 30);
      if (months < 12) return `${months}mo ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  static escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Get metadata for a language
   */
  static getLangMeta(lang) {
    const key = (lang || 'javascript').toLowerCase();
    return LANGUAGE_CONFIG[key] || {
      name: (lang || 'Code').toUpperCase(),
      prismLang: 'javascript',
      ext: '.txt',
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.15)',
      border: 'rgba(148, 163, 184, 0.3)'
    };
  }

  /**
   * Render snippet card in Grid view
   */
  static createSnippetCard(snippet, isListMode = false) {
    const card = document.createElement('article');
    card.className = `snippet-card group relative flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 shadow-lg hover:shadow-2xl hover:shadow-indigo-950/30 transition-all duration-300 backdrop-blur-md overflow-hidden ${
      isListMode ? 'w-full' : ''
    }`;
    card.dataset.id = snippet.id;

    const langMeta = this.getLangMeta(snippet.language);
    const lineCount = (snippet.code || '').split('\n').length;
    const charCount = (snippet.code || '').length;
    const timeFormatted = this.formatRelativeTime(snippet.updatedAt || snippet.createdAt);
    const fullDate = new Date(snippet.createdAt).toLocaleString();

    // Limit code preview to 10 lines for performance and clean UI
    const codeLines = (snippet.code || '').split('\n');
    const isTruncated = codeLines.length > 10;
    const previewCode = isTruncated ? codeLines.slice(0, 10).join('\n') : snippet.code;

    // Tags HTML
    const tagsHtml = (snippet.tags || []).map(tag => `
      <button type="button" class="tag-chip inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-800 text-slate-300 hover:bg-indigo-950/80 hover:text-indigo-300 transition-colors" data-tag="${this.escapeHTML(tag)}">
        #${this.escapeHTML(tag)}
      </button>
    `).join('');

    card.innerHTML = `
      <!-- Card Top Header -->
      <div class="p-5 pb-3 flex items-start justify-between gap-3 border-b border-slate-800/60">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2">
            <!-- Language Badge -->
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono tracking-wide uppercase"
                  style="color: ${langMeta.color}; background-color: ${langMeta.bg}; border: 1px solid ${langMeta.border}">
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${langMeta.color}"></span>
              ${langMeta.name}
            </span>
            <span class="text-xs text-slate-500 font-mono" title="${charCount} characters">• ${lineCount} ${lineCount === 1 ? 'line' : 'lines'}</span>
          </div>
          <h3 class="text-lg font-bold text-slate-100 hover:text-indigo-300 transition-colors truncate cursor-pointer snippet-title-btn" title="${this.escapeHTML(snippet.title)}">
            ${this.escapeHTML(snippet.title)}
          </h3>
          ${snippet.description ? `
            <p class="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              ${this.escapeHTML(snippet.description)}
            </p>
          ` : ''}
        </div>

        <!-- Favorite Toggle Star -->
        <button type="button" class="fav-toggle-btn p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800/70 transition-colors shrink-0" 
                title="${snippet.isFavorite ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Toggle favorite">
          <svg class="w-5 h-5 ${snippet.isFavorite ? 'text-amber-400 fill-amber-400' : 'fill-none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
        </button>
      </div>

      <!-- Code Window Area -->
      <div class="relative bg-slate-950/90 border-b border-slate-800/60 overflow-hidden group/code cursor-pointer view-snippet-code">
        <!-- Window title bar with dots -->
        <div class="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800/40 select-none">
          <div class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span class="text-[11px] font-mono text-slate-400">snippet${langMeta.ext}</span>
          <button type="button" class="quick-copy-btn p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Copy code" aria-label="Copy code">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </button>
        </div>

        <!-- Code Block -->
        <div class="max-h-52 overflow-hidden text-xs font-mono px-4 py-3 bg-slate-950 relative">
          <pre class="language-${langMeta.prismLang} !m-0 !p-0 !bg-transparent"><code class="language-${langMeta.prismLang}">${this.escapeHTML(previewCode)}</code></pre>
          ${isTruncated ? `
            <div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-end justify-center pb-2 pointer-events-none">
              <span class="text-[11px] font-mono font-medium text-indigo-400 bg-indigo-950/90 px-2.5 py-0.5 rounded-full border border-indigo-800/60 shadow">
                +${codeLines.length - 10} more lines (Click to view)
              </span>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Card Footer -->
      <div class="p-4 pt-3 flex flex-col gap-3 mt-auto">
        <!-- Tags container -->
        ${tagsHtml ? `
          <div class="flex flex-wrap gap-1.5 items-center">
            ${tagsHtml}
          </div>
        ` : ''}

        <div class="flex items-center justify-between pt-1 border-t border-slate-800/40 text-xs text-slate-400">
          <span class="font-mono" title="${fullDate}">
            ${timeFormatted}
          </span>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-1">
            <button type="button" class="action-copy-btn p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors" title="Copy code" aria-label="Copy snippet code">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>

            <button type="button" class="action-view-btn p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors" title="View snippet details" aria-label="View snippet details">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>

            <button type="button" class="action-download-btn p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors" title="Download snippet file" aria-label="Download snippet file">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </button>

            <button type="button" class="action-edit-btn p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors" title="Edit snippet" aria-label="Edit snippet">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>

            <button type="button" class="action-delete-btn p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors" title="Delete snippet" aria-label="Delete snippet">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Highlight code via Prism
    const codeEl = card.querySelector('code');
    if (codeEl && typeof Prism !== 'undefined') {
      try {
        Prism.highlightElement(codeEl);
      } catch (err) {
        console.warn('Prism highlight error:', err);
      }
    }

    return card;
  }

  /**
   * Render snippet card in compact List view
   */
  static createSnippetListItem(snippet) {
    const item = document.createElement('article');
    item.className = 'snippet-list-item group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900 shadow-md hover:shadow-xl transition-all duration-200 backdrop-blur-md';
    item.dataset.id = snippet.id;

    const langMeta = this.getLangMeta(snippet.language);
    const lineCount = (snippet.code || '').split('\n').length;
    const timeFormatted = this.formatRelativeTime(snippet.updatedAt || snippet.createdAt);

    const tagsHtml = (snippet.tags || []).slice(0, 3).map(tag => `
      <button type="button" class="tag-chip inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 hover:bg-indigo-950 hover:text-indigo-300 transition-colors" data-tag="${this.escapeHTML(tag)}">
        #${this.escapeHTML(tag)}
      </button>
    `).join('');

    item.innerHTML = `
      <div class="flex items-center gap-3.5 min-w-0 flex-1">
        <button type="button" class="fav-toggle-btn p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors shrink-0" 
                title="${snippet.isFavorite ? 'Remove favorite' : 'Add favorite'}">
          <svg class="w-4 h-4 ${snippet.isFavorite ? 'text-amber-400 fill-amber-400' : 'fill-none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
        </button>

        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold font-mono tracking-wide uppercase shrink-0"
              style="color: ${langMeta.color}; background-color: ${langMeta.bg}; border: 1px solid ${langMeta.border}">
          ${langMeta.name}
        </span>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-slate-100 hover:text-indigo-300 transition-colors truncate cursor-pointer snippet-title-btn" title="${this.escapeHTML(snippet.title)}">
              ${this.escapeHTML(snippet.title)}
            </h3>
            <span class="text-[11px] text-slate-500 font-mono hidden sm:inline">• ${lineCount}L</span>
          </div>
          ${snippet.description ? `<p class="text-xs text-slate-400 truncate mt-0.5">${this.escapeHTML(snippet.description)}</p>` : ''}
        </div>
      </div>

      <div class="flex items-center justify-between md:justify-end gap-3 shrink-0">
        <div class="flex items-center gap-1.5 hidden lg:flex">
          ${tagsHtml}
        </div>

        <span class="text-xs font-mono text-slate-500">${timeFormatted}</span>

        <!-- Actions -->
        <div class="flex items-center space-x-1">
          <button type="button" class="action-copy-btn p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors" title="Copy code">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </button>
          <button type="button" class="action-view-btn p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors" title="View details">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
          <button type="button" class="action-edit-btn p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors" title="Edit snippet">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button type="button" class="action-delete-btn p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors" title="Delete snippet">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    return item;
  }

  /**
   * Render Empty state when no snippets match filters
   */
  static renderEmptyState(isFilterActive = false) {
    const container = document.createElement('div');
    container.className = 'col-span-full flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800';
    
    if (isFilterActive) {
      container.innerHTML = `
        <div class="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-200 mb-1">No Matching Snippets Found</h3>
        <p class="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          We couldn't find any code snippets matching your current search query or filter tags. Try clearing the filters.
        </p>
        <button type="button" id="btn-empty-reset" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Reset All Filters
        </button>
      `;
    } else {
      container.innerHTML = `
        <div class="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-200 mb-1">No Snippets in Your Hub</h3>
        <p class="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Your local snippet hub is currently empty. Start building your developer library by saving your first snippet or restore default examples.
        </p>
        <div class="flex items-center gap-3">
          <button type="button" id="btn-empty-new" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Create Snippet
          </button>
          <button type="button" id="btn-empty-restore-samples" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-all">
            Load Sample Snippets
          </button>
        </div>
      `;
    }
    return container;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ToastManager, UIRenderer, LANGUAGE_CONFIG };
}
