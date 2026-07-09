// Service worker: maakt het spel offline speelbaar (vliegtuig, auto, tunnel).
// Strategie:
//  - de PAGINA zelf (navigatie): NETWORK-FIRST — online krijg je dus altijd
//    meteen de nieuwste versie. (Voorheen stale-while-revalidate: dan zag je
//    een update pas bij de TWEEDE keer openen — verwarrend bij het testen.)
//  - assets: stale-while-revalidate. Vite hasht de namen, dus een nieuwe
//    build betekent nieuwe bestandsnamen → geen verouderde code-mix.
// CACHE-versie ophogen forceert een schone start. v3: de stem-clips (public/
// voice/*.mp3) hebben VASTE namen (geen Vite-hash), dus na het opnieuw inspreken
// van de letter-klanken moet de oude cache weg — anders hoor je op de iPad nog
// de oude clips (stale-while-revalidate). Bij een volgende clip-wijziging: weer
// ophogen (of /voice/ network-first maken).
const CACHE = 'rsp-cache-v5';

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

  // Pagina-navigatie: eerst het net (verse versie!), cache alleen offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Assets: cache eerst (snel), ververs op de achtergrond.
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
