"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useComplianceChecklist,
    useDeleteComplianceChecklist,
    useUpdateComplianceChecklist,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { EmptyState } from "@/components/layouts/empty-state";
import { formatDate } from "@/lib/locale";
import { CheckSquare, ClipboardList, Loader2, ShieldCheck } from "lucide-react";

type TabId = "overview" | "items" | "chatter";
const TAB_VALUES = ["overview", "items", "chatter"] as const;

export default function ComplianceChecklistDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: checklist, isLoading } = useComplianceChecklist(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Compliance Checklist",
        listPath: "/compliance-checklists",
        useUpdateHook: useUpdateComplianceChecklist,
        useDeleteHook: useDeleteComplianceChecklist,
    });
    void router;
    void handleUpdate;

    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(makeMockComments());

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const cl = checklist as Record<string, unknown> | undefined;
    if (!cl) {
        return (
            <EmptyState
                icon={ClipboardList}
                title="Checklist not found"
                description="This compliance checklist may have been removed."
            />
        );
    }

    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "You",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "items" as const, label: "Checklist Items" },
        { id: "chatter" as const, label: "Activity" },
    ];

    const sidebar = (
        <div className="space-y-4 text-sm">
            <div>
                <span className="text-muted-foreground">Status</span>
                <p className="font-medium capitalize">{String(cl.status ?? "pending")}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Category</span>
                <p className="font-medium capitalize">{String(cl.category ?? "—")}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium">
                    {cl.created_at ? formatDate(String(cl.created_at)) : "—"}
                </p>
            </div>
        </div>
    );

    return (
        <DetailLayout
            backHref="/compliance-checklists"
            backLabel="Compliance Checklists"
            title={String(cl.name ?? "Untitled Checklist")}
            subtitle="Compliance Checklist"
            status={String(cl.status ?? "pending")}
            menuItems={[...crudMenuItems]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" /> Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <p>{String(cl.description ?? "No description provided.")}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
            {activeTab === "items" && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" /> Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Checklist items coming soon.
                    </CardContent>
                </Card>
            )}
            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="compliance_checklist"
                    recordId={entityId}
                    comments={chatterComments}
                    activityItems={makeMockActivity("compliance_checklist")}
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
