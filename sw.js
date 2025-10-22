const CACHE_NAME = 'reno-ai-checklist-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/vite.svg'
];

// On install, cache the static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
  const allowedCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!allowedCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// On fetch, use a cache-first strategy.
// This is a simple but effective strategy for offline-first apps.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If we have a cached response, return it.
      if (response) {
        return response;
      }

      // If it's not in the cache, fetch it from the network.
      return fetch(event.request).then((networkResponse) => {
        // Only cache successful GET requests to external resources.
        // This will cache the CDN scripts on first load.
        if (event.request.method === 'GET' && networkResponse.ok) {
          // IMPORTANT: Clone the response. A response is a stream
          // and because we want the browser to consume the response
          // as well as the cache consuming the response, we need
          // to clone it so we have two streams.
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(error => {
        console.error('Fetching failed:', error);
        throw error;
      });
    })
  );
});
