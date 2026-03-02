"use client";

import { PageHeader } from "@/components/ui/page-header";
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
import { PermissionGate } from "@/components/permission-guard";

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

const MOCK_POLICIES: CompliancePolicy[] = [
    {
        id: "cp1",
        name: "Standard Crew",
        maxDailyHours: 10,
        maxWeeklyHours: 45,
        loggingDeadlineDays: 2,
        requiresApproval: true,
        overtimeThreshold: 8,
        isActive: true,
    },
    {
        id: "cp2",
        name: "Event Day",
        maxDailyHours: 14,
        maxWeeklyHours: 60,
        loggingDeadlineDays: 1,
        requiresApproval: true,
        overtimeThreshold: 10,
        isActive: true,
    },
    {
        id: "cp3",
        name: "Office Staff",
        maxDailyHours: 8,
        maxWeeklyHours: 40,
        loggingDeadlineDays: 5,
        requiresApproval: false,
        overtimeThreshold: 8,
        isActive: true,
    },
];

const MOCK_VIOLATIONS: ComplianceViolation[] = [
    {
        id: "v1",
        workerName: "Jake Morrison",
        violationType: "max_daily_exceeded",
        description: "Logged 12.5 hours on Mar 10 — exceeds 10h daily limit",
        severity: "critical",
        date: "2026-03-10",
        resolved: false,
    },
    {
        id: "v2",
        workerName: "Sarah Kim",
        violationType: "late_logging",
        description: "Time entries for Feb 28 submitted 5 days late",
        severity: "warning",
        date: "2026-03-05",
        resolved: false,
    },
    {
        id: "v3",
        workerName: "Marcus Chen",
        violationType: "max_weekly_exceeded",
        description: "48h logged in week of Mar 3 — exceeds 45h weekly limit",
        severity: "critical",
        date: "2026-03-09",
        resolved: false,
    },
    {
        id: "v4",
        workerName: "Lisa Park",
        violationType: "missing_entries",
        description: "No time entries for Mar 7-8",
        severity: "warning",
        date: "2026-03-09",
        resolved: true,
    },
    {
        id: "v5",
        workerName: "Tom Rivera",
        violationType: "unapproved_overtime",
        description: "4h overtime on Mar 11 without pre-approval",
        severity: "info",
        date: "2026-03-11",
        resolved: false,
    },
];

const MOCK_WORKERS: WorkerCompliance[] = [
    {
        id: "w1",
        name: "Jake Morrison",
        role: "Lead Rigger",
        totalHoursThisWeek: 48,
        maxWeeklyHours: 45,
        loggingRate: 92,
        violations: 2,
        status: "non_compliant",
    },
    {
        id: "w2",
        name: "Sarah Kim",
        role: "Production Coordinator",
        totalHoursThisWeek: 38,
        maxWeeklyHours: 40,
        loggingRate: 78,
        violations: 1,
        status: "at_risk",
    },
    {
        id: "w3",
        name: "Marcus Chen",
        role: "Audio Engineer",
        totalHoursThisWeek: 42,
        maxWeeklyHours: 45,
        loggingRate: 95,
        violations: 1,
        status: "at_risk",
    },
    {
        id: "w4",
        name: "Lisa Park",
        role: "Stage Manager",
        totalHoursThisWeek: 36,
        maxWeeklyHours: 45,
        loggingRate: 100,
        violations: 0,
        status: "compliant",
    },
    {
        id: "w5",
        name: "Tom Rivera",
        role: "Lighting Tech",
        totalHoursThisWeek: 44,
        maxWeeklyHours: 45,
        loggingRate: 88,
        violations: 1,
        status: "at_risk",
    },
    {
        id: "w6",
        name: "Anna Williams",
        role: "Event Director",
        totalHoursThisWeek: 32,
        maxWeeklyHours: 40,
        loggingRate: 100,
        violations: 0,
        status: "compliant",
    },
];

const SEVERITY_BADGE: Record<string, "destructive" | "warning" | "info"> = {
    critical: "destructive",
    warning: "warning",
    info: "info",
};

const STATUS_BADGE: Record<string, "success" | "warning" | "destructive"> = {
    compliant: "success",
    at_risk: "warning",
    non_compliant: "destructive",
};

export default function TimeTrackingCompliancePage() {
    const totalViolations = MOCK_VIOLATIONS.filter((v) => !v.resolved).length;
    const compliantWorkers = MOCK_WORKERS.filter((w) => w.status === "compliant").length;
    const avgLoggingRate = Math.round(
        MOCK_WORKERS.reduce((s, w) => s + w.loggingRate, 0) / MOCK_WORKERS.length
    );
    const atRiskCount = MOCK_WORKERS.filter((w) => w.status !== "compliant").length;

    return (
        <PermissionGate resource="time_tracking" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Time Tracking Compliance"
                    description="Monitor logging policies, violations, and workforce compliance status"
                >
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                            <Bell className="h-4 w-4" /> Send Reminders
                        </Button>
                        <Button size="sm">
                            <Shield className="h-4 w-4" /> Manage Policies
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Active Violations"
                        value={totalViolations}
                        icon={AlertTriangle}
                    />
                    <StatCard
                        title="Compliant Workers"
                        value={`${compliantWorkers}/${MOCK_WORKERS.length}`}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {MOCK_POLICIES.filter((p) => p.isActive).map((policy) => (
                                <div
                                    key={policy.id}
                                    className="p-4 rounded-lg bg-secondary/30 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold">{policy.name}</h4>
                                        <Badge variant="success" className="text-[10px]">
                                            Active
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
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
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
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
                        {MOCK_VIOLATIONS.filter((v) => !v.resolved).map((violation) => (
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
                                                variant={SEVERITY_BADGE[violation.severity]}
                                                className="text-[10px]"
                                            >
                                                {violation.severity}
                                            </Badge>
                                            <Badge variant="ghost" className="text-[10px]">
                                                {violation.violationType.replace(/_/g, " ")}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {violation.description}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
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
                        {MOCK_WORKERS.map((worker) => {
                            const hoursPct = Math.round(
                                (worker.totalHoursThisWeek / worker.maxWeeklyHours) * 100
                            );
                            return (
                                <div key={worker.id} className="p-3 rounded-lg bg-secondary/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold">
                                                    {worker.name}
                                                </h4>
                                                <Badge
                                                    variant={STATUS_BADGE[worker.status]}
                                                    className="text-[10px]"
                                                >
                                                    {worker.status.replace("_", " ")}
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
                                                    {worker.totalHoursThisWeek}/
                                                    {worker.maxWeeklyHours}h
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
        </PermissionGate>
    );
}
