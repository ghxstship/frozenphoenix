"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
    Circle,
    Clock,
    Eye,
    FileText,
    GitBranch,
    History,
    Lock,
    MessageSquare,
    Pencil,
    Shield,
    Unlock,
    Users,
} from "lucide-react";
import { useKnowledgeBaseArticles } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

interface CollaborativeDocument {
    id: string;
    title: string;
    category: string;
    lastEditedBy: string;
    lastEditedAt: string | null;
    activeEditors: ActiveEditor[];
    version: number;
    status: "draft" | "published" | "locked";
    conflictCount: number;
}

interface ActiveEditor {
    id: string;
    name: string;
    avatarColor: string;
    cursor: string;
    lastActive: string;
}

interface VersionEntry {
    version: number;
    author: string;
    timestamp: string;
    changes: string;
    additions: number;
    deletions: number;
}

const STATUS_BADGE: Record<string, "success" | "warning" | "default"> = {
    draft: "warning",
    published: "success",
    locked: "default",
};

export function CollaborativeEditorPageClient() {
    const { data: sbArticles, isLoading } = useKnowledgeBaseArticles();

    const documents: CollaborativeDocument[] = useMemo(
        () =>
            (sbArticles ?? []).map((a) => ({
                id: a.id,
                title: a.title,
                category: a.category,
                lastEditedBy: a.user_profiles?.display_name ?? "",
                lastEditedAt: a.updated_at ?? a.created_at,
                activeEditors: [] as ActiveEditor[],
                version: a.version,
                status: (a.status as CollaborativeDocument["status"]) ?? "draft",
                conflictCount: 0,
            })),
        [sbArticles]
    );

    const [selectedDoc, setSelectedDoc] = useState<CollaborativeDocument | null>(null);

    const activeDoc = selectedDoc ?? documents[0] ?? null;

    const totalEditors = documents.reduce((s, d) => s + d.activeEditors.length, 0);

    const config: DashboardPageConfig = useMemo(
        () => ({
            resource: "knowledge_base",
            action: "read",
            title: "Collaborative Editing",
            description:
                "Real-time multi-user document editing with presence indicators and conflict resolution",
            searchable: false,
            headerActions: (
                <Badge variant="info" className="text-sm px-3 py-1">
                    <Users className="mr-2 h-3.5 w-3.5" />
                    {totalEditors} active editors
                </Badge>
            ),
            stats: [
                { label: "Documents", icon: FileText, compute: (d) => d.length },
                {
                    label: "Active Editors",
                    icon: Users,
                    compute: (d) =>
                        d.reduce((s, r) => s + ((r.activeEditors as unknown[]) ?? []).length, 0),
                },
                {
                    label: "Total Revisions",
                    icon: GitBranch,
                    compute: (d) => d.reduce((s, r) => s + Number(r.version ?? 0), 0),
                },
                {
                    label: "Conflicts",
                    icon: Shield,
                    compute: (d) => d.reduce((s, r) => s + Number(r.conflictCount ?? 0), 0),
                },
            ],
            contentSlot: (
                <div className="grid grid-cols-1 lg:grid-cols-3 density-gap-card">
                    {/* Document List */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Documents
                        </h3>
                        {documents.map((doc) => (
                            <Card
                                key={doc.id}
                                className={`cursor-pointer transition-colors ${activeDoc?.id === doc.id ? "border-primary/30 bg-primary/[0.02]" : "hover:border-primary/20"}`}
                                onClick={() => setSelectedDoc(doc)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="text-sm font-semibold">{doc.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="ghost" className="density-caption">
                                                    {doc.category}
                                                </Badge>
                                                <Badge
                                                    variant={STATUS_BADGE[doc.status]}
                                                    className="density-caption flex items-center gap-0.5"
                                                >
                                                    {doc.status === "locked" ? (
                                                        <Lock className="h-2.5 w-2.5" />
                                                    ) : doc.status === "published" ? (
                                                        <Eye className="h-2.5 w-2.5" />
                                                    ) : (
                                                        <Pencil className="h-2.5 w-2.5" />
                                                    )}
                                                    {doc.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <span className="density-caption text-muted-foreground">
                                            v{doc.version}
                                        </span>
                                    </div>

                                    {/* Active editors presence */}
                                    {doc.activeEditors.length > 0 && (
                                        <div className="flex items-center gap-1 mt-2">
                                            <div className="flex -space-x-2">
                                                {doc.activeEditors.map((editor) => (
                                                    <div
                                                        key={editor.id}
                                                        className={`h-6 w-6 rounded-full ${editor.avatarColor} border-2 border-background flex items-center justify-center`}
                                                        title={`${editor.name} — ${editor.cursor}`}
                                                    >
                                                        <span className="density-caption text-white font-bold">
                                                            {editor.name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="density-caption text-muted-foreground ml-1">
                                                {doc.activeEditors.length} editing
                                            </span>
                                            {doc.conflictCount > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="density-caption ml-auto"
                                                >
                                                    {doc.conflictCount} conflict
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    <p className="density-caption text-muted-foreground mt-2">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        {doc.lastEditedBy} ·{" "}
                                        {doc.lastEditedAt ? formatDate(doc.lastEditedAt) : "—"}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Selected Document Detail */}
                    <div className="lg:col-span-2 density-gap-section">
                        {activeDoc ? (
                            <>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">
                                                {activeDoc.title}
                                            </CardTitle>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="outline">
                                                    <History className="h-3.5 w-3.5" /> History
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    <MessageSquare className="h-3.5 w-3.5" />{" "}
                                                    Comment
                                                </Button>
                                                <Button size="sm">
                                                    {activeDoc.status === "locked" ? (
                                                        <>
                                                            <Unlock className="h-3.5 w-3.5" />{" "}
                                                            Unlock
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Pencil className="h-3.5 w-3.5" /> Edit
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Presence indicators */}
                                        {activeDoc.activeEditors.length > 0 && (
                                            <div className="mb-4 p-3 rounded-lg bg-secondary/30">
                                                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                                                    <Circle className="h-2 w-2 fill-success text-success animate-pulse" />
                                                    Currently editing
                                                </h4>
                                                <div className="space-y-2">
                                                    {activeDoc.activeEditors.map((editor) => (
                                                        <div
                                                            key={editor.id}
                                                            className="flex items-center justify-between text-xs"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`h-5 w-5 rounded-full ${editor.avatarColor} flex items-center justify-center`}
                                                                >
                                                                    <span className="density-micro text-white font-bold">
                                                                        {editor.name
                                                                            .split(" ")
                                                                            .map((n) => n[0])
                                                                            .join("")}
                                                                    </span>
                                                                </div>
                                                                <span className="font-medium">
                                                                    {editor.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-muted-foreground">
                                                                Cursor at: {editor.cursor}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Conflict resolution */}
                                        {activeDoc.conflictCount > 0 && (
                                            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-destructive" />
                                                        <span className="text-sm font-semibold text-destructive">
                                                            {activeDoc.conflictCount} merge conflict
                                                            detected
                                                        </span>
                                                    </div>
                                                    <Button size="sm" variant="outline">
                                                        Resolve
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Concurrent edits detected in &ldquo;Emergency
                                                    Procedures&rdquo; section. Review and merge
                                                    changes.
                                                </p>
                                            </div>
                                        )}

                                        {/* Mock document content */}
                                        <div className="prose prose-sm max-w-none space-y-3">
                                            <div className="p-4 rounded-lg bg-secondary/20 border-l-4 border-primary/30">
                                                <p className="text-xs text-muted-foreground italic">
                                                    Document preview — editing features require
                                                    real-time collaboration backend (CRDT)
                                                </p>
                                            </div>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <p>
                                                    This document contains {activeDoc.version}{" "}
                                                    revisions across{" "}
                                                    {activeDoc.activeEditors.length + 2}{" "}
                                                    contributors.
                                                </p>
                                                <p>
                                                    Category:{" "}
                                                    <Badge
                                                        variant="ghost"
                                                        className="density-caption"
                                                    >
                                                        {activeDoc.category}
                                                    </Badge>
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Version History */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <History className="h-4 w-4" />
                                            Version History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {([] as VersionEntry[]).map((v) => (
                                            <div
                                                key={v.version}
                                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-primary">
                                                            v{v.version}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium">
                                                            {v.changes}
                                                        </p>
                                                        <p className="density-caption text-muted-foreground">
                                                            {v.author} · {formatDate(v.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 density-caption">
                                                    <span className="text-success">
                                                        +{v.additions}
                                                    </span>
                                                    <span className="text-destructive">
                                                        -{v.deletions}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 density-caption"
                                                    >
                                                        Restore
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                    <FileText className="h-8 w-8 mb-2 opacity-30" />
                                    <p className="text-sm">Select a document to view details</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            ),
        }),
        [documents, activeDoc, totalEditors]
    );

    return (
        <OperationalDashboardShell
            config={config}
            data={documents as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
        />
    );
}
