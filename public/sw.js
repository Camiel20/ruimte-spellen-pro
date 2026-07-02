// Service worker: maakt het spel offline speelbaar (vliegtuig, auto, tunnel).
// Strategie: "stale-while-revalidate" — serveer meteen uit de cache en haal op
// de achtergrond een verse versie op. Vite geeft assets een hash-naam, dus een
// nieuwe build betekent nieuwe bestandsnamen → geen verouderde code-mix.
// CACHE-versie ophogen forceert een schone start.
const CACHE = 'rsp-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // alleen eigen bestanden cachen

  e.respondWith(
    caches.match(req).then((hit) => {
      const refresh = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit); // offline → cache (of niets)
      return hit || refresh;
    })
  );
});
