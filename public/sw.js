/* ═══════════════════════════════════════════════════════════════
   SERVICE WORKER — Lightweight precaching + runtime caching
   
   Strategy:
   - Static assets (_next/static, fonts, icons): Cache-first (immutable)
   - API GET requests: Stale-while-revalidate with 5-min max-age
   - HTML pages: Network-first with offline fallback
   - Mutations (POST/PATCH/DELETE): Network-only (never cached)
   ═══════════════════════════════════════════════════════════════ */

const CACHE_VERSION = "fp-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

// Performance: Max-age for API cache entries (5 minutes).
// Prevents serving stale data beyond React Query's refetch window.
const API_CACHE_MAX_AGE_MS = 5 * 60 * 1000;

// Performance: Max entries per cache to prevent unbounded memory growth.
const API_CACHE_MAX_ENTRIES = 200;
const PAGE_CACHE_MAX_ENTRIES = 50;

// Static assets to precache on install
const PRECACHE_URLS = [
  "/logo-icon.svg",
  "/logo-wordmark.svg",
  "/manifest.json",
];

// ─── Install: Precache static assets ───
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ─── Activate: Clean old caches + enable navigation preload ───
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Clean old versioned caches
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("fp-") && key !== STATIC_CACHE && key !== API_CACHE && key !== PAGE_CACHE)
            .map((key) => caches.delete(key))
        )
      ),
      // Performance: Navigation Preload — allows the browser to start the
      // network request in parallel with SW startup, saving 50-100ms.
      self.registration.navigationPreload?.enable().catch(() => {}),
    ])
  );
  self.clients.claim();
});

// ─── Cache Helpers ───

/** Evict oldest entries when cache exceeds max size */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

/** Check if a cached response is still fresh (within max-age) */
function isCacheFresh(response, maxAgeMs) {
  const dateHeader = response.headers.get("date") || response.headers.get("sw-cached-at");
  if (!dateHeader) return false;
  const cachedTime = new Date(dateHeader).getTime();
  return Date.now() - cachedTime < maxAgeMs;
}

/** Clone a response with a timestamp header for cache freshness tracking */
function stampResponse(response) {
  const headers = new Headers(response.headers);
  if (!headers.has("date")) {
    headers.set("sw-cached-at", new Date().toISOString());
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ─── Fetch: Route-based caching strategies ───
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (mutations must always go to network)
  if (request.method !== "GET") return;

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // Strategy 1: Cache-first for static assets (immutable hashed files)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Strategy 2: Stale-while-revalidate for API GET requests (with TTL)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, stampResponse(response.clone()));
                // Async: trim cache to prevent unbounded growth
                trimCache(API_CACHE, API_CACHE_MAX_ENTRIES);
              }
              return response;
            })
            .catch(() => cached); // Offline: return cached if available

          // Return cached if fresh, otherwise wait for network
          if (cached && isCacheFresh(cached, API_CACHE_MAX_AGE_MS)) {
            return cached;
          }
          // Stale or no cache: wait for network (or return stale as last resort)
          return fetchPromise.then((networkResponse) => networkResponse || cached);
        })
      )
    );
    return;
  }

  // Strategy 3: Network-first for HTML pages (with navigation preload)
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      (async () => {
        try {
          // Use navigation preload response if available
          const preloadResponse = event.preloadResponse ? await event.preloadResponse : null;
          const response = preloadResponse || await fetch(request);
          if (response.ok) {
            const cache = await caches.open(PAGE_CACHE);
            cache.put(request, response.clone());
            trimCache(PAGE_CACHE, PAGE_CACHE_MAX_ENTRIES);
          }
          return response;
        } catch {
          const cached = await caches.match(request);
          return cached || (await caches.match("/dashboard"));
        }
      })()
    );
    return;
  }
});

