const CACHE = "bullprosperity-shell-v5";
const ASSETS = ["/theme.css","/member-platform.css?v=20260621-2","/access-guard.js?v=20260622-2","/login.js?v=20260623-1","/member-platform.js?v=20260623-1","/favicon.png","/icon-192.png","/icon-512.png","/manifest.json"];

self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
  if (!/\.(css|js|png|jpg|jpeg|webp|svg|json)$/i.test(url.pathname)) return;
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => { const copy=response.clone(); caches.open(CACHE).then(cache => cache.put(request,copy)); return response; })));
});
