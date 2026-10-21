/**
 * CodeSnippet Hub - StorageManager
 * Encapsulates LocalStorage CRUD, serialization, validation, and backup/restore
 */

class StorageManager {
  static STORAGE_KEY = 'codesnippet_hub_snippets_v1';
  static PREFS_KEY = 'codesnippet_hub_prefs_v1';
  static APP_VERSION = '1.2.0';

  /**
   * Fetch all snippets from LocalStorage. Auto-seeds defaults on first launch.
   * @returns {Array} Array of snippet objects
   */
  static getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        // Initial setup - seed default snippets
        const defaults = typeof SAMPLE_SNIPPETS !== 'undefined' ? SAMPLE_SNIPPETS : [];
        this.setAll(defaults);
        return defaults;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error('[StorageManager] Error reading LocalStorage:', err);
      return [];
    }
  }

  /**
   * Persist full array of snippets to LocalStorage
   * @param {Array} snippets 
   */
  static setAll(snippets) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(snippets));
    } catch (err) {
      console.error('[StorageManager] LocalStorage write failed:', err);
      if (err.name === 'QuotaExceededError') {
        throw new Error('Local Storage quota exceeded. Please export and clean up old snippets.');
      }
      throw err;
    }
  }

  /**
   * Retrieve a single snippet by ID
   * @param {string} id 
   * @returns {Object|null}
   */
  static getById(id) {
    const list = this.getAll();
    return list.find(s => s.id === id) || null;
  }

  /**
   * Create or update a snippet
   * @param {Object} snippet 
   * @returns {Object} saved snippet
   */
  static save(snippet) {
    const snippets = this.getAll();
    const now = new Date().toISOString();

    if (!snippet.title || !snippet.title.trim()) {
      throw new Error('Snippet title is required.');
    }
    if (!snippet.code || !snippet.code.trim()) {
      throw new Error('Snippet code content is required.');
    }

    let savedItem;

    if (snippet.id) {
      // Update existing
      const index = snippets.findIndex(s => s.id === snippet.id);
      if (index !== -1) {
        savedItem = {
          ...snippets[index],
          ...snippet,
          title: snippet.title.trim(),
          language: snippet.language || 'javascript',
          code: snippet.code,
          description: (snippet.description || '').trim(),
          tags: this.normalizeTags(snippet.tags),
          updatedAt: now
        };
        snippets[index] = savedItem;
      } else {
        // Fallback: treated as new
        savedItem = this.createSnippetObject(snippet, now);
        snippets.unshift(savedItem);
      }
    } else {
      // New snippet
      savedItem = this.createSnippetObject(snippet, now);
      snippets.unshift(savedItem);
    }

    this.setAll(snippets);
    return savedItem;
  }

  /**
   * Helper to build a clean snippet entity
   */
  static createSnippetObject(data, timestamp) {
    return {
      id: 'snip_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5),
      title: data.title.trim(),
      language: data.language || 'javascript',
      code: data.code,
      description: (data.description || '').trim(),
      tags: this.normalizeTags(data.tags),
      isFavorite: !!data.isFavorite,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }

  /**
   * Sanitize tag array or string
   */
  static normalizeTags(tags) {
    if (Array.isArray(tags)) {
      return [...new Set(tags.map(t => String(t).trim().toLowerCase()).filter(Boolean))];
    }
    if (typeof tags === 'string') {
      return [...new Set(tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean))];
    }
    return [];
  }

  /**
   * Delete snippet by ID
   * @param {string} id 
   * @returns {boolean} true if deleted
   */
  static delete(id) {
    const snippets = this.getAll();
    const filtered = snippets.filter(s => s.id !== id);
    if (filtered.length !== snippets.length) {
      this.setAll(filtered);
      return true;
    }
    return false;
  }

  /**
   * Toggle favorite status
   * @param {string} id 
   * @returns {boolean} new favorite state
   */
  static toggleFavorite(id) {
    const snippets = this.getAll();
    const item = snippets.find(s => s.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      item.updatedAt = new Date().toISOString();
      this.setAll(snippets);
      return item.isFavorite;
    }
    return false;
  }

  /**
   * Export all snippets to JSON backup
   * @returns {string} JSON string
   */
  static exportJSON() {
    const snippets = this.getAll();
    const backupData = {
      app: 'CodeSnippet Hub',
      version: this.APP_VERSION,
      exportedAt: new Date().toISOString(),
      count: snippets.length,
      snippets: snippets
    };
    return JSON.stringify(backupData, null, 2);
  }

  /**
   * Import snippets from JSON backup string
   * @param {string} jsonString 
   * @param {string} mode 'merge' | 'overwrite'
   * @returns {Object} result summary
   */
  static importJSON(jsonString, mode = 'merge') {
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      throw new Error('Invalid JSON format: Could not parse input file.');
    }

    let incomingSnippets = [];
    if (Array.isArray(parsed)) {
      incomingSnippets = parsed;
    } else if (parsed && Array.isArray(parsed.snippets)) {
      incomingSnippets = parsed.snippets;
    } else {
      throw new Error('Unrecognized backup format. Expected an array of snippets or a CodeSnippet Hub backup object.');
    }

    // Validate snippets
    const validSnippets = [];
    for (const item of incomingSnippets) {
      if (item && typeof item === 'object' && item.title && item.code) {
        validSnippets.push({
          id: item.id || ('snip_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5)),
          title: String(item.title).trim(),
          language: item.language ? String(item.language).toLowerCase() : 'javascript',
          code: String(item.code),
          description: item.description ? String(item.description).trim() : '',
          tags: this.normalizeTags(item.tags),
          isFavorite: !!item.isFavorite,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString()
        });
      }
    }

    if (validSnippets.length === 0) {
      throw new Error('No valid snippets found in the imported file.');
    }

    if (mode === 'overwrite') {
      this.setAll(validSnippets);
      return {
        mode: 'overwrite',
        total: validSnippets.length,
        added: validSnippets.length,
        updated: 0
      };
    } else {
      // Merge
      const existing = this.getAll();
      const existingMap = new Map(existing.map(s => [s.id, s]));
      let added = 0;
      let updated = 0;

      for (const item of validSnippets) {
        if (existingMap.has(item.id)) {
          existingMap.set(item.id, item);
          updated++;
        } else {
          existingMap.set(item.id, item);
          added++;
        }
      }

      const merged = Array.from(existingMap.values());
      // Sort by newest updated
      merged.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      this.setAll(merged);

      return {
        mode: 'merge',
        total: merged.length,
        added,
        updated
      };
    }
  }

  /**
   * Reset store back to default sample snippets
   */
  static resetToDefaults() {
    const defaults = typeof SAMPLE_SNIPPETS !== 'undefined' ? SAMPLE_SNIPPETS : [];
    this.setAll(defaults);
    return defaults;
  }

  /**
   * Calculate storage footprint
   * @returns {Object} size in bytes, formatted string, percentage
   */
  static getStorageStats() {
    const raw = localStorage.getItem(this.STORAGE_KEY) || '[]';
    const bytes = new Blob([raw]).size;
    const kb = (bytes / 1024).toFixed(1);
    // Typical 5MB localStorage limit is 5 * 1024 * 1024 bytes = 5,242,880
    const maxBytes = 5 * 1024 * 1024;
    const percent = ((bytes / maxBytes) * 100).toFixed(2);

    return {
      bytes,
      formatted: bytes < 1024 ? `${bytes} B` : `${kb} KB`,
      percent: Math.min(100, Math.max(0.1, parseFloat(percent)))
    };
  }

  /**
   * User preferences (viewMode, sort, etc.)
   */
  static getPreferences() {
    try {
      const data = localStorage.getItem(this.PREFS_KEY);
      return data ? JSON.parse(data) : { viewMode: 'grid', sortBy: 'newest' };
    } catch {
      return { viewMode: 'grid', sortBy: 'newest' };
    }
  }

  static savePreferences(prefs) {
    try {
      const current = this.getPreferences();
      localStorage.setItem(this.PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
    } catch (e) {
      console.warn('Failed to save preferences:', e);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageManager };
}
