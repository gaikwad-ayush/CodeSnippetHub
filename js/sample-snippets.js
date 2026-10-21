/**
 * CodeSnippet Hub - Default Sample Snippets
 * Pre-loaded diverse, high-quality snippets across multiple languages
 */

const SAMPLE_SNIPPETS = [
  {
    id: "snip_py_async_fetcher",
    title: "Async HTTP Concurrent Batch Requester",
    description: "Robust asynchronous API fetcher using Python aiohttp with concurrency semaphore limiting and retry handling.",
    language: "python",
    tags: ["python", "asyncio", "networking", "api", "concurrency"],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // 28 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    code: `import asyncio
import aiohttp
from typing import List, Dict, Any

async def fetch_item(session: aiohttp.ClientSession, url: str, semaphore: asyncio.Semaphore) -> Dict[str, Any]:
    """Fetch a single URL with concurrency throttling."""
    async with semaphore:
        try:
            async with session.get(url, timeout=10) as response:
                response.raise_for_status()
                return await response.json()
        except Exception as error:
            return {"url": url, "error": str(error)}

async def fetch_all(urls: List[str], max_concurrency: int = 5) -> List[Dict[str, Any]]:
    semaphore = asyncio.Semaphore(max_concurrency)
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_item(session, u, semaphore) for u in urls]
        return await asyncio.gather(*tasks)

# Example usage:
# asyncio.run(fetch_all(["https://api.github.com/repos/python/cpython"]))`
  },
  {
    id: "snip_js_debounce_throttle",
    title: "Debounce & Throttle High-Performance Utility",
    description: "Zero-dependency pure ES6 implementation of debounce and throttle with immediate execution support.",
    language: "javascript",
    tags: ["javascript", "performance", "dom", "events", "utility"],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    code: `/**
 * Creates a debounced function that delays invoking func until after wait ms
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeoutId = null;
  return function (...args) {
    const callNow = immediate && !timeoutId;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) func.apply(this, args);
    }, wait);
    if (callNow) func.apply(this, args);
  };
}

/**
 * Creates a throttled function that only invokes func at most once per wait ms
 */
export function throttle(func, wait = 250) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}`
  },
  {
    id: "snip_sql_window_functions",
    title: "PostgreSQL Window Functions for Running Totals & Ranking",
    description: "Calculates customer lifetime rank, rolling 30-day cumulative revenue, and year-over-year moving averages.",
    language: "sql",
    tags: ["sql", "postgresql", "analytics", "database", "window-functions"],
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    code: `WITH monthly_sales AS (
  SELECT 
    DATE_TRUNC('month', order_date) AS sales_month,
    customer_id,
    SUM(order_total) AS total_spent
  FROM orders
  WHERE status = 'completed'
  GROUP BY 1, 2
)
SELECT
  sales_month,
  customer_id,
  total_spent,
  -- Customer rank within current month
  DENSE_RANK() OVER (
    PARTITION BY sales_month 
    ORDER BY total_spent DESC
  ) AS monthly_rank,
  -- Cumulative running revenue by customer
  SUM(total_spent) OVER (
    PARTITION BY customer_id 
    ORDER BY sales_month 
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS customer_running_total,
  -- 3-month moving average of spend
  AVG(total_spent) OVER (
    PARTITION BY customer_id 
    ORDER BY sales_month 
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS moving_avg_3m
FROM monthly_sales
ORDER BY sales_month DESC, total_spent DESC;`
  },
  {
    id: "snip_cpp_lru_cache",
    title: "O(1) LRU Cache with Hash Map & Doubly Linked List",
    description: "Modern C++20 thread-safe ready template implementation of an LRU (Least Recently Used) Cache.",
    language: "cpp",
    tags: ["cpp", "algorithms", "data-structures", "caching", "performance"],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
    code: `#include <unordered_map>
#include <list>
#include <optional>
#include <utility>

template <typename Key, typename Value>
class LRUCache {
private:
    size_t capacity_;
    std::list<std::pair<Key, Value>> items_;
    std::unordered_map<Key, typename std::list<std::pair<Key, Value>>::iterator> lookup_;

public:
    explicit LRUCache(size_t capacity) : capacity_(capacity) {}

    std::optional<Value> get(const Key& key) {
        auto it = lookup_.find(key);
        if (it == lookup_.end()) return std::nullopt;
        // Move accessed item to front
        items_.splice(items_.begin(), items_, it->second);
        return it->second->second;
    }

    void put(const Key& key, const Value& value) {
        auto it = lookup_.find(key);
        if (it != lookup_.end()) {
            it->second->second = value;
            items_.splice(items_.begin(), items_, it->second);
            return;
        }
        if (items_.size() >= capacity_) {
            auto oldest = items_.back().first;
            items_.pop_back();
            lookup_.erase(oldest);
        }
        items_.emplace_front(key, value);
        lookup_[key] = items_.begin();
    }
};`
  },
  {
    id: "snip_html_accessible_dialog",
    title: "Accessible Modal Dialog with HTML5 <dialog>",
    description: "Semantic, accessible HTML5 native dialog element with focus trapping, backdrop styling, and ARIA labels.",
    language: "html",
    tags: ["html", "a11y", "semantic-html", "modal", "frontend"],
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 85).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 85).toISOString(),
    code: `<!-- Native Accessible HTML5 Dialog Component -->
<dialog id="confirmModal" aria-labelledby="modalTitle" aria-describedby="modalDesc" class="custom-dialog">
  <form method="dialog" class="dialog-content">
    <header class="dialog-header">
      <h2 id="modalTitle">Confirm Action</h2>
      <button type="button" aria-label="Close dialog" onclick="this.closest('dialog').close('cancel')">&times;</button>
    </header>
    
    <div class="dialog-body">
      <p id="modalDesc">Are you sure you want to permanently delete this resource? This action cannot be undone.</p>
    </div>
    
    <footer class="dialog-footer">
      <button value="cancel" class="btn btn-secondary">Cancel</button>
      <button value="confirm" class="btn btn-danger">Confirm Delete</button>
    </footer>
  </form>
</dialog>

<script>
  const dialog = document.getElementById('confirmModal');
  // Open with backdrop: dialog.showModal();
  dialog.addEventListener('close', () => {
    console.log('Dialog return value:', dialog.returnValue);
  });
</script>`
  },
  {
    id: "snip_ts_safe_result",
    title: "TypeScript Functional Result / Either Monad Pattern",
    description: "Type-safe error handling pattern replacing exceptions with Ok and Err discriminative unions.",
    language: "typescript",
    tags: ["typescript", "functional-programming", "types", "error-handling"],
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 92).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 92).toISOString(),
    code: `export type Result<T, E = Error> = 
  | { success: true; data: T; error?: never }
  | { success: false; error: E; data?: never };

export const Ok = <T>(data: T): Result<T, never> => ({ success: true, data });
export const Err = <E>(error: E): Result<never, E> => ({ success: false, error });

export async function safeAsync<T>(promise: Promise<T>): Promise<Result<T, Error>> {
  try {
    const data = await promise;
    return Ok(data);
  } catch (err) {
    return Err(err instanceof Error ? err : new Error(String(err)));
  }
}

// Usage:
// const res = await safeAsync(fetchUser(userId));
// if (res.success) console.log(res.data.name);
// else console.error(res.error.message);`
  },
  {
    id: "snip_bash_backup_script",
    title: "Automated Directory Backup with Gzip Compression",
    description: "Reliable Bash script to create timestamped tar.gz archives and prune backups older than 14 days.",
    language: "bash",
    tags: ["bash", "devops", "backup", "automation", "linux"],
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 110).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 110).toISOString(),
    code: `#!/usr/bin/env bash
set -euo pipefail

# Configuration
SOURCE_DIR="\${1:-/var/www/app}"
BACKUP_DIR="\${2:-/var/backups/app}"
RETENTION_DAYS=14
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_NAME="backup_\${TIMESTAMP}.tar.gz"

mkdir -p "\${BACKUP_DIR}"

echo "[INFO] Starting backup of \${SOURCE_DIR}..."
tar --exclude="*.log" --exclude="node_modules" --exclude=".git" \\
    -czf "\${BACKUP_DIR}/\${ARCHIVE_NAME}" -C "\${SOURCE_DIR}" .

echo "[SUCCESS] Created: \${BACKUP_DIR}/\${ARCHIVE_NAME} (\$(du -h "\${BACKUP_DIR}/\${ARCHIVE_NAME}" | cut -f1))"

# Prune archives older than retention threshold
echo "[INFO] Pruning backups older than \${RETENTION_DAYS} days..."
find "\${BACKUP_DIR}" -type f -name "backup_*.tar.gz" -mtime "+\${RETENTION_DAYS}" -delete
echo "[DONE] Backup routine completed."`
  },
  {
    id: "snip_css_modern_glassmorphism",
    title: "Ultra-Modern Glassmorphism & Neon Border Shimmer",
    description: "Pure CSS backdrop-filter glass card with responsive gradient borders, noise blend, and hover illumination.",
    language: "css",
    tags: ["css", "styling", "glassmorphism", "ui", "animations"],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 125).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 125).toISOString(),
    code: `.glass-card {
  position: relative;
  background: rgba(18, 24, 38, 0.65);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 
    0 10px 30px -10px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-3px);
  border-color: rgba(99, 102, 241, 0.35);
  box-shadow: 
    0 20px 40px -15px rgba(99, 102, 241, 0.15),
    0 0 20px -3px rgba(129, 140, 248, 0.2);
}`
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SAMPLE_SNIPPETS };
}
