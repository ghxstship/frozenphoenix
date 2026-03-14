/* ═══════════════════════════════════════════════════════════════
   USE-OFFLINE-SYNC — React hook that monitors network status,
   queues scan operations when offline, and replays them when
   connectivity is restored.
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useEffect, useState } from "react";
import {
    clearQueue,
    enqueueScan,
    getPendingCount,
    type QueuedScan,
    replayQueue,
} from "@/lib/scanning/offline-queue";

export interface UseOfflineSyncReturn {
    /** Whether the browser is currently online */
    isOnline: boolean;
    /** Number of scans waiting to be synced */
    pendingCount: number;
    /** Whether a replay is currently in progress */
    isSyncing: boolean;
    /** Queue a scan for later replay */
    queueScan: (scan: Omit<QueuedScan, "id" | "createdAt" | "retries">) => Promise<string>;
    /** Manually trigger a replay of the queue */
    syncNow: () => Promise<void>;
    /** Clear all pending scans */
    clearPending: () => Promise<void>;
    /** Last sync result summary */
    lastSyncResult: { success: number; failed: number; remaining: number } | null;
}

export function useOfflineSync(): UseOfflineSyncReturn {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== "undefined" ? navigator.onLine : true
    );
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncResult, setLastSyncResult] = useState<{
        success: number;
        failed: number;
        remaining: number;
    } | null>(null);

    // Track online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Refresh pending count periodically
    useEffect(() => {
        const refresh = async () => {
            try {
                const count = await getPendingCount();
                setPendingCount(count);
            } catch {
                // IndexedDB may not be available
            }
        };

        refresh();
        const interval = setInterval(refresh, 5000);
        return () => clearInterval(interval);
    }, []);

    // Auto-replay when coming back online
    useEffect(() => {
        if (isOnline && pendingCount > 0 && !isSyncing) {
            void syncNowInternal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline]);

    const syncNowInternal = useCallback(async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            const result = await replayQueue();
            setLastSyncResult(result);
            setPendingCount(result.remaining);
        } catch {
            // Queue replay failed entirely
        } finally {
            setIsSyncing(false);
        }
    }, [isSyncing]);

    const queueScan = useCallback(
        async (scan: Omit<QueuedScan, "id" | "createdAt" | "retries">) => {
            const id = await enqueueScan(scan);
            const count = await getPendingCount();
            setPendingCount(count);
            return id;
        },
        []
    );

    const clearPending = useCallback(async () => {
        await clearQueue();
        setPendingCount(0);
        setLastSyncResult(null);
    }, []);

    return {
        isOnline,
        pendingCount,
        isSyncing,
        queueScan,
        syncNow: syncNowInternal,
        clearPending,
        lastSyncResult,
    };
}
