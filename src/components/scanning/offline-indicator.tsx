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
import { SCANNING_STRINGS } from "@/lib/i18n/scanning-strings";

const S = SCANNING_STRINGS.offline;

export interface OfflineIndicatorProps {
    isOnline: boolean;
    pendingCount: number;
    isSyncing: boolean;
    onSyncNow?: () => void;
    onClearPending?: () => void;
    className?: string;
}

export function OfflineIndicator({
    isOnline,
    pendingCount,
    isSyncing,
    onSyncNow,
    onClearPending,
    className,
}: OfflineIndicatorProps) {
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
                    <span className="font-medium text-destructive">{S.offlineTitle}</span>
                )}
                {pendingCount > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                        {S.pendingCount.replace("{count}", String(pendingCount))}
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
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    {S.syncNow}
                </Button>
            )}

            {pendingCount > 0 && onClearPending && (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClearPending}
                    className="h-7 text-xs text-muted-foreground"
                >
                    {S.clearQueue}
                </Button>
            )}
        </div>
    );
}
