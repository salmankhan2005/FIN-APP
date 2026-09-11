/**
 * Admin-Isolated In-Memory SWR Cache & In-Flight Request Deduplicator
 * 
 * Features:
 * - Scoped by active user ID to ensure zero data leakage across Admin accounts
 * - Request deduplication for simultaneous component mounts
 * - Automatic cache clearance on logout or account switch
 * - Selective cache invalidation on data mutations
 */

const cacheStore = new Map();
const inFlightRequests = new Map();

function getCurrentUserId() {
  try {
    const raw = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      return u?.id || 'anon';
    }
  } catch (_) {}
  return 'anon';
}

function buildCacheKey(url, params = {}) {
  const userId = getCurrentUserId();
  const sortedParams = Object.keys(params || {})
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  return `user_${userId}:${url}:${sortedParams}`;
}

export const apiCache = {
  /**
   * Fetch with in-flight deduplication and memory caching
   * @param {string} url - Request URL
   * @param {object} params - Query params
   * @param {function} fetchFn - Function returning promise from axios
   * @param {number} ttlMs - Time to live in ms (default: 20s)
   */
  async getOrFetch(url, params, fetchFn, ttlMs = 20000) {
    const key = buildCacheKey(url, params);
    const now = Date.now();

    // 1. Check valid cache
    if (cacheStore.has(key)) {
      const entry = cacheStore.get(key);
      if (now - entry.timestamp < ttlMs) {
        return entry.data;
      }
    }

    // 2. Check if identical request is currently in-flight
    if (inFlightRequests.has(key)) {
      return inFlightRequests.get(key);
    }

    // 3. Initiate request with deduplication
    const promise = (async () => {
      try {
        const result = await fetchFn();
        cacheStore.set(key, { data: result, timestamp: Date.now() });
        return result;
      } finally {
        inFlightRequests.delete(key);
      }
    })();

    inFlightRequests.set(key, promise);
    return promise;
  },

  /**
   * Invalidate cache by key pattern (e.g. 'customers', 'dashboard', 'loans')
   */
  invalidate(pattern) {
    const userId = getCurrentUserId();
    const prefix = `user_${userId}:`;
    for (const key of cacheStore.keys()) {
      if (key.startsWith(prefix) && (!pattern || key.includes(pattern))) {
        cacheStore.delete(key);
      }
    }
  },

  /**
   * Clear entire cache (called on logout/account switch)
   */
  clearAll() {
    cacheStore.clear();
    inFlightRequests.clear();
  },
};

// Automatically purge all cache on logout event
if (typeof window !== 'undefined') {
  window.addEventListener('finova:auth:logout', () => {
    apiCache.clearAll();
  });
}
