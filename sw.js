const CACHE_NAME = "liga-tenis-junio-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key =>
          key !== CACHE_NAME ? caches.delete(key) : null
        )
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;

  // No cachear llamadas al Worker/API
  // para que resultados y clasificación sigan online.
  if (req.url.includes("workers.dev")) {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(
    fetch(req)
      .then(response => {
        const copy = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, copy);
        });

        return response;
      })
      .catch(() => caches.match(req))
  );
});
