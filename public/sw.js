const CACHE_NAME = 'mayankrajjaiswal-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/blog',
  '/404.html',
  '/favicon.svg',
  '/images/mayank-portrait.jpg'
];

// Install Event - Pre-cache critical shell assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale, corrupted caches (Force Cache-Bust)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First with Cache Fallback Strategy (Ultra-Safe)
self.addEventListener('fetch', event => {
  // Only handle GET requests and local scope
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request).then(networkResponse => {
      // If network call succeeds, dynamically cache the fresh response for offline use
      if (networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
      }
      return networkResponse;
    }).catch(() => {
      // If offline and network fails, fall back to cached copy
      return caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // If it's a page navigation request, fall back to the cached homepage
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return null;
      });
    })
  );
});