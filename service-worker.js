const CACHE="finest-foods-v1";

const archivos=[
"./",
"./index.html",
"./style.css",
"./app.js",
"./manifest.json"
];

self.addEventListener("install",e=>{

e.waitUntil(

caches.open(CACHE)

.then(cache=>cache.addAll(archivos))

);

});

self.addEventListener("fetch",e=>{

e.respondWith(

caches.match(e.request)

.then(r=>r||fetch(e.request))

);

});
