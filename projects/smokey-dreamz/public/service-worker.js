const CACHE_NAME = 'smokey-dreamz-v3';
const urlsToCache = [
  '/',
  '/menu',
  '/membership/card',
  '/membership',
  '/locations',
  '/manifest.json',
  '/logo.png',
  '/SDLogo.png',
  '/api/logo'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Skip caching for: API calls, auth, Supabase, admin, staff, verify routes
  if (url.includes('/api/') ||
      url.includes('/auth/') ||
      url.includes('/admin') ||
      url.includes('/staff/') ||
      url.includes('/verify/') ||
      url.includes('.supabase.co') ||
      url.includes('_rsc=')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});
