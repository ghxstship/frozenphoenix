"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_INTEGRATION_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useProviderConnections } from "@/lib/supabase/hooks-external-sync";
import {
    AlertTriangle,
    CheckCircle2,
    Link2,
    Loader2,
    Plus,
    RefreshCw,
    Unplug,
    Wifi,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

interface ConnectionRow {
    id: string;
    provider_name: string;
    provider_type: string;
    display_name: string | null;
    status: string;
    webhook_url: string | null;
    last_sync_at: string | null;
    error_count: number;
    created_at: string;
}

const PROVIDER_ICONS: Record<string, string> = {
    eventbrite: "🎟️",
    square: "💳",
    front_gate: "🎫",
    ticketmaster: "🎪",
    shopify: "🛒",
    stripe: "💵",
};

const STATUS_CONFIG: Record<string, { variant: "success" | "warning" | "destructive" | "ghost"; label: string }> = {
    active: { variant: "success", label: "Active" },
    paused: { variant: "warning", label: "Paused" },
    error: { variant: "destructive", label: "Error" },
    disconnected: { variant: "ghost", label: "Disconnected" },
    pending_auth: { variant: "warning", label: "Pending Auth" },
};

export default function IntegrationsPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const { data: connections, isLoading } = useProviderConnections();

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    const rows = (connections ?? []) as unknown as ConnectionRow[];
    const activeCount = rows.filter((r) => r.status === "active").length;
    const errorCount = rows.filter((r) => r.status === "error").length;
    const totalErrors = rows.reduce((sum, r) => sum + r.error_count, 0);

    return (
        <PermissionGate resource="provider_connections" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Integrations"
                    description="Manage external provider connections for ticketing, POS, and data sync"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        Add Connection
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Connections" value={rows.length} icon={Link2} />
                    <StatCard title="Active" value={activeCount} icon={Wifi} />
                    <StatCard title="Errors" value={errorCount} icon={AlertTriangle} />
                    <StatCard title="Total Sync Errors" value={totalErrors} icon={RefreshCw} />
                </div>

                {rows.length === 0 ? (
                    <Card>
                        <CardContent className="py-16">
                            <div className="flex flex-col items-center text-center">
                                <Unplug className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold">No Integrations Connected</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                                    Connect your ticketing providers (Eventbrite, Front Gate Tickets) and POS systems (Square) to sync data automatically.
                                </p>
                                <Button size="sm" className="mt-6">
                                    <Plus className="h-4 w-4" />
                                    Connect First Provider
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rows.map((conn) => {
                            const cfg = STATUS_CONFIG[conn.status] ?? { variant: "ghost" as const, label: conn.status };
                            const icon = PROVIDER_ICONS[conn.provider_name] ?? "🔗";
                            return (
                                <Card key={conn.id} className={conn.status === "error" ? "border-destructive/30" : ""}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{icon}</span>
                                                <div>
                                                    <CardTitle className="text-sm">
                                                        {conn.display_name || conn.provider_name}
                                                    </CardTitle>
                                                    <p className="text-[10px] text-muted-foreground capitalize">
                                                        {conn.provider_type.replace("_", " ")}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={cfg.variant} className="text-[10px]">
                                                {cfg.label}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-[11px]">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Last Sync</span>
                                                <span className="font-medium">
                                                    {conn.last_sync_at
                                                        ? new Date(conn.last_sync_at).toLocaleString()
                                                        : "Never"}
                                                </span>
                                            </div>
                                            {conn.error_count > 0 && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Errors</span>
                                                    <Badge variant="destructive" className="text-[9px]">
                                                        {conn.error_count}
                                                    </Badge>
                                                </div>
                                            )}
                                            {conn.webhook_url && (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <CheckCircle2 className="h-3 w-3 text-success" />
                                                    <span>Webhook configured</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <Button size="sm" variant="outline" className="flex-1 text-xs h-7">
                                                <RefreshCw className="h-3 w-3" />
                                                Sync Now
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-xs h-7">
                                                Configure
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
            <CreateEntityDialog config={CREATE_INTEGRATION_CONFIG} open={createOpen} onClose={closeCreate} />
        </PermissionGate>
    );
}
