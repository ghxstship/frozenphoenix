"use client";

import { formatDate } from "@/lib/locale";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
    FileText, Plus, Globe, Lock,
    Users, Star, FolderOpen,
    BookOpen, StickyNote, FileCode, Presentation,
    ScrollText, LayoutTemplate, Clock, Eye,
    MessageSquare, Pencil,
} from "lucide-react";

type DocType = "doc" | "wiki" | "meeting_notes" | "specification" | "proposal_doc" | "sow" | "template";
type DocStatus = "draft" | "pending_review" | "published" | "archived";
interface DocItem {
    id: string;
    title: string;
    icon: string | null;
    documentType: DocType;
    status: DocStatus;
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

const DOC_TYPE_ICONS: Record<DocType, React.ElementType> = {
    doc: FileText,
    wiki: BookOpen,
    meeting_notes: StickyNote,
    specification: FileCode,
    proposal_doc: Presentation,
    sow: ScrollText,
    template: LayoutTemplate,
};

const DOC_TYPE_LABELS: Record<DocType, string> = {
    doc: "Document",
    wiki: "Wiki",
    meeting_notes: "Meeting Notes",
    specification: "Specification",
    proposal_doc: "Proposal",
    sow: "Scope of Work",
    template: "Template",
};


const mockDocs: DocItem[] = [
    { id: "1", title: "Nike Air Max Launch — Production Bible", icon: "📕", documentType: "doc", status: "published", projectName: "Nike Air Max Launch", ownerName: "Sarah Chen", lastEditedBy: "Mike Johnson", updatedAt: "2026-02-25T14:30:00Z", createdAt: "2026-01-15", isPublic: false, canComment: true, canEdit: true, sharedWith: 8, starred: true, commentCount: 24, wordCount: 4200, coverImageUrl: null, parentTitle: null },
    { id: "2", title: "Red Bull Festival — Technical Specifications", icon: "⚡", documentType: "specification", status: "published", projectName: "Red Bull Festival", ownerName: "David Kim", lastEditedBy: "David Kim", updatedAt: "2026-02-24T10:15:00Z", createdAt: "2026-02-01", isPublic: false, canComment: true, canEdit: false, sharedWith: 5, starred: true, commentCount: 12, wordCount: 3100, coverImageUrl: null, parentTitle: null },
    { id: "3", title: "Weekly Standup — Feb 25", icon: "📝", documentType: "meeting_notes", status: "draft", projectName: null, ownerName: "Sarah Chen", lastEditedBy: "Sarah Chen", updatedAt: "2026-02-25T09:00:00Z", createdAt: "2026-02-25", isPublic: false, canComment: true, canEdit: true, sharedWith: 12, starred: false, commentCount: 0, wordCount: 450, coverImageUrl: null, parentTitle: null },
    { id: "4", title: "Company Wiki — Onboarding Guide", icon: "📖", documentType: "wiki", status: "published", projectName: null, ownerName: "Lisa Wang", lastEditedBy: "Tom Harris", updatedAt: "2026-02-20T16:45:00Z", createdAt: "2025-11-01", isPublic: true, canComment: true, canEdit: false, sharedWith: 0, starred: true, commentCount: 8, wordCount: 6800, coverImageUrl: null, parentTitle: "Company Wiki" },
    { id: "5", title: "Coachella Experience — SOW Draft", icon: "🎪", documentType: "sow", status: "pending_review", projectName: "Coachella Experience", ownerName: "Mike Johnson", lastEditedBy: "Sarah Chen", updatedAt: "2026-02-23T11:20:00Z", createdAt: "2026-02-15", isPublic: false, canComment: true, canEdit: true, sharedWith: 3, starred: false, commentCount: 6, wordCount: 2800, coverImageUrl: null, parentTitle: null },
    { id: "6", title: "Project Brief Template", icon: "📋", documentType: "template", status: "published", projectName: null, ownerName: "Sarah Chen", lastEditedBy: "Sarah Chen", updatedAt: "2026-02-10T08:30:00Z", createdAt: "2025-10-15", isPublic: true, canComment: false, canEdit: false, sharedWith: 0, starred: false, commentCount: 0, wordCount: 1200, coverImageUrl: null, parentTitle: null },
    { id: "7", title: "TechStart Launch — Proposal Document", icon: "🚀", documentType: "proposal_doc", status: "draft", projectName: "TechStart Launch", ownerName: "Lisa Wang", lastEditedBy: "Lisa Wang", updatedAt: "2026-02-24T15:00:00Z", createdAt: "2026-02-20", isPublic: false, canComment: true, canEdit: true, sharedWith: 2, starred: false, commentCount: 3, wordCount: 1800, coverImageUrl: null, parentTitle: null },
    { id: "8", title: "Safety Protocols & Emergency Procedures", icon: "🛡️", documentType: "wiki", status: "published", projectName: null, ownerName: "Tom Harris", lastEditedBy: "Tom Harris", updatedAt: "2026-02-18T12:00:00Z", createdAt: "2025-12-01", isPublic: true, canComment: true, canEdit: false, sharedWith: 0, starred: false, commentCount: 2, wordCount: 3400, coverImageUrl: null, parentTitle: "Company Wiki" },
    { id: "9", title: "Glossier Pop-Up — Post-Mortem", icon: "✨", documentType: "meeting_notes", status: "published", projectName: "Glossier Pop-Up", ownerName: "Sarah Chen", lastEditedBy: "Mike Johnson", updatedAt: "2026-02-15T17:30:00Z", createdAt: "2026-02-14", isPublic: false, canComment: true, canEdit: false, sharedWith: 6, starred: false, commentCount: 15, wordCount: 2100, coverImageUrl: null, parentTitle: null },
];

export default function DocumentsPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | DocType>("all");
    const [statusFilter, setStatusFilter] = useState<"all" | DocStatus>("all");

