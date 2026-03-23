"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/layouts/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailPageShell } from "@/components/shells";
import { formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    useCreateProviderConnection,
    useCreateSyncConflictPolicy,
    useDeleteProviderConnection,
    useProviderConnection,
    useProviderTicketMap,
    useSyncConflictPolicies,
    useSyncEvents,
    useUpdateProviderConnection,
    useUpdateSyncConflictPolicy,
    useWebhookEvents,
} from "@/lib/supabase/hooks-external-sync";
import {
    AlertTriangle,
    ArrowLeftRight,
    CheckCircle2,
    Clock,
    Copy,
    Link2,
    Pause,
    Play,
    RefreshCw,
    Settings,
    Shield,
    Trash2,
    Webhook,
    XCircle,
} from "lucide-react";

export function IntegrationDetailPageClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord?: Record<string, unknown> | null;
}) {
    const searchParams = useSearchParams();
    const justConnected = searchParams.get("connected") === "true";

    const { data: connection, isLoading } = useProviderConnection(id);
    const { data: webhookEvents } = useWebhookEvents(id);
    const { data: syncEvents } = useSyncEvents({ connection_id: id });
    const { data: conflictPolicies } = useSyncConflictPolicies(id);
    const createConnection = useCreateProviderConnection();
    const updateConnection = useUpdateProviderConnection();
    const deleteConnection = useDeleteProviderConnection();
    const createPolicy = useCreateSyncConflictPolicy();
    const updatePolicy = useUpdateSyncConflictPolicy();
    const { data: _ticketMap } = useProviderTicketMap(id);

    const [newPolicyEntity, setNewPolicyEntity] = useState("");
    const [newPolicyField, setNewPolicyField] = useState("");
    const [newPolicyStrategy, setNewPolicyStrategy] = useState("last_write_wins");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const conn = (connection as Record<string, unknown>) ?? {};
    const isActive = conn.is_active as boolean;
    const errorCount = (conn.error_count as number) ?? 0;
    const lastSync = conn.last_sync_at as string | null;
    const providerType = (conn.provider_type as string) ?? "";
    const displayName = (conn.display_name as string) || providerType;

    const webhooks = (webhookEvents ?? []) as Record<string, unknown>[];
    const syncs = (syncEvents ?? []) as Record<string, unknown>[];
    const policies = (conflictPolicies ?? []) as Record<string, unknown>[];

    const processedWebhooks = webhooks.filter((w) => w.status === "processed").length;
    const failedWebhooks = webhooks.filter((w) => w.status === "failed").length;
    const completedSyncs = syncs.filter((s) => s.status === "completed").length;
    const failedSyncs = syncs.filter((s) => s.status === "failed").length;

    const handleToggleActive = () => {
        updateConnection.mutate({ id, is_active: !isActive });
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        deleteConnection.mutate(id);
        setShowDeleteConfirm(false);
    };

    const handleAddPolicy = () => {
        if (!newPolicyEntity || !newPolicyField) return;
        createPolicy.mutate({
            connection_id: id,
            entity_type: newPolicyEntity,
            field_name: newPolicyField,
            strategy: newPolicyStrategy,
        } as Record<string, unknown> as never);
        setNewPolicyEntity("");
        setNewPolicyField("");
    };

    const config: DetailPageConfig = {
        entityKey: "integration",
        titleFn: () => displayName,
        subtitleFn: () =>
            `${providerType} integration — ${(conn.sync_direction as string) || "inbound"} sync`,
        statusFn: () => (isActive ? "active" : "paused"),
        icon: Link2,
        backHref: "/integrations",
        backLabel: "Integrations",
        fields: [],
        stats: [
            {
                label: "Status",
                icon: isActive ? CheckCircle2 : Pause,
                compute: () => (isActive ? "Active" : "Paused"),
            },
            { label: "Webhooks Received", icon: Webhook, compute: () => webhooks.length },
            { label: "Syncs Completed", icon: RefreshCw, compute: () => completedSyncs },
            { label: "Errors", icon: AlertTriangle, compute: () => errorCount },
            {
                label: "Last Sync",
                icon: Clock,
                compute: () => (lastSync ? formatDate(lastSync) : "Never"),
            },
        ],
        chatter: false,
        overviewSlot: (
            <div className="density-gap-page">
                {justConnected && (
                    <div className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/5 px-4 py-3 text-sm text-success">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>
                            Integration connected successfully! Data sync will begin shortly.
                        </span>
                    </div>
                )}

                {showDeleteConfirm && (
                    <div
                        role="alert"
                        className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
                    >
                        <p>
                            Are you sure you want to delete the <strong>{displayName}</strong>{" "}
                            integration? This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
                                Delete
                            </Button>
                        </div>
                    </div>
                )}

                {errorCount >= 5 && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>
                            This connection has {errorCount} errors. It will be automatically
                            disabled at 10 errors.
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 density-gap-card">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Connection Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Provider</span>
                                <Badge variant="ghost">{providerType}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sync Direction</span>
                                <span>{conn.sync_direction as string}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span>
                                    {conn.created_at ? formatDate(conn.created_at as string) : "—"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">API Key</span>
                                <span>{conn.api_key ? "••••••••" : "Not set"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">OAuth</span>
                                <span>{conn.access_token ? "Connected" : "Not configured"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Webhook Secret</span>
                                <span>{conn.webhook_secret ? "••••••••" : "Not set"}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Health Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Webhook Success Rate</span>
                                <span>
                                    {webhooks.length > 0
                                        ? `${Math.round((processedWebhooks / webhooks.length) * 100)}%`
                                        : "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Failed Webhooks</span>
                                <span
                                    className={
                                        failedWebhooks > 0 ? "text-destructive font-medium" : ""
                                    }
                                >
                                    {failedWebhooks}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sync Success Rate</span>
                                <span>
                                    {syncs.length > 0
                                        ? `${Math.round((completedSyncs / syncs.length) * 100)}%`
                                        : "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Failed Syncs</span>
                                <span
                                    className={
                                        failedSyncs > 0 ? "text-destructive font-medium" : ""
                                    }
                                >
                                    {failedSyncs}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Error Count</span>
                                <span
                                    className={errorCount > 0 ? "text-destructive font-medium" : ""}
                                >
                                    {errorCount}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Rate Limit</span>
                                <span>
                                    {String(
                                        (conn.rate_limit_config as Record<string, unknown>)
                                            ?.requests_per_second ?? 10
                                    )}{" "}
                                    req/s
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        ),
        tabs: [
            {
                id: "webhooks",
                label: "Webhooks",
                icon: Webhook,
                count: webhooks.length,
                content:
                    webhooks.length === 0 ? (
                        <EmptyState
                            icon={Webhook}
                            title="No webhook events"
                            description="Webhook events will appear here as they are received."
                        />
                    ) : (
                        <div className="space-y-2">
                            {webhooks.slice(0, 50).map((wh, i) => (
                                <Card key={(wh.id as string) || i}>
                                    <CardContent className="py-3">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Badge
                                                    variant={
                                                        wh.status === "processed"
                                                            ? "success"
                                                            : wh.status === "failed"
                                                              ? "destructive"
                                                              : "ghost"
                                                    }
                                                >
                                                    {wh.status as string}
                                                </Badge>
                                                <span className="text-sm font-medium truncate">
                                                    {wh.provider_event_type as string}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground shrink-0">
                                                {wh.received_at
                                                    ? formatDate(wh.received_at as string)
                                                    : ""}
                                                {Number(wh.retry_count ?? 0) > 0 && (
                                                    <span className="ml-2">
                                                        Retries: {String(wh.retry_count)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {!!wh.processing_error && (
                                            <p className="mt-2 text-xs text-destructive bg-destructive/5 px-2 py-1 rounded">
                                                {String(wh.processing_error)}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ),
            },
            {
                id: "sync-log",
                label: "Sync Log",
                icon: RefreshCw,
                count: syncs.length,
                content:
                    syncs.length === 0 ? (
                        <EmptyState
                            icon={ArrowLeftRight}
                            title="No sync events"
                            description="Sync events will appear here as data is synchronized."
                        />
                    ) : (
                        <div className="space-y-2">
                            {syncs.slice(0, 50).map((se, i) => (
                                <Card key={(se.id as string) || i}>
                                    <CardContent className="py-3">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Badge
                                                    variant={
                                                        se.status === "completed"
                                                            ? "success"
                                                            : se.status === "failed"
                                                              ? "destructive"
                                                              : "ghost"
                                                    }
                                                >
                                                    {se.status as string}
                                                </Badge>
                                                <Badge variant="ghost">
                                                    {se.direction as string}
                                                </Badge>
                                                <span className="text-sm font-medium">
                                                    {se.entity_type as string}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground shrink-0 text-right">
                                                <div>
                                                    {String(se.records_processed ?? 0)} processed,{" "}
                                                    {String(se.records_failed ?? 0)} failed
                                                </div>
                                                <div>
                                                    {se.created_at
                                                        ? formatDate(se.created_at as string)
                                                        : ""}
                                                </div>
                                            </div>
                                        </div>
                                        {!!se.error_message && (
                                            <p className="mt-2 text-xs text-destructive bg-destructive/5 px-2 py-1 rounded">
                                                {String(se.error_message)}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ),
            },
            {
                id: "conflict-policies",
                label: "Conflict Policies",
                icon: Shield,
                count: policies.length,
                content: (
                    <div className="density-gap-section">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Add Conflict Policy</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Entity Type
                                        </label>
                                        <input
                                            type="text"
                                            value={newPolicyEntity}
                                            onChange={(e) => setNewPolicyEntity(e.target.value)}
                                            placeholder="e.g., credential_assignments"
                                            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Field Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newPolicyField}
                                            onChange={(e) => setNewPolicyField(e.target.value)}
                                            placeholder="e.g., status"
                                            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Strategy
                                        </label>
                                        <select
                                            value={newPolicyStrategy}
                                            onChange={(e) => setNewPolicyStrategy(e.target.value)}
                                            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="last_write_wins">Last Write Wins</option>
                                            <option value="provider_wins">Provider Wins</option>
                                            <option value="compvss_wins">Platform Wins</option>
                                            <option value="manual">Manual Resolution</option>
                                        </select>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleAddPolicy}
                                        disabled={!newPolicyEntity || !newPolicyField}
                                    >
                                        Add Policy
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {policies.length === 0 ? (
                            <EmptyState
                                icon={Shield}
                                title="No conflict policies"
                                description="Add policies to define how data conflicts are resolved during bidirectional sync."
                            />
                        ) : (
                            <div className="space-y-2">
                                {policies.map((p, i) => (
                                    <Card key={(p.id as string) || i}>
                                        <CardContent className="py-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="ghost">
                                                        {p.entity_type as string}
                                                    </Badge>
                                                    <span className="text-sm font-medium">
                                                        {p.field_name as string}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={p.strategy as string}
                                                        onChange={(e) => {
                                                            updatePolicy.mutate({
                                                                id: p.id as string,
                                                                strategy: e.target.value,
                                                            } as Parameters<
                                                                typeof updatePolicy.mutate
                                                            >[0]);
                                                        }}
                                                        className="rounded-md border bg-background px-2 py-1 text-xs"
                                                        aria-label={`Change strategy for ${p.entity_type as string}.${p.field_name as string}`}
                                                    >
                                                        <option value="last_write_wins">
                                                            Last Write Wins
                                                        </option>
                                                        <option value="source_priority">
                                                            Source Priority
                                                        </option>
                                                        <option value="manual_review">
                                                            Manual Review
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                id: "settings",
                label: "Settings",
                icon: Settings,
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Connection Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="density-gap-section">
                            <div className="grid grid-cols-1 md:grid-cols-2 density-gap-card">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Display Name
                                    </label>
                                    <p className="text-sm mt-1">{displayName}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Provider Type
                                    </label>
                                    <p className="text-sm mt-1">{providerType}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Sync Direction
                                    </label>
                                    <p className="text-sm mt-1">{conn.sync_direction as string}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Webhook URL
                                    </label>
                                    <p className="text-sm mt-1 font-mono text-xs break-all">
                                        {(conn.webhook_url as string) || "Not configured"}
                                    </p>
                                </div>
                            </div>
                            <div className="pt-4 border-t flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-destructive" />
                                <span className="text-sm text-muted-foreground">
                                    To change credentials, delete this connection and create a new
                                    one.
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={id}
            record={(connection as Record<string, unknown> | null) ?? null}
            isLoading={isLoading && !initialRecord}
            actions={
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={createConnection.isPending}
                        onClick={() => {
                            createConnection.mutate({
                                provider_type: providerType,
                                display_name: `${displayName} (Copy)`,
                                sync_direction: (conn.sync_direction as string) || "inbound",
                                is_active: false,
                            } as Parameters<typeof createConnection.mutate>[0]);
                        }}
                        aria-label="Duplicate connection"
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                    </Button>
                    <Button
                        variant={isActive ? "outline" : "default"}
                        size="sm"
                        onClick={handleToggleActive}
                        aria-label={isActive ? "Pause integration" : "Enable integration"}
                    >
                        {isActive ? (
                            <Pause className="mr-2 h-4 w-4" />
                        ) : (
                            <Play className="mr-2 h-4 w-4" />
                        )}
                        {isActive ? "Pause" : "Enable"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            }
        />
    );
}
