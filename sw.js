// Ralph Kitchen service worker: always try the network first, fall back to the
// last good copy when offline. This stops the home-screen app getting stuck on
// an old version.
const CACHE = 'ralph-kitchen';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('message', e => { if(e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  let url;
  try{ url = new URL(req.url); }catch(err){ return; }
  if(url.origin !== location.origin) return; // API calls and fonts go straight out
  e.respondWith((async () => {
    try{
      const fresh = await fetch(req, {cache: 'no-store'});
      if(fresh && fresh.ok){ const c = await caches.open(CACHE); c.put(req, fresh.clone()); }
      return fresh;
    }catch(err){
      const c = await caches.open(CACHE);
      const hit = await c.match(req) || await c.match('./index.html') || await c.match('./');
      if(hit) return hit;
      throw err;
    }
  })());
});
