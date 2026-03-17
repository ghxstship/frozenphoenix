"use client";

import { useMemo, useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_GOAL_CONFIG } from "@/config/create-entity-configs";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageShell } from "@/components/layouts/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { OverlineText } from "@/components/ui/overline-text";
import { StaggerItem } from "@/components/ui/stagger-container";
import { formatDate } from "@/lib/utils";
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Plus,
    Target,
    TrendingUp,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import { LoadingState } from "@/components/layouts/loading-state";
import { useGoals, useUpdateGoal } from "@/lib/supabase";

type GoalStatus = "not_started" | "on_track" | "at_risk" | "behind" | "completed" | "cancelled";
type GoalCategory = "performance" | "development" | "project" | "team" | "personal";
type GoalPeriod = "q1" | "q2" | "q3" | "q4" | "annual";

interface KeyResult {
    id: string;
    title: string;
    targetValue: number;
    currentValue: number;
    unit: string;
}

interface Goal {
    id: string;
    title: string;
    description: string;
    ownerName: string;
    category: GoalCategory;
    status: GoalStatus;
    period: GoalPeriod;
    progress: number;
    dueDate: string;
    keyResults: KeyResult[];
    linkedProjectName?: string;
    parentGoalId?: string;
}

const STATUS_CONFIG: Record<GoalStatus, { label: string; color: string }> = {
    not_started: { label: "Not Started", color: "text-muted-foreground" },
    on_track: { label: "On Track", color: "text-success" },
    at_risk: { label: "At Risk", color: "text-warning" },
    behind: { label: "Behind", color: "text-destructive" },
    completed: { label: "Completed", color: "text-success" },
    cancelled: { label: "Cancelled", color: "text-muted-foreground" },
};

const CATEGORY_LABELS: Record<GoalCategory, string> = {
    performance: "Performance",
    development: "Development",
    project: "Project",
    team: "Team",
    personal: "Personal",
};

const PERIOD_LABELS: Record<GoalPeriod, string> = {
    q1: "Q1 2026",
    q2: "Q2 2026",
    q3: "Q3 2026",
    q4: "Q4 2026",
    annual: "Annual 2026",
};

const TAB_VALUES = ["all", "on_track", "at_risk", "behind", "completed"] as const;

