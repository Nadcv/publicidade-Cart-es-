// Service worker do UniAds Studio — permite instalar o site como app e acelera
// visitas seguintes fazendo cache dos ficheiros estáticos. Nunca intercepta pedidos
// a /api/* (pagamentos, encomendas, etc. têm de ser sempre em direto, nunca em cache).
var CACHE_NAME = "uniads-v1";
var PRECACHE = [
  "/index.html",
  "/assets/css/style.css",
  "/assets/js/app.js",
  "/assets/js/i18n.js",
  "/manifest.json",
  "/assets/icon-192.png",
  "/assets/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(PRECACHE); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (url.pathname.indexOf("/api/") === 0 || event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var networkFetch = fetch(event.request)
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
          }
          return response;
        })
        .catch(function () { return cached; });
      return cached || networkFetch;
    })
  );
});
