// Bump both cache namespaces when the app shell changes so existing visitors do not
// receive stale runtime assets after the next service-worker update.
const SHELL_CACHE="jihanki-shell-v4";
const RUNTIME_CACHE="jihanki-runtime-v4";
const SHELL=[
  "./","./index.html","./assets/jihanki.png","./assets/placeholder.png","./css/archive-system.css",
  "./data/archive.js","./js/categories.js","./js/events.js","./js/inventory.js","./js/relationships.js",
  "./js/geography.js","./js/rotation.js","./js/temporal.js","./js/receipts.js","./js/collection.js","./js/museum.js","./js/audio.js",
  "./js/markdown.js","./js/maintenance.js","./js/anomalies.js","./js/video.js","./js/personality.js",
  "./js/discovery.js","./js/map.js","./js/soundscape.js","./js/interaction-model.js","./js/machine.js"
];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys
    .filter(key=>key.startsWith("jihanki-")&&![SHELL_CACHE,RUNTIME_CACHE].includes(key))
    .map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET"||request.headers.has("range"))return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const pathname=url.pathname.toLowerCase();
  if(/\.(mp4|mov|webm)$/i.test(pathname))return;
  if(request.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response.ok){const cache=await caches.open(SHELL_CACHE);await cache.put(request,response.clone());}
        return response;
      }catch(_){
        const cached=await caches.match(request);
        if(cached)return cached;
        const shell=await caches.match(new URL("./index.html",self.registration.scope).href);
        return shell||Response.error();
      }
    })());
    return;
  }
  if(!/\.(html|js|css|md|json|png|jpe?g|webp|gif|svg|txt|opus|wav|ogg|mp3)$/i.test(pathname))return;
  event.respondWith(caches.open(RUNTIME_CACHE).then(async cache=>{
    // The shell cache is the first-visit offline fallback; runtime entries are added
    // only after a visitor has requested the corresponding resource.
    const shell=await caches.open(SHELL_CACHE);
    const cached=await cache.match(request)||await shell.match(request);
    const refresh=fetch(request).then(async response=>{
      if(response.ok&&response.type==="basic"){
        const size=Number(response.headers.get("content-length")||0);
        const isAudio=/\.(opus|wav|ogg|mp3)$/i.test(pathname);
        if((size>0&&size<=12*1024*1024)||(!size&&!isAudio))await cache.put(request,response.clone());
      }
      return response;
    });
    if(cached){event.waitUntil(refresh.catch(()=>null));return cached;}
    return refresh.catch(()=>shell.match(request).then(response=>response||Response.error()));
  }));
});