"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useAccount, useDeleteAccount, useUpdateAccount } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { EmptyState } from "@/components/layouts/empty-state";
import { formatDate } from "@/lib/locale";
import { Building2, Mail, MapPin, Phone, User } from "lucide-react";

type TabId = "overview" | "contacts" | "chatter";
const TAB_VALUES = ["overview", "contacts", "chatter"] as const;

export default function AccountDetailPage() {
    const params = useParams();
    const entityId = params.id as string;
    const { data: account, isLoading } = useAccount(entityId);
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Account",
        listPath: "/accounts",
        useUpdateHook: useUpdateAccount,
        useDeleteHook: useDeleteAccount,
    });

    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);

    if (isLoading) {
        return <LoadingState />;
    }

    const a = account as Record<string, unknown> | undefined;
    if (!a) {
        return (
            <EmptyState
                icon={Building2}
                title="Account not found"
                description="This account may have been removed."
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
        { id: "contacts" as const, label: "Contacts" },
        { id: "chatter" as const, label: "Activity" },
    ];

    const sidebar = (
        <div className="space-y-4 text-sm">
            <div>
                <span className="text-muted-foreground">Type</span>
                <p className="font-medium capitalize">{String(a.type ?? "—")}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Industry</span>
                <p className="font-medium">{String(a.industry ?? "—")}</p>
            </div>
            <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium">
                    {a.created_at ? formatDate(String(a.created_at)) : "—"}
                </p>
            </div>
        </div>
    );

    return (
        <DetailLayout
            backHref="/accounts"
            backLabel="Accounts"
            entityType="accounts"
            entityId={entityId}
            title={String(a.name ?? "Untitled Account")}
            subtitle={String(a.type ?? "Account")}
            status={String(a.status ?? "active")}
            menuItems={[...crudMenuItems]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Building2 className="h-4 w-4" /> Company Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{String(a.email ?? "—")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{String(a.phone ?? "—")}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{String(a.address ?? "—")}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4" /> Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Website</span>
                                    <p>{String(a.website ?? "—")}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Notes</span>
                                    <p>{String(a.notes ?? "—")}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
            {activeTab === "contacts" && (
                <EmptyState
                    icon={User}
                    title="No contacts yet"
                    description="Contacts associated with this account will appear here."
                    compact
                />
            )}
            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="account"
                    recordId={entityId}
                    comments={chatterComments}
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
