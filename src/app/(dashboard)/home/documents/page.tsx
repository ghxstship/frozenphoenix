"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { DocCard } from "@/components/home";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SearchInput } from "@/components/ui/search-input";
import { OverlineText } from "@/components/ui/overline-text";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/permission-guard";
import { DOCUMENT_TYPE_MAP } from "@/config/domain-config";
import { useMyDocuments } from "@/lib/supabase/hooks-pages";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import type { DocumentStatus, DocumentType } from "@/types";
import { useMemo, useState } from "react";
import { Clock, FolderOpen, ListFilter, Plus, Star } from "lucide-react";
import Link from "next/link";
import type { DocCardItem } from "@/components/home";

const TYPE_FILTERS = [
    "all",
    "doc",
    "wiki",
    "meeting_notes",
    "specification",
    "sow",
    "template",
] as const;

const STATUS_FILTERS = ["all", "draft", "published", "pending_review"] as const;

export default function HomeDocumentsPage() {
    const { data: sbDocs, isLoading } = useMyDocuments();
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useQueryTabState({
        key: "type",
        defaultValue: "all",
        validValues: TYPE_FILTERS,
    });
    const [statusFilter, setStatusFilter] = useQueryTabState({
        key: "status",
        defaultValue: "all",
        validValues: STATUS_FILTERS,
    });

    const docs: DocCardItem[] = useMemo(
        () =>
            (sbDocs ?? []).map((d: Record<string, unknown>) => ({
                id: (d.id as string) ?? "",
                title: (d.title as string) ?? "",
                icon: (d.icon as string) ?? null,
                documentType: ((d.document_type as string) ?? "doc") as DocumentType,
                status: ((d.status as string) ?? "draft") as DocumentStatus,
                projectName: (d.project_name as string) ?? null,
                ownerName: (d.owner_name as string) ?? "",
                updatedAt: (d.updated_at as string) ?? "",
                isPublic: (d.is_public as boolean) ?? false,
                sharedWith: (d.shared_with as number) ?? 0,
                starred: (d.starred as boolean) ?? false,
                commentCount: (d.comment_count as number) ?? 0,
                wordCount: (d.word_count as number) ?? 0,
                parentTitle: (d.parent_title as string) ?? null,
            })),
        [sbDocs]
    );

    const filtered = useMemo(() => {
        return docs.filter((d) => {
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
    }, [docs, typeFilter, statusFilter, search]);

    const starred = filtered.filter((d) => d.starred);
    const recent = filtered.filter((d) => !d.starred);

    if (isLoading) return <LoadingState />;

    return (
        <PermissionGate resource="documents" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Documents"
                    description="Your documents and shared files across all projects"
                >
                    <Link href="/documents">
                        <Button variant="outline" size="sm">
                            <ListFilter className="mr-1.5 h-3.5 w-3.5" />
                            All Documents
                        </Button>
                    </Link>
                    <Link href="/documents">
                        <Button size="sm">
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            New Document
                        </Button>
                    </Link>
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
                            ).map((t) => ({
                                value: t,
                                label: DOCUMENT_TYPE_MAP[t].label,
                            })),
                        ]}
                    />
                    <SegmentedControl
                        ariaLabel="Document status filter"
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as (typeof STATUS_FILTERS)[number])}
                        size="sm"
                        options={[
                            { value: "all", label: "All" },
                            { value: "draft", label: "Draft" },
                            { value: "published", label: "Published" },
                            {
                                value: "pending_review",
                                label: "Pending Review",
                            },
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
                                <DocCard key={doc.id} doc={doc} />
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
                            <DocCard key={doc.id} doc={doc} />
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
        </PermissionGate>
    );
}
