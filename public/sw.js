const CACHE_NAME = 'mayankrajjaiswal-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/blog',
  '/404.html',
  '/favicon.svg',
  '/images/mayank-portrait.jpg',
  '/og-image.jpg'
];

// Install Event - Pre-cache critical shell assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
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

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', event => {
  // Only handle GET requests and local scope
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchedResponse = fetch(event.request).then(networkResponse => {
          // If network call succeeds, clone and update cache
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // If offline and request fails, return 404 or cached copy
          return cachedResponse;
        });

        // Return cached response instantly if available, fallback to network
        return cachedResponse || fetchedResponse;
      });
    })
  );
});