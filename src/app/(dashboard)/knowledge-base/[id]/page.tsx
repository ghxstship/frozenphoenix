"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteKBArticle, useUpdateKBArticle } from "@/lib/supabase/hooks-pages";
import {
    useCreateRecordComment,
    useKnowledgeArticle,
    useRecordActivityLog,
    useRecordComments,
} from "@/lib/supabase/hooks-feature-gaps";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { LoadingState } from "@/components/layouts/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/form/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem, CommentItem } from "@/components/activity";
import { formatDate } from "@/lib/utils";
import {
    BookOpen,
    CheckSquare,
    Edit,
    Eye,
    FileText,
    Link2,
    Plus,
    Save,
    Shield,
    Users,
    X,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
    sop: FileText,
    template: FileText,
    checklist: CheckSquare,
    guide: BookOpen,
    policy: Shield,
    training: Users,
};

// ─── Tab config ───
type TabId = "view" | "edit" | "linked" | "chatter";
const TAB_VALUES = ["view", "edit", "linked", "chatter"] as const;

export default function KBArticleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const articleId = params.id as string;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: articleId,
        entityLabel: "Article",
        listPath: "/knowledge-base",
        useUpdateHook: useUpdateKBArticle,
        useDeleteHook: useDeleteKBArticle,
    });

    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "view",
        validValues: TAB_VALUES,
    });

    const [editTitle, setEditTitle] = useState("");
    const [editSummary, setEditSummary] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editTags, setEditTags] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [linkSearch, setLinkSearch] = useState("");

    const { data: article, isLoading } = useKnowledgeArticle(articleId);
    const { data: sbActivity } = useRecordActivityLog("kb_article", articleId);
    const { data: sbComments } = useRecordComments("kb_article", articleId);
    const createComment = useCreateRecordComment();

    const activityItems: ActivityItem[] = useMemo(
        () =>
            (sbActivity ?? []).map((a) => ({
                id: a.id,
                action: a.action as ActivityItem["action"],
                actorName: a.profiles?.name ?? "System",
                entityType: a.entity_type,
                description: (a.metadata?.description as string) ?? undefined,
                createdAt: a.created_at,
            })),
        [sbActivity]
    );

    const chatterComments: CommentItem[] = useMemo(
        () =>
            (sbComments ?? []).map((c) => ({
                id: c.id,
                authorId: c.author_id,
                authorName: c.profiles?.name ?? "",
                content: c.body,
                createdAt: c.created_at,
                updatedAt: c.updated_at,
            })),
        [sbComments]
    );

    const handleAddComment = async (content: string) => {
        await createComment.mutateAsync({
            entity_type: "kb_article",
            entity_id: articleId,
            author_id: "u1",
            body: content,
        });
    };

    const startEditing = () => {
        if (!article) return;
        setEditTitle(article.title);
        setEditSummary(article.body.substring(0, 200));
        setEditContent(article.body);
        setEditTags((article.tags ?? []).join(", "));
        setIsEditing(true);
        setActiveTab("edit");
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setActiveTab("view");
    };

    const tabs = useMemo(
        () => [
            { id: "view" as const, label: "View", icon: <Eye className="h-3.5 w-3.5" /> },
            { id: "edit" as const, label: "Edit", icon: <Edit className="h-3.5 w-3.5" /> },
            {
                id: "linked" as const,
                label: "Linked Records",
                count: 0,
            },
            { id: "chatter" as const, label: "Chatter", count: chatterComments.length },
        ],
        [chatterComments.length]
    );

    if (isLoading) return <LoadingState />;

    if (!article) {
        return (
            <EmptyState
                icon={BookOpen}
                title="Article not found"
                description="The article you're looking for doesn't exist."
                action={{
                    label: "Back to Knowledge Base",
                    onClick: () => router.push("/knowledge-base"),
                }}
            />
        );
    }

    const CategoryIcon = CATEGORY_ICONS[article.category] ?? BookOpen;

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Article Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="secondary">{article.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <StatusBadge status={article.status} />
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Version</span>
                        <span className="font-medium">v{article.version}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Author</span>
                        <span className="font-medium">{article.profiles?.name ?? "—"}</span>
                    </div>
                    {article.published_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Published</span>
                            <span>{formatDate(article.published_at)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated</span>
                        <span>{formatDate(article.updated_at)}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                        {(article.tags ?? []).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <PermissionGate resource="knowledge_base" action="read">
            <DetailLayout
                backHref="/knowledge-base"
                backLabel="Knowledge Base"
                entityType="knowledge-base"
                entityId={articleId}
                title={article.title}
                subtitle={article.body.substring(0, 120)}
                avatar={<CategoryIcon className="h-5 w-5 text-primary" />}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(t) => setActiveTab(t as TabId)}
                sidebar={sidebar}
                actions={
                    <Button onClick={startEditing} variant="outline" size="sm">
                        <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit Article
                    </Button>
                }
                menuItems={[
                    {
                        label: "Publish New Version",
                        onClick: () =>
                            handleUpdate({
                                status: "published",
                                version: (article?.version ?? 0) + 1,
                            }),
                    },
                    ...crudMenuItems,
                ]}
            >
                {/* View Tab */}
                {activeTab === "view" && (
                    <Card>
                        <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                            {article.body.split("\n").map((line, i) => {
                                if (line.startsWith("## "))
                                    return (
                                        <h2 key={i} className="text-lg font-semibold mt-6 mb-3">
                                            {line.replace("## ", "")}
                                        </h2>
                                    );
                                if (line.startsWith("- [ ] "))
                                    return (
                                        <div key={i} className="flex items-center gap-2 py-0.5">
                                            <input type="checkbox" disabled className="rounded" />
                                            <span className="text-sm">
                                                {line.replace("- [ ] ", "")}
                                            </span>
                                        </div>
                                    );
                                if (line.startsWith("- **")) {
                                    const match = line.match(/- \*\*(.+?)\*\*\s*(.*)/);
                                    if (match)
                                        return (
                                            <div key={i} className="flex items-start gap-2 py-0.5">
                                                <span className="text-sm">
                                                    <strong>{match[1]}</strong> {match[2]}
                                                </span>
                                            </div>
                                        );
                                }
                                if (line.match(/^\d+\.\s/))
                                    return (
                                        <div key={i} className="text-sm py-0.5 pl-4">
                                            {line}
                                        </div>
                                    );
                                if (line.startsWith("- "))
                                    return (
                                        <div key={i} className="text-sm py-0.5 pl-4">
                                            {line}
                                        </div>
                                    );
                                if (line.trim() === "") return <div key={i} className="h-2" />;
                                return (
                                    <p key={i} className="text-sm">
                                        {line}
                                    </p>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Edit Tab */}
                {activeTab === "edit" && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Edit Article</CardTitle>
                                <div className="flex gap-2">
                                    {isEditing && (
                                        <Button variant="ghost" size="sm" onClick={cancelEditing}>
                                            <X className="h-3.5 w-3.5 mr-1" /> Cancel
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setActiveTab("view");
                                        }}
                                    >
                                        <Save className="h-3.5 w-3.5 mr-1" /> Save Changes
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label
                                    htmlFor="kb-title"
                                    className="text-sm font-medium block mb-1.5"
                                >
                                    Title
                                </label>
                                <Input
                                    id="kb-title"
                                    value={isEditing ? editTitle : article.title}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onFocus={() => {
                                        if (!isEditing) startEditing();
                                    }}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="kb-summary"
                                    className="text-sm font-medium block mb-1.5"
                                >
                                    Summary
                                </label>
                                <Input
                                    id="kb-summary"
                                    value={isEditing ? editSummary : article.body.substring(0, 200)}
                                    onChange={(e) => setEditSummary(e.target.value)}
                                    onFocus={() => {
                                        if (!isEditing) startEditing();
                                    }}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="kb-tags"
                                    className="text-sm font-medium block mb-1.5"
                                >
                                    Tags (comma-separated)
                                </label>
                                <Input
                                    id="kb-tags"
                                    value={isEditing ? editTags : (article.tags ?? []).join(", ")}
                                    onChange={(e) => setEditTags(e.target.value)}
                                    onFocus={() => {
                                        if (!isEditing) startEditing();
                                    }}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="kb-content"
                                    className="text-sm font-medium block mb-1.5"
                                >
                                    Content (Markdown)
                                </label>
                                <Textarea
                                    id="kb-content"
                                    value={isEditing ? editContent : article.body}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    onFocus={() => {
                                        if (!isEditing) startEditing();
                                    }}
                                    className="min-h-[400px] font-mono text-sm"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Linked Records Tab */}
                {activeTab === "linked" && (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Link2 className="h-4 w-4 text-primary" />
                                        Linked Records
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Search to link a record..."
                                            value={linkSearch}
                                            onChange={(e) => setLinkSearch(e.target.value)}
                                            className="w-64"
                                            aria-label="Search records to link"
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={!linkSearch.trim()}
                                        >
                                            <Plus className="h-3.5 w-3.5 mr-1" /> Link
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-sm text-muted-foreground">
                                    No linked records. Use the search above to link projects, deals,
                                    events, or contracts.
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground">
                                    Linking records helps teams discover relevant documentation when
                                    working on projects, events, or deals.
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                )}

                {/* Chatter Tab */}
                {activeTab === "chatter" && (
                    <RecordChatter
                        recordType="kb_article"
                        recordId={articleId}
                        activityItems={activityItems}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                )}
            </DetailLayout>
        </PermissionGate>
    );
}
