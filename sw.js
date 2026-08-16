const CACHE = 'focuscal-v53-realtime-peek';
const ASSETS = [
  './index.html','./guide.html','./privacy.html','./demo.html','./lp.html',
  './manifest.json','./firebase-config.js','./peek.js','./icon-192.png','./icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

async function injectPeek(response) {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;
  let html = await response.text();
  if (!html.includes('peek.js')) {
    html = html.replace(
      '</head>',
      '<script src="./firebase-config.js"></script><script src="./peek.js"></script></head>'
    );
  }
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, {status: response.status, statusText: response.statusText, headers});
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isIndex = e.request.mode === 'navigate' && (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html'));

  if (isIndex) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(e.request);
        if (fresh.ok) return injectPeek(fresh);
      } catch (_) {}
      const cached = await caches.match('./index.html');
      return cached ? injectPeek(cached) : Response.error();
    })());
    return;
  }

  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
