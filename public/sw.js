// PhysIQx AI Service Worker — PWA offline shell & active workout cache
// v6: data requests (RSC payloads behind client-side navigation) are no
// longer cache-first — after a deploy they served the old build's payloads.
// Bumping the name also clears every v5 entry on activate.
const CACHE_NAME = "physiqx-cache-v6";

const PRECACHE_ASSETS = [
  "/",
  "/home",
  "/insights/strength",
  "/insights/recovery",
  "/compete/challenges/challenge-volume-king",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
];

// Files that only change when their name does (or almost never): safe to
// serve from cache and refresh in the background.
const STATIC_FILE = /\.(?:png|jpe?g|webp|gif|svg|ico|woff2?|mp3|wav|webm|mp4)$/i;

// Install: pre-cache critical app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// Activate: clean up deprecated cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function store(request, response) {
  if (response && response.status === 200) {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }
  return response;
}

// Cached copy now, fresh copy into the cache for next time.
function staleWhileRevalidate(request) {
  return caches.match(request).then((cached) => {
    const network = fetch(request)
      .then((response) => store(request, response))
      .catch(() => cached);
    return cached || network;
  });
}

// The network when it answers; the cache only when offline.
function networkFirst(request, fallbackToRoot) {
  return fetch(request)
    .then((response) => store(request, response))
    .catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (fallbackToRoot) {
        const root = await caches.match("/");
        if (root) return root;
      }
      return Response.error();
    });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only same-origin GETs. Supabase and other origins go straight through.
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Auth hops must always reach the server.
  if (url.pathname.startsWith("/auth/")) {
    return;
  }

  // Next.js build output is content-hashed: a new deploy means new URLs.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/")) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Page loads.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, true));
    return;
  }

  // Images, icons, sounds, optimised images.
  if (url.pathname.startsWith("/_next/image") || STATIC_FILE.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Everything else — RSC payloads, the manifest, JSON — follows the server
  // while online, so a deploy takes effect immediately.
  event.respondWith(networkFirst(request, false));
});
