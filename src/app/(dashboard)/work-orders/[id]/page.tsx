"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteWorkOrder, useUpdateWorkOrder } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { getPriorityVariant, getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Building2,
    Calendar,
    ClipboardList,
    Clock,
    DollarSign,
    MapPin,
    Play,
    User,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useWorkOrder } from "@/lib/supabase/hooks-pages";

type TabId = "details" | "bids" | "chatter";
const TAB_VALUES = ["details", "bids", "chatter"] as const;

interface BidItem {
    id: string;
    vendorName: string;
    amount: number;
    submittedAt: string;
    status: string;
}

function parseBids(raw: unknown): BidItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((b, i) => ({
        id: String(b.id ?? `b-${i}`),
        vendorName: (b.vendor_name as string) ?? (b.vendorName as string) ?? "",
        amount: (b.amount as number) ?? 0,
        submittedAt: (b.submitted_at as string) ?? (b.submittedAt as string) ?? "",
        status: (b.status as string) ?? "pending",
    }));
}

export default function WorkOrderDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: woRecord, isLoading } = useWorkOrder(entityId);
    const wo = woRecord as Record<string, unknown> | null;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Work Order",
        listPath: "/work-orders",
        useUpdateHook: useUpdateWorkOrder,
        useDeleteHook: useDeleteWorkOrder,
    });

    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);
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

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    const woTitle = (wo?.title as string) ?? "";
    const woNumber = (wo?.number as string) ?? "";
    const woStatus = (wo?.status as string) ?? "draft";
    const woPriority = (wo?.priority as string) ?? "medium";
    const woEstimatedCost = (wo?.estimated_cost as number) ?? (wo?.estimatedCost as number) ?? 0;
    const woScheduledStart = (wo?.scheduled_start as string) ?? (wo?.scheduledStart as string) ?? "";
    const woScheduledEnd = (wo?.scheduled_end as string) ?? (wo?.scheduledEnd as string) ?? "";
    const woVendorName = (wo?.vendor_name as string) ?? (wo?.vendorName as string) ?? "";
    const woLocationName = (wo?.location_name as string) ?? (wo?.locationName as string) ?? "";
    const woDescription = (wo?.description as string) ?? "";
    const woCompletionNotes = (wo?.completion_notes as string) ?? (wo?.completionNotes as string) ?? "";
    const woIsOpenForBids = (wo?.is_open_for_bids as boolean) ?? (wo?.isOpenForBids as boolean) ?? false;
    const bids = parseBids(wo?.bids);

    if (!wo) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Record not found</p>
            </div>
        );
    }

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "bids" as const, label: "Bids", count: bids.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Work Order Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {woNumber && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Number</span>
                            <span className="font-mono font-medium">{woNumber}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(woStatus)}>
                            {getStatusLabel(woStatus)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority</span>
                        <Badge variant={getPriorityVariant(woPriority)}>{woPriority}</Badge>
                    </div>
                    {woEstimatedCost > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Cost</span>
                            <span className="font-bold">{formatCurrency(woEstimatedCost)}</span>
                        </div>
                    )}
                    {woScheduledStart && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Start</span>
                            <span className="font-medium">{formatDate(woScheduledStart)}</span>
                        </div>
                    )}
                    {woScheduledEnd && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">End</span>
                            <span className="font-medium">{formatDate(woScheduledEnd)}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {woVendorName && (
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{woVendorName}</span>
                        </div>
                    )}
                    {woLocationName && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs">{woLocationName}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/work-orders"
            backLabel="Work Orders"
            entityType="work-orders"
            entityId={entityId}
            title={woTitle}
            subtitle={`${woNumber}${woVendorName ? ` · ${woVendorName}` : " · Unassigned"}`}
            status={woStatus}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <ClipboardList className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm" onClick={() => handleUpdate({ status: "in_progress" })}>
                    <Play className="h-4 w-4 mr-1" />
                    Start Work
                </Button>
            }
            menuItems={[
                { label: "Edit Work Order", onClick: () => router.push(`/work-orders/${entityId}/edit`) },
                { label: "Reassign Vendor", onClick: () => router.push(`/work-orders/${entityId}/edit?section=vendor`) },
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
                                    <DollarSign className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Estimated Cost
                                        </p>
                                        <p className="text-lg font-bold">
                                            {woEstimatedCost
                                                ? formatCurrency(woEstimatedCost)
                                                : "TBD"}
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
                                        <p className="text-xs text-muted-foreground">Timeline</p>
                                        <p className="text-sm font-semibold">
                                            {woScheduledStart
                                                ? formatDate(woScheduledStart)
                                                : "TBD"}
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
                                            Open for Bids
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {woIsOpenForBids ? "Yes" : "No"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {woDescription && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {woDescription}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {woCompletionNotes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Completion Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {woCompletionNotes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "bids" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Vendor Bids ({bids.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {bids.map((bid) => (
                                <div
                                    key={bid.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {bid.vendorName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Submitted {formatDate(bid.submittedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold">
                                            {formatCurrency(bid.amount)}
                                        </span>
                                        <Badge variant={getStatusVariant(bid.status)}>
                                            {getStatusLabel(bid.status)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="work_order"
                    recordId={entityId}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
