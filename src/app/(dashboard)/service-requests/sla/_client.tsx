"use client";

import { useMemo, useState } from "react";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { capitalize, formatDate } from "@/lib/utils";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Plus,
    Settings,
    Shield,
    Target,
    Timer,
    TrendingUp,
    Users,
    Zap,
} from "lucide-react";
import { useSlaPolicies, useSlaStatus } from "@/lib/supabase";
import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CREATE_SLA_POLICY_CONFIG } from "@/config/create-entity-configs";

type SlaTab = "policies" | "active" | "metrics";

interface SlaPolicy {
    id: string;
    name: string;
    priority: "critical" | "high" | "medium" | "low";
    responseTimeMinutes: number;
    resolutionTimeMinutes: number;
    escalationAfterMinutes: number;
    autoAssign: boolean;
    assignToTeam: string;
    isActive: boolean;
}

interface ActiveSla {
    id: string;
    ticketNumber: string;
    ticketTitle: string;
    policyName: string;
    priority: "critical" | "high" | "medium" | "low";
    status: "within_sla" | "at_risk" | "breached" | "resolved";
    responseDeadline: string;
    resolutionDeadline: string;
    assignee: string;
    timeRemainingMinutes: number;
    elapsedMinutes: number;
}

const PRIORITY_BADGE: Record<string, "destructive" | "warning" | "info" | "default"> = {
    critical: "destructive",
    high: "warning",
    medium: "info",
    low: "default",
};

const STATUS_BADGE: Record<string, "success" | "warning" | "destructive" | "info"> = {
    within_sla: "success",
    at_risk: "warning",
    breached: "destructive",
    resolved: "info",
};

function formatMinutes(min: number): string {
    if (min < 0) return `${Math.abs(min)}m overdue`;
    if (min < 60) return `${min}m`;
    if (min < 1440) return `${Math.floor(min / 60)}h ${min % 60}m`;
    return `${Math.floor(min / 1440)}d ${Math.floor((min % 1440) / 60)}h`;
}

