const CACHE_VERSION = "brandos-v5.0";
const STATIC_ASSETS = ["/", "/index.html", "/favicon.png", "/icon.png"];

// Stale-while-revalidate timeout
const NETWORK_TIMEOUT_MS = 3000;

// Install: cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: purge old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Race: network with timeout, fallback to cache
function networkFirstWithTimeout(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      caches.match(request).then((cached) => {
        if (cached) resolve(cached);
        else reject(new Error("timeout"));
      });
    }, timeoutMs);

    fetch(request)
      .then((response) => {
        clearTimeout(timer);
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        }
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timer);
        caches.match(request).then((cached) => {
          if (cached) resolve(cached);
          else reject(err);
        });
      });
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/rest/") || url.pathname.startsWith("/auth/")) return;

  // Immutable hashed assets: cache first
  if (url.pathname.match(/\.(js|css|woff2?)$/) && url.pathname.includes("/assets/")) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
      )
    );
    return;
  }

  // Images: stale-while-revalidate
  if (url.pathname.match(/\.(png|jpg|jpeg|webp|avif|svg|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // HTML: network first with timeout
  event.respondWith(
    networkFirstWithTimeout(request, NETWORK_TIMEOUT_MS).catch(() =>
      caches.match("/").then((cached) => cached || new Response("Offline", { status: 503 }))
    )
  );
});
