"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useSyncEvents, useWebhookEvents } from "@/lib/supabase/hooks-external-sync";
import { AlertTriangle, CheckCircle2, Clock, RefreshCw, Webhook, XCircle } from "lucide-react";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { PermissionGate } from "@/components/permission-guard";

interface SyncEventRow {
    id: string;
    direction: string;
    entity_type: string;
    status: string;
    error_message: string | null;
    records_processed: number;
    records_failed: number;
    started_at: string;
    completed_at: string | null;
    provider_connections: { provider_name: string; display_name: string | null } | null;
}

interface WebhookEventRow {
    id: string;
    provider_name: string;
    event_type: string;
    status: string;
    error_message: string | null;
    received_at: string;
    processed_at: string | null;
}

const SYNC_STATUS: Record<
    string,
    { variant: "success" | "warning" | "destructive" | "info" | "ghost"; icon: typeof CheckCircle2 }
> = {
    completed: { variant: "success", icon: CheckCircle2 },
    in_progress: { variant: "info", icon: RefreshCw },
    failed: { variant: "destructive", icon: XCircle },
    partial: { variant: "warning", icon: AlertTriangle },
    pending: { variant: "ghost", icon: Clock },
};

const syncColumns: ColumnDef<SyncEventRow>[] = [
    {
        id: "provider",
        header: "Provider",
        accessorFn: (row) =>
            row.provider_connections?.display_name ??
            row.provider_connections?.provider_name ??
            "—",
        sortable: true,
        filterable: true,
    },
    {
        id: "direction",
        header: "Direction",
        accessorKey: "direction",
        sortable: true,
        filterable: true,
        render: (v) => (
            <Badge variant="secondary" className="text-[10px] capitalize">
                {String(v)}
            </Badge>
        ),
    },
    {
        id: "entity_type",
        header: "Entity",
        accessorKey: "entity_type",
        sortable: true,
        filterable: true,
        render: (v) => <span className="text-xs capitalize">{String(v).replace("_", " ")}</span>,
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        sortable: true,
        filterable: true,
        render: (v) => {
            const s = String(v);
            const cfg = SYNC_STATUS[s] ?? { variant: "ghost" as const };
            return (
                <Badge variant={cfg.variant} className="text-[10px] capitalize">
                    {s.replace("_", " ")}
                </Badge>
            );
        },
    },
    {
        id: "records",
        header: "Records",
        accessorKey: "records_processed",
        sortable: true,
        align: "right",
        render: (_v, row) => (
            <div className="text-right">
                <span className="text-xs font-medium">{row.records_processed}</span>
                {row.records_failed > 0 && (
                    <span className="text-[10px] text-destructive ml-1">
                        ({row.records_failed} failed)
                    </span>
                )}
            </div>
        ),
    },
    {
        id: "started_at",
        header: "Started",
        accessorKey: "started_at",
        sortable: true,
        render: (v) => <span className="text-xs">{new Date(v as string).toLocaleString()}</span>,
    },
    {
        id: "error_message",
        header: "Error",
        accessorKey: "error_message",
        render: (v) => {
            if (!v) return <span className="text-xs text-muted-foreground">—</span>;
            return (
                <span className="text-xs text-destructive truncate max-w-[200px] block">
                    {String(v)}
                </span>
            );
        },
    },
];

const webhookColumns: ColumnDef<WebhookEventRow>[] = [
    {
        id: "provider_name",
        header: "Provider",
        accessorKey: "provider_name",
        sortable: true,
        filterable: true,
        render: (v) => <span className="text-xs capitalize">{String(v)}</span>,
    },
    {
        id: "event_type",
        header: "Event",
        accessorKey: "event_type",
        sortable: true,
        render: (v) => <span className="text-xs font-mono">{String(v)}</span>,
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        sortable: true,
        filterable: true,
        render: (v) => {
            const s = String(v);
            const variant =
                s === "processed"
                    ? "success"
                    : s === "failed"
                      ? "destructive"
                      : s === "pending"
                        ? "ghost"
                        : "info";
            return (
                <Badge variant={variant} className="text-[10px] capitalize">
                    {s}
                </Badge>
            );
        },
    },
    {
        id: "received_at",
        header: "Received",
        accessorKey: "received_at",
        sortable: true,
        render: (v) => <span className="text-xs">{new Date(v as string).toLocaleString()}</span>,
    },
    {
        id: "error_message",
        header: "Error",
        accessorKey: "error_message",
        render: (v) => {
            if (!v) return <span className="text-xs text-muted-foreground">—</span>;
            return (
                <span className="text-xs text-destructive truncate max-w-[200px] block">
                    {String(v)}
                </span>
            );
        },
    },
];

export default function SyncLogPage() {
    const { data: syncEvents, isLoading: loadingSyncs } = useSyncEvents();
    const { data: webhookEvents, isLoading: loadingWebhooks } = useWebhookEvents();

    const isLoading = loadingSyncs || loadingWebhooks;

    if (isLoading) {
        return <LoadingState />;
    }

    const syncs = (syncEvents ?? []) as unknown as SyncEventRow[];
    const webhooks = (webhookEvents ?? []) as unknown as WebhookEventRow[];

    const completedSyncs = syncs.filter((s) => s.status === "completed").length;
    const failedSyncs = syncs.filter((s) => s.status === "failed").length;
    const processedWebhooks = webhooks.filter((w) => w.status === "processed").length;

    return (
        <PermissionGate resource="sync_events" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Sync Log"
                    description="Monitor data synchronization events and webhook activity"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Syncs" value={syncs.length} icon={RefreshCw} />
                    <StatCard title="Completed" value={completedSyncs} icon={CheckCircle2} />
                    <StatCard title="Failed" value={failedSyncs} icon={XCircle} />
                    <StatCard title="Webhooks Processed" value={processedWebhooks} icon={Webhook} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <RefreshCw className="h-4 w-4" />
                            Sync Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable<SyncEventRow>
                            data={syncs}
                            columns={syncColumns}
                            keyField="id"
                            searchable
                            searchPlaceholder="Search sync events..."
                            pageSize={20}
                            hoverable
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Webhook className="h-4 w-4" />
                            Webhook Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable<WebhookEventRow>
                            data={webhooks}
                            columns={webhookColumns}
                            keyField="id"
                            searchable
                            searchPlaceholder="Search webhook events..."
                            pageSize={20}
                            hoverable
                        />
                    </CardContent>
                </Card>
            </div>
        </PermissionGate>
    );
}
