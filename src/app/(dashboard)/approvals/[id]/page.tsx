"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApproval } from "@/lib/supabase/hooks-pages";
import { useUpdateApproval } from "@/lib/supabase/hooks";
import { useDeleteApproval } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatDate } from "@/lib/utils";
import { Calendar, CheckCircle2, Clock, ExternalLink, Loader2, Shield, User } from "lucide-react";

type TabId = "details" | "chatter";
const TAB_VALUES = ["details", "chatter"] as const;

export default function ApprovalDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: approval, isLoading } = useApproval(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Approval",
        listPath: "/approvals",
        useUpdateHook: useUpdateApproval,
        useDeleteHook: useDeleteApproval,
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

    if (!approval) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Record not found</p>
            </div>
        );
    }

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const isOverdue =
        approval.status === "pending" &&
        approval.deadline &&
        new Date(approval.deadline) < new Date();

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Approval Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(isOverdue ? "overdue" : approval.status)}>
                            {isOverdue ? "Overdue" : getStatusLabel(approval.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Milestone</span>
                        <span className="font-medium text-xs">{approval.milestone_name}</span>
                    </div>
                    {approval.deadline && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Deadline</span>
                            <span className="font-medium">{formatDate(approval.deadline)}</span>
                        </div>
                    )}
                    {approval.approved_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Approved</span>
                            <span className="font-medium">{formatDate(approval.approved_at)}</span>
                        </div>
                    )}
                    {approval.timeline_impact_days != null && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Timeline Impact</span>
                            <span className="font-medium">
                                {approval.timeline_impact_days > 0
                                    ? `+${approval.timeline_impact_days}d`
                                    : `${approval.timeline_impact_days}d`}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/approvals"
            backLabel="Approvals"
            entityType="approvals"
            entityId={entityId}
            title={approval.milestone_name}
            subtitle={`Milestone ${approval.milestone_id}`}
            status={isOverdue ? "overdue" : approval.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Shield className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                approval.status === "pending" ? (
                    <Button size="sm">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                    </Button>
                ) : undefined
            }
            menuItems={[{ label: "Edit Approval", onClick: () => {} }, ...crudMenuItems]}
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
                                    <Calendar className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Requested</p>
                                        <p className="text-sm font-semibold">
                                            {approval.requested_at
                                                ? formatDate(approval.requested_at)
                                                : "—"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-info" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Deadline</p>
                                        <p className="text-sm font-semibold">
                                            {approval.deadline
                                                ? formatDate(approval.deadline)
                                                : "No deadline"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Approver</p>
                                        <p className="text-sm font-semibold font-mono">
                                            {approval.approver_id
                                                ? String(approval.approver_id).slice(0, 8)
                                                : "—"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {approval.deliverable_url && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Deliverable</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href={approval.deliverable_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    View Deliverable
                                </a>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="approval"
                    recordId={approval.id}
                    activityItems={makeMockActivity("approval")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
