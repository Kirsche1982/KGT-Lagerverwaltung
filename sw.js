/* KGT Lagerverwaltung – PWA Service Worker (no app logic changes) */
const CACHE_NAME = 'kgt-lager-v1-' + Date.now();
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/kgt-192.png',
  './icons/kgt-512.png',
  './icons/kgt-maskable-192.png',
  './icons/kgt-maskable-512.png',
  './apple-touch-icon-180.png',
  './kgt-96.png',
  './kgt-192.png',
  './kgt-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try { await cache.addAll(PRECACHE); } catch(e) { /* ignore partial failures */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => { if (k !== CACHE_NAME && k.startsWith('kgt-lager-v1-')) return caches.delete(k); }));
    self.clients.claim();
  })());
});

function isSupabase(url){
  return /(?:^https?:)?\/\/[^\/]*supabase\.co\//.test(url);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        return fresh;
      } catch(_) {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  if (isSupabase(req.url) || req.method !== 'GET') {
    event.respondWith(fetch(req).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      const hit = await cache.match(req);
      return hit || new Response('', { status: 503, statusText: 'Offline' });
    }));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && res.status === 200) cache.put(req, res.clone());
      return res;
    } catch(_) {
      return new Response('', { status: 504, statusText: 'Gateway Timeout (offline)' });
    }
  })());
});
