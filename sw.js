const CACHE='focuscal-v56-holidays-gestures';
const CORE=['./index.html','./app.html','./manifest.json','./icon-192.png','./icon-512.png','./enhancements.js'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(CORE);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

async function networkFirst(request,fallback){
  try{
    const fresh=await fetch(request,{cache:'no-store'});
    if(fresh.ok)return fresh;
  }catch(_){ }
  return (await caches.match(fallback||request))||Response.error();
}

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const path=url.pathname;

  if(event.request.mode==='navigate'){
    event.respondWith(networkFirst(event.request,'./index.html'));
    return;
  }

  if(path.endsWith('/app.html')||path.endsWith('/peek.js')||path.endsWith('/firebase-config.js')||path.endsWith('/enhancements.js')||path.endsWith('/sw.js')){
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    try{
      const fresh=await fetch(event.request);
      if(fresh.ok&&url.origin===self.location.origin){
        const cache=await caches.open(CACHE);
        cache.put(event.request,fresh.clone());
      }
      return fresh;
    }catch(_){return Response.error()}
  })());
});
