"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDeleteBrief, useUpdateBrief } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Chip } from "@/components/ui/chip";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { CREATIVE_BRIEF_TYPE_MAP } from "@/config/domain-config";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { Calendar, CheckCircle2, DollarSign, FileText, Send, Target } from "lucide-react";
import { useParams } from "next/navigation";
import { useBrief } from "@/lib/supabase";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "briefs",
    titleKey: "title",
    statusKey: "status",
    icon: FileText,
    backHref: "/briefs",
    backLabel: "Briefs",
    chatter: false,
    fields: [
        { id: "brief_type", label: "Type", accessorKey: "brief_type", fieldType: "status" },
        {
            id: "total_budget",
            label: "Budget",
            accessorKey: "total_budget",
            fieldType: "currency",
            icon: DollarSign,
        },
        { id: "version", label: "Version", accessorKey: "version" },
        {
            id: "start_date",
            label: "Start",
            accessorKey: "start_date",
            fieldType: "date",
            icon: Calendar,
        },
        {
            id: "end_date",
            label: "End",
            accessorKey: "end_date",
            fieldType: "date",
            icon: Calendar,
        },
    ],
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        { id: "brief_type", label: "Type", accessorKey: "brief_type", fieldType: "status" },
        { id: "total_budget", label: "Budget", accessorKey: "total_budget", fieldType: "currency" },
        { id: "version", label: "Version", accessorKey: "version" },
        { id: "start_date", label: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", label: "End", accessorKey: "end_date", fieldType: "date" },
    ],
    tabs: [],
};

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

    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);

    const typeCfg = brief
        ? CREATIVE_BRIEF_TYPE_MAP[brief.brief_type as keyof typeof CREATIVE_BRIEF_TYPE_MAP]
        : undefined;
    const typeIcon = brief ? (BRIEF_TYPE_ICONS[brief.brief_type] ?? "📄") : "📄";

    const kpiDefs = Array.isArray(brief?.kpi_definitions) ? brief.kpi_definitions : [];
    const deliverableManifest = Array.isArray(brief?.deliverable_manifest)
        ? brief.deliverable_manifest
        : [];
    const budgetBreakdown = Array.isArray(brief?.budget_breakdown) ? brief.budget_breakdown : [];
    const milestoneDates = Array.isArray(brief?.milestone_dates) ? brief.milestone_dates : [];
    const businessObjectives = Array.isArray(brief?.business_objectives)
        ? brief.business_objectives
        : [];
    const successCriteria = Array.isArray(brief?.success_criteria) ? brief.success_criteria : [];
    const channels = Array.isArray(brief?.channels) ? brief.channels : [];
    const markets = Array.isArray(brief?.markets) ? brief.markets : [];
    const completedKpis = kpiDefs.length;
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

    const sidebarSlot = brief ? (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Channels & Markets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {channels.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Channels</p>
                            <div className="flex flex-wrap gap-1.5">
                                {channels.map((ch: unknown) => (
                                    <Chip key={String(ch)} size="sm">
                                        {String(ch)}
                                    </Chip>
                                ))}
                            </div>
                        </div>
                    )}
                    {markets.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Markets</p>
                            <div className="flex flex-wrap gap-1.5">
                                {markets.map((m: unknown) => (
                                    <Chip key={String(m)} size="sm">
                                        {String(m)}
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
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleUpdate({ status: "in_review" })}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Submit for Review
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => router.push(`/campaigns/new?briefId=${entityId}`)}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Create Campaign
                    </Button>
                </CardContent>
            </Card>
        </div>
    ) : null;

    const overviewSlot = brief ? (
        <div className="space-y-6">
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

            {businessObjectives.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Business Objectives</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1.5">
                            {businessObjectives.map((obj: unknown, i: number) => (
                                <li
                                    key={i}
                                    className="text-sm text-muted-foreground flex items-start gap-2"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                    {String(obj)}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {successCriteria.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Success Criteria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1.5">
                            {successCriteria.map((criterion: unknown, i: number) => (
                                <li
                                    key={i}
                                    className="text-sm text-muted-foreground flex items-start gap-2"
                                >
                                    <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    {String(criterion)}
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
                                <p className="text-muted-foreground">{brief.visual_direction}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {milestoneDates.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Milestones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {milestoneDates.map((ms: unknown, i: number) => {
                                const m = ms as Record<string, string>;
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/20"
                                    >
                                        <span className="text-sm font-medium">{m.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {m.date ? formatDate(m.date, "compact") : "—"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    ) : null;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: (r) => {
            const rec = r as Record<string, unknown>;
            return `${typeCfg?.label ?? rec.brief_type ?? ""} Brief · v${rec.version ?? 1}`;
        },
        sidebarSlot,
        overviewSlot,
        stats: [
            {
                label: "Budget",
                icon: DollarSign,
                compute: () => formatCurrency(brief?.total_budget ?? 0),
            },
            { label: "KPIs Defined", icon: Target, compute: () => completedKpis },
            { label: "Milestones", icon: Calendar, compute: () => milestoneDates.length },
        ],
        tabs: [
            {
                id: "deliverables",
                label: "Deliverables",
                count: deliverableManifest.length,
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Deliverable Manifest ({deliverableManifest.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {deliverableManifest.map((rawDel: unknown, i: number) => {
                                    const del = rawDel as Record<string, unknown>;
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold capitalize">
                                                    {String(del.type ?? "").replace(/_/g, " ")}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {String(del.specs ?? "")}
                                                </p>
                                                {Boolean(del.channel) && (
                                                    <Badge
                                                        variant="outline"
                                                        className="mt-1 text-[10px]"
                                                    >
                                                        {String(del.channel)}
                                                    </Badge>
                                                )}
                                            </div>
                                            <Badge variant="ghost">×{String(del.quantity)}</Badge>
                                        </div>
                                    );
                                })}
                                {deliverableManifest.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No deliverables defined yet
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "budget",
                label: "Budget",
                count: budgetBreakdown.length,
                content: brief ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>Budget Breakdown</span>
                                <span className="text-sm font-normal text-muted-foreground">
                                    {formatCurrency(brief.total_budget ?? 0)} total ·{" "}
                                    {brief.contingency_pct}% contingency
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {budgetBreakdown.map((rawItem: unknown, i: number) => {
                                    const item = rawItem as Record<string, unknown>;
                                    const amount = Number(item.amount ?? 0);
                                    const totalBudget = brief.total_budget ?? 0;
                                    const pct =
                                        totalBudget > 0
                                            ? Math.round((amount / totalBudget) * 100)
                                            : 0;
                                    return (
                                        <div key={i} className="p-3 rounded-lg bg-secondary/20">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium capitalize">
                                                    {String(item.category ?? "").replace(/_/g, " ")}
                                                </span>
                                                <span className="font-bold">
                                                    {formatCurrency(amount)}
                                                </span>
                                            </div>
                                            <ProgressBar value={pct} size="sm" />
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {pct}% of total budget
                                            </p>
                                        </div>
                                    );
                                })}
                                {budgetBreakdown.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No budget breakdown defined yet
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : null,
            },
            {
                id: "chatter",
                label: "Chatter",
                content: (
                    <RecordChatter
                        recordType="brief"
                        recordId={entityId}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={entityId}
            record={brief}
            isLoading={isLoading}
            menuItems={[
                { label: "Edit Brief", onClick: () => router.push(`/briefs/${entityId}/edit`) },
                {
                    label: "Duplicate",
                    onClick: () => router.push(`/briefs/new?duplicateFrom=${entityId}`),
                },
                {
                    label: "Create Amendment",
                    onClick: () => handleUpdate({ status: "amendment_requested" }),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                    {typeIcon}
                </div>
            }
            actions={
                <Button size="sm" onClick={() => handleUpdate({ status: "approved" })}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve
                </Button>
            }
        />
    );
}
