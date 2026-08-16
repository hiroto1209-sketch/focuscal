const CACHE = 'focuscal-v54-firebase-boot';
const APP_VERSION = '54';
const ASSETS = [
  './index.html','./guide.html','./privacy.html','./demo.html','./lp.html',
  './manifest.json','./firebase-config.js','./peek.js','./icon-192.png','./icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAG3z8Uq40nGP1ofCcsFoMLcGZ4a4tsGhA',
  authDomain: 'focuscal-connects.firebaseapp.com',
  projectId: 'focuscal-connects',
  storageBucket: 'focuscal-connects.firebasestorage.app',
  messagingSenderId: '570470010602',
  appId: '1:570470010602:web:4142ec4b57990c81581193',
  measurementId: 'G-T82NHMXWSL'
};

async function injectPeek(response) {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;

  let html = await response.text();
  const marker = 'data-focuscal-peek-v="54"';
  const config = JSON.stringify(FIREBASE_CONFIG).replace(/</g, '\\u003c');
  const boot = `<script ${marker}>window.FOCUSCAL_FIREBASE_CONFIG=${config};window.FOCUSCAL_PEEK_BUILD='54';</script><script ${marker} src="./peek.js?v=${APP_VERSION}"></script>`;

  // Remove older service-worker injected Peek scripts before injecting this build.
  html = html
    .replace(/<script[^>]*src=["']\.\/firebase-config\.js[^"']*["'][^>]*><\/script>/gi, '')
    .replace(/<script[^>]*src=["']\.\/peek\.js[^"']*["'][^>]*><\/script>/gi, '');

  if (!html.includes(marker)) html = html.replace('</head>', `${boot}</head>`);

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.set('cache-control', 'no-store');
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function networkFirst(request, fallback) {
  try {
    const response = await fetch(request, {cache: 'no-store'});
    if (response.ok) return response;
  } catch (_) {}
  return (await caches.match(fallback || request)) || Response.error();
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate';
  const isAppNavigation = isNavigation && (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html'));

  if (isAppNavigation) {
    event.respondWith((async () => {
      const response = await networkFirst(event.request, './index.html');
      return injectPeek(response);
    })());
    return;
  }

  // Firebase boot files are always network-first so an old PWA cache cannot keep the app disconnected.
  if (url.pathname.endsWith('/peek.js') || url.pathname.endsWith('/firebase-config.js') || url.pathname.endsWith('/sw.js')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const fresh = await fetch(event.request);
      if (fresh.ok && url.origin === self.location.origin) {
        const cache = await caches.open(CACHE);
        cache.put(event.request, fresh.clone());
      }
      return fresh;
    } catch (_) {
      return Response.error();
    }
  })());
});
