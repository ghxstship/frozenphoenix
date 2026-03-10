"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React, { useMemo, useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_CASE_STUDY_CONFIG } from "@/config/create-entity-configs";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { OverlineText } from "@/components/ui/overline-text";
import { Badge } from "@/components/ui/badge";
import { useCaseStudies } from "@/lib/supabase/hooks";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/layouts/empty-state";
import { Award, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaggerItem } from "@/components/ui/stagger-container";
import { PermissionGate } from "@/components/permission-guard";

export default function CaseStudiesPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
    const { data: sbCaseStudies, isLoading } = useCaseStudies();

    const caseStudies = (sbCaseStudies ?? []).map((cs) => ({
        id: cs.id,
        projectId: cs.project_id,
        title: cs.title,
        client: cs.client,
        summary: cs.summary,
        status: cs.status as "draft" | "published",
        metrics: (
            (
                cs as unknown as {
                    case_study_metrics?: Array<{ label: string; value: string }>;
                }
            ).case_study_metrics || []
        ).map((m) => ({
            label: m.label,
            value: m.value,
        })),
        publishedAt: cs.published_at ?? undefined,
        createdAt: cs.created_at,
    }));

    const filtered = useMemo(() => {
        return caseStudies.filter((cs) => {
            const matchesSearch = !search || cs.title.toLowerCase().includes(search.toLowerCase()) || cs.client.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || cs.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [caseStudies, search, statusFilter]);

    if (isLoading) {
        return (
            <LoadingState />
        );
    }
    return (
        <PermissionGate resource="case_studies" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Case Studies"
                    description="Auto-published from completed productions"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Award className="h-4 w-4" /> Publish New
                    </Button>
                </PageHeader>

                <div className="flex items-center gap-3 mb-2">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search case studies..."
                        className="flex-1 max-w-sm"
                    />
                    <div className="flex gap-1">
                        {(["all", "draft", "published"] as const).map((s) => (
                            <Button
                                key={s}
                                variant={statusFilter === s ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setStatusFilter(s)}
                            >
                                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <EmptyState
                        icon={Award}
                        title="No case studies found"
                        description={search || statusFilter !== "all" ? "Try adjusting your filters" : "Publish your first case study from a completed production"}
                        action={!search && statusFilter === "all" ? { label: "Publish New", onClick: openCreate } : undefined}
                    />
                ) : (
                <div className="space-y-4">
                    {filtered.map((cs, i) => (
                        <StaggerItem key={cs.id} index={i} stagger="relaxed">
                            <Card>
                                <CardContent>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <Badge variant="info" className="mb-2">
                                                {cs.client}
                                            </Badge>
                                            <h3 className="text-lg font-bold">{cs.title}</h3>
                                        </div>
                                        <Badge
                                            variant={
                                                cs.status === "published" ? "success" : "ghost"
                                            }
                                        >
                                            {cs.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                        {cs.summary}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {cs.metrics.map((m) => (
                                            <div
                                                key={m.label}
                                                className="px-3 py-2 rounded-xl bg-secondary"
                                            >
                                                <p className="text-lg font-bold">{m.value}</p>
                                                <OverlineText>{m.label}</OverlineText>
                                            </div>
                                        ))}
                                    </div>
                                    {cs.status === "published" && (
                                        <div className="mt-4 flex items-center gap-2 text-xs text-primary">
                                            <Globe className="h-3.5 w-3.5" />
                                            Published to landing page
                                            <ExternalLink className="h-3 w-3" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    ))}
                </div>
                )}
            </div>
            <CreateEntityDialog config={CREATE_CASE_STUDY_CONFIG} open={createOpen} onClose={closeCreate} />
        </PermissionGate>
    );
}
