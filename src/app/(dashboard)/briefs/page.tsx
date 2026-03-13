"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React, { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_BRIEF_CONFIG } from "@/config/create-entity-configs";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { OverlineText } from "@/components/ui/overline-text";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import type { BriefTemplate } from "@/types/creative-brand";
import { CREATIVE_BRIEF_TYPE_MAP } from "@/config/domain-config";
import { useBriefs, useBriefTemplates } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import type { CreativeBrief, CreativeBriefStatus, CreativeBriefType } from "@/types";
import {
    CalendarDays,
    ChevronRight,
    DollarSign,
    FileText,
    LayoutTemplate,
    Plus,
    Target,
    Users,
} from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";

const BRIEF_TYPE_ICONS: Record<CreativeBriefType, string> = {
    brand: "🎨",
    campaign: "📢",
    product: "🚀",
    event: "🎪",
    social: "📱",
    content: "✍️",
    experiential: "🌟",
};

const STATUS_ORDER: CreativeBriefStatus[] = [
    "draft",
    "stakeholder_review",
    "strategy_approved",
    "budget_approved",
    "final_approved",
    "active",
    "completed",
    "archived",
];

export default function BriefsPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const { data: sbBriefs, isLoading } = useBriefs();

    const briefs = useMemo(() => (sbBriefs ?? []) as unknown as CreativeBrief[], [sbBriefs]);
    const { data: sbTemplates } = useBriefTemplates();
    const templates: BriefTemplate[] = (sbTemplates ?? []) as unknown as BriefTemplate[];

    const filtered = useMemo(() => {
        return briefs.filter((b) => {
            const matchesSearch =
                !search ||
                b.title.toLowerCase().includes(search.toLowerCase()) ||
                (b.objective_summary ?? "").toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || b.status === statusFilter;
            const matchesType = typeFilter === "all" || b.brief_type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [briefs, search, statusFilter, typeFilter]);

    const activeBriefs = briefs.filter((b) => !["archived", "completed"].includes(b.status));
    const totalBudget = briefs.reduce((sum, b) => sum + b.total_budget, 0);
    const avgDeliverables =
        briefs.length > 0
            ? Math.round(
                  briefs.reduce((sum, b) => sum + b.deliverable_manifest.length, 0) / briefs.length
              )
            : 0;

    function computeStatusProgress(status: CreativeBriefStatus): number {
        const idx = STATUS_ORDER.indexOf(status);
        return idx >= 0 ? Math.round(((idx + 1) / STATUS_ORDER.length) * 100) : 0;
    }

    if (isLoading) {
        return <LoadingState />;
    }

    return (
        <PermissionGate resource="briefs" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Creative Briefs"
                    description="Strategic briefs connecting creative intent to measurable outcomes"
                >
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        New Brief
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Active Briefs" value={activeBriefs.length} icon={FileText} />
                    <StatCard
                        title="Total Budget"
                        value={formatCurrency(totalBudget)}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Avg Deliverables"
                        value={avgDeliverables}
                        icon={Target}
                        description="per brief"
                    />
                    <StatCard title="Templates" value={templates.length} icon={LayoutTemplate} />
                </div>

                {/* Templates Quick Access */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
                            Quick Start Templates
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3 overflow-x-auto pb-1">
                            {templates.map((t) => (
                                <button
                                    key={t.id}
                                    className="flex-shrink-0 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/20 transition-colors text-left min-w-[200px]"
                                >
                                    <p className="text-sm font-medium">{t.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {t.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge
                                            variant={getStatusVariant(t.brief_type) as "default"}
                                            className="text-[9px]"
                                        >
                                            {t.brief_type}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">
                                            Used {t.usage_count}x
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search briefs..."
                        className="flex-1"
                    />
                    <div className="flex gap-2">
                        <select
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            {STATUS_ORDER.map((s) => (
                                <option key={s} value={s}>
                                    {getStatusLabel(s)}
                                </option>
                            ))}
                        </select>
                        <select
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            {Object.keys(BRIEF_TYPE_ICONS).map((t) => (
                                <option key={t} value={t}>
                                    {CREATIVE_BRIEF_TYPE_MAP[t as CreativeBriefType]?.label ?? t}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Brief Cards */}
                {filtered.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No briefs found"
                        description={
                            search
                                ? "Try adjusting your search or filters"
                                : "Create your first brief"
                        }
                        action={!search ? { label: "New Brief", onClick: openCreate } : undefined}
                    />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filtered.map((brief, i) => (
                            <BriefCard
                                key={brief.id}
                                brief={brief}
                                index={i}
                                statusProgress={computeStatusProgress(brief.status)}
                            />
                        ))}
                    </div>
                )}
            </div>
            <CreateEntityDialog
                config={CREATE_BRIEF_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}

function BriefCard({
    brief,
    index,
    statusProgress,
}: {
    brief: CreativeBrief;
    index: number;
    statusProgress: number;
}) {
    return (
        <StaggerItem index={index} stagger="relaxed">
            <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="text-2xl flex-shrink-0">
                                {BRIEF_TYPE_ICONS[brief.brief_type]}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold truncate">{brief.title}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                    {brief.objective_summary}
                                </p>
                            </div>
                        </div>
                        <Badge
                            variant={getStatusVariant(brief.status) as "default"}
                            className="text-[9px] flex-shrink-0 ml-2"
                        >
                            {getStatusLabel(brief.status)}
                        </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                        <ProgressBar value={statusProgress} size="xs" />
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {statusProgress}% through lifecycle
                        </p>
                    </div>

                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        <div className="text-center p-2 rounded bg-secondary/30">
                            <DollarSign className="h-3 w-3 text-muted-foreground mx-auto mb-0.5" />
                            <p className="text-xs font-semibold">
                                {formatCurrency(brief.total_budget)}
                            </p>
                            <p className="text-[9px] text-muted-foreground">Budget</p>
                        </div>
                        <div className="text-center p-2 rounded bg-secondary/30">
                            <Target className="h-3 w-3 text-muted-foreground mx-auto mb-0.5" />
                            <p className="text-xs font-semibold">
                                {brief.deliverable_manifest.length}
                            </p>
                            <p className="text-[9px] text-muted-foreground">Deliverables</p>
                        </div>
                        <div className="text-center p-2 rounded bg-secondary/30">
                            <Users className="h-3 w-3 text-muted-foreground mx-auto mb-0.5" />
                            <p className="text-xs font-semibold">{brief.channels.length}</p>
                            <p className="text-[9px] text-muted-foreground">Channels</p>
                        </div>
                    </div>

                    {/* Channels & Timeline */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1 flex-wrap">
                            {brief.channels.slice(0, 3).map((ch) => (
                                <Badge key={ch} variant="outline" className="text-[8px]">
                                    {ch.replace("social_", "").replace("_", " ")}
                                </Badge>
                            ))}
                            {brief.channels.length > 3 && (
                                <Badge variant="outline" className="text-[8px]">
                                    +{brief.channels.length - 3}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            {brief.start_date && (
                                <>
                                    <CalendarDays className="h-3 w-3" />
                                    {formatDate(brief.start_date, "compact")}
                                    {brief.end_date && (
                                        <>
                                            <ChevronRight className="h-3 w-3" />
                                            {formatDate(brief.end_date, "compact")}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* KPIs Preview */}
                    {brief.kpi_definitions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                            <OverlineText className="mb-1.5">KPIs</OverlineText>
                            <div className="flex gap-2 flex-wrap">
                                {brief.kpi_definitions.slice(0, 3).map((kpi, j) => (
                                    <span
                                        key={j}
                                        className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50"
                                    >
                                        {kpi.metric}:{" "}
                                        <span className="font-semibold">
                                            {kpi.target.toLocaleString()}
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Retrospective Notes */}
                    {brief.retrospective_notes && (
                        <div className="mt-3 pt-3 border-t border-border">
                            <OverlineText className="mb-1">Retrospective</OverlineText>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {brief.retrospective_notes}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </StaggerItem>
    );
}
