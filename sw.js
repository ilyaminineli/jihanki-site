const SHELL_CACHE="jihanki-shell-v1";
const RUNTIME_CACHE="jihanki-runtime-v1";
const SHELL=[
  "./","./index.html","./assets/jihanki.png","./assets/placeholder.png","./css/archive-system.css",
  "./data/archive.js","./js/categories.js","./js/events.js","./js/inventory.js","./js/relationships.js",
  "./js/geography.js","./js/rotation.js","./js/receipts.js","./js/collection.js","./js/audio.js","./js/markdown.js",
  "./js/maintenance.js","./js/anomalies.js","./js/video.js","./js/personality.js","./js/discovery.js","./js/map.js",
  "./js/soundscape.js","./js/machine.js"
];
self.addEventListener("install",event=>event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys
  .filter(key=>key.startsWith("jihanki-")&&![SHELL_CACHE,RUNTIME_CACHE].includes(key)).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const request=event.request;if(request.method!=="GET"||request.headers.has("range"))return;
  const url=new URL(request.url);if(url.origin!==self.location.origin)return;
  const path=url.pathname.toLowerCase();if(/\.(mp4|mov|webm)$/i.test(path))return;
  if(request.mode==="navigate"){
    event.respondWith(fetch(request).then(response=>{if(response.ok)caches.open(SHELL_CACHE).then(cache=>cache.put("./index.html",response.clone()));return response;})
      .catch(async()=>(await caches.match("./index.html"))||Response.error()));return;
  }
  if(!/\.(html|js|css|md|json|png|jpe?g|webp|gif|svg|txt|opus|wav|ogg|mp3)$/i.test(path))return;
  event.respondWith(caches.open(RUNTIME_CACHE).then(async cache=>{
    const cached=await cache.match(request);
    const refresh=fetch(request).then(response=>{
      if(response.ok&&response.type==="basic"){
        const size=Number(response.headers.get("content-length")||0);
        if(!size||size<=12*1024*1024)cache.put(request,response.clone());
      }
      return response;
    });
    if(cached){event.waitUntil(refresh.catch(()=>null));return cached;}
    return refresh.catch(()=>Response.error());
  }));
});