"use client";

import { useRouter } from "next/navigation";
import {
    useCampaign,
    useCampaignAssets,
    useCampaignChannels,
    useCampaignKPIs,
    useDeleteCampaign,
    useUpdateCampaign,
} from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Chip } from "@/components/ui/chip";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
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

function formatCompactNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toString();
}

type ChannelView = {
    id: string;
    label: string;
    channel_type: string;
    budget_allocation: number;
    status: string;
};
type AssetView = { id: string; name: string; asset_role: string; production_status: string };
type KpiView = {
    id: string;
    metric_name: string;
    current_value: number | null;
    target_value: number | null;
};

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "campaign",
    titleKey: "name",
    statusKey: "status",
    icon: Megaphone,
    backHref: "/campaigns",
    backLabel: "Campaigns",
    chatterRecordType: "campaign",
    fields: [
        { id: "objective", label: "Objective", accessorKey: "objective", fieldType: "status" },
        {
            id: "total_budget",
            label: "Budget",
            accessorKey: "total_budget",
            fieldType: "currency",
            icon: DollarSign,
        },
        { id: "start_date", label: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", label: "End", accessorKey: "end_date", fieldType: "date" },
        { id: "roi", label: "ROI", accessorKey: "roi" },
    ],
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        { id: "objective", label: "Type", accessorKey: "objective", fieldType: "status" },
        { id: "start_date", label: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", label: "End", accessorKey: "end_date", fieldType: "date" },
        { id: "roi", label: "ROI", accessorKey: "roi" },
    ],
    tabs: [],
};

export function CampaignDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { data: campaign, isLoading } = useCampaign(id);
    const rec = campaign ?? initialRecord;
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Campaign",
        listPath: "/campaigns",
        useUpdateHook: useUpdateCampaign,
        useDeleteHook: useDeleteCampaign,
    });
    const { data: sbChannels } = useCampaignChannels({ campaign_id: id });
    const { data: sbAssets } = useCampaignAssets({ campaign_id: id });
    const { data: sbKpis } = useCampaignKPIs({ campaign_id: id });

    const channels: ChannelView[] = (sbChannels ?? []).map((r: Record<string, unknown>) => ({
        id: String(r.id ?? ""),
        label: String(r.label ?? ""),
        channel_type: String(r.channel_type ?? ""),
        budget_allocation: Number(r.budget_allocation ?? 0),
        status: String(r.status ?? ""),
    }));
    const assets: AssetView[] = (sbAssets ?? []).map((r: Record<string, unknown>) => ({
        id: String(r.id ?? ""),
        name: String(r.name ?? ""),
        asset_role: String(r.asset_role ?? ""),
        production_status: String(r.production_status ?? ""),
    }));
    const kpis: KpiView[] = (sbKpis ?? []).map((r: Record<string, unknown>) => ({
        id: String(r.id ?? ""),
        metric_name: String(r.metric_name ?? ""),
        current_value: r.current_value != null ? Number(r.current_value) : null,
        target_value: r.target_value != null ? Number(r.target_value) : null,
    }));
    const budgetPct =
        rec && (((rec as Record<string, unknown>).total_budget as number) ?? 0) > 0
            ? Math.round(
                  ((((rec as Record<string, unknown>).spent_budget as number) ?? 0) /
                      (((rec as Record<string, unknown>).total_budget as number) ?? 1)) *
                      100
              )
            : 0;

    const camp = rec as Record<string, unknown> | null;

    const sidebarSlot = camp ? (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Budget</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold">
                            {formatCurrency((camp.total_budget as number) ?? 0)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="font-medium">
                            {formatCurrency((camp.spent_budget as number) ?? 0)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-medium">
                            {formatCurrency(
                                ((camp.total_budget as number) ?? 0) -
                                    ((camp.spent_budget as number) ?? 0)
                            )}
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
                        {((camp.tags as string[]) ?? []).map((tag: string) => (
                            <Chip key={tag} size="sm">
                                {tag}
                            </Chip>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    ) : undefined;

    const overviewSlot = camp ? (
        <div className="space-y-6">
            {camp.total_reach !== null && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="text-center p-3 rounded-lg bg-secondary/20">
                                <p className="text-xs text-muted-foreground">Reach</p>
                                <p className="text-lg font-bold">
                                    {formatCompactNumber((camp.total_reach as number) ?? 0)}
                                </p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-secondary/20">
                                <p className="text-xs text-muted-foreground">Impressions</p>
                                <p className="text-lg font-bold">
                                    {formatCompactNumber((camp.total_impressions as number) ?? 0)}
                                </p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-secondary/20">
                                <p className="text-xs text-muted-foreground">Engagements</p>
                                <p className="text-lg font-bold">
                                    {formatCompactNumber((camp.total_engagements as number) ?? 0)}
                                </p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-secondary/20">
                                <p className="text-xs text-muted-foreground">Conversions</p>
                                <p className="text-lg font-bold">
                                    {formatCompactNumber((camp.total_conversions as number) ?? 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            {typeof camp.description === "string" && camp.description && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {camp.description}
                        </p>
                    </CardContent>
                </Card>
            )}
            {typeof camp.start_date === "string" && camp.start_date && (
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
                                    {String(formatDate(camp.start_date, "long"))}
                                </p>
                            </div>
                            {typeof camp.end_date === "string" && camp.end_date && (
                                <>
                                    <span className="text-muted-foreground">→</span>
                                    <div>
                                        <p className="text-xs text-muted-foreground">End</p>
                                        <p className="font-medium">
                                            {String(formatDate(camp.end_date, "long"))}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => (typeof camp?.description === "string" ? camp.description : ""),
        sidebarSlot,
        overviewSlot,
        stats: [
            {
                label: "Budget",
                icon: DollarSign,
                compute: () => formatCurrency((camp?.total_budget as number) ?? 0),
            },
            { label: "Channels", icon: BarChart3, compute: () => channels.length },
            { label: "Assets", icon: ImageIcon, compute: () => assets.length },
            {
                label: "ROI",
                icon: TrendingUp,
                compute: () => (camp?.roi !== null ? `${String(camp?.roi)}x` : "—"),
            },
        ],
        tabs: [
            {
                id: "channels",
                label: "Channels",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Channels ({channels.length})
                            </CardTitle>
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
                                                variant={
                                                    ch.status === "active" ? "success" : "ghost"
                                                }
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
                ),
            },
            {
                id: "assets",
                label: "Assets",
                content: (
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
                                                getStatusVariant(
                                                    asset.production_status
                                                ) as "default"
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
                ),
            },
            {
                id: "performance",
                label: "Performance",
                content: (
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
                                                  ((kpi.current_value ?? 0) / kpi.target_value) *
                                                      100
                                              ),
                                              100
                                          )
                                        : 0;
                                    return (
                                        <div
                                            key={kpi.id}
                                            className="p-3 rounded-lg bg-secondary/20"
                                        >
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium">
                                                    {kpi.metric_name}
                                                </span>
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
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={id}
            record={camp ? { ...camp } : null}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                { label: "Edit Campaign", onClick: () => router.push(`/campaigns/${id}/edit`) },
                {
                    label: "Duplicate",
                    onClick: () => router.push(`/campaigns/new?duplicateFrom=${id}`),
                },
                ...crudMenuItems,
            ]}
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
        />
    );
}
