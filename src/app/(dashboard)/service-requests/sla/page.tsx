"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchInput } from "@/components/ui/search-input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { TabBar, TabPanel } from "@/components/ui/tab-bar";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { formatDate } from "@/lib/utils";
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
import { PermissionGate } from "@/components/permission-guard";

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

const MOCK_POLICIES: SlaPolicy[] = [
    {
        id: "sp1",
        name: "Critical — Production Down",
        priority: "critical",
        responseTimeMinutes: 15,
        resolutionTimeMinutes: 120,
        escalationAfterMinutes: 30,
        autoAssign: true,
        assignToTeam: "Senior Engineers",
        isActive: true,
    },
    {
        id: "sp2",
        name: "High — Client-Facing",
        priority: "high",
        responseTimeMinutes: 60,
        resolutionTimeMinutes: 480,
        escalationAfterMinutes: 120,
        autoAssign: true,
        assignToTeam: "Support Team",
        isActive: true,
    },
    {
        id: "sp3",
        name: "Medium — Internal",
        priority: "medium",
        responseTimeMinutes: 240,
        resolutionTimeMinutes: 1440,
        escalationAfterMinutes: 480,
        autoAssign: false,
        assignToTeam: "General Queue",
        isActive: true,
    },
    {
        id: "sp4",
        name: "Low — Enhancement",
        priority: "low",
        responseTimeMinutes: 1440,
        resolutionTimeMinutes: 10080,
        escalationAfterMinutes: 2880,
        autoAssign: false,
        assignToTeam: "Backlog",
        isActive: true,
    },
];

const MOCK_ACTIVE_SLAS: ActiveSla[] = [
    {
        id: "as1",
        ticketNumber: "SR-2026-0142",
        ticketTitle: "LED panel failure — Stage Left",
        policyName: "Critical — Production Down",
        priority: "critical",
        status: "at_risk",
        responseDeadline: "2026-03-12T14:30:00Z",
        resolutionDeadline: "2026-03-12T16:15:00Z",
        assignee: "Jake Morrison",
        timeRemainingMinutes: 22,
        elapsedMinutes: 93,
    },
    {
        id: "as2",
        ticketNumber: "SR-2026-0143",
        ticketTitle: "Client access to project dashboard broken",
        policyName: "High — Client-Facing",
        priority: "high",
        status: "within_sla",
        responseDeadline: "2026-03-12T15:00:00Z",
        resolutionDeadline: "2026-03-12T22:15:00Z",
        assignee: "Sarah Kim",
        timeRemainingMinutes: 310,
        elapsedMinutes: 170,
    },
    {
        id: "as3",
        ticketNumber: "SR-2026-0138",
        ticketTitle: "Update vendor payment terms",
        policyName: "Medium — Internal",
        priority: "medium",
        status: "within_sla",
        responseDeadline: "2026-03-12T18:00:00Z",
        resolutionDeadline: "2026-03-13T14:15:00Z",
        assignee: "Lisa Park",
        timeRemainingMinutes: 1200,
        elapsedMinutes: 240,
    },
    {
        id: "as4",
        ticketNumber: "SR-2026-0135",
        ticketTitle: "Audio sync issue on Barclays playback",
        policyName: "Critical — Production Down",
        priority: "critical",
        status: "breached",
        responseDeadline: "2026-03-11T10:00:00Z",
        resolutionDeadline: "2026-03-11T12:00:00Z",
        assignee: "Marcus Chen",
        timeRemainingMinutes: -180,
        elapsedMinutes: 300,
    },
];

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

