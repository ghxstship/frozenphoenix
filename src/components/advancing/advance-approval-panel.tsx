"use client";

import * as React from "react";
import { CheckCircle2, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvanceStatusBadge } from "@/components/advancing/advance-status-badge";
import { AdvanceTimeline } from "@/components/advancing/advance-timeline";
import { formatAdvanceCost } from "@/config/advancing-config";
import type { AdvanceStatus } from "@/types";

interface AdvanceApprovalPanelProps {
    advanceId: string;
    status: AdvanceStatus;
    title: string;
    totalEstimatedCost: number;
    totalItems: number;
    submittedBy?: string;
    submittedAt?: string;
    onAction?: () => void;
}

export function AdvanceApprovalPanel({
    advanceId,
    status,
    title,
    totalEstimatedCost,
    totalItems,
    submittedBy,
    submittedAt,
    onAction,
}: AdvanceApprovalPanelProps) {
    const [loading, setLoading] = React.useState<string | null>(null);
    const [rejectReason, setRejectReason] = React.useState("");
    const [showRejectForm, setShowRejectForm] = React.useState(false);

    const canApprove = status === "submitted" || status === "in_review";
    const canReject = canApprove; // eslint-disable-line @typescript-eslint/no-unused-vars -- reserved for future per-field reject

    async function handleAction(action: string, body?: Record<string, unknown>) {
        setLoading(action);
        try {
            const res = await fetch(`/api/advancing/${advanceId}/${action}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: body ? JSON.stringify(body) : undefined,
            });
            if (!res.ok) {
                const err = await res.json();
                alert(String(err.error?.message ?? "Action failed"));
                return;
            }
            setShowRejectForm(false);
            setRejectReason("");
            onAction?.();
        } finally {
            setLoading(null);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Approval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">{title}</p>
                        <p className="text-xs text-muted-foreground">
                            {totalItems} items &middot; {formatAdvanceCost(totalEstimatedCost)}
                        </p>
                    </div>
                    <AdvanceStatusBadge status={status} />
                </div>

                {/* Submitter info */}
                {Boolean(submittedBy) && (
                    <div className="rounded-md border px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Submitted by </span>
                        <span className="font-medium">{submittedBy}</span>
                        {Boolean(submittedAt) && (
                            <span className="text-muted-foreground">
                                {" "}on {new Date(submittedAt!).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                )}

                {/* Actions */}
                {canApprove && (
                    <div className="flex flex-col gap-2">
                        <Button
                            className="w-full"
                            onClick={() => handleAction("approve")}
                            disabled={loading !== null}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {loading === "approve" ? "Approving..." : "Approve Advance"}
                        </Button>

                        {!showRejectForm ? (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setShowRejectForm(true)}
                                disabled={loading !== null}
                            >
                                <XCircle className="h-4 w-4" />
                                Reject
                            </Button>
                        ) : (
                            <div className="space-y-2 rounded-md border p-3">
                                <label
                                    htmlFor="reject-reason"
                                    className="text-sm font-medium"
                                >
                                    Rejection Reason
                                </label>
                                <textarea
                                    id="reject-reason"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Explain why this advance is being rejected..."
                                    className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    rows={3}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() =>
                                            handleAction("reject", { reason: rejectReason })
                                        }
                                        disabled={!rejectReason.trim() || loading !== null}
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        {loading === "reject" ? "Rejecting..." : "Confirm Reject"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setShowRejectForm(false);
                                            setRejectReason("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Status history */}
                <AdvanceTimeline entityType="advance" entityId={advanceId} />
            </CardContent>
        </Card>
    );
}
