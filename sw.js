// Offline-Cache: Seite immer zuerst frisch aus dem Netz, sonst aus dem Cache
const CACHE = 'kugel-v6';
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
const put = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(res => put(e.request, res)).catch(() => caches.match(e.request).then(h => h || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => put(e.request, res)).catch(() => hit);
    return hit || net;
  }));
});
