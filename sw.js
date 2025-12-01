// Einfacher Service Worker für KGT Lagerverwaltung
const CACHE_NAME = 'kgt-lager-v1';

// Ressourcen, die wir auf jeden Fall cachen wollen (App Shell)
const APP_SHELL = [
  './',
  'Lagerverwaltung v035 – PWA Branding KGT.html',
  'kgt-192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL).catch(() => {
        // Installation nicht abbrechen, wenn etwas schiefgeht
        return;
      });
    })
  );
  self.skipWaiting();
});

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
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const respClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, respClone).catch(() => {});
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          return caches.match('./');
        });
      })
  );
});
