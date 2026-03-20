"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { DOCUMENT_TYPE_MAP } from "@/config/domain-config";
import type { DocumentStatus, DocumentType } from "@/types";
import {
    BookOpen,
    Eye,
    FileCode,
    FileText,
    Globe,
    LayoutTemplate,
    Lock,
    MessageSquare,
    Pencil,
    Presentation,
    ScrollText,
    Star,
    StickyNote,
    Users,
} from "lucide-react";

export interface DocCardItem {
    id: string;
    title: string;
    icon: string | null;
    documentType: DocumentType;
    status: DocumentStatus;
    projectName: string | null;
    ownerName: string;
    updatedAt: string;
    isPublic: boolean;
    sharedWith: number;
    starred: boolean;
    commentCount: number;
    wordCount: number;
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

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DocCard({ doc }: { doc: DocCardItem }) {
    const TypeIcon = DOC_TYPE_ICONS[doc.documentType];
    const typeLabel = DOCUMENT_TYPE_MAP[doc.documentType]?.label ?? doc.documentType;

    return (
        <Link href={`/documents/${doc.id}`}>
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
                                    <p className="density-caption text-muted-foreground">
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
                        <StatusBadge status={doc.status} className="density-caption" />
                        <Badge variant="ghost" className="density-caption">
                            {typeLabel}
                        </Badge>
                        {doc.isPublic ? (
                            <Globe className="h-3 w-3 text-success" />
                        ) : doc.sharedWith > 0 ? (
                            <span className="flex items-center gap-0.5 density-caption text-muted-foreground">
                                <Users className="h-2.5 w-2.5" /> {doc.sharedWith}
                            </span>
                        ) : (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                    </div>

                    {doc.projectName && (
                        <p className="density-caption text-muted-foreground truncate">
                            {doc.projectName}
                        </p>
                    )}

                    <div className="flex items-center justify-between density-caption text-muted-foreground pt-1 border-t">
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
                            <span>{formatRelativeTime(doc.updatedAt)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
