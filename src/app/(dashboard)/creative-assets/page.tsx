"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getStatusVariant, getStatusLabel } from "@/config/ui-variants";
import {
    MOCK_CAMPAIGN_ASSETS,
    MOCK_CREATIVE_REVIEWS,
    MOCK_CAMPAIGNS,
} from "@/lib/mock-data-creative-brand";
import type { CampaignAsset, CreativeReview, CampaignAssetProductionStatus } from "@/types";
import {
    Plus,
    Search,
    CheckCircle2,
    Clock,
    Filter,
    Shield,
    Globe,
    Layers,
} from "lucide-react";

const STATUS_ORDER: CampaignAssetProductionStatus[] = [
    "briefed",
    "in_production",
    "in_review",
    "revision_requested",
    "approved",
    "deployed",
    "retired",
];

const GATE_LABELS: Record<string, string> = {
    creative_director: "Creative Director",
    brand_compliance: "Brand Compliance",
    legal: "Legal",
    stakeholder: "Stakeholder",
    client: "Client",
};

export default function CreativeAssetsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [view, setView] = useState<"board" | "list">("board");

    const assets = MOCK_CAMPAIGN_ASSETS;
    const reviews = MOCK_CREATIVE_REVIEWS;
    const campaigns = MOCK_CAMPAIGNS;

    const filtered = useMemo(() => {
        return assets.filter((a) => {
            const matchesSearch =
                !search || a.name.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "all" || a.production_status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [assets, search, statusFilter]);

    function getReviewsForAsset(assetId: string): CreativeReview[] {
        return reviews.filter((r) => r.campaign_asset_id === assetId);
    }

    function getCampaignName(campaignId: string): string {
        return campaigns.find((c) => c.id === campaignId)?.name ?? "Unknown";
    }

    const totalAssets = assets.length;
    const approvedCount = assets.filter((a) => a.production_status === "approved" || a.production_status === "deployed").length;
    const pendingReviewCount = assets.filter((a) => a.production_status === "in_review").length;
    const avgComplianceScore = (() => {
        const withScore = assets.filter((a) => a.brand_compliance_score !== null);
        return withScore.length > 0
            ? Math.round(withScore.reduce((sum, a) => sum + (a.brand_compliance_score ?? 0), 0) / withScore.length)
            : 0;
    })();

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Creative Assets" description="Campaign asset production, review workflow, and brand compliance tracking">
                <div className="flex gap-2">
                    <div className="flex rounded-lg border border-input overflow-hidden">
                        <button
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "board" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                            onClick={() => setView("board")}
                        >
                            Board
                        </button>
                        <button
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                            onClick={() => setView("list")}
                        >
                            List
                        </button>
                    </div>
                    <Button size="sm">
                        <Plus className="h-4 w-4" />
                        New Asset
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Assets" value={totalAssets} icon={Layers} />
                <StatCard title="Approved / Deployed" value={approvedCount} icon={CheckCircle2} />
                <StatCard title="Pending Review" value={pendingReviewCount} icon={Clock} />
                <StatCard title="Avg Compliance" value={`${avgComplianceScore}%`} icon={Shield} />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search assets..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
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

            {/* Board View */}
            {view === "board" && (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {STATUS_ORDER.filter((s) => s !== "retired").map((status) => {
                        const statusAssets = filtered.filter((a) => a.production_status === status);
                        return (
                            <div key={status} className="flex-shrink-0 w-72">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant={getStatusVariant(status) as "default"} className="text-[9px]">
                                        {getStatusLabel(status)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{statusAssets.length}</span>
                                </div>
                                <div className="space-y-2">
                                    {statusAssets.map((asset) => (
                                        <AssetCard
                                            key={asset.id}
                                            asset={asset}
                                            reviews={getReviewsForAsset(asset.id)}
                                            campaignName={getCampaignName(asset.campaign_id)}
                                        />
                                    ))}
                                    {statusAssets.length === 0 && (
                                        <div className="p-4 border border-dashed border-border rounded-lg text-center">
                                            <p className="text-[10px] text-muted-foreground">No assets</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {view === "list" && (
                <div className="space-y-2">
                    {filtered.map((asset, i) => (
                        <AssetListRow
                            key={asset.id}
                            asset={asset}
                            reviews={getReviewsForAsset(asset.id)}
                            campaignName={getCampaignName(asset.campaign_id)}
                            index={i}
                        />
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No assets match your filters</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function AssetCard({
    asset,
    reviews,
    campaignName,
}: {
    asset: CampaignAsset;
    reviews: CreativeReview[];
    campaignName: string;
}) {
    const approvedGates = reviews.filter((r) => r.status === "approved").length;
    const totalGates = reviews.length;

    return (
        <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between mb-1.5">
                    <p className="text-xs font-semibold truncate flex-1">{asset.name}</p>
                    <Badge variant="outline" className="text-[8px] flex-shrink-0 ml-1">
                        {asset.asset_role}
                    </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">{campaignName}</p>

                {/* Compliance Score */}
                {asset.brand_compliance_score !== null && (
                    <div className="mb-2">
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Compliance
                            </span>
                            <span className={`font-semibold ${asset.brand_compliance_score >= 90 ? "text-success" : asset.brand_compliance_score >= 70 ? "text-warning" : "text-destructive"}`}>
                                {asset.brand_compliance_score}%
                            </span>
                        </div>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                            <div
                                className={`h-full rounded-full ${asset.brand_compliance_score >= 90 ? "bg-success" : asset.brand_compliance_score >= 70 ? "bg-warning" : "bg-destructive"}`}
                                style={{ width: `${asset.brand_compliance_score}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Review Gates */}
                {totalGates > 0 && (
                    <div className="flex items-center gap-1.5 mb-2">
                        {reviews.map((r) => (
                            <div
                                key={r.id}
                                className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] ${
                                    r.status === "approved"
                                        ? "bg-success/20 text-success"
                                        : r.status === "rejected" || r.status === "revision_requested"
                                        ? "bg-destructive/20 text-destructive"
                                        : "bg-muted text-muted-foreground"
                                }`}
                                title={`${GATE_LABELS[r.gate_type] ?? r.gate_type}: ${getStatusLabel(r.status)}`}
                            >
                                {r.status === "approved" ? "✓" : r.status === "rejected" ? "✗" : "·"}
                            </div>
                        ))}
                        <span className="text-[9px] text-muted-foreground">
                            {approvedGates}/{totalGates} gates
                        </span>
                    </div>
                )}

                {/* Channels & Locale */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                        {asset.target_channels.slice(0, 2).map((ch) => (
                            <Badge key={ch} variant="outline" className="text-[7px]">
                                {ch.replace("social_", "").replace(/_/g, " ")}
                            </Badge>
                        ))}
                    </div>
                    {asset.locale !== "en-US" && (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                            <Globe className="h-2.5 w-2.5" />
                            {asset.locale}
                        </span>
                    )}
                </div>

                {/* Due Date */}
                {asset.due_date && (
                    <p className="text-[9px] text-muted-foreground mt-1.5">
                        Due: {new Date(asset.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function AssetListRow({
    asset,
    reviews,
    campaignName,
    index,
}: {
    asset: CampaignAsset;
    reviews: CreativeReview[];
    campaignName: string;
    index: number;
}) {
    const approvedGates = reviews.filter((r) => r.status === "approved").length;
    const totalGates = reviews.length;

    return (
        <Card
            className="hover:border-primary/30 transition-colors animate-slide-up"
            style={{ animationDelay: `${index * 30}ms` }}
        >
            <CardContent className="py-3 flex items-center gap-4">
                {/* Status */}
                <Badge
                    variant={getStatusVariant(asset.production_status) as "default"}
                    className="text-[9px] w-24 justify-center flex-shrink-0"
                >
                    {getStatusLabel(asset.production_status)}
                </Badge>

                {/* Name & Campaign */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{asset.name}</p>
                    <p className="text-[10px] text-muted-foreground">{campaignName}</p>
                </div>

                {/* Role */}
                <Badge variant="outline" className="text-[9px] flex-shrink-0">
                    {asset.asset_role}
                </Badge>

                {/* Compliance */}
                <div className="flex-shrink-0 w-16 text-right">
                    {asset.brand_compliance_score !== null ? (
                        <span className={`text-xs font-semibold ${asset.brand_compliance_score >= 90 ? "text-success" : asset.brand_compliance_score >= 70 ? "text-warning" : "text-destructive"}`}>
                            {asset.brand_compliance_score}%
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                    )}
                </div>

                {/* Review Gates */}
                <div className="flex-shrink-0 w-20 text-right">
                    {totalGates > 0 ? (
                        <span className="text-xs">
                            <span className="font-semibold text-success">{approvedGates}</span>
                            <span className="text-muted-foreground">/{totalGates} gates</span>
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">No reviews</span>
                    )}
                </div>

                {/* Channels */}
                <div className="flex gap-1 flex-shrink-0">
                    {asset.target_channels.slice(0, 2).map((ch) => (
                        <Badge key={ch} variant="outline" className="text-[8px]">
                            {ch.replace("social_", "").replace(/_/g, " ")}
                        </Badge>
                    ))}
                </div>

                {/* Due Date */}
                <div className="flex-shrink-0 w-20 text-right text-[10px] text-muted-foreground">
                    {asset.due_date
                        ? new Date(asset.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "—"}
                </div>
            </CardContent>
        </Card>
    );
}
