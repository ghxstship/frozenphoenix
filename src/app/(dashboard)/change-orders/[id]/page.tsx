"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteChangeOrder, useUpdateChangeOrder } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import { Calendar, CheckCircle2, Clock, DollarSign, FileEdit, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useChangeOrder } from "@/lib/supabase/hooks-pages";

type TabId = "details" | "scope" | "chatter";
const TAB_VALUES = ["details", "scope", "chatter"] as const;

export default function ChangeOrderDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: changeOrder, isLoading } = useChangeOrder(entityId);
    const co = changeOrder;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Change Order",
        listPath: "/change-orders",
        useUpdateHook: useUpdateChangeOrder,
        useDeleteHook: useDeleteChangeOrder,
    });

    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);

    if (isLoading) {
        return <LoadingState />;
    }

    if (!co) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Record not found</p>
            </div>
        );
    }
    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "Sarah Chen",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "scope" as const, label: "Scope Changes" },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Change Order Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(co.status) as "default"}>
                            {getStatusLabel(co.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Number</span>
                        <span className="font-mono text-xs">{co.number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline" className="capitalize">
                            {co.changeType.replace(/_/g, " ")}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Value Impact</span>
                        <span
                            className={`font-bold ${co.valueImpact >= 0 ? "text-success" : "text-destructive"}`}
                        >
                            {co.valueImpact >= 0 ? "+" : ""}
                            {formatCurrency(co.valueImpact)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Schedule Impact</span>
                        <span
                            className={`font-medium ${co.scheduleImpactDays > 0 ? "text-warning" : "text-success"}`}
                        >
                            {co.scheduleImpactDays > 0
                                ? `+${co.scheduleImpactDays} days`
                                : "No delay"}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {co.projectName && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Project</span>
                            <span className="font-medium text-xs text-right max-w-[140px]">
                                {co.projectName}
                            </span>
                        </div>
                    )}
                    {co.companyName && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Company</span>
                            <span className="font-medium text-xs">{co.companyName}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                        {co.tags.length > 0 ? (
                            co.tags.map((t: string) => (
                                <Chip key={t} size="sm">
                                    {t}
                                </Chip>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground">No tags</span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/change-orders"
            backLabel="Change Orders"
            entityType="change-orders"
            entityId={entityId}
            title={co.title}
            subtitle={`${co.number} · ${co.projectName ?? co.projectId}`}
            status={co.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileEdit className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdate({ status: "in_review" })}
                    >
                        <User className="h-4 w-4 mr-1" />
                        Request Review
                    </Button>
                    <Button size="sm" onClick={() => handleUpdate({ status: "approved" })}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                    </Button>
                </div>
            }
            menuItems={[
                {
                    label: "Edit Change Order",
                    onClick: () => router.push(`/change-orders/${entityId}/edit`),
                },
                {
                    label: "Duplicate",
                    onClick: () => router.push(`/change-orders/new?duplicateFrom=${entityId}`),
                },
                ...crudMenuItems,
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "details" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-success" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Value Impact
                                        </p>
                                        <p className="text-lg font-bold">
                                            {co.valueImpact >= 0 ? "+" : ""}
                                            {formatCurrency(co.valueImpact)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Schedule Impact
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {co.scheduleImpactDays > 0
                                                ? `+${co.scheduleImpactDays} days`
                                                : "No delay"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-info" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Requested</p>
                                        <p className="text-sm font-semibold">
                                            {formatDate(co.requestedAt, "compact")}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {co.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {co.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {co.reason && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Reason</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {co.reason}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {co.businessCase && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Business Case</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {co.businessCase}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Approval Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Requested By</span>
                                <span className="font-medium">
                                    {co.requestedByName ?? co.requestedBy ?? "—"}
                                </span>
                            </div>
                            {co.reviewedAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Reviewed</span>
                                    <span className="font-medium">
                                        {formatDate(co.reviewedAt, "compact")}
                                    </span>
                                </div>
                            )}
                            {co.approvedAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Approved</span>
                                    <span className="font-medium">
                                        {formatDate(co.approvedAt, "compact")}
                                    </span>
                                </div>
                            )}
                            {co.clientApprovedAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Client Approved</span>
                                    <span className="font-medium">
                                        {formatDate(co.clientApprovedAt, "compact")}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {co.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {co.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "scope" && (
                <div className="space-y-4">
                    {co.scopeAdditions && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-success">
                                    Scope Additions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {co.scopeAdditions}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    {co.scopeRemovals && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-destructive">
                                    Scope Removals
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {co.scopeRemovals}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    {co.deliverablesAdded.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Deliverables Added ({co.deliverablesAdded.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {co.deliverablesAdded.map(
                                        (d: Record<string, unknown>, i: number) => (
                                            <div
                                                key={i}
                                                className="p-3 rounded-lg bg-success/5 border border-success/20"
                                            >
                                                <p className="text-sm font-mono">
                                                    {JSON.stringify(d)}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {co.deliverablesRemoved.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Deliverables Removed ({co.deliverablesRemoved.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {co.deliverablesRemoved.map(
                                        (d: Record<string, unknown>, i: number) => (
                                            <div
                                                key={i}
                                                className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                                            >
                                                <p className="text-sm font-mono">
                                                    {JSON.stringify(d)}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {!co.scopeAdditions &&
                        !co.scopeRemovals &&
                        co.deliverablesAdded.length === 0 &&
                        co.deliverablesRemoved.length === 0 && (
                            <Card>
                                <CardContent className="py-8">
                                    <p className="text-sm text-muted-foreground text-center">
                                        No scope changes documented yet.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                </div>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="change_order"
                    recordId={co.id}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
