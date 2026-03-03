"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
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
import { PermissionGate } from "@/components/permission-guard";

interface CollaborativeDocument {
    id: string;
    title: string;
    category: string;
    lastEditedBy: string;
    lastEditedAt: string;
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

const MOCK_DOCUMENTS: CollaborativeDocument[] = [
    {
        id: "cd1",
        title: "Event Production Handbook",
        category: "Operations",
        lastEditedBy: "Anna Williams",
        lastEditedAt: "2026-03-12T14:30:00Z",
        activeEditors: [
            {
                id: "e1",
                name: "Anna Williams",
                avatarColor: "bg-chart-1",
                cursor: "Section 3.2",
                lastActive: "2026-03-12T14:30:00Z",
            },
            {
                id: "e2",
                name: "Marcus Chen",
                avatarColor: "bg-chart-4",
                cursor: "Section 5.1",
                lastActive: "2026-03-12T14:28:00Z",
            },
        ],
        version: 42,
        status: "published",
        conflictCount: 0,
    },
    {
        id: "cd2",
        title: "Safety Protocol — Large Venues",
        category: "Safety",
        lastEditedBy: "Jake Morrison",
        lastEditedAt: "2026-03-12T13:15:00Z",
        activeEditors: [
            {
                id: "e3",
                name: "Jake Morrison",
                avatarColor: "bg-chart-3",
                cursor: "Emergency Procedures",
                lastActive: "2026-03-12T13:15:00Z",
            },
        ],
        version: 18,
        status: "draft",
        conflictCount: 1,
    },
    {
        id: "cd3",
        title: "Brand Guidelines Template",
        category: "Creative",
        lastEditedBy: "Lisa Park",
        lastEditedAt: "2026-03-12T11:00:00Z",
        activeEditors: [],
        version: 7,
        status: "published",
        conflictCount: 0,
    },
    {
        id: "cd4",
        title: "Vendor Onboarding Checklist",
        category: "Operations",
        lastEditedBy: "Sarah Kim",
        lastEditedAt: "2026-03-11T16:45:00Z",
        activeEditors: [
            {
                id: "e4",
                name: "Sarah Kim",
                avatarColor: "bg-chart-2",
                cursor: "Document Requirements",
                lastActive: "2026-03-11T16:45:00Z",
            },
            {
                id: "e5",
                name: "Tom Rivera",
                avatarColor: "bg-chart-5",
                cursor: "Insurance Checklist",
                lastActive: "2026-03-11T16:40:00Z",
            },
            {
                id: "e6",
                name: "Lisa Park",
                avatarColor: "bg-chart-7",
                cursor: "Compliance Section",
                lastActive: "2026-03-11T16:35:00Z",
            },
        ],
        version: 31,
        status: "locked",
        conflictCount: 0,
    },
];

const MOCK_VERSIONS: VersionEntry[] = [
    {
        version: 42,
        author: "Anna Williams",
        timestamp: "2026-03-12T14:30:00Z",
        changes: "Updated Section 3.2 — Load-in procedures",
        additions: 12,
        deletions: 3,
    },
    {
        version: 41,
        author: "Marcus Chen",
        timestamp: "2026-03-12T14:15:00Z",
        changes: "Added AV setup checklist to Section 5.1",
        additions: 28,
        deletions: 0,
    },
    {
        version: 40,
        author: "Anna Williams",
        timestamp: "2026-03-12T10:30:00Z",
        changes: "Revised safety protocols per venue requirements",
        additions: 8,
        deletions: 15,
    },
    {
        version: 39,
        author: "Jake Morrison",
        timestamp: "2026-03-11T16:00:00Z",
        changes: "Added rigging specifications",
        additions: 45,
        deletions: 2,
    },
    {
        version: 38,
        author: "Sarah Kim",
        timestamp: "2026-03-11T14:00:00Z",
        changes: "Formatting cleanup and typo fixes",
        additions: 3,
        deletions: 5,
    },
];

const STATUS_BADGE: Record<string, "success" | "warning" | "default"> = {
    draft: "warning",
    published: "success",
    locked: "default",
};

export default function CollaborativeEditingPage() {
    const [selectedDoc, setSelectedDoc] = useState<CollaborativeDocument | null>(
        MOCK_DOCUMENTS[0] || null
    );

    const totalEditors = MOCK_DOCUMENTS.reduce((s, d) => s + d.activeEditors.length, 0);
    const totalVersions = MOCK_DOCUMENTS.reduce((s, d) => s + d.version, 0);
    const conflicts = MOCK_DOCUMENTS.reduce((s, d) => s + d.conflictCount, 0);

    return (
        <PermissionGate resource="knowledge_base" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Collaborative Editing"
                    description="Real-time multi-user document editing with presence indicators and conflict resolution"
                >
                    <Badge variant="info" className="text-sm px-3 py-1">
                        <Users className="mr-2 h-3.5 w-3.5" />
                        {totalEditors} active editors
                    </Badge>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Active Documents"
                        value={MOCK_DOCUMENTS.filter((d) => d.activeEditors.length > 0).length}
                        icon={FileText}
                    />
                    <StatCard title="Active Editors" value={totalEditors} icon={Users} />
                    <StatCard title="Total Revisions" value={totalVersions} icon={GitBranch} />
                    <StatCard title="Conflicts" value={conflicts} icon={Shield} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Document List */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Documents
                        </h3>
                        {MOCK_DOCUMENTS.map((doc) => (
                            <Card
                                key={doc.id}
                                className={`cursor-pointer transition-colors ${selectedDoc?.id === doc.id ? "border-primary/30 bg-primary/[0.02]" : "hover:border-primary/20"}`}
                                onClick={() => setSelectedDoc(doc)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className="text-sm font-semibold">{doc.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="ghost" className="text-[10px]">
                                                    {doc.category}
                                                </Badge>
                                                <Badge
                                                    variant={STATUS_BADGE[doc.status]}
                                                    className="text-[10px] flex items-center gap-0.5"
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
                                        <span className="text-[10px] text-muted-foreground">
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
                                                        <span className="text-[9px] text-white font-bold">
                                                            {editor.name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground ml-1">
                                                {doc.activeEditors.length} editing
                                            </span>
                                            {doc.conflictCount > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="text-[9px] ml-auto"
                                                >
                                                    {doc.conflictCount} conflict
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-[10px] text-muted-foreground mt-2">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        {doc.lastEditedBy} · {formatDate(doc.lastEditedAt)}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Selected Document Detail */}
                    <div className="lg:col-span-2 space-y-4">
                        {selectedDoc ? (
                            <>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">
                                                {selectedDoc.title}
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
                                                    {selectedDoc.status === "locked" ? (
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
                                        {selectedDoc.activeEditors.length > 0 && (
                                            <div className="mb-4 p-3 rounded-lg bg-secondary/30">
                                                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                                                    <Circle className="h-2 w-2 fill-success text-success animate-pulse" />
                                                    Currently editing
                                                </h4>
                                                <div className="space-y-2">
                                                    {selectedDoc.activeEditors.map((editor) => (
                                                        <div
                                                            key={editor.id}
                                                            className="flex items-center justify-between text-xs"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`h-5 w-5 rounded-full ${editor.avatarColor} flex items-center justify-center`}
                                                                >
                                                                    <span className="text-[8px] text-white font-bold">
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
                                        {selectedDoc.conflictCount > 0 && (
                                            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-destructive" />
                                                        <span className="text-sm font-semibold text-destructive">
                                                            {selectedDoc.conflictCount} merge
                                                            conflict detected
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
                                                    This document contains {selectedDoc.version}{" "}
                                                    revisions across{" "}
                                                    {selectedDoc.activeEditors.length + 2}{" "}
                                                    contributors.
                                                </p>
                                                <p>
                                                    Category:{" "}
                                                    <Badge variant="ghost" className="text-[10px]">
                                                        {selectedDoc.category}
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
                                        {MOCK_VERSIONS.map((v) => (
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
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {v.author} · {formatDate(v.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px]">
                                                    <span className="text-success">
                                                        +{v.additions}
                                                    </span>
                                                    <span className="text-destructive">
                                                        -{v.deletions}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 text-[10px]"
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
            </div>
        </PermissionGate>
    );
}
