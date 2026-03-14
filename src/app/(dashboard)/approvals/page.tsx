"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { logger } from "@/lib/logger";
import { formatDate } from "@/lib/locale";

import React, { useCallback, useState } from "react";
import { CsvExportButton } from "@/components/csv/csv-export-button";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useApprovals, useUpdateApproval } from "@/lib/supabase/hooks";
import { LIFECYCLE_STAGES, type LifecycleStage } from "@/config/domain-config";
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    GitBranch,
    List,
    Loader2,
    Shield,
    Table2,
    XCircle,
} from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Approval } from "@/types";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { DateField } from "@/components/data-view/field-renderers";
import { PermissionGate } from "@/components/permission-guard";
import { TabBar } from "@/components/ui/tab-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/components/layouts/empty-state";

const approvalColumns: ColumnDef<Approval>[] = [
    {
        id: "milestoneName",
        header: "Milestone",
        accessorKey: "milestoneName",
        sortable: true,
        filterable: true,
        sticky: true,
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        sortable: true,
        filterable: true,
        render: (value) => {
            const v = String(value);
            const variant =
                v === "approved"
                    ? "success"
                    : v === "overdue"
                      ? "destructive"
                      : v === "pending"
                        ? "warning"
                        : "ghost";
            return (
                <Badge variant={variant} className="text-[10px]">
                    {v}
                </Badge>
            );
        },
    },
    {
        id: "approverName",
        header: "Approver",
        accessorKey: "approverName",
        sortable: true,
    },
    {
        id: "deadline",
        header: "Deadline",
        accessorKey: "deadline",
        sortable: true,
        render: (value) => <DateField value={String(value)} />,
    },
    {
        id: "timelineImpact",
        header: "Impact",
        accessorFn: (row) => row.timelineImpactDays ?? 0,
        sortable: true,
        render: (value) => {
            const days = Number(value);
            if (!days) return <span className="text-xs text-muted-foreground">—</span>;
            return <span className="text-xs font-medium text-destructive">+{days}d</span>;
        },
    },
    {
        id: "approvedAt",
        header: "Approved",
        accessorKey: "approvedAt",
        render: (value) =>
            value ? (
                <DateField value={String(value)} />
            ) : (
                <span className="text-xs text-muted-foreground">—</span>
            ),
    },
];

type LifecycleStatus = "completed" | "active" | "pending" | "blocked";

interface LifecycleStageItem {
    stage: LifecycleStage;
    label: string;
    description: string;
    status: LifecycleStatus;
    approver?: string;
    completedAt?: string;
}

function buildLifecycleStages(approvals: Approval[]): LifecycleStageItem[] {
    const approvalByMilestone = new Map<string, Approval>();
    for (const a of approvals) {
        if (a.milestoneName) {
            approvalByMilestone.set(a.milestoneName.toLowerCase(), a);
        }
    }
    let foundActive = false;
    return LIFECYCLE_STAGES.map((ls) => {
        const match = approvalByMilestone.get(ls.label.toLowerCase());
        let status: LifecycleStatus;
        let approver: string | undefined;
        let completedAt: string | undefined;
        if (match) {
            if (match.status === "approved") {
                status = "completed";
                approver = match.approverName || undefined;
                completedAt = match.approvedAt;
            } else if (match.status === "revision_requested") {
                status = "blocked";
                approver = match.approverName || undefined;
            } else {
                status = "active";
                foundActive = true;
                approver = match.approverName || undefined;
            }
        } else if (foundActive) {
            status = "pending";
        } else {
            status = "pending";
        }
        return {
            stage: ls.value,
            label: ls.label,
            description: ls.description ?? "",
            status,
            approver,
            completedAt,
        };
    });
}

