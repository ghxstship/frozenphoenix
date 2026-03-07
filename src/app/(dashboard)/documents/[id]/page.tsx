"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteDocument, useDocument, useUpdateDocument } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { formatDate } from "@/lib/utils";
import {
    Calendar,
    Download,
    ExternalLink,
    FileText,
    Loader2,
    Lock,
    Shield,
    User,
} from "lucide-react";

type TabId = "details" | "chatter";
const TAB_VALUES = ["details", "chatter"] as const;

const CATEGORY_LABELS: Record<string, string> = {
    site_map: "Site Map",
    nda: "NDA",
    contract: "Contract",
    blueprint: "Blueprint",
    permit: "Permit",
    other: "Other",
};

const ACCESS_VARIANTS: Record<string, "destructive" | "warning" | "default" | "success"> = {
    exec: "destructive",
    pm: "warning",
    client: "default",
    vendor: "success",
};

export default function DocumentDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: doc, isLoading } = useDocument(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Document",
        listPath: "/documents",
        useUpdateHook: useUpdateDocument,
        useDeleteHook: useDeleteDocument,
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

    if (!doc) {
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

    const fileSizeMB = doc.size ? (Number(doc.size) / (1024 * 1024)).toFixed(2) : "—";

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Document Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="outline">
                            {CATEGORY_LABELS[doc.category] ?? doc.category}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Access Level</span>
                        <Badge variant={ACCESS_VARIANTS[doc.access_level] ?? "default"}>
                            {doc.access_level}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Size</span>
                        <span className="font-medium">{fileSizeMB} MB</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-mono text-xs">{doc.mime_type}</span>
                    </div>
                    {doc.created_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Uploaded</span>
                            <span className="font-medium">{formatDate(doc.created_at)}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/documents"
            backLabel="Documents"
            entityType="documents"
            entityId={entityId}
            title={doc.name}
            subtitle={`${CATEGORY_LABELS[doc.category] ?? doc.category} · ${doc.mime_type}`}
            status={doc.category}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileText className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                doc.url ? (
                    <Button size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                        </a>
                    </Button>
                ) : undefined
            }
            menuItems={[
                { label: "Edit Document", onClick: () => {} },
                { label: "Change Access Level", onClick: () => {} },
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
                                    <Shield className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Access Level
                                        </p>
                                        <p className="text-sm font-semibold capitalize">
                                            {doc.access_level}
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
                                        <p className="text-xs text-muted-foreground">Uploaded</p>
                                        <p className="text-sm font-semibold">
                                            {doc.created_at ? formatDate(doc.created_at) : "—"}
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
                                        <p className="text-xs text-muted-foreground">Uploaded By</p>
                                        <p className="text-sm font-semibold font-mono">
                                            {doc.uploaded_by
                                                ? String(doc.uploaded_by).slice(0, 8)
                                                : "—"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {doc.url && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">File URL</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline break-all"
                                >
                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                    {doc.url}
                                </a>
                            </CardContent>
                        </Card>
                    )}

                    {doc.expiring_link_url && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    Expiring Link
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <a
                                    href={doc.expiring_link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline break-all"
                                >
                                    <ExternalLink className="h-4 w-4 shrink-0" />
                                    Expiring Link
                                </a>
                                {doc.expiring_link_expires_at && (
                                    <p className="text-xs text-muted-foreground">
                                        Expires: {formatDate(doc.expiring_link_expires_at)}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="document"
                    recordId={doc.id}
                    activityItems={makeMockActivity("document")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
