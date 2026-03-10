"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
    useDeleteWorkerProfile,
    useUpdateWorkerProfile,
    useWorkerProfile,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { EmptyState } from "@/components/layouts/empty-state";
import { formatDate } from "@/lib/locale";
import { Briefcase, HardHat, Mail, Phone } from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

type TabId = "overview" | "assignments" | "chatter";
const TAB_VALUES = ["overview", "assignments", "chatter"] as const;

export default function WorkforceDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: worker, isLoading } = useWorkerProfile(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Worker Profile",
        listPath: "/workforce",
        useUpdateHook: useUpdateWorkerProfile,
        useDeleteHook: useDeleteWorkerProfile,
    });

    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    const w = worker as Record<string, unknown> | undefined;
    if (!w) {
        return (
            <EmptyState
                icon={HardHat}
                title="Worker profile not found"
                description="This worker profile may have been removed."
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
        { id: "assignments" as const, label: "Assignments" },
        { id: "chatter" as const, label: "Activity" },
    ];

    const sidebar = (
        <div className="space-y-4 text-sm">
            <div>
                <span className="text-muted-foreground">Status</span>
                <p className="font-medium capitalize">
                    {String(w.lifecycle_status ?? w.status ?? "active")}
                </p>
            </div>
            <div>
                <span className="text-muted-foreground">Classification</span>
                <p className="font-medium capitalize">{String(w.classification ?? "—")}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Start Date</span>
                <p className="font-medium">
                    {w.start_date
                        ? formatDate(String(w.start_date))
                        : w.created_at
                          ? formatDate(String(w.created_at))
                          : "—"}
                </p>
            </div>
        </div>
    );

    return (
        <PermissionGate resource="workforce" action="read">
        <DetailLayout
            backHref="/workforce"
            backLabel="Workforce"
            entityType="workforce"
            entityId={entityId}
            title={String(w.full_name ?? w.name ?? "Unknown Worker")}
            subtitle={String(w.classification ?? "Worker Profile")}
            status={String(w.lifecycle_status ?? w.status ?? "active")}
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
                                <Briefcase className="h-4 w-4" /> Worker Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{String(w.email ?? "—")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{String(w.phone ?? "—")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Department</span>
                                <span>{String(w.department ?? "—")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Job Title</span>
                                <span>{String(w.job_title ?? w.role ?? "—")}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {activeTab === "assignments" && (
                <EmptyState
                    icon={Briefcase}
                    title="No assignments yet"
                    description="Project assignments and shift history for this worker will appear here."
                    compact
                />
            )}
            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="worker_profile"
                    recordId={entityId}
                    comments={chatterComments}
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
        </PermissionGate>
    );
}
