"use client";

import { useMemo } from "react";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatDate } from "@/lib/utils";
import {
    AlertTriangle,
    Bell,
    Calendar,
    CheckCircle2,
    Shield,
    Timer,
    TrendingDown,
    Users,
    XCircle,
} from "lucide-react";
import { useTimeTrackingCompliance, useTimeTrackingPolicy } from "@/lib/supabase";
import { useCrewMembers } from "@/lib/supabase";
import { getStatusVariant } from "@/config/ui-variants";

interface CompliancePolicy {
    id: string;
    name: string;
    maxDailyHours: number;
    maxWeeklyHours: number;
    loggingDeadlineDays: number;
    requiresApproval: boolean;
    overtimeThreshold: number;
    isActive: boolean;
}

interface ComplianceViolation {
    id: string;
    workerName: string;
    violationType:
        | "max_daily_exceeded"
        | "max_weekly_exceeded"
        | "late_logging"
        | "missing_entries"
        | "unapproved_overtime";
    description: string;
    severity: "critical" | "warning" | "info";
    date: string;
    resolved: boolean;
}

interface WorkerCompliance {
    id: string;
    name: string;
    role: string;
    totalHoursThisWeek: number;
    maxWeeklyHours: number;
    loggingRate: number;
    violations: number;
    status: "compliant" | "at_risk" | "non_compliant";
}

