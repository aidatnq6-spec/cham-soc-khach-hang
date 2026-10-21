const CACHE = 'cskh-next-v2-2';
const SHELL = ['/', '/icons/app-icon.svg', '/manifest.webmanifest'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    const root = await cache.match('/');
    const html = await root.text();
    const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => new URL(match[1].replaceAll('&amp;', '&'), self.location.origin)).filter(url => url.origin === self.location.origin && url.pathname.startsWith('/_next/static/')).map(url => url.href);
    await cache.addAll([...new Set(assets)]);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('cskh-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('authorization') || url.pathname.startsWith('/api/') || url.searchParams.has('_rsc') || request.headers.has('rsc')) return;
  if (request.mode === 'navigate') {
    if (url.pathname !== '/') return;
    event.respondWith(fetch(request).catch(() => caches.match('/').then(response => response || Response.error())));
    return;
  }
  if (!url.pathname.startsWith('/_next/static/') && !SHELL.includes(url.pathname)) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok && response.type === 'basic') { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy))); }
    return response;
  })));
});
