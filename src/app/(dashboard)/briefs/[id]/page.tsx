"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteBrief, useUpdateBrief } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Chip } from "@/components/ui/chip";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { CREATIVE_BRIEF_TYPE_MAP } from "@/config/domain-config";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import { Calendar, CheckCircle2, DollarSign, FileText, Loader2, Send, Target } from "lucide-react";
import { useParams } from "next/navigation";
import { useBrief } from "@/lib/supabase/hooks-pages";

type TabId = "overview" | "deliverables" | "budget" | "chatter";
const TAB_VALUES = ["overview", "deliverables", "budget", "chatter"] as const;

const BRIEF_TYPE_ICONS: Record<string, string> = {
    brand: "🎨",
    campaign: "📢",
    product: "🚀",
    event: "🎪",
    social: "📱",
    content: "✍️",
    experiential: "🌟",
};

export default function BriefDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });

    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: brief, isLoading } = useBrief(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Brief",
        listPath: "/briefs",
        useUpdateHook: useUpdateBrief,
        useDeleteHook: useDeleteBrief,
    });
    void router;
    void handleUpdate;

    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!brief) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Record not found</p>
            </div>
        );
    }
    const typeCfg =
        CREATIVE_BRIEF_TYPE_MAP[brief.brief_type as keyof typeof CREATIVE_BRIEF_TYPE_MAP];
    const typeIcon = BRIEF_TYPE_ICONS[brief.brief_type] ?? "📄";

    const completedKpis = brief.kpi_definitions.length;
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
        {
            id: "deliverables" as const,
            label: "Deliverables",
            count: brief.deliverable_manifest.length,
        },
        { id: "budget" as const, label: "Budget", count: brief.budget_breakdown.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Brief Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(brief.status)}>
                            {getStatusLabel(brief.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline">
                            {typeIcon} {typeCfg?.label ?? brief.brief_type}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-bold">{formatCurrency(brief.total_budget)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Version</span>
                        <span className="font-medium">v{brief.version}</span>
                    </div>
                    {brief.start_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Start</span>
                            <span className="font-medium">
                                {formatDate(brief.start_date, "compact")}
                            </span>
                        </div>
                    )}
                    {brief.end_date && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">End</span>
                            <span className="font-medium">
                                {formatDate(brief.end_date, "compact")}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Channels & Markets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {brief.channels.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Channels</p>
                            <div className="flex flex-wrap gap-1.5">
                                {brief.channels.map((ch: string) => (
                                    <Chip key={ch} size="sm">
                                        {ch}
                                    </Chip>
                                ))}
                            </div>
                        </div>
                    )}
                    {brief.markets.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Markets</p>
                            <div className="flex flex-wrap gap-1.5">
                                {brief.markets.map((m: string) => (
                                    <Chip key={m} size="sm">
                                        {m}
                                    </Chip>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <Send className="mr-2 h-4 w-4" />
                        Submit for Review
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Create Campaign
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/briefs"
            backLabel="Briefs"
            entityType="briefs"
            entityId={entityId}
            title={brief.title}
            subtitle={`${typeCfg?.label ?? brief.brief_type} Brief · v${brief.version}`}
            status={brief.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                    {typeIcon}
                </div>
            }
            actions={
                <Button size="sm">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve
                </Button>
            }
            menuItems={[
                { label: "Edit Brief", onClick: () => {} },
                { label: "Duplicate", onClick: () => {} },
                { label: "Create Amendment", onClick: () => {} },
                ...crudMenuItems,
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Budget</p>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(brief.total_budget)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Target className="h-5 w-5 text-info" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            KPIs Defined
                                        </p>
                                        <p className="text-lg font-bold">{completedKpis}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Milestones</p>
                                        <p className="text-lg font-bold">
                                            {brief.milestone_dates.length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {brief.objective_summary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Objective</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {brief.objective_summary}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {brief.business_objectives.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Business Objectives</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-1.5">
                                    {brief.business_objectives.map((obj: string, i: number) => (
                                        <li
                                            key={i}
                                            className="text-sm text-muted-foreground flex items-start gap-2"
                                        >
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                            {obj}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {brief.success_criteria.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Success Criteria</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-1.5">
                                    {brief.success_criteria.map((criterion: string, i: number) => (
                                        <li
                                            key={i}
                                            className="text-sm text-muted-foreground flex items-start gap-2"
                                        >
                                            <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                            {criterion}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {brief.tone_direction && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Creative Direction</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Tone</p>
                                    <p className="text-muted-foreground">{brief.tone_direction}</p>
                                </div>
                                {brief.visual_direction && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Visual</p>
                                        <p className="text-muted-foreground">
                                            {brief.visual_direction}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {brief.milestone_dates.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Milestones
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {brief.milestone_dates.map(
                                        (ms: { label: string; date: string }, i: number) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20"
                                            >
                                                <span className="text-sm font-medium">
                                                    {ms.label}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(ms.date, "compact")}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "deliverables" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Deliverable Manifest ({brief.deliverable_manifest.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {brief.deliverable_manifest.map(
                                (
                                    del: {
                                        type: string;
                                        quantity: number;
                                        specs: string;
                                        channel?: string;
                                    },
                                    i: number
                                ) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold capitalize">
                                                {del.type.replace(/_/g, " ")}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {del.specs}
                                            </p>
                                            {del.channel && (
                                                <Badge
                                                    variant="outline"
                                                    className="mt-1 text-[10px]"
                                                >
                                                    {del.channel}
                                                </Badge>
                                            )}
                                        </div>
                                        <Badge variant="ghost">×{del.quantity}</Badge>
                                    </div>
                                )
                            )}
                            {brief.deliverable_manifest.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No deliverables defined yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "budget" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>Budget Breakdown</span>
                            <span className="text-sm font-normal text-muted-foreground">
                                {formatCurrency(brief.total_budget)} total · {brief.contingency_pct}
                                % contingency
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {brief.budget_breakdown.map(
                                (item: { category: string; amount: number }, i: number) => {
                                    const pct =
                                        brief.total_budget > 0
                                            ? Math.round((item.amount / brief.total_budget) * 100)
                                            : 0;
                                    return (
                                        <div key={i} className="p-3 rounded-lg bg-secondary/20">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium capitalize">
                                                    {item.category.replace(/_/g, " ")}
                                                </span>
                                                <span className="font-bold">
                                                    {formatCurrency(item.amount)}
                                                </span>
                                            </div>
                                            <ProgressBar value={pct} size="sm" />
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {pct}% of total budget
                                            </p>
                                        </div>
                                    );
                                }
                            )}
                            {brief.budget_breakdown.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No budget breakdown defined yet
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="brief"
                    recordId={brief.id}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
