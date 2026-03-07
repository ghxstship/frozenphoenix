"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteKBArticle, useUpdateKBArticle } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/form/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { OverlineText } from "@/components/ui/overline-text";
import { RECORD_TYPE_LABELS } from "@/config/ui-variants";
import { formatDate } from "@/lib/utils";
import {
    BookOpen,
    CheckSquare,
    Edit,
    ExternalLink,
    Eye,
    FileText,
    Link2,
    Plus,
    Save,
    Shield,
    Trash2,
    Users,
    X,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

// ─── Types ───
interface LinkedRecord {
    id: string;
    type: "project" | "deal" | "contract" | "event" | "asset";
    name: string;
    href: string;
}

interface KBArticleDetail {
    id: string;
    category: string;
    department?: string;
    title: string;
    summary: string;
    content: string;
    tags: string[];
    status: string;
    version: number;
    authorName: string;
    publishedAt: string;
    updatedAt: string;
    requiresAcknowledgment: boolean;
    acknowledgmentCount?: number;
    totalRequired?: number;
    linkedRecords: LinkedRecord[];
}

// ─── Mock Data ───
const PLACEHOLDER_ARTICLES: Record<string, KBArticleDetail> = {
    "kb-1": {
        id: "kb-1",
        category: "sop",
        department: "production",
        title: "Load-In Safety Procedures",
        summary: "Standard operating procedures for safe load-in operations at venues",
        content: `## Purpose\nThis SOP outlines the safety procedures all crew members must follow during load-in operations at any venue.\n\n## Scope\nApplies to all production staff, contractors, and vendors participating in load-in activities.\n\n## Pre-Load-In Requirements\n1. Complete venue safety briefing\n2. Verify all personal protective equipment (PPE)\n3. Review venue-specific load-in map and weight restrictions\n4. Confirm forklift certification for operators\n\n## Safety Protocols\n- **Hard hats** required in all active load-in zones\n- **Steel-toed boots** mandatory for all personnel\n- **High-visibility vests** required when operating near vehicle traffic\n- Maximum individual lift weight: **50 lbs** without mechanical assistance\n- All rigging points must be inspected and certified before use\n\n## Emergency Procedures\n1. Know the location of all emergency exits\n2. First aid kits located at each staging area\n3. Report all incidents to the Safety Lead immediately\n4. Emergency contact: Safety Hotline ext. 911`,
        tags: ["safety", "load-in", "venue"],
        status: "published",
        version: 3,
        authorName: "Marcus Johnson",
        publishedAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-02-20T14:30:00Z",
        requiresAcknowledgment: true,
        acknowledgmentCount: 12,
        totalRequired: 15,
        linkedRecords: [
            { id: "p1", type: "project", name: "Nike Air Max Launch", href: "/projects/1" },
            { id: "e1", type: "event", name: "Red Bull Festival 2024", href: "/events/1" },
            {
                id: "c1",
                type: "contract",
                name: "Venue Safety Agreement — Convention Center",
                href: "/contracts/1",
            },
        ],
    },
    "kb-2": {
        id: "kb-2",
        category: "checklist",
        department: "technical",
        title: "AV System Pre-Show Checklist",
        summary: "Complete checklist for verifying all AV systems before show start",
        content: `## Audio Systems\n- [ ] Main PA powered on and tested\n- [ ] Monitor mix verified with artists/presenters\n- [ ] Wireless microphone batteries checked (min 70%)\n- [ ] Backup microphones staged\n- [ ] Audio recording system armed\n\n## Video Systems\n- [ ] All LED walls calibrated and tested\n- [ ] Projection systems aligned\n- [ ] Camera feeds verified on switcher\n- [ ] IMAG system tested end-to-end\n- [ ] Backup playback device staged\n\n## Lighting\n- [ ] All fixtures addressed and patched\n- [ ] Follow spots positioned and tested\n- [ ] Haze machines filled and tested\n- [ ] Emergency lighting verified\n\n## Network & Control\n- [ ] Show control system online\n- [ ] Timecode sync verified\n- [ ] Backup show files loaded\n- [ ] Intercom system tested all positions`,
        tags: ["av", "checklist", "pre-show"],
        status: "published",
        version: 2,
        authorName: "David Kim",
        publishedAt: "2024-02-01T10:00:00Z",
        updatedAt: "2024-02-15T09:00:00Z",
        requiresAcknowledgment: false,
        linkedRecords: [
            { id: "p1", type: "project", name: "Nike Air Max Launch", href: "/projects/1" },
        ],
    },
};

const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
    sop: FileText,
    template: FileText,
    checklist: CheckSquare,
    guide: BookOpen,
    policy: Shield,
    training: Users,
};

