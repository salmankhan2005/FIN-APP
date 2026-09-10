/**
 * lazyWithRetry — wraps React.lazy with automatic retry logic.
 *
 * Problem: After a Vite/Webpack deployment, old cached HTML tries to load
 * new chunk URLs (different content hashes). The fetch fails → blank page.
 *
 * Solution: Retry up to `retries` times with a short delay. If still failing,
 * force a hard reload (clearing the stale cache).
 */
import { lazy } from 'react';

export function lazyWithRetry(importFn, retries = 3, delay = 300) {
  return lazy(() => retry(importFn, retries, delay));
}

async function retry(importFn, retriesLeft, delay) {
  try {
    return await importFn();
  } catch (err) {
    if (retriesLeft === 0) {
      // Last resort: force hard reload to clear stale cache
      const reloadKey = 'finova_chunk_reloaded';
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1');
        window.location.reload();
      }
      throw err;
    }
    await new Promise((res) => setTimeout(res, delay));
    return retry(importFn, retriesLeft - 1, delay * 2);
  }
}
