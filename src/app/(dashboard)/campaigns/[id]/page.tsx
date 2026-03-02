"use client";

import { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Chip } from "@/components/ui/chip";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import {
    MOCK_CAMPAIGN_ASSETS,
    MOCK_CAMPAIGN_CHANNELS,
    MOCK_CAMPAIGN_KPIS,
    MOCK_CAMPAIGNS,
} from "@/lib/demo-data-creative-brand";
import {
    BarChart3,
    CalendarDays,
    DollarSign,
    ImageIcon,
    Megaphone,
    Play,
    Target,
    TrendingUp,
} from "lucide-react";

type TabId = "overview" | "channels" | "assets" | "performance" | "chatter";
const TAB_VALUES = ["overview", "channels", "assets", "performance", "chatter"] as const;

export default function CampaignDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });

    const campaign = MOCK_CAMPAIGNS[0]!;
    const channels = MOCK_CAMPAIGN_CHANNELS.filter((ch) => ch.campaign_id === campaign.id);
    const assets = MOCK_CAMPAIGN_ASSETS.filter((a) => a.campaign_id === campaign.id);
    const kpis = MOCK_CAMPAIGN_KPIS.filter((k) => k.campaign_id === campaign.id);
    const budgetPct =
        campaign.total_budget > 0
            ? Math.round((campaign.spent_budget / campaign.total_budget) * 100)
            : 0;

    const [chatterComments, setChatterComments] = useState<CommentItem[]>(makeMockComments());
    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "Sarah Chen",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "channels" as const, label: "Channels", count: channels.length },
        { id: "assets" as const, label: "Assets", count: assets.length },
        { id: "performance" as const, label: "Performance", count: kpis.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Campaign Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(campaign.status) as "default"}>
                            {getStatusLabel(campaign.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium capitalize">
                            {campaign.objective ?? "General"}
                        </span>
                    </div>
                    {campaign.start_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Start</span>
                            <span className="font-medium">
                                {formatDate(campaign.start_date, "compact")}
                            </span>
                        </div>
                    )}
                    {campaign.end_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">End</span>
                            <span className="font-medium">
                                {formatDate(campaign.end_date, "compact")}
                            </span>
                        </div>
                    )}
                    {campaign.roi !== null && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ROI</span>
                            <span className="font-bold text-success">{campaign.roi}x</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Budget</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold">{formatCurrency(campaign.total_budget)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="font-medium">{formatCurrency(campaign.spent_budget)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-medium">
                            {formatCurrency(campaign.total_budget - campaign.spent_budget)}
                        </span>
                    </div>
                    <ProgressBar value={Math.min(budgetPct, 100)} size="sm" />
                    <p className="text-xs text-muted-foreground text-center">
                        {budgetPct}% utilized
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                        {campaign.tags.map((tag) => (
                            <Chip key={tag} size="sm">
                                {tag}
                            </Chip>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/campaigns"
            backLabel="Campaigns"
            title={campaign.name}
            subtitle={campaign.description ?? ""}
            status={campaign.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Megaphone className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm">
                    <Play className="h-4 w-4 mr-1" />
                    Launch
                </Button>
            }
            menuItems={[
                { label: "Edit Campaign", onClick: () => {} },
                { label: "Duplicate", onClick: () => {} },
                { label: "Archive", onClick: () => {}, variant: "destructive" },
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">Budget</p>
                                        <p className="text-sm font-bold">
                                            {formatCurrency(campaign.total_budget)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="h-5 w-5 text-info" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Channels
                                        </p>
                                        <p className="text-sm font-bold">{channels.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <ImageIcon className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">Assets</p>
                                        <p className="text-sm font-bold">{assets.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-5 w-5 text-success" />
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">ROI</p>
                                        <p className="text-sm font-bold">
                                            {campaign.roi !== null ? `${campaign.roi}x` : "—"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {campaign.total_reach !== null && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Performance Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="text-center p-3 rounded-lg bg-secondary/20">
                                        <p className="text-xs text-muted-foreground">Reach</p>
                                        <p className="text-lg font-bold">
                                            {formatCompactNumber(campaign.total_reach ?? 0)}
                                        </p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-secondary/20">
                                        <p className="text-xs text-muted-foreground">Impressions</p>
                                        <p className="text-lg font-bold">
                                            {formatCompactNumber(campaign.total_impressions ?? 0)}
                                        </p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-secondary/20">
                                        <p className="text-xs text-muted-foreground">Engagements</p>
                                        <p className="text-lg font-bold">
                                            {formatCompactNumber(campaign.total_engagements ?? 0)}
                                        </p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-secondary/20">
                                        <p className="text-xs text-muted-foreground">Conversions</p>
                                        <p className="text-lg font-bold">
                                            {formatCompactNumber(campaign.total_conversions ?? 0)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {campaign.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {campaign.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {campaign.start_date && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Start</p>
                                        <p className="font-medium">
                                            {formatDate(campaign.start_date, "long")}
                                        </p>
                                    </div>
                                    {campaign.end_date && (
                                        <>
                                            <span className="text-muted-foreground">→</span>
                                            <div>
                                                <p className="text-xs text-muted-foreground">End</p>
                                                <p className="font-medium">
                                                    {formatDate(campaign.end_date, "long")}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "channels" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Channels ({channels.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {channels.map((ch) => (
                                <div
                                    key={ch.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                >
                                    <div>
                                        <p className="text-sm font-semibold capitalize">
                                            {(ch.label ?? ch.channel_type).replace(/_/g, " ")}
                                        </p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {ch.channel_type.replace(/_/g, " ")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="font-medium">
                                            {formatCurrency(ch.budget_allocation)}
                                        </span>
                                        <Badge
                                            variant={ch.status === "active" ? "success" : "ghost"}
                                        >
                                            {ch.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                            {channels.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No channels configured yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "assets" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Assets ({assets.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {assets.map((asset) => (
                                <div
                                    key={asset.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                >
                                    <div>
                                        <p className="text-sm font-semibold">{asset.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {asset.asset_role.replace(/_/g, " ")}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            getStatusVariant(asset.production_status) as "default"
                                        }
                                    >
                                        {getStatusLabel(asset.production_status)}
                                    </Badge>
                                </div>
                            ))}
                            {assets.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No assets created yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "performance" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            KPIs ({kpis.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {kpis.map((kpi) => {
                                const progress = kpi.target_value
                                    ? Math.min(
                                          Math.round(
                                              ((kpi.current_value ?? 0) / kpi.target_value) * 100
                                          ),
                                          100
                                      )
                                    : 0;
                                return (
                                    <div key={kpi.id} className="p-3 rounded-lg bg-secondary/20">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium">{kpi.metric_name}</span>
                                            <span className="text-muted-foreground">
                                                {kpi.current_value ?? "—"} /{" "}
                                                {kpi.target_value ?? "—"}
                                            </span>
                                        </div>
                                        <ProgressBar value={progress} size="sm" />
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {progress}% of target
                                        </p>
                                    </div>
                                );
                            })}
                            {kpis.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No KPIs defined yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="campaign"
                    recordId={campaign.id}
                    activityItems={makeMockActivity("campaign")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}

function formatCompactNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toString();
}
