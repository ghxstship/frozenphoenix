"use client";

/* ═══════════════════════════════════════════════════════════════
   OFFLINE INDICATOR — Displays network status and pending scan
   count. Shows a sync button when scans are queued.
   ═══════════════════════════════════════════════════════════════ */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, CloudOff, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/locale-provider";

export interface OfflineIndicatorProps {
    isOnline: boolean;
    pendingCount: number;
    isSyncing: boolean;
    onSyncNow?: (() => void) | undefined;
    onClearPending?: (() => void) | undefined;
    className?: string | undefined;
}

export function OfflineIndicator({
    isOnline,
    pendingCount,
    isSyncing,
    onSyncNow,
    onClearPending,
    className,
}: OfflineIndicatorProps) {
    const { t } = useTranslation("scanning");
    // Fully online with nothing pending — show nothing
    if (isOnline && pendingCount === 0) return null;

    return (
        <div
            className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                isOnline
                    ? "border-warning/50 bg-warning/5"
                    : "border-destructive/50 bg-destructive/5",
                className
            )}
            role="status"
            aria-live="polite"
        >
            {isOnline ? (
                <Cloud className="h-4 w-4 text-success shrink-0" />
            ) : (
                <CloudOff className="h-4 w-4 text-destructive shrink-0" />
            )}

            <span className="flex-1">
                {!isOnline && (
                    <span className="font-medium text-destructive">
                        {t("offline.offlineTitle")}
                    </span>
                )}
                {pendingCount > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                        {t("offline.pendingCount").replace("{count}", String(pendingCount))}
                    </Badge>
                )}
            </span>

            {pendingCount > 0 && isOnline && onSyncNow && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onSyncNow}
                    disabled={isSyncing}
                    className="h-7 text-xs"
                >
                    {isSyncing ? (
                        <Loader2 className="h-3 w-3 motion-safe:animate-spin mr-1" />
                    ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    {t("offline.syncNow")}
                </Button>
            )}

            {pendingCount > 0 && onClearPending && (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClearPending}
                    className="h-7 text-xs text-muted-foreground"
                >
                    {t("offline.clearQueue")}
                </Button>
            )}
        </div>
    );
}
