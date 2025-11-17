self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('kgt-lager-v1').then(function(cache) {
      return cache.addAll([
        './',
        './KGT Lagerverwaltung PWA V2.html',
        './manifest.json',
        './kgt-192.png',
        './kgt-512.png'
      ]);
    })
  );
});
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
