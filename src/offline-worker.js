// This file is emitted as a service worker with the cache name and asset list filled in at build time.
const CACHE = '__CACHE__';
const ASSETS = __ASSETS__;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('lightlink-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    // A cache-first HTML page can keep old app versions alive across deployments.
    // Prefer fresh HTML online; the precached app remains available offline.
    event.respondWith(fetch(request, { cache: 'no-cache' }).then(response => {
      if (!response.ok) throw new Error('Navigation failed');
      return response;
    }).catch(async () => (await caches.match(new URL('./index.html', self.registration.scope).href)) || Response.error()));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
