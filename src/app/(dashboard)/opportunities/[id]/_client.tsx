"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDeleteOpportunity, useOpportunity, useUpdateOpportunity } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import {
    OPPORTUNITY_STAGES_KANBAN as OPPORTUNITY_STAGES,
    OPPORTUNITY_TYPE_MAP,
} from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    Building2,
    Calendar,
    CheckCircle2,
    DollarSign,
    FileText,
    Mail,
    Phone,
    Target,
    TrendingUp,
    User,
} from "lucide-react";

interface OppActivityItem {
    id: string;
    type: string;
    description: string;
    date: string;
    user: string;
}
function parseActivities(raw: unknown): OppActivityItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((a, i) => ({
        id: String(a.id ?? `a-${i}`),
        type: (a.type as string) ?? "",
        description: (a.description as string) ?? "",
        date: (a.date as string) ?? (a.created_at as string) ?? "",
        user: (a.user as string) ?? (a.user_name as string) ?? "",
    }));
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "opportunity",
    titleKey: "name",
    statusKey: "stage",
    icon: Target,
    backHref: "/opportunities",
    backLabel: "Opportunities",
    chatter: false,
    fields: [],
    tabs: [],
};

export function OpportunityDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { data: opp, isLoading } = useOpportunity(id);
    const updateOpp = useUpdateOpportunity();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Opportunity",
        listPath: "/opportunities",
        useUpdateHook: useUpdateOpportunity,
        useDeleteHook: useDeleteOpportunity,
    });

    const rec = opp ?? initialRecord;
    const activities = parseActivities((rec as Record<string, unknown> | null)?.activities);
    const expectedClose = (rec as Record<string, unknown> | null)?.expected_close_date ?? null;
    const daysToClose = useMemo(() => {
        if (!expectedClose || typeof expectedClose !== "string") return null;
        return Math.ceil((new Date(expectedClose).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }, [expectedClose]);

    const chatterComments: CommentItem[] = [];
    const handleAddComment = async (content: string) => {
        void content;
    };

    const stageCfg = opp ? OPPORTUNITY_STAGES.find((s) => s.id === opp.stage) : undefined;
    const typeCfg = opp
        ? OPPORTUNITY_TYPE_MAP[opp.type as keyof typeof OPPORTUNITY_TYPE_MAP]
        : undefined;
    const stageIndex = opp ? OPPORTUNITY_STAGES.findIndex((s) => s.id === opp.stage) : -1;
    const stageProgress =
        stageIndex >= 0 ? Math.round(((stageIndex + 1) / OPPORTUNITY_STAGES.length) * 100) : 0;

    const sidebarSlot = opp ? (
        <div className="density-gap-section">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Opportunity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Stage</span>
                        <Badge style={{ backgroundColor: stageCfg?.color, color: "#fff" }}>
                            {stageCfg?.label}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline">{typeCfg?.label ?? opp.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Value</span>
                        <span className="font-bold">{formatCurrency(opp.value)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Weighted</span>
                        <span className="font-medium">
                            {formatCurrency(opp.weighted_value ?? 0)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Probability</span>
                        <span className="font-medium">{opp.probability}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Close Date</span>
                        <span className="font-medium">
                            {opp.expected_close_date ? formatDate(opp.expected_close_date) : "TBD"}
                        </span>
                    </div>
                    {daysToClose !== null && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Days to Close</span>
                            <Badge variant={daysToClose <= 14 ? "warning" : "ghost"}>
                                {daysToClose}d
                            </Badge>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{String(opp.company_id)}</span>
                    </div>
                    {opp.primary_contact_id && (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{String(opp.primary_contact_id)}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">
                            contact@
                            {String(opp.company_id ?? "company")
                                .toLowerCase()
                                .replace(/\s/g, "")}
                            .com
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">+1 (555) 123-4567</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Owner</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">{String(opp.assigned_to ?? "Unassigned")}</p>
                            <p className="text-xs text-muted-foreground">Account Executive</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    ) : undefined;

    const overviewSlot = opp ? (
        <div className="density-gap-page">
            <div className="grid grid-cols-1 sm:grid-cols-3 density-gap-card">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Deal Value</p>
                                <p className="text-lg font-bold">{formatCurrency(opp.value)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-info" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Weighted Value</p>
                                <p className="text-lg font-bold">
                                    {formatCurrency(opp.weighted_value ?? 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Expected Close</p>
                                <p className="text-sm font-semibold">
                                    {opp.expected_close_date
                                        ? formatDate(opp.expected_close_date)
                                        : "TBD"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Pipeline Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProgressBar value={stageProgress} size="md" className="mb-3" />
                    <div className="flex flex-wrap gap-2">
                        {OPPORTUNITY_STAGES.map((stage, i) => (
                            <Badge
                                key={stage.id}
                                variant={i <= stageIndex ? "default" : "ghost"}
                                className="density-caption"
                                style={
                                    i <= stageIndex
                                        ? { backgroundColor: stage.color, color: "#fff" }
                                        : {}
                                }
                            >
                                {stage.label}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
            {opp.next_step && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Next Step
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{String(opp.next_step)}</p>
                    </CardContent>
                </Card>
            )}
            {opp.lost_reason_id && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Lost Reason</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {String(opp.lost_reason_id)}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () =>
            `${String(opp?.company_id ?? "")} · ${typeCfg?.label ?? String(opp?.type ?? "")}`,
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "activity",
                label: "Activity",
                count: activities.length,
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Activity Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="density-gap-section">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex gap-3 p-3 rounded-lg bg-secondary/20"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm">{activity.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {activity.user}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    ·
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(activity.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "chatter",
                label: "Chatter",
                content: (
                    <RecordChatter
                        recordType="opportunity"
                        recordId={id}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    const advanceAction = (() => {
        if (!opp) return undefined;
        const stageIds = OPPORTUNITY_STAGES.map((s) => s.id);
        const idx = stageIds.indexOf(opp.stage);
        const nextStage = idx >= 0 && idx < stageIds.length - 1 ? stageIds[idx + 1] : null;
        return nextStage ? (
            <Button
                size="sm"
                disabled={updateOpp.isPending}
                onClick={() => updateOpp.mutate({ id, stage: nextStage })}
            >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Advance Stage
            </Button>
        ) : undefined;
    })();

    const record = rec ? { ...(rec as Record<string, unknown>) } : null;

    return (
        <DetailPageShell
            config={config}
            id={id}
            record={record}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                {
                    label: "Edit Opportunity",
                    onClick: () => router.push(`/opportunities/${id}/edit`),
                },
                {
                    label: "Clone Opportunity",
                    onClick: () => router.push(`/opportunities/new?duplicateFrom=${id}`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Target className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={advanceAction}
        />
    );
}