export default function ApprovalsPage() {
    const [activeTab, setActiveTab] = useQueryTabState<"approvals" | "lifecycle">({
        key: "tab",
        defaultValue: "approvals",
        validValues: ["approvals", "lifecycle"] as const,
    });
    const APPROVAL_VIEW_MODES = ["list", "table"] as const;
    const [approvalView, setApprovalView] = useQueryTabState({
        key: "view",
        defaultValue: "list",
        validValues: APPROVAL_VIEW_MODES,
    });
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const { data: sbApprovals, isLoading } = useApprovals();
    const updateApproval = useUpdateApproval();

    const handleBulkApprove = useCallback(async () => {
        setBulkProcessing(true);
        try {
            await Promise.all(
                [...selectedIds].map((id) =>
                    updateApproval.mutateAsync({
                        id,
                        status: "approved",
                        approved_at: new Date().toISOString(),
                    } as unknown as Parameters<typeof updateApproval.mutateAsync>[0])
                )
            );
            setSelectedIds(new Set());
        } catch (error) {
            logger.error("Bulk approve failed", { error });
        } finally {
            setBulkProcessing(false);
        }
    }, [selectedIds, updateApproval]);

    const handleBulkReject = useCallback(async () => {
        setBulkProcessing(true);
        try {
            await Promise.all(
                [...selectedIds].map((id) =>
                    updateApproval.mutateAsync({
                        id,
                        status: "rejected",
                    } as unknown as Parameters<typeof updateApproval.mutateAsync>[0])
                )
            );
            setSelectedIds(new Set());
        } catch (error) {
            logger.error("Bulk reject failed", { error });
        } finally {
            setBulkProcessing(false);
        }
    }, [selectedIds, updateApproval]);

    const handleApprove = async (approvalId: string) => {
        try {
            await updateApproval.mutateAsync({
                id: approvalId,
                status: "approved",
                approved_at: new Date().toISOString(),
            } as unknown as Parameters<typeof updateApproval.mutateAsync>[0]);
        } catch (error) {
            logger.error("Failed to approve", { error });
        }
    };

    const handleReject = async (approvalId: string) => {
        try {
            await updateApproval.mutateAsync({
                id: approvalId,
                status: "rejected",
            } as unknown as Parameters<typeof updateApproval.mutateAsync>[0]);
        } catch (error) {
            logger.error("Failed to reject", { error });
        }
    };

    const approvals: Approval[] = (sbApprovals ?? []).map((a) => ({
        id: a.id,
        projectId: a.project_id,
        milestoneId: a.milestone_id,
        milestoneName: a.milestone_name,
        status: a.status as Approval["status"],
        requestedAt: a.requested_at,
        deadline: a.deadline,
        approvedAt: a.approved_at ?? undefined,
        approverName: (a as unknown as { profiles?: { name: string } }).profiles?.name || "",
        deliverableUrl: a.deliverable_url ?? undefined,
        timelineImpactDays: a.timeline_impact_days ?? undefined,
    }));

    if (isLoading) {
        return <LoadingState />;
    }

    const pending = approvals.filter((a) => a.status === "pending");
    const overdue = approvals.filter((a) => a.status === "overdue");
    const approved = approvals.filter((a) => a.status === "approved");
    const lifecycleStages = buildLifecycleStages(approvals);
    const lifecycleCompleted = lifecycleStages.filter((s) => s.status === "completed").length;
    const lifecycleTotal = lifecycleStages.length;

    return (
        <PermissionGate resource="approvals" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Approval Shield"
                    description="Lifecycle approval matrix with 72-hour auto-escalation workflow engine"
                >
                    <TabBar
                        items={[
                            {
                                id: "approvals",
                                label: "Approvals",
                                icon: <Shield className="h-4 w-4" />,
                            },
                            {
                                id: "lifecycle",
                                label: "Lifecycle Matrix",
                                icon: <GitBranch className="h-4 w-4" />,
                            },
                        ]}
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as "approvals" | "lifecycle")}
                        ariaLabel="Approvals page sections"
                    />
                    <CsvExportButton entity="approvals" />
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Pending" value={pending.length} icon={Clock} />
                    <StatCard title="Overdue" value={overdue.length} icon={AlertTriangle} />
                    <StatCard title="Approved" value={approved.length} icon={CheckCircle2} />
                    <StatCard
                        title="Lifecycle Progress"
                        value={`${lifecycleCompleted}/${lifecycleTotal}`}
                        description={`${Math.round((lifecycleCompleted / lifecycleTotal) * 100)}% complete`}
                        icon={GitBranch}
                    />
                </div>

                {/* Lifecycle Matrix Tab */}
                {activeTab === "lifecycle" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <GitBranch className="h-4 w-4" />
                                Production Lifecycle Approval Matrix
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {lifecycleStages.map((stage: LifecycleStageItem, i: number) => {
                                    const statusColors: Record<LifecycleStatus, string> = {
                                        completed: "bg-success text-success-foreground",
                                        active: "bg-primary text-primary-foreground animate-pulse",
                                        pending: "bg-muted text-muted-foreground",
                                        blocked: "bg-destructive text-destructive-foreground",
                                    };
                                    const lineColors: Record<LifecycleStatus, string> = {
                                        completed: "bg-success",
                                        active: "bg-primary",
                                        pending: "bg-muted",
                                        blocked: "bg-destructive",
                                    };

                                    return (
                                        <div key={stage.stage} className="flex items-start gap-3">
                                            {/* Timeline dot and connector */}
                                            <div className="flex flex-col items-center shrink-0 w-6">
                                                <div
                                                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${statusColors[stage.status]}`}
                                                >
                                                    {stage.status === "completed" ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    ) : (
                                                        i + 1
                                                    )}
                                                </div>
                                                {i < lifecycleStages.length - 1 && (
                                                    <div
                                                        className={`w-0.5 h-8 ${lineColors[stage.status]}`}
                                                    />
                                                )}
                                            </div>
                                            {/* Stage details */}
                                            <div
                                                className={`flex-1 p-2.5 rounded-lg transition-colors ${stage.status === "active" ? "bg-primary/5 border border-primary/20" : "hover:bg-secondary/30"}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold">
                                                            {stage.label}
                                                        </span>
                                                        <Badge
                                                            variant={
                                                                stage.status === "completed"
                                                                    ? "success"
                                                                    : stage.status === "active"
                                                                      ? "default"
                                                                      : "ghost"
                                                            }
                                                            className="text-[10px]"
                                                        >
                                                            {stage.status}
                                                        </Badge>
                                                    </div>
                                                    {stage.approver && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {stage.approver}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {stage.description}
                                                </p>
                                                {stage.completedAt && (
                                                    <p className="text-[10px] text-success mt-1">
                                                        Completed{" "}
                                                        {formatDate(stage.completedAt, "compact")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Approvals Tab */}
                {activeTab === "approvals" && (
                    <>
                        {/* View Toggle */}
                        <div className="flex items-center justify-between">
                            {/* Summary */}
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 text-warning text-xs font-medium">
                                    <Clock className="h-3.5 w-3.5" />
                                    {pending.length} Pending
                                </div>
                                {overdue.length > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        {overdue.length} Overdue — Timeline Impact Active
                                    </div>
                                )}
                            </div>
                            <SegmentedControl<"list" | "table">
                                ariaLabel="Approval view mode"
                                value={approvalView}
                                onValueChange={setApprovalView}
                                options={[
                                    {
                                        value: "list",
                                        label: "List",
                                        icon: <List className="h-4 w-4" />,
                                        labelHidden: true,
                                    },
                                    {
                                        value: "table",
                                        label: "Table",
                                        icon: <Table2 className="h-4 w-4" />,
                                        labelHidden: true,
                                    },
                                ]}
                            />
                        </div>

                        {/* Bulk Action Bar */}
                        {selectedIds.size > 0 && (
                            <div className="sticky top-0 z-20 flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 animate-fade-in">
                                <span className="text-sm font-medium">
                                    {selectedIds.size} approval{selectedIds.size > 1 ? "s" : ""}{" "}
                                    selected
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setSelectedIds(new Set())}
                                        disabled={bulkProcessing}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={handleBulkReject}
                                        disabled={bulkProcessing}
                                    >
                                        {bulkProcessing ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <XCircle className="h-3.5 w-3.5" />
                                        )}
                                        Reject All
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleBulkApprove}
                                        disabled={bulkProcessing}
                                    >
                                        {bulkProcessing ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        )}
                                        Approve All
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Table View */}
                        {approvalView === "table" && (
                            <DataTable<Approval>
                                data={approvals}
                                columns={approvalColumns}
                                keyField="id"
                                searchable
                                searchPlaceholder="Search approvals..."
                                pageSize={15}
                                hoverable
                                selectable
                                selectedKeys={selectedIds}
                                onSelectionChange={setSelectedIds}
                            />
                        )}

                        {approvalView === "list" &&
                            (approvals.length === 0 ? (
                                <EmptyState
                                    icon={Shield}
                                    title="No approvals found"
                                    description="No approvals match your current filters"
                                />
                            ) : (
                                <div className="space-y-4">
                                    {approvals.map((approval, i) => {
                                        const deadlineDate = new Date(approval.deadline);
                                        const now = new Date();
                                        const hoursRemaining = Math.round(
                                            (deadlineDate.getTime() - now.getTime()) /
                                                (1000 * 60 * 60)
                                        );
                                        const isOverdue = hoursRemaining < 0;

                                        return (
                                            <StaggerItem
                                                key={approval.id}
                                                index={i}
                                                stagger="relaxed"
                                            >
                                                <Card
                                                    className={`${
                                                        approval.status === "overdue"
                                                            ? "border-destructive/30 bg-destructive/3"
                                                            : approval.status === "pending"
                                                              ? "border-warning/20"
                                                              : ""
                                                    }`}
                                                >
                                                    <CardContent>
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-3">
                                                                <div
                                                                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                                        approval.status ===
                                                                        "approved"
                                                                            ? "bg-success/10"
                                                                            : approval.status ===
                                                                                "overdue"
                                                                              ? "bg-destructive/10"
                                                                              : approval.status ===
                                                                                  "pending"
                                                                                ? "bg-warning/10"
                                                                                : "bg-muted"
                                                                    }`}
                                                                >
                                                                    {approval.status ===
                                                                    "approved" ? (
                                                                        <CheckCircle2 className="h-5 w-5 text-success" />
                                                                    ) : approval.status ===
                                                                      "overdue" ? (
                                                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                                                    ) : approval.status ===
                                                                      "pending" ? (
                                                                        <Clock className="h-5 w-5 text-warning" />
                                                                    ) : (
                                                                        <XCircle className="h-5 w-5 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-sm font-bold">
                                                                        {approval.milestoneName}
                                                                    </h3>
                                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                                        Approver:{" "}
                                                                        {approval.approverName}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Badge
                                                                variant={
                                                                    approval.status === "approved"
                                                                        ? "success"
                                                                        : approval.status ===
                                                                            "overdue"
                                                                          ? "destructive"
                                                                          : approval.status ===
                                                                              "pending"
                                                                            ? "warning"
                                                                            : "ghost"
                                                                }
                                                            >
                                                                {approval.status}
                                                            </Badge>
                                                        </div>

                                                        {/* Timeline Impact Notification */}
                                                        {approval.status === "overdue" &&
                                                            approval.timelineImpactDays && (
                                                                <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <AlertTriangle className="h-4 w-4 text-destructive" />
                                                                        <span className="text-xs font-bold text-destructive">
                                                                            Timeline Impact
                                                                            Notification
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        This approval is{" "}
                                                                        <strong className="text-destructive">
                                                                            {Math.abs(
                                                                                hoursRemaining
                                                                            )}
                                                                            h overdue
                                                                        </strong>
                                                                        . The final delivery date
                                                                        will shift by{" "}
                                                                        <strong className="text-destructive">
                                                                            +
                                                                            {
                                                                                approval.timelineImpactDays
                                                                            }{" "}
                                                                            days
                                                                        </strong>{" "}
                                                                        unless approved immediately.
                                                                    </p>
                                                                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                                                                        <Calendar className="h-3 w-3" />
                                                                        <span>
                                                                            Deadline was:{" "}
                                                                            {formatDate(
                                                                                deadlineDate,
                                                                                "medium"
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                        {/* Pending countdown */}
                                                        {approval.status === "pending" &&
                                                            !isOverdue && (
                                                                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    <span>
                                                                        {hoursRemaining}h remaining
                                                                    </span>
                                                                    <ProgressBar
                                                                        value={Math.max(
                                                                            0,
                                                                            Math.min(
                                                                                100,
                                                                                ((72 -
                                                                                    hoursRemaining) /
                                                                                    72) *
                                                                                    100
                                                                            )
                                                                        )}
                                                                        size="xs"
                                                                        className="flex-1"
                                                                    />
                                                                </div>
                                                            )}

                                                        {/* Approve / Reject Actions */}
                                                        {(approval.status === "pending" ||
                                                            approval.status === "overdue") && (
                                                            <div className="mt-4 flex items-center gap-2 justify-end">
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        handleReject(approval.id)
                                                                    }
                                                                    disabled={
                                                                        updateApproval.isPending
                                                                    }
                                                                >
                                                                    <XCircle className="h-3.5 w-3.5" />
                                                                    Reject
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleApprove(approval.id)
                                                                    }
                                                                    disabled={
                                                                        updateApproval.isPending
                                                                    }
                                                                >
                                                                    {updateApproval.isPending ? (
                                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                                    )}
                                                                    Approve
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {/* Approved date */}
                                                        {approval.status === "approved" &&
                                                            approval.approvedAt && (
                                                                <div className="mt-3 flex items-center gap-2 text-xs text-success">
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                    Approved on{" "}
                                                                    {formatDate(
                                                                        approval.approvedAt,
                                                                        "compact"
                                                                    )}
                                                                </div>
                                                            )}
                                                    </CardContent>
                                                </Card>
                                            </StaggerItem>
                                        );
                                    })}
                                </div>
                            ))}
                    </>
                )}
            </div>
        </PermissionGate>
    );
}