export default function SlaPage() {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useQueryTabState<SlaTab>({
        key: "tab",
        defaultValue: "active",
        validValues: ["policies", "active", "metrics"],
    });

    const breached = MOCK_ACTIVE_SLAS.filter((s) => s.status === "breached").length;
    const atRisk = MOCK_ACTIVE_SLAS.filter((s) => s.status === "at_risk").length;
    const withinSla = MOCK_ACTIVE_SLAS.filter((s) => s.status === "within_sla").length;
    const complianceRate = Math.round((withinSla / MOCK_ACTIVE_SLAS.length) * 100);

    const tabs = [
        {
            id: "active" as const,
            label: "Active SLAs",
            count: MOCK_ACTIVE_SLAS.length,
            icon: <Timer className="h-4 w-4" />,
        },
        {
            id: "policies" as const,
            label: "Policies",
            count: MOCK_POLICIES.length,
            icon: <Shield className="h-4 w-4" />,
        },
        { id: "metrics" as const, label: "Metrics", icon: <TrendingUp className="h-4 w-4" /> },
    ];

    return (
        <PermissionGate resource="service_requests" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="SLA Management"
                    description="Service Level Agreement policies, active SLA timers, and compliance metrics"
                >
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" /> Configure
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4" /> New Policy
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        {MOCK_ACTIVE_SLAS.filter(
                            (s) =>
                                !search ||
                                s.ticketTitle.toLowerCase().includes(search.toLowerCase()) ||
                                s.ticketNumber.toLowerCase().includes(search.toLowerCase())
                        ).map((sla) => {
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
                                                    <span className="text-[10px] font-mono text-muted-foreground">
                                                        {sla.ticketNumber}
                                                    </span>
                                                    <Badge
                                                        variant={PRIORITY_BADGE[sla.priority]}
                                                        className="text-[10px]"
                                                    >
                                                        {sla.priority}
                                                    </Badge>
                                                    <Badge
                                                        variant={STATUS_BADGE[sla.status]}
                                                        className="text-[10px]"
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
                                                <p className="text-[10px] text-muted-foreground">
                                                    remaining
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {MOCK_POLICIES.map((policy) => (
                            <Card key={policy.id}>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={PRIORITY_BADGE[policy.priority]}
                                                className="text-[10px]"
                                            >
                                                {policy.priority}
                                            </Badge>
                                            <h3 className="text-sm font-semibold">{policy.name}</h3>
                                        </div>
                                        <Badge
                                            variant={policy.isActive ? "success" : "ghost"}
                                            className="text-[10px]"
                                        >
                                            {policy.isActive ? "Active" : "Disabled"}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-2 rounded-lg bg-secondary/30 text-center">
                                            <p className="text-sm font-bold">
                                                {formatMinutes(policy.responseTimeMinutes)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Response
                                            </p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-secondary/30 text-center">
                                            <p className="text-sm font-bold">
                                                {formatMinutes(policy.resolutionTimeMinutes)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Resolution
                                            </p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-secondary/30 text-center">
                                            <p className="text-sm font-bold">
                                                {formatMinutes(policy.escalationAfterMinutes)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
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
                                            className="h-6 text-[10px]"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Target className="h-4 w-4" />
                                    Compliance by Priority
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { priority: "Critical", rate: 75, total: 8, breached: 2 },
                                    { priority: "High", rate: 88, total: 16, breached: 2 },
                                    { priority: "Medium", rate: 95, total: 24, breached: 1 },
                                    { priority: "Low", rate: 100, total: 12, breached: 0 },
                                ].map((metric) => (
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
                                {[
                                    {
                                        week: "Week 10",
                                        avgResponse: "12m",
                                        avgResolution: "2.1h",
                                        compliance: 92,
                                    },
                                    {
                                        week: "Week 11",
                                        avgResponse: "8m",
                                        avgResolution: "1.8h",
                                        compliance: 95,
                                    },
                                    {
                                        week: "Week 12",
                                        avgResponse: "15m",
                                        avgResolution: "2.5h",
                                        compliance: 88,
                                    },
                                ].map((week) => (
                                    <div
                                        key={week.week}
                                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                                    >
                                        <span className="text-sm font-medium">{week.week}</span>
                                        <div className="flex items-center gap-4 text-xs">
                                            <div className="text-center">
                                                <p className="text-muted-foreground">
                                                    Avg Response
                                                </p>
                                                <p className="font-bold">{week.avgResponse}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-muted-foreground">
                                                    Avg Resolution
                                                </p>
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
            </div>
        </PermissionGate>
    );
}
