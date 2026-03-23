"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, RefreshCw } from "lucide-react";

interface ProviderConnectionCardProps {
    providerName: string;
    providerType: string;
    displayName: string | null;
    status: string;
    webhookUrl: string | null;
    lastSyncAt: string | null;
    errorCount: number;
    onSyncNow?: (() => void) | undefined;
    onConfigure?: (() => void) | undefined;
}

const PROVIDER_ICONS: Record<string, string> = {
    eventbrite: "🎟️",
    square: "💳",
    front_gate: "🎫",
    ticketmaster: "🎪",
    shopify: "🛒",
    stripe: "💵",
};

const STATUS_CONFIG: Record<
    string,
    { variant: "success" | "warning" | "destructive" | "ghost"; label: string }
> = {
    active: { variant: "success", label: "Active" },
    paused: { variant: "warning", label: "Paused" },
    error: { variant: "destructive", label: "Error" },
    disconnected: { variant: "ghost", label: "Disconnected" },
    pending_auth: { variant: "warning", label: "Pending Auth" },
};

export function ProviderConnectionCard({
    providerName,
    providerType,
    displayName,
    status,
    webhookUrl,
    lastSyncAt,
    errorCount,
    onSyncNow,
    onConfigure,
}: ProviderConnectionCardProps) {
    const cfg = STATUS_CONFIG[status] ?? { variant: "ghost" as const, label: status };
    const icon = PROVIDER_ICONS[providerName] ?? "🔗";

    return (
        <Card className={status === "error" ? "border-destructive/30" : ""}>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{icon}</span>
                        <div>
                            <CardTitle className="text-sm">{displayName || providerName}</CardTitle>
                            <p className="density-caption text-muted-foreground capitalize">
                                {providerType.replace("_", " ")}
                            </p>
                        </div>
                    </div>
                    <Badge variant={cfg.variant} className="density-caption">
                        {cfg.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 density-caption">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Last Sync</span>
                        <span className="font-medium">
                            {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : "Never"}
                        </span>
                    </div>
                    {errorCount > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Errors</span>
                            <Badge variant="destructive" className="density-caption">
                                {errorCount}
                            </Badge>
                        </div>
                    )}
                    {webhookUrl && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-success" />
                            <span>Webhook configured</span>
                        </div>
                    )}
                </div>
                <div className="mt-3 flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7"
                        onClick={onSyncNow}
                    >
                        <RefreshCw className="h-3 w-3" />
                        Sync Now
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs h-7" onClick={onConfigure}>
                        Configure
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
