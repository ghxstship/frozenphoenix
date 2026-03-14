/* ═══════════════════════════════════════════════════════════════
   OFFLINE QUEUE — Persist scan operations in IndexedDB when the
   network is unavailable and replay them when connectivity returns.
   ═══════════════════════════════════════════════════════════════ */

export interface QueuedScan {
    id: string;
    endpoint: string;
    payload: Record<string, unknown>;
    method: "POST" | "PUT";
    createdAt: string;
    retries: number;
    lastError?: string;
}

const DB_NAME = "frozen-phoenix-scan-queue";
const DB_VERSION = 1;
const STORE_NAME = "pending_scans";

/**
 * Open (or create) the IndexedDB database for the scan queue.
 */
function openDb(): Promise<IDBDatabase> {
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

/**
 * Enqueue a scan operation for later replay.
 */
export async function enqueueScan(
    scan: Omit<QueuedScan, "id" | "createdAt" | "retries">
): Promise<string> {
    const db = await openDb();
    const id = crypto.randomUUID();
    const entry: QueuedScan = {
        ...scan,
        id,
        createdAt: new Date().toISOString(),
        retries: 0,
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(entry);
        tx.oncomplete = () => resolve(id);
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * Get all pending scans, ordered by creation time.
 */
export async function getPendingScans(): Promise<QueuedScan[]> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => {
            const items = (request.result as QueuedScan[]).sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            resolve(items);
        };
        request.onerror = () => reject(request.error);
    });
}

/**
 * Remove a scan from the queue (after successful replay).
 */
export async function removeScan(id: string): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * Update a queued scan (e.g. increment retry count, record error).
 */
export async function updateScan(id: string, updates: Partial<QueuedScan>): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);

        getReq.onsuccess = () => {
            const existing = getReq.result as QueuedScan | undefined;
            if (existing) {
                store.put({ ...existing, ...updates });
            }
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * Get count of pending scans.
 */
export async function getPendingCount(): Promise<number> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Clear all pending scans.
 */
export async function clearQueue(): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

const MAX_RETRIES = 5;

/**
 * Attempt to replay all pending scans. Returns count of successful replays.
 */
export async function replayQueue(): Promise<{
    success: number;
    failed: number;
    remaining: number;
}> {
    const pending = await getPendingScans();
    let success = 0;
    let failed = 0;

    for (const scan of pending) {
        if (scan.retries >= MAX_RETRIES) {
            failed++;
            continue;
        }

        try {
            const res = await fetch(scan.endpoint, {
                method: scan.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scan.payload),
            });

            if (res.ok) {
                await removeScan(scan.id);
                success++;
            } else {
                await updateScan(scan.id, {
                    retries: scan.retries + 1,
                    lastError: `HTTP ${res.status}`,
                });
                failed++;
            }
        } catch (err) {
            await updateScan(scan.id, {
                retries: scan.retries + 1,
                lastError: err instanceof Error ? err.message : "Network error",
            });
            failed++;
        }
    }

    const remaining = (await getPendingScans()).length;
    return { success, failed, remaining };
}
