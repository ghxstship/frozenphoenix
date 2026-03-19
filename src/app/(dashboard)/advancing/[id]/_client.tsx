"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    DollarSign,
    History,
    Layout,
    Loader2,
    Package,
    Send,
    XCircle,
} from "lucide-react";
import { DetailPageShell } from "@/components/shells";
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
import {
    useAdvance,
    useAdvanceItems,
    useAdvanceStatusHistory,
    useAdvanceTemplates,
} from "@/lib/supabase/hooks-advancing";
import { useAdvancesRealtime } from "@/lib/supabase/realtime-advancing";
import { formatAdvanceCost } from "@/config/advancing-config";
import type { DetailPageConfig } from "@/types/detail-page-config";
import type { AdvanceItemStatus, AdvancePriority, AdvanceStatus, AdvanceType } from "@/types";

function AdvanceStatusHistoryTab({ advanceId }: { advanceId: string }) {
    const { data: history, isLoading } = useAdvanceStatusHistory("advance", advanceId);
    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }
    if (!history || history.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No status history recorded.
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Status History ({history.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {history.map((h: Record<string, unknown>) => (
                        <div
                            key={String(h.id)}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                        >
                            <div>
                                <p className="text-sm font-medium">
                                    {String(h.from_status ?? "")} → {String(h.to_status ?? "")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {h.created_at
                                        ? new Date(String(h.created_at)).toLocaleString()
                                        : ""}
                                </p>
                            </div>
                            {Boolean(h.reason) && (
                                <Badge variant="outline" className="text-[10px]">
                                    {String(h.reason)}
                                </Badge>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function AdvanceTemplatesTab() {
    const { data: templates, isLoading } = useAdvanceTemplates();
    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }
    if (!templates || templates.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No advance templates available.
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Layout className="h-4 w-4 text-primary" />
                    Advance Templates ({templates.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {templates.map((t: Record<string, unknown>) => (
                        <div
                            key={String(t.id)}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {String(t.name ?? t.id)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {String(t.advance_type ?? "")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "advancing",
    titleKey: "title",
    subtitleFn: (r) =>
        `${String(r.advance_number ?? "")} · ${String(r.advance_type ?? "").replace("_", " ")}`,
    statusKey: "status",
    icon: Package,
    backHref: "/advancing",
    backLabel: "Advances",
    fields: [],
    stats: [
        {
            label: "Estimated",
            icon: DollarSign,
            compute: (r) => formatAdvanceCost(Number(r.total_estimated_cost ?? 0)),
        },
        {
            label: "Actual",
            icon: DollarSign,
            compute: (r) => formatAdvanceCost(Number(r.total_actual_cost ?? 0)),
        },
        { label: "Items", icon: Package, accessorKey: "total_items" },
    ],
    chatter: false,
};

export function AdvancingOrderDetailPageClient() {
    const params = useParams();
    const id = params.id as string;

    useAdvancesRealtime();

    const { data: advance, isLoading } = useAdvance(id);
    const { data: items } = useAdvanceItems(id);

    const adv = advance as Record<string, unknown> | undefined;
    const itemsList = (items as Record<string, unknown>[] | undefined) ?? [];

    const [actionLoading, setActionLoading] = React.useState<string | null>(null);
    const [actionError, setActionError] = React.useState<string | null>(null);
    const [rejectReason, setRejectReason] = React.useState("");
    const [showRejectInput, setShowRejectInput] = React.useState(false);
    const [cancelReason, setCancelReason] = React.useState("");
    const [showCancelInput, setShowCancelInput] = React.useState(false);

    async function handleStatusAction(action: string, body?: Record<string, unknown>) {
        setActionLoading(action);
        setActionError(null);
        try {
            const res = await fetch(`/api/advancing/${id}/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: body ? JSON.stringify(body) : undefined,
            });
            if (!res.ok) {
                const err = await res.json();
                setActionError(err.error?.message ?? "Action failed");
            }
        } finally {
            setActionLoading(null);
        }
    }

    const status = (adv?.status as AdvanceStatus) ?? "draft";
    const canSubmit = status === "draft";
    const canApprove = status === "submitted" || status === "in_review";
    const canReject = canApprove;
    const canCancel = ["draft", "submitted", "in_review", "approved", "in_progress"].includes(
        status
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        tabs: [
            {
                id: "activity",
                label: "Activity",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AdvanceTimeline entityType="advance" entityId={id} />
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "status-history",
                label: "Status History",
                content: <AdvanceStatusHistoryTab advanceId={id} />,
            },
            {
                id: "templates",
                label: "Templates",
                content: <AdvanceTemplatesTab />,
            },
        ],
        overviewSlot: (
            <div className="space-y-6">
                {/* Reject reason input */}
                {showRejectInput && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
                        <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Rejection reason (required)"
                            className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm"
                            autoFocus
                        />
                        <Button
                            size="sm"
                            variant="destructive"
                            disabled={!rejectReason.trim() || actionLoading !== null}
                            onClick={() => {
                                handleStatusAction("reject", { reason: rejectReason.trim() });
                                setShowRejectInput(false);
                                setRejectReason("");
                            }}
                        >
                            Confirm Reject
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setShowRejectInput(false);
                                setRejectReason("");
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                )}

                {/* Cancel reason input */}
                {showCancelInput && (
                    <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/5 px-4 py-3">
                        <input
                            type="text"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Cancellation reason (optional)"
                            className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm"
                            autoFocus
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading !== null}
                            onClick={() => {
                                handleStatusAction("cancel", {
                                    reason: cancelReason.trim() || undefined,
                                });
                                setShowCancelInput(false);
                                setCancelReason("");
                            }}
                        >
                            Confirm Cancel
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setShowCancelInput(false);
                                setCancelReason("");
                            }}
                        >
                            Dismiss
                        </Button>
                    </div>
                )}

                {/* Inline error banner */}
                {actionError && (
                    <div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        <span>{actionError}</span>
                        <button
                            onClick={() => setActionError(null)}
                            className="text-xs text-muted-foreground hover:text-foreground ml-4"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Status + metadata */}
                {adv && (
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
                )}

                {/* Description */}
                {adv && Boolean(adv.description) && (
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
                        <CardTitle className="text-base">Items ({itemsList.length})</CardTitle>
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
                                                        (
                                                            item.catalog_items as Record<
                                                                string,
                                                                unknown
                                                            >
                                                        )?.name ?? item.catalog_item_id
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
        ),
        sidebarSlot: adv ? (
            <div className="flex flex-col gap-6">
                {/* Dates */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Dates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Created</span>
                            <span>{new Date(String(adv.created_at)).toLocaleDateString()}</span>
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
                                    <p className="mt-0.5 text-sm">{String(adv.internal_notes)}</p>
                                </div>
                            )}
                            {Boolean(adv.client_notes) && (
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Client
                                    </span>
                                    <p className="mt-0.5 text-sm">{String(adv.client_notes)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        ) : undefined,
    };

    return (
        <DetailPageShell
            config={config}
            id={id}
            record={adv ?? null}
            isLoading={isLoading}
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
                    {canReject && !showRejectInput && (
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectInput(true)}
                            disabled={actionLoading !== null}
                        >
                            <XCircle className="h-4 w-4" />
                            Reject
                        </Button>
                    )}
                    {canCancel && !showCancelInput && (
                        <Button
                            variant="ghost"
                            onClick={() => setShowCancelInput(true)}
                            disabled={actionLoading !== null}
                        >
                            Cancel Advance
                        </Button>
                    )}
                </div>
            }
        />
    );
}
