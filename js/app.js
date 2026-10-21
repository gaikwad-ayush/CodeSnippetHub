/**
 * CodeSnippet Hub - Main Controller & Application Logic
 * Wires State, UI Rendering, Modals, Keyboard Shortcuts, and LocalStorage
 */

document.addEventListener('DOMContentLoaded', () => {
  const state = new AppState();

  // Cache Core DOM Elements
  const elements = {
    // Top Bar & Search
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    languageFilter: document.getElementById('filter-language'),
    tagFilter: document.getElementById('filter-tag'),
    sortFilter: document.getElementById('filter-sort'),
    favFilterBtn: document.getElementById('filter-fav-btn'),
    viewGridBtn: document.getElementById('view-grid-btn'),
    viewListBtn: document.getElementById('view-list-btn'),
    activeFilterBar: document.getElementById('active-filters-bar'),
    activeFilterChips: document.getElementById('active-filter-chips'),
    clearAllFiltersBtn: document.getElementById('btn-clear-all-filters'),

    // Stats Bar
    statTotal: document.getElementById('stat-total-count'),
    statLanguages: document.getElementById('stat-languages-count'),
    statFavorites: document.getElementById('stat-favorites-count'),
    statStorageBar: document.getElementById('stat-storage-bar'),
    statStorageText: document.getElementById('stat-storage-text'),

    // Cards Grid
    snippetsContainer: document.getElementById('snippets-grid'),

    // Action Triggers
    btnNewSnippet: document.getElementById('btn-new-snippet'),
    btnBackupModal: document.getElementById('btn-backup-modal'),
    btnHelpModal: document.getElementById('btn-help-modal'),

    // Snippet Form Modal
    snippetModal: document.getElementById('snippet-form-modal'),
    snippetModalTitle: document.getElementById('modal-form-title'),
    formSnippetId: document.getElementById('form-snippet-id'),
    formTitle: document.getElementById('form-title'),
    formLanguage: document.getElementById('form-language'),
    formDescription: document.getElementById('form-description'),
    formCode: document.getElementById('form-code'),
    formCodeLines: document.getElementById('form-code-lines'),
    formTagInput: document.getElementById('form-tag-input'),
    formTagsContainer: document.getElementById('form-tags-container'),
    formCloseBtn: document.getElementById('btn-modal-form-close'),
    formCancelBtn: document.getElementById('btn-modal-form-cancel'),
    formSubmitBtn: document.getElementById('btn-modal-form-save'),
    formTabEdit: document.getElementById('form-tab-edit'),
    formTabPreview: document.getElementById('form-tab-preview'),
    formEditorView: document.getElementById('form-editor-view'),
    formPreviewView: document.getElementById('form-preview-view'),
    formPreviewCode: document.getElementById('form-preview-code'),

    // Snippet Detail Modal
    detailModal: document.getElementById('snippet-detail-modal'),
    detailTitle: document.getElementById('detail-title'),
    detailLangBadge: document.getElementById('detail-lang-badge'),
    detailMetaTime: document.getElementById('detail-meta-time'),
    detailMetaLines: document.getElementById('detail-meta-lines'),
    detailDescription: document.getElementById('detail-description'),
    detailTags: document.getElementById('detail-tags'),
    detailCode: document.getElementById('detail-code'),
    detailCopyBtn: document.getElementById('btn-detail-copy'),
    detailCopyMarkdownBtn: document.getElementById('btn-detail-copy-md'),
    detailDownloadBtn: document.getElementById('btn-detail-download'),
    detailEditBtn: document.getElementById('btn-detail-edit'),
    detailDeleteBtn: document.getElementById('btn-detail-delete'),
    detailCloseBtn: document.getElementById('btn-detail-close'),

    // Delete Confirmation Modal
    deleteModal: document.getElementById('delete-confirm-modal'),
    deleteSnippetTitle: document.getElementById('delete-snippet-title'),
    deleteConfirmBtn: document.getElementById('btn-delete-confirm'),
    deleteCancelBtn: document.getElementById('btn-delete-cancel'),

    // Backup & Restore Modal
    backupModal: document.getElementById('backup-modal'),
    backupCloseBtn: document.getElementById('btn-backup-close'),
    backupTabExport: document.getElementById('tab-btn-export'),
    backupTabImport: document.getElementById('tab-btn-import'),
    backupSectionExport: document.getElementById('backup-section-export'),
    backupSectionImport: document.getElementById('backup-section-import'),
    btnDownloadBackup: document.getElementById('btn-download-backup'),
    btnCopyBackupJson: document.getElementById('btn-copy-backup-json'),
    backupExportSummary: document.getElementById('backup-export-summary'),
    importFileInput: document.getElementById('import-file-input'),
    importDropzone: document.getElementById('import-dropzone'),
    importJsonText: document.getElementById('import-json-text'),
    importModeMerge: document.getElementById('import-mode-merge'),
    importModeOverwrite: document.getElementById('import-mode-overwrite'),
    btnPerformImport: document.getElementById('btn-perform-import'),
    btnRestoreDefaults: document.getElementById('btn-restore-defaults'),
    btnClearAll: document.getElementById('btn-clear-all-data'),

    // Keyboard Shortcuts Modal
    helpModal: document.getElementById('help-modal'),
    helpCloseBtn: document.getElementById('btn-help-close')
  };

  // State for active modal form tags
  let currentFormTags = [];
  let pendingDeleteId = null;
  let activeDetailSnippet = null;

  // Initialize Toast System
  ToastManager.init();

  // Helper: Copy text with fallback
  async function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      ToastManager.show(successMessage, 'success');
      return true;
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      ToastManager.show('Failed to copy to clipboard', 'error');
      return false;
    }
  }

  // Helper: Download text as file
  function downloadSnippetFile(filename, content) {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      ToastManager.show(`Downloaded "${filename}"`, 'info');
    } catch (err) {
      console.error('Download error:', err);
      ToastManager.show('File download failed', 'error');
    }
  }

  // Modal Open/Close Helpers with ESC and Focus management
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('hidden');
    modalEl.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    // Animate dialog scale
    const dialogBox = modalEl.querySelector('.modal-dialog-box');
    if (dialogBox) {
      dialogBox.classList.remove('scale-95', 'opacity-0');
      dialogBox.classList.add('scale-100', 'opacity-100');
    }
  }

  function closeModal(modalEl) {
    if (!modalEl || modalEl.classList.contains('hidden')) return;
    const dialogBox = modalEl.querySelector('.modal-dialog-box');
    if (dialogBox) {
      dialogBox.classList.remove('scale-100', 'opacity-100');
      dialogBox.classList.add('scale-95', 'opacity-0');
    }
    setTimeout(() => {
      modalEl.classList.add('hidden');
      modalEl.classList.remove('flex');
      // If no other modal open, restore body scrolling
      const anyOpen = document.querySelectorAll('.app-modal:not(.hidden)');
      if (anyOpen.length === 0) {
        document.body.classList.remove('overflow-hidden');
      }
    }, 150);
  }

  function closeAllModals() {
    [elements.snippetModal, elements.detailModal, elements.deleteModal, elements.backupModal, elements.helpModal]
      .forEach(m => closeModal(m));
  }

  // Update Line Numbers in Code Textarea
  function updateCodeLineNumbers() {
    const text = elements.formCode.value;
    const lines = text.split('\n').length;
    let numbersHtml = '';
    for (let i = 1; i <= Math.max(lines, 1); i++) {
      numbersHtml += `<div>${i}</div>`;
    }
    elements.formCodeLines.innerHTML = numbersHtml;
  }

  // Render Form Tags Chips
  function renderFormTags() {
    elements.formTagsContainer.innerHTML = '';
    currentFormTags.forEach((tag, index) => {
      const chip = document.createElement('span');
      chip.className = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 shadow-sm';
      chip.innerHTML = `
        #${UIRenderer.escapeHTML(tag)}
        <button type="button" class="text-indigo-400 hover:text-white ml-0.5 remove-tag-btn" data-index="${index}" aria-label="Remove tag">
          &times;
        </button>
      `;
      chip.querySelector('.remove-tag-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        currentFormTags.splice(index, 1);
        renderFormTags();
      });
      elements.formTagsContainer.appendChild(chip);
    });
  }

  function addFormTag(tagText) {
    const clean = tagText.trim().toLowerCase().replace(/^#+/, '');
    if (clean && !currentFormTags.includes(clean)) {
      if (currentFormTags.length >= 8) {
        ToastManager.show('Maximum 8 tags per snippet', 'warning');
        return;
      }
      currentFormTags.push(clean);
      renderFormTags();
    }
    elements.formTagInput.value = '';
  }

  // Open Snippet Editor Modal (Create or Edit)
  function openSnippetForm(snippet = null) {
    // Reset tabs to Editor view
    switchFormTab('edit');

    if (snippet) {
      elements.snippetModalTitle.textContent = 'Edit Code Snippet';
      elements.formSnippetId.value = snippet.id;
      elements.formTitle.value = snippet.title;
      elements.formLanguage.value = snippet.language || 'javascript';
      elements.formDescription.value = snippet.description || '';
      elements.formCode.value = snippet.code || '';
      currentFormTags = Array.isArray(snippet.tags) ? [...snippet.tags] : [];
    } else {
      elements.snippetModalTitle.textContent = 'Create New Snippet';
      elements.formSnippetId.value = '';
      elements.formTitle.value = '';
      elements.formLanguage.value = state.filters.language !== 'all' ? state.filters.language : 'javascript';
      elements.formDescription.value = '';
      elements.formCode.value = '';
      currentFormTags = state.filters.tag !== 'all' ? [state.filters.tag] : [];
    }

    renderFormTags();
    updateCodeLineNumbers();
    openModal(elements.snippetModal);
    setTimeout(() => elements.formTitle.focus(), 160);
  }

  function switchFormTab(tab) {
    if (tab === 'preview') {
      elements.formTabPreview.classList.add('border-indigo-500', 'text-indigo-400', 'bg-indigo-950/40');
      elements.formTabPreview.classList.remove('border-transparent', 'text-slate-400');
      elements.formTabEdit.classList.remove('border-indigo-500', 'text-indigo-400', 'bg-indigo-950/40');
      elements.formTabEdit.classList.add('border-transparent', 'text-slate-400');

      elements.formEditorView.classList.add('hidden');
      elements.formPreviewView.classList.remove('hidden');

      // Render Prism Preview
      const lang = elements.formLanguage.value || 'javascript';
      const langMeta = UIRenderer.getLangMeta(lang);
      const code = elements.formCode.value || '// Empty code snippet';
      elements.formPreviewCode.className = `language-${langMeta.prismLang}`;
      elements.formPreviewCode.textContent = code;
      if (typeof Prism !== 'undefined') {
        try {
          Prism.highlightElement(elements.formPreviewCode);
        } catch (e) {
          console.warn('Prism preview highlight error:', e);
        }
      }
    } else {
      elements.formTabEdit.classList.add('border-indigo-500', 'text-indigo-400', 'bg-indigo-950/40');
      elements.formTabEdit.classList.remove('border-transparent', 'text-slate-400');
      elements.formTabPreview.classList.remove('border-indigo-500', 'text-indigo-400', 'bg-indigo-950/40');
      elements.formTabPreview.classList.add('border-transparent', 'text-slate-400');

      elements.formEditorView.classList.remove('hidden');
      elements.formPreviewView.classList.add('hidden');
    }
  }

  // Open Snippet Detail Modal
  function openDetailModal(snippet) {
    if (!snippet) return;
    activeDetailSnippet = snippet;

    const langMeta = UIRenderer.getLangMeta(snippet.language);
    elements.detailTitle.textContent = snippet.title;

    // Language Badge
    elements.detailLangBadge.textContent = langMeta.name;
    elements.detailLangBadge.style.color = langMeta.color;
    elements.detailLangBadge.style.backgroundColor = langMeta.bg;
    elements.detailLangBadge.style.borderColor = langMeta.border;

    // Meta timestamps & lines
    const lineCount = (snippet.code || '').split('\n').length;
    const charCount = (snippet.code || '').length;
    elements.detailMetaLines.textContent = `${lineCount} lines • ${charCount} chars`;
    elements.detailMetaTime.textContent = `Updated ${new Date(snippet.updatedAt || snippet.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

    // Description
    if (snippet.description && snippet.description.trim()) {
      elements.detailDescription.textContent = snippet.description;
      elements.detailDescription.classList.remove('hidden');
    } else {
      elements.detailDescription.classList.add('hidden');
    }

    // Tags
    if (snippet.tags && snippet.tags.length > 0) {
      elements.detailTags.innerHTML = snippet.tags.map(t => `
        <button type="button" class="tag-chip inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-800 text-slate-300 hover:bg-indigo-950 hover:text-indigo-300 transition-colors" data-tag="${UIRenderer.escapeHTML(t)}">
          #${UIRenderer.escapeHTML(t)}
        </button>
      `).join('');
      elements.detailTags.classList.remove('hidden');
    } else {
      elements.detailTags.classList.add('hidden');
    }

    // Code & Highlight
    elements.detailCode.className = `language-${langMeta.prismLang}`;
    elements.detailCode.textContent = snippet.code;
    if (typeof Prism !== 'undefined') {
      try {
        Prism.highlightElement(elements.detailCode);
      } catch (err) {
        console.warn('Prism highlight error in detail modal:', err);
      }
    }

    openModal(elements.detailModal);
  }

  // Open Delete Confirmation Modal
  function openDeleteModal(snippetId) {
    const snippet = state.snippets.find(s => s.id === snippetId);
    if (!snippet) return;
    pendingDeleteId = snippetId;
    elements.deleteSnippetTitle.textContent = `"${snippet.title}"`;
    openModal(elements.deleteModal);
  }

  // Render Full Snippet List & Metrics
  function renderAll() {
    const filtered = state.getFilteredSnippets();
    const metrics = state.getMetrics();
    const isFilterActive = Boolean(
      state.filters.query ||
      state.filters.language !== 'all' ||
      state.filters.tag !== 'all' ||
      state.filters.favoritesOnly
    );

    // 1. Update Metrics Bar
    elements.statTotal.textContent = metrics.total;
    elements.statLanguages.textContent = metrics.languages;
    elements.statFavorites.textContent = metrics.favorites;
    elements.statStorageText.textContent = `${metrics.storage.formatted} (${metrics.storage.percent}%)`;
    elements.statStorageBar.style.width = `${Math.max(4, metrics.storage.percent)}%`;

    // 2. Update Filter Dropdowns Options dynamically
    updateDropdownOptions();

    // 3. Update Active Filter Badges Bar
    renderActiveFilterBadges(isFilterActive);

    // 4. Update View Mode Button states
    if (state.viewMode === 'grid') {
      elements.viewGridBtn.classList.add('bg-indigo-600', 'text-white');
      elements.viewGridBtn.classList.remove('text-slate-400');
      elements.viewListBtn.classList.remove('bg-indigo-600', 'text-white');
      elements.viewListBtn.classList.add('text-slate-400');
      elements.snippetsContainer.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6';
    } else {
      elements.viewListBtn.classList.add('bg-indigo-600', 'text-white');
      elements.viewListBtn.classList.remove('text-slate-400');
      elements.viewGridBtn.classList.remove('bg-indigo-600', 'text-white');
      elements.viewGridBtn.classList.add('text-slate-400');
      elements.snippetsContainer.className = 'flex flex-col space-y-3';
    }

    // 5. Update Favorites Toggle Button Appearance
    if (state.filters.favoritesOnly) {
      elements.favFilterBtn.classList.add('bg-amber-500/20', 'text-amber-400', 'border-amber-500/50');
      elements.favFilterBtn.classList.remove('text-slate-400', 'border-slate-800');
    } else {
      elements.favFilterBtn.classList.remove('bg-amber-500/20', 'text-amber-400', 'border-amber-500/50');
      elements.favFilterBtn.classList.add('text-slate-400', 'border-slate-800');
    }

    // 6. Clear container and render items or empty state
    elements.snippetsContainer.innerHTML = '';

    if (filtered.length === 0) {
      const emptyEl = UIRenderer.renderEmptyState(isFilterActive);
      elements.snippetsContainer.appendChild(emptyEl);

      const btnReset = emptyEl.querySelector('#btn-empty-reset');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          elements.searchInput.value = '';
          state.resetFilters();
        });
      }

      const btnNew = emptyEl.querySelector('#btn-empty-new');
      if (btnNew) {
        btnNew.addEventListener('click', () => openSnippetForm());
      }

      const btnRestore = emptyEl.querySelector('#btn-empty-restore-samples');
      if (btnRestore) {
        btnRestore.addEventListener('click', () => {
          state.reloadFromStorage();
          StorageManager.resetToDefaults();
          state.reloadFromStorage();
          ToastManager.show('Sample snippets restored!', 'success');
        });
      }
      return;
    }

    // Render Cards
    const fragment = document.createDocumentFragment();
    filtered.forEach(snippet => {
      const card = state.viewMode === 'grid'
        ? UIRenderer.createSnippetCard(snippet)
        : UIRenderer.createSnippetListItem(snippet);

      // Card event listeners
      bindCardEvents(card, snippet);
      fragment.appendChild(card);
    });

    elements.snippetsContainer.appendChild(fragment);
  }

  // Bind Card Click Handlers
  function bindCardEvents(cardEl, snippet) {
    // 1. Favorite toggle
    const favBtn = cardEl.querySelector('.fav-toggle-btn');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isFav = state.toggleFavorite(snippet.id);
        ToastManager.show(isFav ? 'Added to favorites' : 'Removed from favorites', 'info', 2000);
      });
    }

    // 2. Quick Copy Code
    const quickCopy = cardEl.querySelector('.quick-copy-btn');
    if (quickCopy) {
      quickCopy.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(snippet.code, `Copied "${snippet.title}"!`);
      });
    }

    const actionCopy = cardEl.querySelector('.action-copy-btn');
    if (actionCopy) {
      actionCopy.addEventListener('click', (e) => {
        e.stopPropagation();
        copyToClipboard(snippet.code, `Copied "${snippet.title}"!`);
      });
    }

    // 3. View detail modal triggers
    const titleBtn = cardEl.querySelector('.snippet-title-btn');
    if (titleBtn) {
      titleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openDetailModal(snippet);
      });
    }

    const codePreviewArea = cardEl.querySelector('.view-snippet-code');
    if (codePreviewArea) {
      codePreviewArea.addEventListener('click', (e) => {
        if (!e.target.closest('.quick-copy-btn')) {
          openDetailModal(snippet);
        }
      });
    }

    const actionView = cardEl.querySelector('.action-view-btn');
    if (actionView) {
      actionView.addEventListener('click', (e) => {
        e.stopPropagation();
        openDetailModal(snippet);
      });
    }

    // 4. Download file
    const downloadBtn = cardEl.querySelector('.action-download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const langMeta = UIRenderer.getLangMeta(snippet.language);
        const safeName = snippet.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
        downloadSnippetFile(`${safeName}${langMeta.ext}`, snippet.code);
      });
    }

    // 5. Edit snippet
    const editBtn = cardEl.querySelector('.action-edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSnippetForm(snippet);
      });
    }

    // 6. Delete snippet
    const deleteBtn = cardEl.querySelector('.action-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openDeleteModal(snippet.id);
      });
    }

    // 7. Clickable tag chips inside card
    const tagChips = cardEl.querySelectorAll('.tag-chip');
    tagChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = chip.dataset.tag;
        if (tag) {
          state.setTagFilter(tag);
          elements.tagFilter.value = tag;
        }
      });
    });
  }

  // Update Dynamic Tag & Language Dropdown Options
  function updateDropdownOptions() {
    // Languages
    const currentLang = state.filters.language;
    const languages = state.getAvailableLanguages();
    let langOptionsHtml = '<option value="all">All Languages</option>';
    languages.forEach(({ name, count }) => {
      const meta = UIRenderer.getLangMeta(name);
      langOptionsHtml += `<option value="${name}" ${currentLang === name ? 'selected' : ''}>${meta.name} (${count})</option>`;
    });
    elements.languageFilter.innerHTML = langOptionsHtml;

    // Tags
    const currentTag = state.filters.tag;
    const tags = state.getAvailableTags();
    let tagOptionsHtml = '<option value="all">All Tags</option>';
    tags.forEach(({ name, count }) => {
      tagOptionsHtml += `<option value="${name}" ${currentTag === name ? 'selected' : ''}>#${name} (${count})</option>`;
    });
    elements.tagFilter.innerHTML = tagOptionsHtml;
  }

  // Render Active Filter Badges Bar
  function renderActiveFilterBadges(isFilterActive) {
    if (!isFilterActive) {
      elements.activeFilterBar.classList.add('hidden');
      elements.activeFilterChips.innerHTML = '';
      return;
    }

    elements.activeFilterBar.classList.remove('hidden');
    elements.activeFilterChips.innerHTML = '';

    if (state.filters.query) {
      const chip = createFilterChip(`Search: "${state.filters.query}"`, () => {
        elements.searchInput.value = '';
        state.setSearchQuery('');
      });
      elements.activeFilterChips.appendChild(chip);
    }

    if (state.filters.language !== 'all') {
      const meta = UIRenderer.getLangMeta(state.filters.language);
      const chip = createFilterChip(`Lang: ${meta.name}`, () => {
        state.setLanguageFilter('all');
        elements.languageFilter.value = 'all';
      });
      elements.activeFilterChips.appendChild(chip);
    }

    if (state.filters.tag !== 'all') {
      const chip = createFilterChip(`Tag: #${state.filters.tag}`, () => {
        state.setTagFilter('all');
        elements.tagFilter.value = 'all';
      });
      elements.activeFilterChips.appendChild(chip);
    }

    if (state.filters.favoritesOnly) {
      const chip = createFilterChip('Starred only', () => {
        state.toggleFavoritesOnly();
      });
      elements.activeFilterChips.appendChild(chip);
    }
  }

  function createFilterChip(label, onRemove) {
    const chip = document.createElement('span');
    chip.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/90 text-indigo-200 border border-indigo-700/60 shadow-sm';
    chip.innerHTML = `
      <span>${UIRenderer.escapeHTML(label)}</span>
      <button type="button" class="text-indigo-400 hover:text-white font-bold ml-1 focus:outline-none" aria-label="Remove filter">&times;</button>
    `;
    chip.querySelector('button').addEventListener('click', onRemove);
    return chip;
  }

  // EVENT LISTENERS //

  // Subscribe state changes to re-render
  state.subscribe(() => {
    renderAll();
  });

  // Search Input live handler with debounce
  let searchDebounceTimer;
  elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    const query = e.target.value;
    if (query.trim()) {
      elements.searchClearBtn.classList.remove('hidden');
    } else {
      elements.searchClearBtn.classList.add('hidden');
    }
    searchDebounceTimer = setTimeout(() => {
      state.setSearchQuery(query);
    }, 200);
  });

  elements.searchClearBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.searchClearBtn.classList.add('hidden');
    state.setSearchQuery('');
    elements.searchInput.focus();
  });

  // Filter Dropdowns
  elements.languageFilter.addEventListener('change', (e) => {
    state.setLanguageFilter(e.target.value);
  });

  elements.tagFilter.addEventListener('change', (e) => {
    state.setTagFilter(e.target.value);
  });

  elements.sortFilter.addEventListener('change', (e) => {
    state.setSortBy(e.target.value);
  });

  elements.favFilterBtn.addEventListener('click', () => {
    state.toggleFavoritesOnly();
  });

  elements.viewGridBtn.addEventListener('click', () => {
    state.setViewMode('grid');
  });

  elements.viewListBtn.addEventListener('click', () => {
    state.setViewMode('list');
  });

  elements.clearAllFiltersBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.searchClearBtn.classList.add('hidden');
    state.resetFilters();
  });

  // Global Primary Action Buttons
  elements.btnNewSnippet.addEventListener('click', () => {
    openSnippetForm();
  });

  elements.btnBackupModal.addEventListener('click', () => {
    openModal(elements.backupModal);
    updateBackupModalData();
  });

  elements.btnHelpModal.addEventListener('click', () => {
    openModal(elements.helpModal);
  });

  // Snippet Form Modal Tabs & Inputs
  elements.formTabEdit.addEventListener('click', () => switchFormTab('edit'));
  elements.formTabPreview.addEventListener('click', () => switchFormTab('preview'));

  // Textarea Line Numbers & Tab Handling
  elements.formCode.addEventListener('input', updateCodeLineNumbers);
  elements.formCode.addEventListener('scroll', () => {
    elements.formCodeLines.scrollTop = elements.formCode.value ? elements.formCode.scrollTop : 0;
  });

  elements.formCode.addEventListener('keydown', (e) => {
    // Tab key inserts 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = elements.formCode.selectionStart;
      const end = elements.formCode.selectionEnd;
      const val = elements.formCode.value;
      elements.formCode.value = val.substring(0, start) + '  ' + val.substring(end);
      elements.formCode.selectionStart = elements.formCode.selectionEnd = start + 2;
      updateCodeLineNumbers();
    }
    // Ctrl+Enter or Cmd+Enter submits form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      saveSnippetFromForm();
    }
  });

  // Tags input
  elements.formTagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addFormTag(elements.formTagInput.value);
    }
  });

  // Preset quick tags buttons in modal
  document.querySelectorAll('.preset-tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addFormTag(btn.dataset.preset);
    });
  });

  // Snippet Form Save
  function saveSnippetFromForm() {
    const id = elements.formSnippetId.value || null;
    const title = elements.formTitle.value.trim();
    const language = elements.formLanguage.value;
    const description = elements.formDescription.value.trim();
    const code = elements.formCode.value;

    if (!title) {
      ToastManager.show('Please enter a snippet title', 'error');
      elements.formTitle.focus();
      return;
    }

    if (!code || !code.trim()) {
      ToastManager.show('Please enter some code for your snippet', 'error');
      elements.formCode.focus();
      return;
    }

    try {
      state.saveSnippet({
        id,
        title,
        language,
        description,
        code,
        tags: currentFormTags
      });

      closeModal(elements.snippetModal);
      ToastManager.show(id ? 'Snippet updated successfully!' : 'New snippet saved to Hub!', 'success');
    } catch (err) {
      ToastManager.show(err.message, 'error');
    }
  }

  elements.formSubmitBtn.addEventListener('click', saveSnippetFromForm);
  elements.formCloseBtn.addEventListener('click', () => closeModal(elements.snippetModal));
  elements.formCancelBtn.addEventListener('click', () => closeModal(elements.snippetModal));

  // Snippet Detail Modal Actions
  elements.detailCloseBtn.addEventListener('click', () => closeModal(elements.detailModal));

  elements.detailCopyBtn.addEventListener('click', () => {
    if (activeDetailSnippet) {
      copyToClipboard(activeDetailSnippet.code, `Copied code to clipboard!`);
    }
  });

  elements.detailCopyMarkdownBtn.addEventListener('click', () => {
    if (activeDetailSnippet) {
      const lang = activeDetailSnippet.language || '';
      const markdown = `\`\`\`${lang}\n${activeDetailSnippet.code}\n\`\`\``;
      copyToClipboard(markdown, 'Copied as Markdown code block!');
    }
  });

  elements.detailDownloadBtn.addEventListener('click', () => {
    if (activeDetailSnippet) {
      const langMeta = UIRenderer.getLangMeta(activeDetailSnippet.language);
      const safeName = activeDetailSnippet.title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
      downloadSnippetFile(`${safeName}${langMeta.ext}`, activeDetailSnippet.code);
    }
  });

  elements.detailEditBtn.addEventListener('click', () => {
    if (activeDetailSnippet) {
      const snip = activeDetailSnippet;
      closeModal(elements.detailModal);
      setTimeout(() => openSnippetForm(snip), 150);
    }
  });

  elements.detailDeleteBtn.addEventListener('click', () => {
    if (activeDetailSnippet) {
      const id = activeDetailSnippet.id;
      closeModal(elements.detailModal);
      setTimeout(() => openDeleteModal(id), 150);
    }
  });

  // Delete Confirmation Modal Actions
  elements.deleteConfirmBtn.addEventListener('click', () => {
    if (pendingDeleteId) {
      state.deleteSnippet(pendingDeleteId);
      ToastManager.show('Snippet deleted from Hub', 'info');
      pendingDeleteId = null;
      closeModal(elements.deleteModal);
    }
  });

  elements.deleteCancelBtn.addEventListener('click', () => {
    pendingDeleteId = null;
    closeModal(elements.deleteModal);
  });

  // Backup & Restore Modal Tabs & Actions
  function switchBackupTab(tab) {
    if (tab === 'import') {
      elements.backupTabImport.classList.add('border-indigo-500', 'text-indigo-400');
      elements.backupTabImport.classList.remove('border-transparent', 'text-slate-400');
      elements.backupTabExport.classList.remove('border-indigo-500', 'text-indigo-400');
      elements.backupTabExport.classList.add('border-transparent', 'text-slate-400');

      elements.backupSectionImport.classList.remove('hidden');
      elements.backupSectionExport.classList.add('hidden');
    } else {
      elements.backupTabExport.classList.add('border-indigo-500', 'text-indigo-400');
      elements.backupTabExport.classList.remove('border-transparent', 'text-slate-400');
      elements.backupTabImport.classList.remove('border-indigo-500', 'text-indigo-400');
      elements.backupTabImport.classList.add('border-transparent', 'text-slate-400');

      elements.backupSectionExport.classList.remove('hidden');
      elements.backupSectionImport.classList.add('hidden');
    }
  }

  elements.backupTabExport.addEventListener('click', () => switchBackupTab('export'));
  elements.backupTabImport.addEventListener('click', () => switchBackupTab('import'));
  elements.backupCloseBtn.addEventListener('click', () => closeModal(elements.backupModal));

  function updateBackupModalData() {
    const jsonStr = StorageManager.exportJSON();
    const blobSize = (new Blob([jsonStr]).size / 1024).toFixed(1);
    elements.backupExportSummary.textContent = `${state.snippets.length} snippets ready for export (${blobSize} KB)`;
  }

  // Export JSON file
  elements.btnDownloadBackup.addEventListener('click', () => {
    const jsonStr = StorageManager.exportJSON();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadSnippetFile(`codesnippet-hub-backup-${dateStr}.json`, jsonStr);
  });

  elements.btnCopyBackupJson.addEventListener('click', () => {
    const jsonStr = StorageManager.exportJSON();
    copyToClipboard(jsonStr, 'Backup JSON copied to clipboard!');
  });

  // Import JSON file
  elements.importFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        elements.importJsonText.value = event.target.result;
        ToastManager.show(`Loaded "${file.name}"`, 'info');
      };
      reader.readAsText(file);
    }
  });

  // Drag and drop into import dropzone
  elements.importDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.importDropzone.classList.add('border-indigo-500', 'bg-indigo-950/20');
  });

  elements.importDropzone.addEventListener('dragleave', () => {
    elements.importDropzone.classList.remove('border-indigo-500', 'bg-indigo-950/20');
  });

  elements.importDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.importDropzone.classList.remove('border-indigo-500', 'bg-indigo-950/20');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        elements.importJsonText.value = event.target.result;
        ToastManager.show(`Dropped "${file.name}"`, 'info');
      };
      reader.readAsText(file);
    }
  });

  // Perform Import
  elements.btnPerformImport.addEventListener('click', () => {
    const jsonText = elements.importJsonText.value.trim();
    if (!jsonText) {
      ToastManager.show('Please select a JSON file or paste JSON data', 'error');
      return;
    }

    const mode = elements.importModeOverwrite.checked ? 'overwrite' : 'merge';

    try {
      const result = StorageManager.importJSON(jsonText, mode);
      state.reloadFromStorage();
      closeModal(elements.backupModal);
      elements.importJsonText.value = '';
      elements.importFileInput.value = '';

      if (mode === 'overwrite') {
        ToastManager.show(`Successfully restored ${result.total} snippets!`, 'success');
      } else {
        ToastManager.show(`Import complete: ${result.added} added, ${result.updated} updated.`, 'success');
      }
    } catch (err) {
      ToastManager.show(err.message, 'error');
    }
  });

  // Restore Default Samples
  elements.btnRestoreDefaults.addEventListener('click', () => {
    if (confirm('Restore default sample snippets? (Existing custom snippets will remain if you merge)')) {
      StorageManager.resetToDefaults();
      state.reloadFromStorage();
      closeModal(elements.backupModal);
      ToastManager.show('Default sample snippets restored!', 'success');
    }
  });

  // Clear all snippets
  elements.btnClearAll.addEventListener('click', () => {
    if (confirm('DANGER: Permanently wipe all snippets from LocalStorage? Please ensure you downloaded a backup first!')) {
      StorageManager.setAll([]);
      state.reloadFromStorage();
      closeModal(elements.backupModal);
      ToastManager.show('All snippets cleared from storage', 'warning');
    }
  });

  // Help Modal Close
  elements.helpCloseBtn.addEventListener('click', () => closeModal(elements.helpModal));

  // Global Click Outside Modals to Close
  document.querySelectorAll('.app-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // If typing inside an input/textarea, only handle Escape or Ctrl+Enter
    const isEditingInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.app-modal:not(.hidden)');
      if (openModals.length > 0) {
        e.preventDefault();
        closeAllModals();
      } else if (document.activeElement === elements.searchInput) {
        elements.searchInput.blur();
      }
      return;
    }

    if (!isEditingInput) {
      // 'N' or 'n': New Snippet
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openSnippetForm();
      }
      // '/' (slash): Focus Search
      else if (e.key === '/') {
        e.preventDefault();
        elements.searchInput.focus();
        elements.searchInput.select();
      }
      // '?' (Shift + /): Open Help
      else if (e.key === '?') {
        e.preventDefault();
        openModal(elements.helpModal);
      }
      // 'g' or 'G': Toggle Grid / List
      else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        state.setViewMode(state.viewMode === 'grid' ? 'list' : 'grid');
      }
    }
  });

  // Bootstrap application
  state.init();
});