export function SlaPageClient() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useQueryTabState<SlaTab>({
        key: "tab",
        defaultValue: "active",
        validValues: ["policies", "active", "metrics"],
    });

    const { data: sbPolicies, isLoading: loadingPolicies } = useSlaPolicies();
    const { data: sbSlaStatus, isLoading: loadingSla } = useSlaStatus();

    const policies: SlaPolicy[] = useMemo(
        () =>
            (sbPolicies ?? []).map((p: Record<string, unknown>) => ({
                id: String(p.id),
                name: String(p.name ?? ""),
                priority: (p.priority as SlaPolicy["priority"]) ?? "medium",
                responseTimeMinutes: Number(p.response_time_minutes ?? 60),
                resolutionTimeMinutes: Number(p.resolution_time_minutes ?? 480),
                escalationAfterMinutes: Number(p.escalation_after_minutes ?? 120),
                autoAssign: p.auto_assign === true,
                assignToTeam: String(p.assign_to_team ?? ""),
                isActive: p.is_active !== false,
            })),
        [sbPolicies]
    );

    const activeSlas: ActiveSla[] = useMemo(
        () =>
            (sbSlaStatus ?? []).map((s: Record<string, unknown>) => ({
                id: String(s.id ?? s.ticket_id ?? ""),
                ticketNumber: String(s.ticket_number ?? ""),
                ticketTitle: String(s.ticket_title ?? s.title ?? ""),
                policyName: String(s.policy_name ?? ""),
                priority: (s.priority as ActiveSla["priority"]) ?? "medium",
                status: (s.status as ActiveSla["status"]) ?? "within_sla",
                responseDeadline: String(s.response_deadline ?? ""),
                resolutionDeadline: String(s.resolution_deadline ?? ""),
                assignee: String(s.assignee_name ?? s.assignee ?? ""),
                timeRemainingMinutes: Number(s.time_remaining_minutes ?? 0),
                elapsedMinutes: Number(s.elapsed_minutes ?? 0),
            })),
        [sbSlaStatus]
    );

    const isLoading = loadingPolicies || loadingSla;

    const breached = activeSlas.filter((s) => s.status === "breached").length;
    const atRisk = activeSlas.filter((s) => s.status === "at_risk").length;
    const withinSla = activeSlas.filter((s) => s.status === "within_sla").length;
    const complianceRate =
        activeSlas.length > 0 ? Math.round((withinSla / activeSlas.length) * 100) : 100;

    const tabs = [
        {
            id: "active" as const,
            label: "Active SLAs",
            count: activeSlas.length,
            icon: <Timer className="h-4 w-4" />,
        },
        {
            id: "policies" as const,
            label: "Policies",
            count: policies.length,
            icon: <Shield className="h-4 w-4" />,
        },
        { id: "metrics" as const, label: "Metrics", icon: <TrendingUp className="h-4 w-4" /> },
    ];

    const contentSlot = (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 density-gap-card">
                <StatCard title="SLA Compliance" value={`${complianceRate}%`} icon={Target} />
                <StatCard title="Breached" value={breached} icon={AlertTriangle} />
                <StatCard title="At Risk" value={atRisk} icon={Clock} />
                <StatCard title="Within SLA" value={withinSla} icon={CheckCircle2} />
            </div>

            <div className="flex items-center gap-3">
                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search tickets..."
                    className="max-w-sm"
                />
            </div>

            <TabBar
                items={tabs}
                value={activeTab}
                onValueChange={(id) => setActiveTab(id as SlaTab)}
            />

            <TabPanel value="active" activeValue={activeTab}>
                <div className="space-y-3">
                    {activeSlas
                        .filter(
                            (s) =>
                                !search ||
                                s.ticketTitle.toLowerCase().includes(search.toLowerCase()) ||
                                s.ticketNumber.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((sla) => {
                            const totalMinutes =
                                sla.elapsedMinutes + Math.max(sla.timeRemainingMinutes, 0);
                            const progressPct = Math.min(
                                Math.round((sla.elapsedMinutes / totalMinutes) * 100),
                                100
                            );
                            return (
                                <Card
                                    key={sla.id}
                                    className={
                                        sla.status === "breached"
                                            ? "border-destructive/30"
                                            : sla.status === "at_risk"
                                              ? "border-warning/30"
                                              : ""
                                    }
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="density-caption font-mono text-muted-foreground">
                                                        {sla.ticketNumber}
                                                    </span>
                                                    <Badge
                                                        variant={PRIORITY_BADGE[sla.priority]}
                                                        className="density-caption"
                                                    >
                                                        {sla.priority}
                                                    </Badge>
                                                    <Badge
                                                        variant={STATUS_BADGE[sla.status]}
                                                        className="density-caption"
                                                    >
                                                        {sla.status.replace(/_/g, " ")}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-sm font-semibold mt-1">
                                                    {sla.ticketTitle}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {sla.policyName} · Assigned to {sla.assignee}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className={`text-sm font-bold ${sla.timeRemainingMinutes < 0 ? "text-destructive" : sla.timeRemainingMinutes < 30 ? "text-warning" : "text-success"}`}
                                                >
                                                    {sla.timeRemainingMinutes < 0
                                                        ? "BREACHED"
                                                        : formatMinutes(sla.timeRemainingMinutes)}
                                                </p>
                                                <p className="density-caption text-muted-foreground">
                                                    remaining
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 density-gap-card mb-3 text-xs">
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Response Deadline
                                                </p>
                                                <p className="font-medium">
                                                    {formatDate(sla.responseDeadline)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">
                                                    Resolution Deadline
                                                </p>
                                                <p className="font-medium">
                                                    {formatDate(sla.resolutionDeadline)}
                                                </p>
                                            </div>
                                        </div>
                                        <ProgressBar value={progressPct} size="sm" />
                                    </CardContent>
                                </Card>
                            );
                        })}
                </div>
            </TabPanel>

            <TabPanel value="policies" activeValue={activeTab}>
                <div className="grid grid-cols-1 md:grid-cols-2 density-gap-card">
                    {policies.map((policy) => (
                        <Card key={policy.id}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={PRIORITY_BADGE[policy.priority]}
                                            className="density-caption"
                                        >
                                            {policy.priority}
                                        </Badge>
                                        <h3 className="text-sm font-semibold">{policy.name}</h3>
                                    </div>
                                    <Badge
                                        variant={policy.isActive ? "success" : "ghost"}
                                        className="density-caption"
                                    >
                                        {policy.isActive ? "Active" : "Disabled"}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="p-2 rounded-lg bg-secondary/30 text-center">
                                        <p className="text-sm font-bold">
                                            {formatMinutes(policy.responseTimeMinutes)}
                                        </p>
                                        <p className="density-caption text-muted-foreground">
                                            Response
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-secondary/30 text-center">
                                        <p className="text-sm font-bold">
                                            {formatMinutes(policy.resolutionTimeMinutes)}
                                        </p>
                                        <p className="density-caption text-muted-foreground">
                                            Resolution
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-secondary/30 text-center">
                                        <p className="text-sm font-bold">
                                            {formatMinutes(policy.escalationAfterMinutes)}
                                        </p>
                                        <p className="density-caption text-muted-foreground">
                                            Escalation
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        {policy.autoAssign ? (
                                            <>
                                                <Zap className="h-3 w-3 text-success" />
                                                Auto-assign to {policy.assignToTeam}
                                            </>
                                        ) : (
                                            <>
                                                <Users className="h-3 w-3" />
                                                Manual — {policy.assignToTeam}
                                            </>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 density-caption"
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabPanel>

            <TabPanel value="metrics" activeValue={activeTab}>
                <div className="grid grid-cols-1 md:grid-cols-2 density-gap-card">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Compliance by Priority
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="density-gap-section">
                            {(["critical", "high", "medium", "low"] as const)
                                .map((p) => {
                                    const matching = activeSlas.filter((s) => s.priority === p);
                                    const total = matching.length;
                                    const breachedCount = matching.filter(
                                        (s) => s.status === "breached"
                                    ).length;
                                    const rate =
                                        total > 0
                                            ? Math.round(((total - breachedCount) / total) * 100)
                                            : 100;
                                    return {
                                        priority: capitalize(p),
                                        rate,
                                        total,
                                        breached: breachedCount,
                                    };
                                })
                                .map((metric) => (
                                    <div key={metric.priority}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium">
                                                {metric.priority}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {metric.rate}% ({metric.total - metric.breached}/
                                                {metric.total})
                                            </span>
                                        </div>
                                        <ProgressBar value={metric.rate} size="sm" />
                                    </div>
                                ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Response Time Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(() => {
                                if (activeSlas.length === 0) return [];
                                const avgElapsed = Math.round(
                                    activeSlas.reduce((s, a) => s + a.elapsedMinutes, 0) /
                                        activeSlas.length
                                );
                                const compliant = activeSlas.filter(
                                    (a) => a.status !== "breached"
                                ).length;
                                const pct = Math.round((compliant / activeSlas.length) * 100);
                                return [
                                    {
                                        week: "Current",
                                        avgResponse: formatMinutes(avgElapsed),
                                        avgResolution: "—",
                                        compliance: pct,
                                    },
                                ];
                            })().map((week) => (
                                <div
                                    key={week.week}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                >
                                    <span className="text-sm font-medium">{week.week}</span>
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="text-center">
                                            <p className="text-muted-foreground">Avg Response</p>
                                            <p className="font-bold">{week.avgResponse}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-muted-foreground">Avg Resolution</p>
                                            <p className="font-bold">{week.avgResolution}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-muted-foreground">Compliance</p>
                                            <p
                                                className={`font-bold ${week.compliance >= 90 ? "text-success" : "text-warning"}`}
                                            >
                                                {week.compliance}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </TabPanel>
            <CreateEntityDialog
                config={CREATE_SLA_POLICY_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </>
    );

    const config: DashboardPageConfig = {
        resource: "service_requests",
        action: "read",
        title: "SLA Management",
        description: "Service Level Agreement policies, active SLA timers, and compliance metrics",
        headerActions: (
            <div className="flex gap-2">
                <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" /> Configure
                </Button>
                <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" /> New Policy
                </Button>
            </div>
        ),
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={isLoading} />;
}
