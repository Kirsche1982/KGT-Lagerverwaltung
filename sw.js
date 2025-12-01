// Service Worker für KGT Lagerverwaltung
const CACHE_NAME = 'kgt-lager-v1';
const APP_SHELL = [
  './',
  'Lagerverwaltung v035 – PWA KGT sauber.html',
  'kgt-192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const respClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, respClone).catch(() => {});
        });
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./')))
  );
});
