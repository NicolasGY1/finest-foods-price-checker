const CACHE = "finest-foods-v2";

const archivos = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json"
];

self.addEventListener("install", e => {

    self.skipWaiting();

    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(archivos))
    );

});

self.addEventListener("activate", e => {

    e.waitUntil(
        caches.keys().then(nombres =>
            Promise.all(
                nombres.filter(n => n !== CACHE).map(n => caches.delete(n))
            )
        ).then(() => self.clients.claim())
    );

});

self.addEventListener("fetch", e => {

    // Siempre intenta traer la versión más reciente de internet primero.
    // Si no hay internet, usa la copia guardada (para que la app siga funcionando offline).
    e.respondWith(
        fetch(e.request)
            .then(respuesta => {
                const copia = respuesta.clone();
                caches.open(CACHE).then(cache => cache.put(e.request, copia));
                return respuesta;
            })
            .catch(() => caches.match(e.request))
    );

});
