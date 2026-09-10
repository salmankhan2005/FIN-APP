import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ── Auto-reload on stale chunk error ──────────────────────────────────────────
// When Vite deploys new bundles, old cached JS can't find the new chunk hashes.
// Instead of showing a blank page, detect this and reload once automatically.
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || '';
  const isChunkError =
    event.reason?.name === 'ChunkLoadError' ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module');

  if (isChunkError) {
    event.preventDefault();
    const reloadKey = 'finova_chunk_reloaded';
    if (!sessionStorage.getItem(reloadKey)) {
      sessionStorage.setItem(reloadKey, '1');
      window.location.reload();
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality with auto-update (production only)
if ('serviceWorker' in navigator) {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalhost) {
    // Cleanly unregister any active service workers on localhost to avoid Vite development caching issues
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        registration.update();
        console.log('PWA ServiceWorker registered with scope:', registration.scope);
      }).catch((error) => {
        console.error('PWA ServiceWorker registration failed:', error);
      });
    });
  }
}