    const filtered = mockDocs.filter((d) => {
        if (typeFilter !== "all" && d.documentType !== typeFilter) return false;
        if (statusFilter !== "all" && d.status !== statusFilter) return false;
        if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !(d.projectName?.toLowerCase().includes(search.toLowerCase()))) return false;
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
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Documents" description="Create, collaborate, and share documents across your team and projects">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Document
                </Button>
            </PageHeader>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search documents..." className="flex-1 max-w-sm" />
                <div className="flex gap-1 flex-wrap">
                    {(["all", "doc", "wiki", "meeting_notes", "specification", "sow", "template"] as const).map((t) => (
                        <Button key={t} variant={typeFilter === t ? "default" : "ghost"} size="sm" onClick={() => setTypeFilter(t)} className="text-xs">
                            {t === "all" ? "All Types" : DOC_TYPE_LABELS[t]}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-1">
                    {(["all", "draft", "published", "pending_review"] as const).map((s) => (
                        <Button key={s} variant={statusFilter === s ? "default" : "ghost"} size="sm" onClick={() => setStatusFilter(s)} className="text-xs capitalize">
                            {s === "all" ? "All" : s.replace("_", " ")}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Starred Docs */}
            {starred.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Star className="h-3 w-3" /> Starred
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {starred.map((doc) => <DocCard key={doc.id} doc={doc} formatTime={formatRelativeTime} />)}
                    </div>
                </div>
            )}

            {/* Recent Docs */}
            <div className="space-y-2">
                {starred.length > 0 && (
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Recent
                    </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recent.map((doc) => <DocCard key={doc.id} doc={doc} formatTime={formatRelativeTime} />)}
                </div>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No documents found</p>
                </div>
            )}
        </div>
    );
}

function DocCard({ doc, formatTime }: { doc: DocItem; formatTime: (d: string) => string }) {
    const TypeIcon = DOC_TYPE_ICONS[doc.documentType];

    return (
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
                                <p className="text-[10px] text-muted-foreground">in {doc.parentTitle}</p>
                            )}
                        </div>
                    </div>
                    {doc.starred && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={doc.status} className="text-[9px]" />
                    <Badge variant="ghost" className="text-[9px]">{DOC_TYPE_LABELS[doc.documentType]}</Badge>
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
                            <Eye className="h-2.5 w-2.5" /> {doc.wordCount.toLocaleString()} words
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Pencil className="h-2.5 w-2.5" />
                        <span>{formatTime(doc.updatedAt)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
