"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";

interface SyncEventRowProps {
    providerName: string;
    direction: string;
    entityType: string;
    status: string;
    recordsProcessed: number;
    recordsFailed: number;
    errorMessage: string | null;
    startedAt: string;
    completedAt: string | null;
}

const STATUS_CONFIG: Record<
    string,
    {
        variant: "success" | "warning" | "destructive" | "info" | "ghost";
        icon: typeof CheckCircle2;
    }
> = {
    completed: { variant: "success", icon: CheckCircle2 },
    in_progress: { variant: "info", icon: RefreshCw },
    failed: { variant: "destructive", icon: XCircle },
    partial: { variant: "warning", icon: AlertTriangle },
    pending: { variant: "ghost", icon: Clock },
};

export function SyncEventRow({
    providerName,
    direction,
    entityType,
    status,
    recordsProcessed,
    recordsFailed,
    errorMessage,
    startedAt,
    completedAt,
}: SyncEventRowProps) {
    const cfg = (STATUS_CONFIG[status] ?? STATUS_CONFIG.pending)!;
    const Icon = cfg.icon;
    const duration = completedAt
        ? `${Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000)}s`
        : "—";

    return (
        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/30 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
                <Icon
                    className={`h-4 w-4 shrink-0 ${
                        status === "completed"
                            ? "text-success"
                            : status === "failed"
                              ? "text-destructive"
                              : status === "in_progress"
                                ? "text-info motion-safe:animate-spin"
                                : "text-muted-foreground"
                    }`}
                />
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">{providerName}</span>
                        <Badge variant="secondary" className="density-caption capitalize">
                            {direction}
                        </Badge>
                        <span className="density-caption text-muted-foreground capitalize">
                            {entityType.replace("_", " ")}
                        </span>
                    </div>
                    {errorMessage && (
                        <p className="density-caption text-destructive truncate mt-0.5">
                            {errorMessage}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                <div className="text-right density-caption">
                    <span className="font-medium">{recordsProcessed}</span>
                    {recordsFailed > 0 && (
                        <span className="text-destructive ml-1">({recordsFailed} failed)</span>
                    )}
                </div>
                <span className="density-caption text-muted-foreground w-10 text-right">
                    {duration}
                </span>
                <Badge
                    variant={cfg.variant}
                    className="density-caption capitalize w-20 justify-center"
                >
                    {status.replace("_", " ")}
                </Badge>
                <span className="density-caption text-muted-foreground">
                    {new Date(startedAt).toLocaleTimeString()}
                </span>
            </div>
        </div>
    );
}
