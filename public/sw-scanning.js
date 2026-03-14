/* ═══════════════════════════════════════════════════════════════
   SERVICE WORKER — Scanning Offline Support
   
   Intercepts scan API requests when offline and stores them in
   IndexedDB for later replay. Also caches critical scanning
   assets for offline availability.
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME = "frozen-phoenix-scanning-v1";
const SCAN_ENDPOINTS = [
    "/api/assets/scan",
    "/api/assets/lookup",
    "/api/credentials/scan",
];

const PRECACHE_URLS = [
    "/assets/scan",
    "/assets/scan/batch",
];

// ─── Install ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS).catch(() => {
                // Precaching is best-effort — don't block install
            });
        })
    );
    self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// ─── Fetch ───────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Only intercept scan API POST requests
    const isScanEndpoint = SCAN_ENDPOINTS.some((ep) =>
        url.pathname.startsWith(ep)
    );

    if (isScanEndpoint && event.request.method === "POST") {
        event.respondWith(handleScanRequest(event.request));
        return;
    }

    // For navigation requests to scan pages, try network then cache
    if (
        event.request.mode === "navigate" &&
        PRECACHE_URLS.some((p) => url.pathname.startsWith(p))
    ) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request).then((cached) => {
                    return cached || new Response("Offline", { status: 503 });
                });
            })
        );
        return;
    }
});

/**
 * Handle scan API requests — try network first, fall back to
 * queuing in IndexedDB if offline.
 */
async function handleScanRequest(request) {
    try {
        const response = await fetch(request.clone());
        return response;
    } catch {
        // Network failed — queue the request
        const body = await request.json();
        const url = new URL(request.url);

        const entry = {
            id: crypto.randomUUID(),
            endpoint: url.pathname,
            payload: body,
            method: request.method,
            createdAt: new Date().toISOString(),
            retries: 0,
        };

        // Store in IndexedDB
        await storeInQueue(entry);

        // Notify all clients about the queued scan
        const clients = await self.clients.matchAll();
        for (const client of clients) {
            client.postMessage({
                type: "SCAN_QUEUED",
                payload: entry,
            });
        }

        // Return a synthetic response so the UI can continue
        return new Response(
            JSON.stringify({
                queued: true,
                queue_id: entry.id,
                message: "Scan queued for offline sync",
            }),
            {
                status: 202,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

// ─── IndexedDB helpers ───────────────────────────────────────
const DB_NAME = "frozen-phoenix-scan-queue";
const DB_VERSION = 1;
const STORE_NAME = "pending_scans";

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function storeInQueue(entry) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(entry);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// ─── Background Sync ─────────────────────────────────────────
self.addEventListener("sync", (event) => {
    if (event.tag === "scan-queue-sync") {
        event.waitUntil(replayQueue());
    }
});

async function replayQueue() {
    const db = await openDb();
    const pending = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    for (const scan of pending) {
        try {
            const res = await fetch(scan.endpoint, {
                method: scan.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scan.payload),
            });

            if (res.ok) {
                const deleteTx = db.transaction(STORE_NAME, "readwrite");
                deleteTx.objectStore(STORE_NAME).delete(scan.id);
                await new Promise((r) => { deleteTx.oncomplete = r; });
            }
        } catch {
            // Will retry on next sync
        }
    }

    // Notify clients about sync completion
    const clients = await self.clients.matchAll();
    for (const client of clients) {
        client.postMessage({ type: "SCAN_SYNC_COMPLETE" });
    }
}
