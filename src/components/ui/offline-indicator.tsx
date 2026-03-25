"use client";

/* ═══════════════════════════════════════════════════════════════
   OFFLINE INDICATOR — Network Connectivity Status Banner

   Non-intrusive toast that appears when the device loses
   connectivity and dismisses when reconnected.
   ═══════════════════════════════════════════════════════════════ */

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(
        () => typeof navigator !== "undefined" && !navigator.onLine
    );
    const [showReconnected, setShowReconnected] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const goOffline = () => {
            setIsOffline(true);
            setWasOffline(true);
        };
        const goOnline = () => {
            setIsOffline(false);
            if (wasOffline) {
                setShowReconnected(true);
                setTimeout(() => setShowReconnected(false), 3000);
            }
        };

        window.addEventListener("offline", goOffline);
        window.addEventListener("online", goOnline);
        return () => {
            window.removeEventListener("offline", goOffline);
            window.removeEventListener("online", goOnline);
        };
    }, [wasOffline]);

    if (!isOffline && !showReconnected) return null;

    return (
        <div
            className={cn(
                "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 motion-safe:animate-slide-up",
                isOffline
                    ? "bg-warning text-warning-foreground"
                    : "bg-success text-success-foreground"
            )}
            role="status"
            aria-live="polite"
        >
            {isOffline ? (
                <>
                    <WifiOff className="h-4 w-4" />
                    Working offline — changes will sync when reconnected
                </>
            ) : (
                <>
                    <Wifi className="h-4 w-4" />
                    Back online
                </>
            )}
        </div>
    );
}

OfflineIndicator.displayName = "OfflineIndicator";
