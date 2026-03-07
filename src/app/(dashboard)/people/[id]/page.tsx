"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeletePerson, usePerson, useUpdatePerson } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { EmptyState } from "@/components/layouts/empty-state";
import { formatDate } from "@/lib/locale";
import { Loader2, Mail, Phone, User } from "lucide-react";

type TabId = "overview" | "projects" | "chatter";
const TAB_VALUES = ["overview", "projects", "chatter"] as const;

export default function PersonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: person, isLoading } = usePerson(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Person",
        listPath: "/people",
        useUpdateHook: useUpdatePerson,
        useDeleteHook: useDeletePerson,
    });
    void router;
    void handleUpdate;

    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const p = person as Record<string, unknown> | undefined;
    if (!p) {
        return (
            <EmptyState
                icon={User}
                title="Person not found"
                description="This person may have been removed."
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
        { id: "projects" as const, label: "Projects" },
        { id: "chatter" as const, label: "Activity" },
    ];

    const sidebar = (
        <div className="space-y-4 text-sm">
            <div>
                <span className="text-muted-foreground">Role</span>
                <p className="font-medium capitalize">{String(p.role ?? "—")}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Department</span>
                <p className="font-medium">{String(p.department ?? "—")}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Joined</span>
                <p className="font-medium">
                    {p.created_at ? formatDate(String(p.created_at)) : "—"}
                </p>
            </div>
        </div>
    );

    return (
        <DetailLayout
            backHref="/people"
            backLabel="People"
            entityType="people"
            entityId={entityId}
            title={String(p.full_name ?? p.name ?? "Unknown")}
            subtitle={String(p.role ?? "Person")}
            status={String(p.status ?? "active")}
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
                                <User className="h-4 w-4" /> Contact Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{String(p.email ?? "—")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{String(p.phone ?? "—")}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {activeTab === "projects" && (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Project assignments coming soon.
                    </CardContent>
                </Card>
            )}
            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="person"
                    recordId={entityId}
                    comments={chatterComments}
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
