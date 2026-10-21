/**
 * CodeSnippet Hub - AppState
 * Central reactive state container with event listener architecture
 */

class AppState {
  constructor() {
    this.snippets = [];
    this.filters = {
      query: '',
      language: 'all',
      tag: 'all',
      favoritesOnly: false,
      sortBy: 'newest'
    };
    this.viewMode = 'grid'; // 'grid' or 'list'
    this.activeSnippetId = null;
    this.listeners = new Set();
  }

  /**
   * Subscribe to state change notifications
   * @param {Function} callback 
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all registered listeners
   */
  notify(changeType = 'update', payload = {}) {
    for (const listener of this.listeners) {
      try {
        listener({ state: this, changeType, payload });
      } catch (err) {
        console.error('[AppState] Listener execution error:', err);
      }
    }
  }

  /**
   * Initialize state from storage
   */
  init() {
    this.snippets = StorageManager.getAll();
    const prefs = StorageManager.getPreferences();
    if (prefs.viewMode) this.viewMode = prefs.viewMode;
    if (prefs.sortBy) this.filters.sortBy = prefs.sortBy;
    this.notify('init');
  }

  /**
   * Reload snippets from storage (e.g. after import or reset)
   */
  reloadFromStorage() {
    this.snippets = StorageManager.getAll();
    this.notify('reload');
  }

  /**
   * Filter and search setters
   */
  setSearchQuery(query) {
    this.filters.query = (query || '').trim().toLowerCase();
    this.notify('filter');
  }

  setLanguageFilter(language) {
    this.filters.language = language || 'all';
    this.notify('filter');
  }

  setTagFilter(tag) {
    this.filters.tag = tag || 'all';
    this.notify('filter');
  }

  toggleFavoritesOnly() {
    this.filters.favoritesOnly = !this.filters.favoritesOnly;
    this.notify('filter');
    return this.filters.favoritesOnly;
  }

  setSortBy(sortBy) {
    this.filters.sortBy = sortBy;
    StorageManager.savePreferences({ sortBy });
    this.notify('filter');
  }

  setViewMode(mode) {
    if (mode === 'grid' || mode === 'list') {
      this.viewMode = mode;
      StorageManager.savePreferences({ viewMode: mode });
      this.notify('viewMode');
    }
  }

  resetFilters() {
    this.filters.query = '';
    this.filters.language = 'all';
    this.filters.tag = 'all';
    this.filters.favoritesOnly = false;
    this.notify('filter');
  }

  /**
   * CRUD Actions dispatched through State
   */
  saveSnippet(snippetData) {
    const saved = StorageManager.save(snippetData);
    this.snippets = StorageManager.getAll();
    this.notify('snippet_saved', { snippet: saved });
    return saved;
  }

  deleteSnippet(id) {
    const success = StorageManager.delete(id);
    if (success) {
      this.snippets = StorageManager.getAll();
      this.notify('snippet_deleted', { id });
    }
    return success;
  }

  toggleFavorite(id) {
    const newStatus = StorageManager.toggleFavorite(id);
    this.snippets = StorageManager.getAll();
    this.notify('favorite_toggled', { id, isFavorite: newStatus });
    return newStatus;
  }

  /**
   * Query: Get filtered & sorted snippets
   */
  getFilteredSnippets() {
    let result = [...this.snippets];
    const { query, language, tag, favoritesOnly, sortBy } = this.filters;

    // 1. Favorites filter
    if (favoritesOnly) {
      result = result.filter(s => s.isFavorite);
    }

    // 2. Language filter
    if (language && language !== 'all') {
      result = result.filter(s => s.language && s.language.toLowerCase() === language.toLowerCase());
    }

    // 3. Tag filter
    if (tag && tag !== 'all') {
      result = result.filter(s => Array.isArray(s.tags) && s.tags.includes(tag.toLowerCase()));
    }

    // 4. Keyword search (title, code, tags, description)
    if (query) {
      result = result.filter(s => {
        const titleMatch = s.title && s.title.toLowerCase().includes(query);
        const codeMatch = s.code && s.code.toLowerCase().includes(query);
        const descMatch = s.description && s.description.toLowerCase().includes(query);
        const tagMatch = Array.isArray(s.tags) && s.tags.some(t => t.toLowerCase().includes(query));
        return titleMatch || codeMatch || descMatch || tagMatch;
      });
    }

    // 5. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'lines_desc': {
          const linesA = (a.code || '').split('\n').length;
          const linesB = (b.code || '').split('\n').length;
          return linesB - linesA;
        }
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }

  /**
   * Analytics & Aggregates
   */
  getAvailableTags() {
    const tagCount = new Map();
    for (const s of this.snippets) {
      if (Array.isArray(s.tags)) {
        for (const t of s.tags) {
          tagCount.set(t, (tagCount.get(t) || 0) + 1);
        }
      }
    }
    // Return sorted by frequency descending
    return Array.from(tagCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }

  getAvailableLanguages() {
    const langCount = new Map();
    for (const s of this.snippets) {
      const l = s.language ? s.language.toLowerCase() : 'other';
      langCount.set(l, (langCount.get(l) || 0) + 1);
    }
    return Array.from(langCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }

  getMetrics() {
    const favoritesCount = this.snippets.filter(s => s.isFavorite).length;
    const languagesCount = new Set(this.snippets.map(s => s.language?.toLowerCase()).filter(Boolean)).size;
    const storageStats = StorageManager.getStorageStats();

    return {
      total: this.snippets.length,
      favorites: favoritesCount,
      languages: languagesCount,
      storage: storageStats
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AppState };
}
