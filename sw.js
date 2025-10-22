const CACHE_NAME = 'reno-ai-checklist-v8'; // Bumped version for update
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/components/ChecklistItem.tsx',
  '/components/icons.tsx',
  '/components/NewProjectForm.tsx',
  '/components/ProjectCard.tsx',
  '/components/ImageModal.tsx',
  '/components/ShareModal.tsx',
  '/components/SuggestionsModal.tsx', // Added new component
  '/services/dbService.ts',
  '/services/geminiService.ts',
  '/services/imageService.ts',
  '/services/notificationService.ts'
];

// On install, cache all critical static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Force the new service worker to become active
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
  const allowedCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!allowedCaches.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        // Take control of all pages immediately
        return self.clients.claim();
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Close the notification

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // If a window for the app is already open, focus it.
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// On fetch, use a cache-first strategy.
self.addEventListener('fetch', (event) => {
  // Let the browser handle non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If we have a cached response, return it.
      if (response) {
        return response;
      }

      // If it's not in the cache, fetch it from the network.
      return fetch(event.request).then((networkResponse) => {
        // Clone the response because it's a stream that can only be consumed once.
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Cache the new resource.
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(error => {
        console.error('Fetching failed:', error);
        // You could return a custom offline page here if you had one.
        throw error;
      });
    })
  );
});
