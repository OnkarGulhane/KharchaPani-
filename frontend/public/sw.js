const CACHE_NAME = 'kharcha-pani-v3-fresh';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/icon.svg',
  '/favicon.svg',
  '/apple-touch-icon.png'
];

// Install Event — Force instant activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (asset) => {
          try {
            const res = await fetch(asset, { cache: 'no-cache' });
            if (res && (res.status === 200 || res.type === 'opaque')) {
              await cache.put(asset, res);
            }
          } catch (err) {
            console.warn('Pre-cache skipped for:', asset);
          }
        })
      );
    })
  );
});

// Activate Event — Instantly purge all older caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event — Network First for scripts & pages to prevent stale cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // Skip caching API endpoints completely
  if (url.pathname.includes('/api/')) {
    return;
  }

  // Network First for all HTML pages and JavaScript bundles
  if (
    request.mode === 'navigate' ||
    url.pathname.startsWith('/_next/static/') ||
    request.destination === 'script' ||
    request.destination === 'document'
  ) {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          if (request.mode === 'navigate') {
            const offlinePage = await caches.match(OFFLINE_URL);
            return offlinePage || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
          }
          return new Response('Network error', { status: 503 });
        })
    );
    return;
  }

  // Cache First for static media assets (icons, images, fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      }).catch(() => new Response('Asset not found', { status: 404 }));
    })
  );
});

// Immediate activation message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
