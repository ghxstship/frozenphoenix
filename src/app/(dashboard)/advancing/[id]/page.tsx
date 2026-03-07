"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Package,
    Send,
    XCircle,
} from "lucide-react";
import { PageShell } from "@/components/layouts/page-shell";
import { PermissionGate } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AdvanceItemStatusBadge,
    AdvancePriorityBadge,
    AdvanceStatusBadge,
    AdvanceTypeBadge,
} from "@/components/advancing";
import { AdvanceTimeline } from "@/components/advancing/advance-timeline";
import { useAdvance, useAdvanceItems } from "@/lib/supabase/hooks-advancing";
import { useAdvancesRealtime } from "@/lib/supabase/realtime-advancing";
import { formatAdvanceCost } from "@/config/advancing-config";
import type { AdvanceItemStatus, AdvancePriority, AdvanceStatus, AdvanceType } from "@/types";

export default function AdvanceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    useAdvancesRealtime();

    const { data: advance, isLoading } = useAdvance(id);
    const { data: items } = useAdvanceItems(id);

    const adv = advance as Record<string, unknown> | undefined;
    const itemsList = (items as Record<string, unknown>[] | undefined) ?? [];

    const [actionLoading, setActionLoading] = React.useState<string | null>(null);

    async function handleStatusAction(action: string, body?: Record<string, unknown>) {
        setActionLoading(action);
        try {
            const res = await fetch(`/api/advancing/${id}/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: body ? JSON.stringify(body) : undefined,
            });
            if (!res.ok) {
                const err = await res.json();
                alert(err.error?.message ?? "Action failed");
            }
        } finally {
            setActionLoading(null);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!adv) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
                <Package className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Advance not found</p>
                <Button variant="outline" onClick={() => router.push("/advancing")}>
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Advances
                </Button>
            </div>
        );
    }

    const status = adv.status as AdvanceStatus;
    const canSubmit = status === "draft";
    const canApprove = status === "submitted" || status === "in_review";
    const canReject = canApprove;
    const canCancel = ["draft", "submitted", "in_review", "approved", "in_progress"].includes(status);

    return (
        <PermissionGate resource="advancing" action="read">
            <PageShell
                title={String(adv.title)}
                description={`${String(adv.advance_number)} · ${String(adv.advance_type).replace("_", " ")}`}
                actions={
                    <div className="flex items-center gap-2">
                        {canSubmit && (
                            <Button
                                onClick={() => handleStatusAction("submit")}
                                disabled={actionLoading !== null}
                            >
                                <Send className="h-4 w-4" />
                                {actionLoading === "submit" ? "Submitting..." : "Submit"}
                            </Button>
                        )}
                        {canApprove && (
                            <Button
                                variant="default"
                                onClick={() => handleStatusAction("approve")}
                                disabled={actionLoading !== null}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                {actionLoading === "approve" ? "Approving..." : "Approve"}
                            </Button>
                        )}
                        {canReject && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const reason = prompt("Rejection reason:");
                                    if (reason) handleStatusAction("reject", { reason });
                                }}
                                disabled={actionLoading !== null}
                            >
                                <XCircle className="h-4 w-4" />
                                Reject
                            </Button>
                        )}
                        {canCancel && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    const reason = prompt("Cancellation reason (optional):");
                                    handleStatusAction("cancel", { reason: reason ?? undefined });
                                }}
                                disabled={actionLoading !== null}
                            >
                                Cancel Advance
                            </Button>
                        )}
                    </div>
                }
            >
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main content */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Status + metadata */}
                        <Card>
                            <CardContent className="flex flex-wrap items-center gap-3 pt-4">
                                <AdvanceStatusBadge status={status} />
                                <AdvanceTypeBadge type={adv.advance_type as AdvanceType} />
                                <AdvancePriorityBadge priority={adv.priority as AdvancePriority} />
                                {Boolean(adv.events) && (
                                    <Badge variant="outline" className="gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {String((adv.events as Record<string, unknown>)?.name ?? "")}
                                    </Badge>
                                )}
                            </CardContent>
                        </Card>

                        {/* Description */}
                        {Boolean(adv.description) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {String(adv.description)}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Items ({itemsList.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {itemsList.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        No items added yet
                                    </p>
                                ) : (
                                    <div className="divide-y">
                                        {itemsList.map((item) => (
                                            <div
                                                key={item.id as string}
                                                className="flex items-center gap-3 py-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate text-sm font-medium">
                                                            {String(
                                                                (item.catalog_items as Record<string, unknown>)?.name ??
                                                                    item.catalog_item_id
                                                            )}
                                                        </span>
                                                        {Boolean(item.is_critical_path) && (
                                                            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>
                                                            Qty: {Number(item.quantity_requested ?? 0)}
                                                        </span>
                                                        <span>×</span>
                                                        <span>
                                                            {formatAdvanceCost(Number(item.unit_cost ?? 0))}
                                                        </span>
                                                        <AdvanceItemStatusBadge
                                                            status={item.status as AdvanceItemStatus}
                                                        />
                                                    </div>
                                                    {Boolean(item.notes) && (
                                                        <p className="mt-1 text-xs italic text-muted-foreground">
                                                            {String(item.notes)}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="shrink-0 text-sm font-semibold">
                                                    {formatAdvanceCost(
                                                        Number(item.unit_cost ?? 0) *
                                                            Number(item.quantity_requested ?? 0)
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-6">
                        {/* Cost summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Cost Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Estimated</span>
                                    <span className="font-medium">
                                        {formatAdvanceCost(Number(adv.total_estimated_cost ?? 0))}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Actual</span>
                                    <span className="font-medium">
                                        {formatAdvanceCost(Number(adv.total_actual_cost ?? 0))}
                                    </span>
                                </div>
                                <div className="border-t pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Items</span>
                                        <span>{Number(adv.total_items ?? 0)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dates */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Dates</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created</span>
                                    <span>
                                        {new Date(String(adv.created_at)).toLocaleDateString()}
                                    </span>
                                </div>
                                {Boolean(adv.service_start_date) && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Service Start</span>
                                        <span>
                                            {new Date(String(adv.service_start_date)).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                {Boolean(adv.service_end_date) && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Service End</span>
                                        <span>
                                            {new Date(String(adv.service_end_date)).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {(Boolean(adv.internal_notes) || Boolean(adv.client_notes)) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Notes</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {Boolean(adv.internal_notes) && (
                                        <div>
                                            <span className="text-xs font-medium text-muted-foreground">
                                                Internal
                                            </span>
                                            <p className="mt-0.5 text-sm">
                                                {String(adv.internal_notes)}
                                            </p>
                                        </div>
                                    )}
                                    {Boolean(adv.client_notes) && (
                                        <div>
                                            <span className="text-xs font-medium text-muted-foreground">
                                                Client
                                            </span>
                                            <p className="mt-0.5 text-sm">
                                                {String(adv.client_notes)}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AdvanceTimeline entityType="advance" entityId={id} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </PageShell>
        </PermissionGate>
    );
}
