/* ═══════════════════════════════════════════════════════════════
   SERVICE WORKER REGISTRATION — Register the scanning service
   worker for offline scan queue support.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Register the scanning service worker. Call this once at app startup
 * (e.g. in a layout or root component). Safe to call in SSR — it
 * checks for browser environment before registering.
 */
export async function registerScanningServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register("/sw-scanning.js", {
            scope: "/",
        });

        // Request background sync permission if available
        if ("sync" in registration) {
            try {
                await (
                    registration as unknown as {
                        sync: { register: (tag: string) => Promise<void> };
                    }
                ).sync.register("scan-queue-sync");
            } catch {
                // Background sync not supported or permission denied
            }
        }

        return registration;
    } catch {
        // Service worker registration failed — non-fatal
        return null;
    }
}

/**
 * Listen for messages from the scanning service worker.
 */
export function onServiceWorkerMessage(callback: (event: MessageEvent) => void): () => void {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return () => {};
    }

    navigator.serviceWorker.addEventListener("message", callback);
    return () => {
        navigator.serviceWorker.removeEventListener("message", callback);
    };
}
