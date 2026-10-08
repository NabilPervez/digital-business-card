// Offline cache so the card opens instantly, even with no signal.
// Bump VERSION whenever any cached file changes.
const VERSION = 'card-v1';
const FILES = [
  '/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/nabil-pervez.vcf',
  '/assets/mark-nebtune-gold-bright.png', '/assets/monogram-npc-gold-bright.png',
  '/assets/pattern-gold-tile-2x.png', '/assets/icon-192.png', '/assets/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Stale-while-revalidate: serve from cache, refresh in the background.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(res => {
      if (res.ok && (new URL(e.request.url).origin === location.origin || res.type === 'cors')) cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
