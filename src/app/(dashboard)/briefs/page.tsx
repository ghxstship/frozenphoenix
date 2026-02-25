"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getStatusVariant, getStatusLabel } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import { MOCK_CREATIVE_BRIEFS, MOCK_BRIEF_TEMPLATES } from "@/lib/mock-data-creative-brand";
import type { CreativeBrief, CreativeBriefStatus, CreativeBriefType } from "@/types";
import {
    Plus,
    Search,
    FileText,
    Target,
    DollarSign,
    Filter,
    ChevronRight,
    CalendarDays,
    Users,
    LayoutTemplate,
} from "lucide-react";

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
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");

    const briefs = MOCK_CREATIVE_BRIEFS;
    const templates = MOCK_BRIEF_TEMPLATES;

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
            ? Math.round(briefs.reduce((sum, b) => sum + b.deliverable_manifest.length, 0) / briefs.length)
            : 0;

    function computeStatusProgress(status: CreativeBriefStatus): number {
        const idx = STATUS_ORDER.indexOf(status);
        return idx >= 0 ? Math.round(((idx + 1) / STATUS_ORDER.length) * 100) : 0;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Creative Briefs" description="Strategic briefs connecting creative intent to measurable outcomes">
                <Button size="sm">
                    <Plus className="h-4 w-4" />
                    New Brief
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Briefs" value={activeBriefs.length} icon={FileText} />
                <StatCard title="Total Budget" value={formatCurrency(totalBudget)} icon={DollarSign} />
                <StatCard title="Avg Deliverables" value={avgDeliverables} icon={Target} description="per brief" />
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
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={getStatusVariant(t.brief_type) as "default"} className="text-[9px]">
                                        {t.brief_type}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground">Used {t.usage_count}x</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search briefs..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
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
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Brief Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map((brief, i) => (
                    <BriefCard key={brief.id} brief={brief} index={i} statusProgress={computeStatusProgress(brief.status)} />
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No briefs match your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function BriefCard({ brief, index, statusProgress }: { brief: CreativeBrief; index: number; statusProgress: number }) {
    return (
        <Card className="hover:border-primary/30 transition-colors animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
            <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-2xl flex-shrink-0">{BRIEF_TYPE_ICONS[brief.brief_type]}</div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold truncate">{brief.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{brief.objective_summary}</p>
                        </div>
                    </div>
                    <Badge variant={getStatusVariant(brief.status) as "default"} className="text-[9px] flex-shrink-0 ml-2">
                        {getStatusLabel(brief.status)}
                    </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${statusProgress}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{statusProgress}% through lifecycle</p>
                </div>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 rounded bg-secondary/30">
                        <DollarSign className="h-3 w-3 text-muted-foreground mx-auto mb-0.5" />
                        <p className="text-xs font-semibold">{formatCurrency(brief.total_budget)}</p>
                        <p className="text-[9px] text-muted-foreground">Budget</p>
                    </div>
                    <div className="text-center p-2 rounded bg-secondary/30">
                        <Target className="h-3 w-3 text-muted-foreground mx-auto mb-0.5" />
                        <p className="text-xs font-semibold">{brief.deliverable_manifest.length}</p>
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
                                {new Date(brief.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                {brief.end_date && (
                                    <>
                                        <ChevronRight className="h-3 w-3" />
                                        {new Date(brief.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* KPIs Preview */}
                {brief.kpi_definitions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">KPIs</p>
                        <div className="flex gap-2 flex-wrap">
                            {brief.kpi_definitions.slice(0, 3).map((kpi, j) => (
                                <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50">
                                    {kpi.metric}: <span className="font-semibold">{kpi.target.toLocaleString()}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Retrospective Notes */}
                {brief.retrospective_notes && (
                    <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Retrospective</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{brief.retrospective_notes}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
