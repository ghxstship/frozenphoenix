"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useBrandGuideline,
    useDeleteBrandGuideline,
    useUpdateBrandGuideline,
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
import { FileText, Loader2, Palette } from "lucide-react";

type TabId = "overview" | "rules" | "chatter";
const TAB_VALUES = ["overview", "rules", "chatter"] as const;

export default function BrandGuidelineDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: guideline, isLoading } = useBrandGuideline(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Brand Guideline",
        listPath: "/brand-guidelines",
        useUpdateHook: useUpdateBrandGuideline,
        useDeleteHook: useDeleteBrandGuideline,
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

    const g = guideline as Record<string, unknown> | undefined;
    if (!g) {
        return (
            <EmptyState
                icon={Palette}
                title="Brand guideline not found"
                description="This guideline may have been removed."
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
        { id: "rules" as const, label: "Rules" },
        { id: "chatter" as const, label: "Activity" },
    ];

    const sidebar = (
        <div className="space-y-4 text-sm">
            <div>
                <span className="text-muted-foreground">Category</span>
                <p className="font-medium capitalize">{String(g.category ?? "—")}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Status</span>
                <p className="font-medium capitalize">{String(g.status ?? "—")}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium">
                    {g.created_at ? formatDate(String(g.created_at)) : "—"}
                </p>
            </div>
        </div>
    );

    return (
        <DetailLayout
            backHref="/brand-guidelines"
            backLabel="Brand Guidelines"
            title={String(g.name ?? g.title ?? "Untitled Guideline")}
            subtitle="Brand Guideline"
            status={String(g.status ?? "active")}
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
                                <Palette className="h-4 w-4" /> Guideline Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <p>
                                {String(g.description ?? g.content ?? "No description provided.")}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
            {activeTab === "rules" && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Brand Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Detailed brand rules coming soon.
                    </CardContent>
                </Card>
            )}
            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="brand_guideline"
                    recordId={entityId}
                    comments={chatterComments}
                    activityItems={makeMockActivity("brand_guideline")}
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
