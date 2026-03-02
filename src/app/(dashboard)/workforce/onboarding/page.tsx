"use client";

import { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabBar } from "@/components/ui/tab-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Circle,
    Clock,
    Plus,
    UserPlus,
} from "lucide-react";
import { MOCK_OFFBOARDING_RUNS, MOCK_ONBOARDING_RUNS } from "@/lib/demo-data-workforce";
import type { LifecycleStepStatus } from "@/types/workforce";

const STEP_ICONS: Record<LifecycleStepStatus, { icon: typeof CheckCircle2; color: string }> = {
    not_started: { icon: Circle, color: "text-muted-foreground" },
    in_progress: { icon: Clock, color: "text-info" },
    completed: { icon: CheckCircle2, color: "text-success" },
    skipped: { icon: Circle, color: "text-muted-foreground/50" },
    blocked: { icon: AlertTriangle, color: "text-destructive" },
    overdue: { icon: AlertTriangle, color: "text-destructive" },
};

type TabMode = "onboarding" | "offboarding";

export default function WorkforceOnboardingPage() {
    const [search, setSearch] = useState("");
    const TAB_MODES = ["onboarding", "offboarding"] as const;
    const [tab, setTab] = useQueryTabState({
        key: "tab",
        defaultValue: "onboarding",
        validValues: TAB_MODES,
    });
    const [expandedRun, setExpandedRun] = useState<string | null>("obr1");

    const onboardingRuns = MOCK_ONBOARDING_RUNS;
    const offboardingRuns = MOCK_OFFBOARDING_RUNS;

    const activeOnboarding = onboardingRuns.filter((r) => r.status !== "completed").length;
    const completedOnboarding = onboardingRuns.filter((r) => r.status === "completed").length;
    const activeOffboarding = offboardingRuns.filter((r) => r.status !== "completed").length;

    const currentRuns = tab === "onboarding" ? onboardingRuns : offboardingRuns;
    const filtered = currentRuns.filter(
        (r) => !search || (r.workerName || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Onboarding & Offboarding"
                description="Classification-aware lifecycle workflows for all worker types — employees, contractors, freelancers, and vendors"
            >
                <Button size="sm">
                    <Plus className="h-4 w-4" /> Start Onboarding
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Active Onboarding" value={activeOnboarding} icon={UserPlus} />
                <StatCard
                    title="Completed Onboarding"
                    value={completedOnboarding}
                    icon={CheckCircle2}
                />
                <StatCard
                    title="Active Offboarding"
                    value={activeOffboarding}
                    icon={AlertTriangle}
                />
            </div>

            <div className="flex items-center gap-3">
                <TabBar
                    items={[
                        { id: "onboarding", label: "Onboarding", count: onboardingRuns.length },
                        { id: "offboarding", label: "Offboarding", count: offboardingRuns.length },
                    ]}
                    value={tab}
                    onValueChange={(v) => setTab(v as TabMode)}
                    variant="pill"
                    size="sm"
                    ariaLabel="Workforce lifecycle"
                />
                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search by name..."
                    className="flex-1 max-w-sm"
                />
            </div>

            <div className="space-y-4">
                {filtered.map((run, i) => {
                    const isOnboarding = tab === "onboarding";
                    const typedRun = isOnboarding ? (run as (typeof onboardingRuns)[0]) : run;
                    const isExpanded = expandedRun === run.id;
                    const progressPct =
                        run.totalSteps > 0
                            ? Math.round((run.completedSteps / run.totalSteps) * 100)
                            : 0;

                    return (
                        <StaggerItem key={run.id} index={i} stagger="normal">
                            <Card>
                                <CardHeader
                                    className="pb-2 cursor-pointer"
                                    onClick={() => setExpandedRun(isExpanded ? null : run.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <div>
                                                <CardTitle className="text-sm">
                                                    {run.workerName}
                                                </CardTitle>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {isOnboarding &&
                                                        (typedRun as (typeof onboardingRuns)[0])
                                                            .classification && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                                {{
                                                                    new_hire: "New Hire",
                                                                    rehire: "Rehire",
                                                                    transfer: "Transfer",
                                                                    contractor: "Contractor",
                                                                    intern: "Intern",
                                                                }[
                                                                    (
                                                                        typedRun as (typeof onboardingRuns)[0]
                                                                    ).classification as string
                                                                ] ??
                                                                    (
                                                                        typedRun as (typeof onboardingRuns)[0]
                                                                    ).classification?.replace(
                                                                        /_/g,
                                                                        " "
                                                                    )}
                                                            </span>
                                                        )}
                                                    <Badge
                                                        variant={
                                                            run.status === "completed"
                                                                ? "success"
                                                                : run.status === "in_progress"
                                                                  ? "info"
                                                                  : "default"
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {run.status.replace(/_/g, " ")}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs font-medium">
                                                    {run.completedSteps}/{run.totalSteps} steps
                                                </p>
                                                <ProgressBar
                                                    value={progressPct}
                                                    size="xs"
                                                    className="w-24 mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                {isExpanded &&
                                    isOnboarding &&
                                    (typedRun as (typeof onboardingRuns)[0]).steps && (
                                        <CardContent className="pt-0">
                                            {run.notes && (
                                                <p className="text-xs text-muted-foreground mb-3 px-7">
                                                    {run.notes}
                                                </p>
                                            )}
                                            <div className="space-y-2 ml-7">
                                                {(
                                                    typedRun as (typeof onboardingRuns)[0]
                                                ).steps!.map((step) => {
                                                    const cfg = STEP_ICONS[step.status];
                                                    const StepIcon = cfg.icon;
                                                    return (
                                                        <div
                                                            key={step.id}
                                                            className="flex items-center gap-3"
                                                        >
                                                            <StepIcon
                                                                className={`h-4 w-4 shrink-0 ${cfg.color}`}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p
                                                                    className={`text-xs ${step.status === "completed" ? "line-through text-muted-foreground" : "font-medium"}`}
                                                                >
                                                                    {step.stepName}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {step.assignedToName &&
                                                                    step.status !== "completed" && (
                                                                        <span className="text-[10px] text-muted-foreground">
                                                                            {step.assignedToName}
                                                                        </span>
                                                                    )}
                                                                {step.dueDate && (
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        Due {step.dueDate}
                                                                    </span>
                                                                )}
                                                                {step.completedAt && (
                                                                    <span className="text-[10px] text-success">
                                                                        {new Date(
                                                                            step.completedAt
                                                                        ).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    )}

                                {isExpanded && !isOnboarding && (
                                    <CardContent className="pt-0 ml-7">
                                        <div className="space-y-1 text-xs">
                                            {"reason" in run && run.reason && (
                                                <p>
                                                    <span className="text-muted-foreground">
                                                        Reason:
                                                    </span>{" "}
                                                    {run.reason}
                                                </p>
                                            )}
                                            {"isVoluntary" in run && (
                                                <p>
                                                    <span className="text-muted-foreground">
                                                        Type:
                                                    </span>{" "}
                                                    {run.isVoluntary ? "Voluntary" : "Involuntary"}
                                                </p>
                                            )}
                                            {"eligibleForRehire" in run && (
                                                <p>
                                                    <span className="text-muted-foreground">
                                                        Eligible for rehire:
                                                    </span>{" "}
                                                    {run.eligibleForRehire ? "Yes" : "No"}
                                                </p>
                                            )}
                                            {"exitInterviewCompleted" in run && (
                                                <p>
                                                    <span className="text-muted-foreground">
                                                        Exit interview:
                                                    </span>{" "}
                                                    {run.exitInterviewCompleted
                                                        ? "Completed"
                                                        : "Pending"}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        </StaggerItem>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No {tab} workflows found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
