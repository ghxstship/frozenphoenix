"use client";

/* ═══════════════════════════════════════════════════════════════
   OFFLINE BANNER — Full-width network status indicator

   Renders a persistent banner at the top of the dashboard when
   the browser goes offline. Dismissible, re-appears on subsequent
   offline events. Uses the browser's native navigator.onLine API
   with event listeners for instant response.
   ═══════════════════════════════════════════════════════════════ */

import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WifiOff, X } from "lucide-react";

export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(
        () => typeof navigator !== "undefined" && !navigator.onLine
    );
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handleOffline = () => {
            setIsOffline(true);
            setDismissed(false); // Re-show on new offline event
        };
        const handleOnline = () => {
            setIsOffline(false);
            setDismissed(false);
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);
        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    const handleDismiss = useCallback(() => setDismissed(true), []);

    if (!isOffline || dismissed) return null;

    return (
        <div
            className={cn(
                "flex items-center justify-center gap-2 px-4 py-2",
                "bg-warning/10 border-b border-warning/30 text-warning",
                "text-sm font-medium",
                "motion-safe:animate-slide-down"
            )}
            role="status"
            aria-live="assertive"
        >
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>You&lsquo;re offline — changes will sync when reconnected</span>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="ml-2 h-6 w-6 min-h-[44px] min-w-[44px] text-warning/70 hover:text-warning"
                aria-label="Dismiss offline notification"
            >
                <X className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
