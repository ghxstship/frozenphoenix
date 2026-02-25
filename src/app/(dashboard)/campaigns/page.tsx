"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getStatusVariant, getStatusLabel } from "@/config/ui-variants";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Chip } from "@/components/ui/chip";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import {
    MOCK_CAMPAIGNS,
    MOCK_CAMPAIGN_CHANNELS,
    MOCK_CAMPAIGN_ASSETS,
    MOCK_CAMPAIGN_KPIS,
} from "@/lib/mock-data-creative-brand";
import type { Campaign, CampaignStatus } from "@/types";
import {
    Plus,
    Megaphone,
    DollarSign,
    TrendingUp,
    BarChart3,
    Filter,
    CalendarDays,
    ChevronRight,
} from "lucide-react";

const STATUS_ORDER: CampaignStatus[] = [
    "planning",
    "brief_approved",
    "in_production",
    "review",
    "approved",
    "launching",
    "live",
    "optimizing",
    "completed",
    "archived",
];

export default function CampaignsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [view, setView] = useState<"cards" | "kanban">("cards");

    const campaigns = MOCK_CAMPAIGNS;
    const channels = MOCK_CAMPAIGN_CHANNELS;
    const assets = MOCK_CAMPAIGN_ASSETS;
    const kpis = MOCK_CAMPAIGN_KPIS;

    const filtered = useMemo(() => {
        return campaigns.filter((c) => {
            const matchesSearch =
                !search ||
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                (c.description ?? "").toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || c.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [campaigns, search, statusFilter]);

    const activeCampaigns = campaigns.filter((c) => !["archived", "completed"].includes(c.status));
    const totalBudget = campaigns.reduce((sum, c) => sum + c.total_budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent_budget, 0);
    const avgRoi = (() => {
        const withRoi = campaigns.filter((c) => c.roi !== null);
        return withRoi.length > 0
            ? (withRoi.reduce((sum, c) => sum + (c.roi ?? 0), 0) / withRoi.length).toFixed(1)
            : "—";
    })();

    function getChannelsForCampaign(campaignId: string) {
        return channels.filter((ch) => ch.campaign_id === campaignId);
    }

    function getAssetsForCampaign(campaignId: string) {
        return assets.filter((a) => a.campaign_id === campaignId);
    }

    function getKpisForCampaign(campaignId: string) {
        return kpis.filter((k) => k.campaign_id === campaignId);
    }

    function computeBudgetProgress(campaign: Campaign): number {
        if (campaign.total_budget === 0) return 0;
        return Math.round((campaign.spent_budget / campaign.total_budget) * 100);
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Campaigns" description="Multi-channel campaign lifecycle from planning through performance analysis">
                <div className="flex gap-2">
                    <div className="flex rounded-lg border border-input overflow-hidden">
                        <button
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "cards" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                            onClick={() => setView("cards")}
                        >
                            Cards
                        </button>
                        <button
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "kanban" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                            onClick={() => setView("kanban")}
                        >
                            Kanban
                        </button>
                    </div>
                    <Button size="sm">
                        <Plus className="h-4 w-4" />
                        New Campaign
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Campaigns" value={activeCampaigns.length} icon={Megaphone} />
                <StatCard title="Total Budget" value={formatCompactCurrency(totalBudget)} icon={DollarSign} />
                <StatCard title="Total Spent" value={formatCompactCurrency(totalSpent)} icon={BarChart3} />
                <StatCard title="Avg ROI" value={`${avgRoi}x`} icon={TrendingUp} />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search campaigns..." className="flex-1" />
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
            </div>

            {/* Card View */}
            {view === "cards" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((campaign, i) => {
                        const campaignChannels = getChannelsForCampaign(campaign.id);
                        const campaignAssets = getAssetsForCampaign(campaign.id);
                        const campaignKpis = getKpisForCampaign(campaign.id);
                        const budgetPct = computeBudgetProgress(campaign);

                        return (
                            <StaggerItem key={campaign.id} index={i} stagger="relaxed">
                            <Card
                                className="hover:border-primary/30 transition-colors"
                            >
                                <CardContent className="pt-5">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-semibold truncate">{campaign.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{campaign.description}</p>
                                        </div>
                                        <Badge variant={getStatusVariant(campaign.status) as "default"} className="text-[9px] flex-shrink-0 ml-2">
                                            {getStatusLabel(campaign.status)}
                                        </Badge>
                                    </div>

                                    {/* Budget Bar */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                            <span>Budget: {formatCurrency(campaign.spent_budget)} / {formatCurrency(campaign.total_budget)}</span>
                                            <span>{budgetPct}%</span>
                                        </div>
                                        <ProgressBar value={Math.min(budgetPct, 100)} size="xs" />
                                    </div>

                                    {/* Metrics Row */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                                        <div className="text-center p-1.5 rounded bg-secondary/30">
                                            <p className="text-xs font-semibold">{campaignChannels.length}</p>
                                            <p className="text-[9px] text-muted-foreground">Channels</p>
                                        </div>
                                        <div className="text-center p-1.5 rounded bg-secondary/30">
                                            <p className="text-xs font-semibold">{campaignAssets.length}</p>
                                            <p className="text-[9px] text-muted-foreground">Assets</p>
                                        </div>
                                        <div className="text-center p-1.5 rounded bg-secondary/30">
                                            <p className="text-xs font-semibold">
                                                {campaignAssets.filter((a) => a.production_status === "approved" || a.production_status === "deployed").length}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground">Approved</p>
                                        </div>
                                        <div className="text-center p-1.5 rounded bg-secondary/30">
                                            <p className="text-xs font-semibold">{campaignKpis.length}</p>
                                            <p className="text-[9px] text-muted-foreground">KPIs</p>
                                        </div>
                                    </div>

                                    {/* Channels */}
                                    {campaignChannels.length > 0 && (
                                        <div className="flex gap-1 flex-wrap mb-3">
                                            {campaignChannels.map((ch) => (
                                                <Badge key={ch.id} variant="outline" className="text-[8px]">
                                                    {(ch.label ?? ch.channel_type).replace("social_", "").replace(/_/g, " ")}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Performance (if available) */}
                                    {campaign.total_reach !== null && (
                                        <div className="pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            <div>
                                                <p className="text-[9px] text-muted-foreground">Reach</p>
                                                <p className="text-xs font-semibold">{formatCompactNumber(campaign.total_reach ?? 0)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-muted-foreground">Impressions</p>
                                                <p className="text-xs font-semibold">{formatCompactNumber(campaign.total_impressions ?? 0)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-muted-foreground">Engagements</p>
                                                <p className="text-xs font-semibold">{formatCompactNumber(campaign.total_engagements ?? 0)}</p>
                                            </div>
                                            {campaign.roi !== null && (
                                                <div>
                                                    <p className="text-[9px] text-muted-foreground">ROI</p>
                                                    <p className="text-xs font-semibold text-success">{campaign.roi}x</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* KPI Progress (if available) */}
                                    {campaignKpis.filter((k) => k.current_value !== null).length > 0 && (
                                        <div className="pt-3 mt-3 border-t border-border">
                                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">KPI Progress</p>
                                            <div className="space-y-1.5">
                                                {campaignKpis
                                                    .filter((k) => k.current_value !== null)
                                                    .map((kpi) => {
                                                        const progress = kpi.target_value
                                                            ? Math.min(Math.round(((kpi.current_value ?? 0) / kpi.target_value) * 100), 100)
                                                            : 0;
                                                        return (
                                                            <div key={kpi.id}>
                                                                <div className="flex justify-between text-[10px] mb-0.5">
                                                                    <span className="text-muted-foreground">{kpi.metric_name}</span>
                                                                    <span className="font-medium">
                                                                        {kpi.current_value} / {kpi.target_value}
                                                                    </span>
                                                                </div>
                                                                <ProgressBar value={progress} size="xs" />
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                                        <div className="flex gap-1 flex-wrap">
                                            {campaign.tags.slice(0, 3).map((tag) => (
                                                <Chip key={tag} size="sm">{tag}</Chip>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            {campaign.start_date && (
                                                <>
                                                    <CalendarDays className="h-3 w-3" />
                                                    {formatDate(campaign.start_date, "compact")}
                                                    {campaign.end_date && (
                                                        <>
                                                            <ChevronRight className="h-3 w-3" />
                                                            {formatDate(campaign.end_date, "compact")}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            </StaggerItem>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No campaigns match your filters</p>
                        </div>
                    )}
                </div>
            )}

            {/* Kanban View */}
            {view === "kanban" && (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {STATUS_ORDER.filter((s) => s !== "archived").map((status) => {
                        const statusCampaigns = filtered.filter((c) => c.status === status);
                        return (
                            <div key={status} className="flex-shrink-0 w-72">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getStatusVariant(status) as "default"} className="text-[9px]">
                                            {getStatusLabel(status)}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{statusCampaigns.length}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {statusCampaigns.map((c) => (
                                        <Card key={c.id} className="hover:border-primary/30 transition-colors cursor-pointer">
                                            <CardContent className="pt-3 pb-3">
                                                <p className="text-xs font-semibold truncate">{c.name}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(c.total_budget)}</p>
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {c.tags.slice(0, 2).map((tag) => (
                                                        <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full bg-secondary/50">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {statusCampaigns.length === 0 && (
                                        <div className="p-4 border border-dashed border-border rounded-lg text-center">
                                            <p className="text-[10px] text-muted-foreground">No campaigns</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function formatCompactNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toString();
}
