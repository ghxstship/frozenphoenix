"use client";

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
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { getPriorityVariant, getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    Building2,
    Calendar,
    ClipboardList,
    Clock,
    DollarSign,
    Loader2,
    MapPin,
    Play,
    User,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useWorkOrder } from "@/lib/supabase/hooks-pages";

type TabId = "details" | "bids" | "chatter";
const TAB_VALUES = ["details", "bids", "chatter"] as const;

const mockBids = [
    {
        id: "b1",
        vendorName: "StageCraft Studios",
        amount: 42000,
        submittedAt: "2026-02-15",
        status: "accepted",
    },
    {
        id: "b2",
        vendorName: "Premier AV Solutions",
        amount: 48500,
        submittedAt: "2026-02-14",
        status: "rejected",
    },
    {
        id: "b3",
        vendorName: "EventTech Pro",
        amount: 44200,
        submittedAt: "2026-02-16",
        status: "pending",
    },
];

export default function WorkOrderDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: wo, isLoading } = useWorkOrder(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Work Order",
        listPath: "/work-orders",
        useUpdateHook: useUpdateWorkOrder,
        useDeleteHook: useDeleteWorkOrder,
    });
    void router;
    void handleUpdate;

    const [chatterComments, setChatterComments] = useState<CommentItem[]>(makeMockComments());
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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!wo) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Record not found</p>
            </div>
        );
    }

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "bids" as const, label: "Bids", count: mockBids.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Work Order Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Number</span>
                        <span className="font-mono font-medium">{wo.number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(wo.status)}>
                            {getStatusLabel(wo.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority</span>
                        <Badge variant={getPriorityVariant(wo.priority)}>{wo.priority}</Badge>
                    </div>
                    {wo.estimatedCost && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Cost</span>
                            <span className="font-bold">{formatCurrency(wo.estimatedCost)}</span>
                        </div>
                    )}
                    {wo.scheduledStart && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Start</span>
                            <span className="font-medium">{formatDate(wo.scheduledStart)}</span>
                        </div>
                    )}
                    {wo.scheduledEnd && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">End</span>
                            <span className="font-medium">{formatDate(wo.scheduledEnd)}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {wo.vendorName && (
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{wo.vendorName}</span>
                        </div>
                    )}
                    {wo.locationName && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs">{wo.locationName}</span>
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
            title={wo.title}
            subtitle={`${wo.number} · ${wo.vendorName ?? "Unassigned"}`}
            status={wo.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <ClipboardList className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Start Work
                </Button>
            }
            menuItems={[
                { label: "Edit Work Order", onClick: () => {} },
                { label: "Reassign Vendor", onClick: () => {} },
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
                                            {wo.estimatedCost
                                                ? formatCurrency(wo.estimatedCost)
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
                                            {wo.scheduledStart
                                                ? formatDate(wo.scheduledStart)
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
                                            {wo.isOpenForBids ? "Yes" : "No"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {wo.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {wo.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {wo.completionNotes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Completion Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {wo.completionNotes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "bids" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Vendor Bids ({mockBids.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockBids.map((bid) => (
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
                    recordId={wo.id}
                    activityItems={makeMockActivity("work_order")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
