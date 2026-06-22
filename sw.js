const CACHE_NAME = 'simonx-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Offline-first strategy for local assets, network-first fallback
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => {
        // Fallback for document requests when offline
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