export function TimeTrackingCompliancePageClient() {
    const { data: sbPolicies, isLoading: loadingPolicies } = useTimeTrackingPolicy();
    const { data: sbCompliance, isLoading: loadingCompliance } = useTimeTrackingCompliance();
    const { data: sbCrew, isLoading: loadingCrew } = useCrewMembers();

    const policies: CompliancePolicy[] = useMemo(
        () =>
            ((sbPolicies ?? []) as Record<string, unknown>[]).map((p) => ({
                id: String(p.id),
                name: String(p.name ?? ""),
                maxDailyHours: Number(p.max_daily_hours ?? 10),
                maxWeeklyHours: Number(p.max_weekly_hours ?? 45),
                loggingDeadlineDays: Number(p.logging_deadline_days ?? 2),
                requiresApproval: p.requires_approval === true,
                overtimeThreshold: Number(p.overtime_threshold ?? 8),
                isActive: p.is_active !== false,
            })),
        [sbPolicies]
    );

    const violations: ComplianceViolation[] = useMemo(() => {
        if (!sbCompliance) return [];
        return (sbCompliance as Record<string, unknown>[])
            .filter((c) => c.violation_type)
            .map((c) => ({
                id: String(c.crew_member_id ?? c.id ?? ""),
                workerName: String(c.crew_member_name ?? ""),
                violationType:
                    (c.violation_type as ComplianceViolation["violationType"]) ?? "missing_entries",
                description: String(c.violation_description ?? c.violation_type ?? ""),
                severity: (c.severity as ComplianceViolation["severity"]) ?? "warning",
                date: String(c.violation_date ?? c.period_end ?? ""),
                resolved: c.resolved === true,
            }));
    }, [sbCompliance]);

    const workers: WorkerCompliance[] = useMemo(
        () =>
            (sbCrew ?? []).map((c: Record<string, unknown>) => {
                const compliance = ((sbCompliance as Record<string, unknown>[] | null) ?? []).find(
                    (r: Record<string, unknown>) => String(r.crew_member_id) === String(c.id)
                ) as Record<string, unknown> | undefined;
                const hoursWeek = Number(compliance?.hours_this_week ?? 0);
                const maxWeek = Number(compliance?.max_weekly_hours ?? 45);
                const logRate = Number(compliance?.logging_rate ?? 100);
                const vCount = Number(compliance?.violation_count ?? 0);
                const status: WorkerCompliance["status"] =
                    vCount > 1
                        ? "non_compliant"
                        : vCount > 0 || logRate < 85 || hoursWeek > maxWeek * 0.95
                          ? "at_risk"
                          : "compliant";
                return {
                    id: String(c.id),
                    name: String(c.name ?? ""),
                    role: String(c.role ?? ""),
                    totalHoursThisWeek: hoursWeek,
                    maxWeeklyHours: maxWeek,
                    loggingRate: logRate,
                    violations: vCount,
                    status,
                };
            }),
        [sbCrew, sbCompliance]
    );

    const isLoading = loadingPolicies || loadingCompliance || loadingCrew;
    const totalViolations = violations.filter((v) => !v.resolved).length;
    const compliantWorkers = workers.filter((w) => w.status === "compliant").length;
    const avgLoggingRate =
        workers.length > 0
            ? Math.round(workers.reduce((s, w) => s + w.loggingRate, 0) / workers.length)
            : 0;
    const atRiskCount = workers.filter((w) => w.status !== "compliant").length;

    const contentSlot = (
        <div className="density-gap-page">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 density-gap-card">
                <StatCard title="Active Violations" value={totalViolations} icon={AlertTriangle} />
                <StatCard
                    title="Compliant Workers"
                    value={`${compliantWorkers}/${workers.length}`}
                    icon={CheckCircle2}
                />
                <StatCard title="Avg Logging Rate" value={`${avgLoggingRate}%`} icon={Timer} />
                <StatCard title="At Risk" value={atRiskCount} icon={TrendingDown} />
            </div>

            {/* Active Policies */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Active Policies
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 density-gap-card">
                        {policies
                            .filter((p) => p.isActive)
                            .map((policy) => (
                                <div
                                    key={policy.id}
                                    className="p-4 rounded-lg bg-secondary/30 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">{policy.name}</h4>
                                        <Badge variant="success" className="density-caption">
                                            Active
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <p className="text-muted-foreground">Max Daily</p>
                                            <p className="font-semibold">{policy.maxDailyHours}h</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Max Weekly</p>
                                            <p className="font-semibold">
                                                {policy.maxWeeklyHours}h
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Log Deadline</p>
                                            <p className="font-semibold">
                                                {policy.loggingDeadlineDays}d
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">OT Threshold</p>
                                            <p className="font-semibold">
                                                {policy.overtimeThreshold}h
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 density-caption text-muted-foreground">
                                        {policy.requiresApproval ? (
                                            <>
                                                <CheckCircle2 className="h-3 w-3 text-success" />
                                                Approval required
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-3 w-3 text-muted-foreground" />
                                                No approval needed
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>

            {/* Violations */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Active Violations
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {violations
                        .filter((v) => !v.resolved)
                        .map((violation) => (
                            <div
                                key={violation.id}
                                className="flex items-start justify-between p-3 rounded-lg bg-secondary/30"
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${violation.severity === "critical" ? "bg-destructive" : violation.severity === "warning" ? "bg-warning" : "bg-info"}`}
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold">
                                                {violation.workerName}
                                            </h4>
                                            <Badge
                                                variant={getStatusVariant(violation.severity)}
                                                className="density-caption"
                                            >
                                                {violation.severity}
                                            </Badge>
                                            <Badge variant="ghost" className="density-caption">
                                                {violation.violationType.replace(/_/g, " ")}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {violation.description}
                                        </p>
                                        <p className="density-caption text-muted-foreground mt-1 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(violation.date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="outline">
                                        Resolve
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        Waive
                                    </Button>
                                </div>
                            </div>
                        ))}
                </CardContent>
            </Card>

            {/* Worker Compliance Dashboard */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Worker Compliance Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {workers.map((worker) => {
                        const hoursPct = Math.round(
                            (worker.totalHoursThisWeek / worker.maxWeeklyHours) * 100
                        );
                        return (
                            <div key={worker.id} className="p-3 rounded-lg bg-secondary/30">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-semibold">{worker.name}</h4>
                                            <Badge
                                                variant={getStatusVariant(worker.status)}
                                                className="density-caption"
                                            >
                                                {worker.status.replaceAll("_", " ")}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {worker.role}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="text-center">
                                            <p className="text-muted-foreground">Hours</p>
                                            <p
                                                className={`font-bold ${hoursPct > 100 ? "text-destructive" : hoursPct > 90 ? "text-warning" : ""}`}
                                            >
                                                {worker.totalHoursThisWeek}/{worker.maxWeeklyHours}h
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-muted-foreground">Logging</p>
                                            <p
                                                className={`font-bold ${worker.loggingRate < 85 ? "text-warning" : "text-success"}`}
                                            >
                                                {worker.loggingRate}%
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-muted-foreground">Violations</p>
                                            <p
                                                className={`font-bold ${worker.violations > 0 ? "text-destructive" : ""}`}
                                            >
                                                {worker.violations}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <ProgressBar value={Math.min(hoursPct, 100)} size="sm" />
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );

    const config: ListPageConfig = {
        entityKey: "time_tracking",
        resource: "time_tracking",
        action: "read",
        title: "Time Tracking Compliance",
        description: "Monitor logging policies, violations, and workforce compliance status",
        headerActions: (
            <div className="flex gap-2">
                <Button size="sm" variant="outline">
                    <Bell className="h-4 w-4" /> Send Reminders
                </Button>
                <Button size="sm">
                    <Shield className="h-4 w-4" /> Manage Policies
                </Button>
            </div>
        ),
        contentSlot,
    };

    return <ListPageShell config={config} isLoading={isLoading} />;
}