const PLACEHOLDER_ACTIVITY: ActivityItem[] = [
    {
        id: "a1",
        action: "created",
        actorName: "Marcus Johnson",
        entityType: "article",
        entityName: "this article",
        createdAt: "2024-01-10T10:00:00Z",
    },
    {
        id: "a2",
        action: "updated",
        actorName: "Marcus Johnson",
        entityType: "article",
        description: "Updated safety protocols section",
        createdAt: "2024-01-20T14:00:00Z",
    },
    {
        id: "a3",
        action: "approved",
        actorName: "Safety Team",
        entityType: "article",
        description: "Published version 2",
        createdAt: "2024-02-01T09:00:00Z",
    },
    {
        id: "a4",
        action: "updated",
        actorName: "Marcus Johnson",
        entityType: "article",
        description: "Added emergency procedures; published v3",
        createdAt: "2024-02-20T14:30:00Z",
    },
];

const PLACEHOLDER_COMMENTS: CommentItem[] = [
    {
        id: "c1",
        authorId: "u1",
        authorName: "Sarah Chen",
        content: "Can we add a section about weather contingencies for outdoor load-ins?",
        createdAt: "2024-02-18T10:00:00Z",
    },
    {
        id: "c2",
        authorId: "u2",
        authorName: "Marcus Johnson",
        content: "Good idea — I'll add an outdoor-specific addendum in the next revision.",
        createdAt: "2024-02-19T08:30:00Z",
    },
];

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
    void handleUpdate;

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
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(PLACEHOLDER_COMMENTS);
    const [linkSearch, setLinkSearch] = useState("");

    const article = PLACEHOLDER_ARTICLES[articleId];

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

    const startEditing = () => {
        if (!article) return;
        setEditTitle(article.title);
        setEditSummary(article.summary);
        setEditContent(article.content);
        setEditTags(article.tags.join(", "));
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
                count: article?.linkedRecords.length ?? 0,
            },
            { id: "chatter" as const, label: "Chatter", count: chatterComments.length },
        ],
        [article?.linkedRecords.length, chatterComments.length]
    );

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
                    {article.department && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Department</span>
                            <span className="font-medium capitalize">{article.department}</span>
                        </div>
                    )}
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
                        <span className="font-medium">{article.authorName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Published</span>
                        <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated</span>
                        <span>{formatDate(article.updatedAt)}</span>
                    </div>
                    {article.requiresAcknowledgment &&
                        article.acknowledgmentCount !== undefined &&
                        article.totalRequired !== undefined && (
                            <>
                                <div className="border-t pt-3 mt-3">
                                    <OverlineText className="mb-2">Acknowledgments</OverlineText>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span
                                            className={`font-bold ${article.acknowledgmentCount < article.totalRequired ? "text-warning" : "text-success"}`}
                                        >
                                            {article.acknowledgmentCount}/{article.totalRequired}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${article.acknowledgmentCount >= article.totalRequired ? "bg-success" : "bg-warning"}`}
                                            style={{
                                                width: `${Math.min(100, (article.acknowledgmentCount / article.totalRequired) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                        {article.tags.map((tag) => (
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
                subtitle={article.summary}
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
                    { label: "Publish New Version", onClick: () => {} },
                    { label: "Request Acknowledgment", onClick: () => {} },
                    ...crudMenuItems,
                ]}
            >
                {/* View Tab */}
                {activeTab === "view" && (
                    <Card>
                        <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                            {article.content.split("\n").map((line, i) => {
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
                                    value={isEditing ? editSummary : article.summary}
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
                                    value={isEditing ? editTags : article.tags.join(", ")}
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
                                    value={isEditing ? editContent : article.content}
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
                                {article.linkedRecords.length === 0 ? (
                                    <div className="text-center py-8 text-sm text-muted-foreground">
                                        No linked records. Use the search above to link projects,
                                        deals, events, or contracts.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {article.linkedRecords.map((record) => (
                                            <div
                                                key={record.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px]"
                                                    >
                                                        {RECORD_TYPE_LABELS[record.type] ??
                                                            record.type}
                                                    </Badge>
                                                    <span className="text-sm font-medium">
                                                        {record.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0"
                                                        onClick={() => router.push(record.href)}
                                                        aria-label={`Open ${record.name}`}
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0 text-destructive"
                                                        aria-label={`Unlink ${record.name}`}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                        activityItems={PLACEHOLDER_ACTIVITY}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                )}
            </DetailLayout>
        </PermissionGate>
    );
}
