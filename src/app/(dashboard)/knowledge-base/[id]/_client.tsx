"use client";

import React, { useMemo, useState } from "react";
import {
    useCreateRecordComment,
    useDeleteKBArticle,
    useKnowledgeBaseArticle,
    useRecordActivityLog,
    useRecordComments,
    useUpdateKBArticle,
} from "@/lib/supabase";
import {
    useArticleLinks,
    useKnowledgeArticles,
    useLinkArticle,
} from "@/lib/supabase/hooks-feature-gaps";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/form/textarea";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem, CommentItem } from "@/components/activity";
import { formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    BookOpen,
    CheckSquare,
    Edit,
    FileText,
    Link2,
    Loader2,
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

function RelatedArticlesTab({ category }: { category: string }) {
    const { data: articles, isLoading } = useKnowledgeArticles(category || undefined);
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    if (!articles || articles.length === 0)
        return (
            <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    No related articles in this category.
                </CardContent>
            </Card>
        );
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Related Articles ({articles.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {articles.map((a) => (
                        <div
                            key={String(a.id)}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {String(a.title ?? "")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    v{String(a.version ?? 1)} · {String(a.status ?? "draft")}
                                </p>
                            </div>
                            <Badge variant="outline" className="density-caption shrink-0 ml-2">
                                {String(a.category ?? "")}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ArticleLinksTab({ articleId }: { articleId: string }) {
    const { data: links, isLoading } = useArticleLinks("kb_article", articleId);
    const linkArticle = useLinkArticle();
    if (isLoading)
        return (
            <Card>
                <CardContent className="py-8 flex justify-center">
                    <Loader2 className="h-5 w-5 motion-safe:animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    if (!links || links.length === 0)
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-primary" />
                        Linked Articles
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-4 text-center text-sm text-muted-foreground">
                    No linked articles yet.
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        disabled={linkArticle.isPending}
                        onClick={() => {}}
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Link Article
                    </Button>
                </CardContent>
            </Card>
        );
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-primary" />
                        Linked Articles ({links.length})
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={linkArticle.isPending}
                        onClick={() => {}}
                    >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Link
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {links.map((link) => (
                        <div
                            key={String(link.id)}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {link.knowledge_articles?.title ?? link.article_id.slice(0, 8)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {link.entity_type} · {link.entity_id.slice(0, 8)}
                                </p>
                            </div>
                            <Badge variant="ghost" className="density-caption">
                                linked
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "knowledge_base_article",
    titleKey: "title",
    statusKey: "status",
    icon: BookOpen,
    backHref: "/knowledge-base",
    backLabel: "Knowledge Base",
    chatter: false,
    fields: [
        { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
        { id: "version", label: "Version", accessorKey: "version" },
    ],
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        { id: "category", label: "Category", accessorKey: "category", fieldType: "status" },
        { id: "version", label: "Version", accessorKey: "version" },
    ],
    tabs: [],
};

export function KBArticleDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: id,
        entityLabel: "Article",
        listPath: "/knowledge-base",
        useUpdateHook: useUpdateKBArticle,
        useDeleteHook: useDeleteKBArticle,
    });

    const [editTitle, setEditTitle] = useState("");
    const [editSummary, setEditSummary] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editTags, setEditTags] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [linkSearch, setLinkSearch] = useState("");

    const { data: article, isLoading } = useKnowledgeBaseArticle(id);
    const { data: sbActivity } = useRecordActivityLog("kb_article", id);
    const { data: sbComments } = useRecordComments("kb_article", id);
    const createComment = useCreateRecordComment();

    const activityItems: ActivityItem[] = useMemo(
        () =>
            (sbActivity ?? []).map((a) => ({
                id: a.id,
                action: a.action as ActivityItem["action"],
                actorName: a.user_profiles?.display_name ?? "System",
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
                authorName: c.user_profiles?.display_name ?? "",
                content: c.body,
                createdAt: c.created_at,
                updatedAt: c.updated_at,
            })),
        [sbComments]
    );
    const handleAddComment = async (content: string) => {
        await createComment.mutateAsync({
            entity_type: "kb_article",
            entity_id: id,
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
    };
    const cancelEditing = () => {
        setIsEditing(false);
    };
    const CategoryIcon = article ? (CATEGORY_ICONS[article.category] ?? BookOpen) : BookOpen;

    const sidebarSlot = article ? (
        <div className="density-gap-section">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Author</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Author</span>
                        <span className="font-medium">
                            {article.user_profiles?.display_name ?? "—"}
                        </span>
                    </div>
                    {article.published_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Published</span>
                            <span>{formatDate(article.published_at)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated</span>
                        <span>{formatDate(article.updated_at ?? "")}</span>
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
    ) : undefined;

    const overviewSlot = article ? (
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
                                <span className="text-sm">{line.replace("- [ ] ", "")}</span>
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
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: (rec) => {
            const body = (rec as Record<string, unknown>)?.body;
            return typeof body === "string" ? body.substring(0, 120) : "";
        },
        sidebarSlot,
        overviewSlot,
        stats: [
            { label: "Version", icon: BookOpen, compute: () => `v${article?.version ?? 1}` },
            {
                label: "Published",
                icon: FileText,
                compute: () => (article?.published_at ? formatDate(article.published_at) : "Draft"),
            },
            {
                label: "Updated",
                icon: Edit,
                compute: () => (article?.updated_at ? formatDate(article.updated_at) : "—"),
            },
        ],
        tabs: [
            {
                id: "edit",
                label: "Edit",
                content: article ? (
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
                                    <Button size="sm" onClick={() => setIsEditing(false)}>
                                        <Save className="h-3.5 w-3.5 mr-1" /> Save Changes
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="density-gap-section">
                            <div>
                                <label className="text-sm font-medium block mb-1.5">Title</label>
                                <Input
                                    value={isEditing ? editTitle : article.title}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onFocus={() => {
                                        if (!isEditing) startEditing();
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1.5">Summary</label>
                                <Input
                                    value={isEditing ? editSummary : article.body.substring(0, 200)}
                                    onChange={(e) => setEditSummary(e.target.value)}
                                    onFocus={() => {
                                        if (!isEditing) startEditing();
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1.5">
                                    Tags (comma-separated)
                                </label>
                                <Input
                                    value={isEditing ? editTags : (article.tags ?? []).join(", ")}
                                    onChange={(e) => setEditTags(e.target.value)}
                                    onFocus={() => {
                                        if (!isEditing) startEditing();
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1.5">
                                    Content (Markdown)
                                </label>
                                <Textarea
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
                ) : null,
            },
            {
                id: "linked",
                label: "Linked Records",
                count: 0,
                content: (
                    <div className="density-gap-section">
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
                                    No linked records.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ),
            },
            {
                id: "related-articles",
                label: "Related",
                content: <RelatedArticlesTab category={article?.category ?? ""} />,
            },
            {
                id: "article-links",
                label: "Article Links",
                content: <ArticleLinksTab articleId={id} />,
            },
            {
                id: "chatter",
                label: "Chatter",
                count: chatterComments.length,
                content: (
                    <RecordChatter
                        recordType="kb_article"
                        recordId={id}
                        activityItems={activityItems}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    const rec = (article as unknown as Record<string, unknown>) ?? initialRecord;

    return (
        <PermissionGate resource="knowledge_base" action="read">
            <DetailPageShell
                config={config}
                id={id}
                record={rec ? { ...rec } : null}
                isLoading={isLoading && !initialRecord}
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
                avatar={<CategoryIcon className="h-5 w-5 text-primary" />}
                actions={
                    <Button onClick={startEditing} variant="outline" size="sm">
                        <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit Article
                    </Button>
                }
            />
        </PermissionGate>
    );
}
