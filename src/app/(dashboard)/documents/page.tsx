"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { formatDate } from "@/lib/locale";

import { useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_DOCUMENT_CONFIG } from "@/config/create-entity-configs";
import { DOCUMENT_TYPE_MAP } from "@/config/domain-config";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { getStatusLabel } from "@/config/ui-variants";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DocumentStatus, DocumentType } from "@/types";
import {
    BookOpen,
    Clock,
    Eye,
    FileCode,
    FileText,
    FolderOpen,
    Globe,
    LayoutTemplate,
    Lock,
    MessageSquare,
    Pencil,
    Plus,
    Presentation,
    ScrollText,
    Star,
    StickyNote,
    Users,
} from "lucide-react";
import { useDocuments } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

interface DocItem {
    id: string;
    title: string;
    icon: string | null;
    documentType: DocumentType;
    status: DocumentStatus;
    projectName: string | null;
    ownerName: string;
    lastEditedBy: string;
    updatedAt: string;
    createdAt: string;
    isPublic: boolean;
    canComment: boolean;
    canEdit: boolean;
    sharedWith: number;
    starred: boolean;
    commentCount: number;
    wordCount: number;
    coverImageUrl: string | null;
    parentTitle: string | null;
}

const DOC_TYPE_ICONS: Record<DocumentType, React.ElementType> = {
    doc: FileText,
    wiki: BookOpen,
    meeting_notes: StickyNote,
    specification: FileCode,
    proposal_doc: Presentation,
    sow: ScrollText,
    template: LayoutTemplate,
};

const DOC_TYPE_LABELS: Record<DocumentType, string> = Object.fromEntries(
    Object.entries(DOCUMENT_TYPE_MAP).map(([k, v]) => [k, v.label])
) as Record<DocumentType, string>;