export default function GoalsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useQueryTabState({
        key: "status",
        defaultValue: "all",
        validValues: TAB_VALUES,
    });
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const updateGoal = useUpdateGoal();

    const { data: sbGoals, isLoading } = useGoals();

    const goals: Goal[] = useMemo(
        () =>
            (sbGoals ?? []).map((g) => {
                const pct =
                    g.target_value && g.target_value > 0
                        ? Math.min(100, Math.round((g.current_value / g.target_value) * 100))
                        : 0;
                return {
                    id: g.id,
                    title: g.title,
                    description: g.description ?? "",
                    ownerName: g.user_profiles?.display_name ?? "",
                    category: (g.goal_type as GoalCategory) ?? "performance",
                    status: (g.status as GoalStatus) ?? "not_started",
                    period: "q2" as GoalPeriod,
                    progress: pct,
                    dueDate: g.due_date ?? "",
                    keyResults: g.target_value
                        ? [
                              {
                                  id: `kr-${g.id}`,
                                  title: g.title,
                                  targetValue: g.target_value,
                                  currentValue: g.current_value,
                                  unit: g.unit,
                              },
                          ]
                        : [],
                    linkedProjectName: g.projects?.name,
                    parentGoalId: g.parent_goal_id ?? undefined,
                };
            }),
        [sbGoals]
    );

    if (isLoading) return <LoadingState />;

    const filtered = goals.filter((g) => {
        if (statusFilter !== "all" && g.status !== statusFilter) return false;
        if (
            search &&
            !g.title.toLowerCase().includes(search.toLowerCase()) &&
            !g.ownerName.toLowerCase().includes(search.toLowerCase())
        )
            return false;
        return true;
    });

    const onTrack = goals.filter((g) => g.status === "on_track").length;
    const atRisk = goals.filter((g) => g.status === "at_risk" || g.status === "behind").length;
    const completed = goals.filter((g) => g.status === "completed").length;
    const avgProgress =
        goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;

    return (
        <PermissionGate resource="workforce" action="read">
            <PageShell
                title="Goals & OKRs"
                description="Track individual and team objectives with measurable key results"
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Goal
                    </Button>
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="On Track" value={onTrack} icon={TrendingUp} />
                    <StatCard
                        title="At Risk / Behind"
                        value={atRisk}
                        icon={AlertTriangle}
                        className={atRisk > 0 ? "border-warning/50 bg-warning/5" : ""}
                    />
                    <StatCard title="Completed" value={completed} icon={CheckCircle2} />
                    <StatCard title="Avg Progress" value={`${avgProgress}%`} icon={Target} />
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search goals..."
                        className="flex-1 max-w-sm"
                    />
                    <SegmentedControl
                        ariaLabel="Goal status filter"
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as (typeof TAB_VALUES)[number])}
                        size="sm"
                        options={[
                            { value: "all", label: "All" },
                            { value: "on_track", label: "On Track" },
                            { value: "at_risk", label: "At Risk" },
                            { value: "behind", label: "Behind" },
                            { value: "completed", label: "Done" },
                        ]}
                    />
                </div>

                <div className="space-y-3">
                    {filtered.map((goal, i) => {
                        const isExpanded = expandedId === goal.id;
                        const statusCfg = STATUS_CONFIG[goal.status];

                        return (
                            <StaggerItem key={goal.id} index={i} stagger="normal">
                                <Card className="overflow-hidden">
                                    <CardHeader
                                        className="cursor-pointer hover:bg-secondary/30 transition-colors py-4"
                                        onClick={() => setExpandedId(isExpanded ? null : goal.id)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CardTitle className="text-sm">
                                                        {goal.title}
                                                    </CardTitle>
                                                    <StatusBadge
                                                        status={goal.status}
                                                        className="text-[10px]"
                                                    />
                                                    <Badge variant="ghost" className="text-[10px]">
                                                        {CATEGORY_LABELS[goal.category]}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px]"
                                                    >
                                                        {PERIOD_LABELS[goal.period]}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {goal.ownerName} · Due{" "}
                                                    {formatDate(goal.dueDate)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="w-24">
                                                    <ProgressBar
                                                        value={goal.progress}
                                                        max={100}
                                                        size="sm"
                                                    />
                                                </div>
                                                <span
                                                    className={`text-sm font-bold tabular-nums ${statusCfg.color}`}
                                                >
                                                    {goal.progress}%
                                                </span>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {isExpanded && (
                                        <CardContent className="pt-0 space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                {goal.description}
                                            </p>

                                            {goal.linkedProjectName && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <ArrowRight className="h-3 w-3 text-primary" />
                                                    <span className="text-muted-foreground">
                                                        Linked to
                                                    </span>
                                                    <span className="font-medium">
                                                        {goal.linkedProjectName}
                                                    </span>
                                                </div>
                                            )}

                                            <div>
                                                <OverlineText as="h4" className="mb-3">
                                                    Key Results
                                                </OverlineText>
                                                <div className="space-y-3">
                                                    {goal.keyResults.map((kr) => {
                                                        const pct =
                                                            kr.targetValue > 0
                                                                ? Math.min(
                                                                      100,
                                                                      Math.round(
                                                                          (kr.currentValue /
                                                                              kr.targetValue) *
                                                                              100
                                                                      )
                                                                  )
                                                                : 0;
                                                        const isOnTarget = pct >= 70;
                                                        return (
                                                            <div
                                                                key={kr.id}
                                                                className="p-3 rounded-lg bg-secondary/30"
                                                            >
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-xs font-medium">
                                                                        {kr.title}
                                                                    </span>
                                                                    <span
                                                                        className={`text-xs font-bold tabular-nums ${isOnTarget ? "text-success" : "text-warning"}`}
                                                                    >
                                                                        {kr.currentValue}
                                                                        {kr.unit} / {kr.targetValue}
                                                                        {kr.unit}
                                                                    </span>
                                                                </div>
                                                                <ProgressBar
                                                                    value={pct}
                                                                    max={100}
                                                                    size="sm"
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-2 border-t">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={updateGoal.isPending}
                                                    onClick={() =>
                                                        updateGoal.mutate({
                                                            id: goal.id,
                                                            progress: Math.min(
                                                                100,
                                                                goal.progress + 10
                                                            ),
                                                        })
                                                    }
                                                >
                                                    Update Progress
                                                </Button>
                                                {goal.status !== "completed" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={updateGoal.isPending}
                                                        onClick={() =>
                                                            updateGoal.mutate({
                                                                id: goal.id,
                                                                status: "completed",
                                                                progress: 100,
                                                            })
                                                        }
                                                    >
                                                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />{" "}
                                                        Mark Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            </StaggerItem>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No goals found</p>
                    </div>
                )}
            </PageShell>
            <CreateEntityDialog
                config={CREATE_GOAL_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