export default function DocumentsPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const TYPE_FILTERS = [
        "all",
        "doc",
        "wiki",
        "meeting_notes",
        "specification",
        "sow",
        "template",
    ] as const;
    const [typeFilter, setTypeFilter] = useQueryTabState({
        key: "type",
        defaultValue: "all",
        validValues: TYPE_FILTERS,
    });
    const STATUS_FILTERS = ["all", "draft", "published", "pending_review"] as const;
    const [statusFilter, setStatusFilter] = useQueryTabState({
        key: "status",
        defaultValue: "all",
        validValues: STATUS_FILTERS,
    });

    const { data: sbDocs, isLoading } = useDocuments();

    const docs: DocItem[] = (sbDocs ?? []).map((d: Record<string, unknown>) => ({
        id: (d.id as string) ?? "",
        title: (d.title as string) ?? "",
        icon: (d.icon as string) ?? null,
        documentType: ((d.document_type as string) ?? "doc") as DocumentType,
        status: ((d.status as string) ?? "draft") as DocumentStatus,
        projectName: (d.project_name as string) ?? null,
        ownerName: (d.owner_name as string) ?? "",
        lastEditedBy: (d.last_edited_by as string) ?? "",
        updatedAt: (d.updated_at as string) ?? "",
        createdAt: (d.created_at as string) ?? "",
        isPublic: (d.is_public as boolean) ?? false,
        canComment: (d.can_comment as boolean) ?? false,
        canEdit: (d.can_edit as boolean) ?? false,
        sharedWith: (d.shared_with as number) ?? 0,
        starred: (d.starred as boolean) ?? false,
        commentCount: (d.comment_count as number) ?? 0,
        wordCount: (d.word_count as number) ?? 0,
        coverImageUrl: (d.cover_image_url as string) ?? null,
        parentTitle: (d.parent_title as string) ?? null,
    }));

    if (isLoading) {
        return <LoadingState />;
    }

    const filtered = docs.filter((d) => {
        if (typeFilter !== "all" && d.documentType !== typeFilter) return false;
        if (statusFilter !== "all" && d.status !== statusFilter) return false;
        if (
            search &&
            !d.title.toLowerCase().includes(search.toLowerCase()) &&
            !d.projectName?.toLowerCase().includes(search.toLowerCase())
        )
            return false;
        return true;
    });

    const starred = filtered.filter((d) => d.starred);
    const recent = filtered.filter((d) => !d.starred);

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date("2026-02-25T15:00:00Z");
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 1) return "just now";
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return "yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(date, "compact");
    };

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Documents"
                    description="Create, collaborate, and share documents across your team and projects"
                >
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Document
                    </Button>
                </PageHeader>

                {/* Filters */}
                <div className="flex items-center gap-4 flex-wrap">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search documents..."
                        className="flex-1 max-w-sm"
                    />
                    <SegmentedControl
                        ariaLabel="Document type filter"
                        value={typeFilter}
                        onValueChange={(v) => setTypeFilter(v as (typeof TYPE_FILTERS)[number])}
                        size="sm"
                        options={[
                            { value: "all", label: "All Types" },
                            ...(
                                [
                                    "doc",
                                    "wiki",
                                    "meeting_notes",
                                    "specification",
                                    "sow",
                                    "template",
                                ] as const
                            ).map((t) => ({ value: t, label: DOC_TYPE_LABELS[t] })),
                        ]}
                    />
                    <SegmentedControl
                        ariaLabel="Document status filter"
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as (typeof STATUS_FILTERS)[number])}
                        size="sm"
                        options={[
                            { value: "all", label: "All" },
                            { value: "draft", label: getStatusLabel("draft") },
                            { value: "published", label: getStatusLabel("published") },
                            { value: "pending_review", label: getStatusLabel("pending_review") },
                        ]}
                    />
                </div>

                {/* Starred Docs */}
                {starred.length > 0 && (
                    <div className="space-y-2">
                        <OverlineText as="h3" className="flex items-center gap-1">
                            <Star className="h-3 w-3" /> Starred
                        </OverlineText>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {starred.map((doc) => (
                                <DocCard key={doc.id} doc={doc} formatTime={formatRelativeTime} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Docs */}
                <div className="space-y-2">
                    {starred.length > 0 && (
                        <OverlineText as="h3" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Recent
                        </OverlineText>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {recent.map((doc) => (
                            <DocCard key={doc.id} doc={doc} formatTime={formatRelativeTime} />
                        ))}
                    </div>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                        <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No documents found</p>
                    </div>
                )}
            </div>
            <CreateEntityDialog
                config={CREATE_DOCUMENT_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </>
    );
}

function DocCard({ doc, formatTime }: { doc: DocItem; formatTime: (d: string) => string }) {
    const TypeIcon = DOC_TYPE_ICONS[doc.documentType];

    return (
        <PermissionGate resource="documents" action="read">
            <Card className="hover:bg-secondary/30 transition-colors cursor-pointer group">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            {doc.icon ? (
                                <span className="text-lg shrink-0">{doc.icon}</span>
                            ) : (
                                <TypeIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                            )}
                            <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{doc.title}</p>
                                {doc.parentTitle && (
                                    <p className="text-[10px] text-muted-foreground">
                                        in {doc.parentTitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        {doc.starred && (
                            <Star className="h-3.5 w-3.5 text-star-rating fill-star-rating shrink-0" />
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        <StatusBadge status={doc.status} className="text-[9px]" />
                        <Badge variant="ghost" className="text-[9px]">
                            {DOC_TYPE_LABELS[doc.documentType]}
                        </Badge>
                        {doc.isPublic ? (
                            <Globe className="h-3 w-3 text-success" />
                        ) : doc.sharedWith > 0 ? (
                            <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                                <Users className="h-2.5 w-2.5" /> {doc.sharedWith}
                            </span>
                        ) : (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                    </div>

                    {doc.projectName && (
                        <p className="text-[10px] text-muted-foreground truncate">
                            {doc.projectName}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
                        <div className="flex items-center gap-2">
                            {doc.commentCount > 0 && (
                                <span className="flex items-center gap-0.5">
                                    <MessageSquare className="h-2.5 w-2.5" /> {doc.commentCount}
                                </span>
                            )}
                            <span className="flex items-center gap-0.5">
                                <Eye className="h-2.5 w-2.5" /> {doc.wordCount.toLocaleString()}{" "}
                                words
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Pencil className="h-2.5 w-2.5" />
                            <span>{formatTime(doc.updatedAt)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </PermissionGate>
    );
}
