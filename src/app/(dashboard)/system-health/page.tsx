"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
    Activity,
    AlertTriangle,
    Bell,
    CheckCircle2,
    Clock,
    Database,
    Gauge,
    HardDrive,
    Shield,
    Users,
    XCircle,
    Zap,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

// NEXT: Wire to Supabase when system_health monitoring queries are available
type HealthStatus = "healthy" | "degraded" | "down";
type AlertSeverity = "info" | "warning" | "critical";

interface ServiceHealth {
    id: string;
    name: string;
    status: HealthStatus;
    latency: number;
    uptime: number;
    lastCheck: string;
}

interface SystemAlert {
    id: string;
    severity: AlertSeverity;
    message: string;
    source: string;
    timestamp: string;
    acknowledged: boolean;
}

interface SlaMetric {
    id: string;
    name: string;
    target: string;
    current: number;
    status: "on_track" | "at_risk" | "breached";
}

// Mock data for system health monitoring
const mockServices: ServiceHealth[] = [
    {
        id: "1",
        name: "Database (Supabase)",
        status: "healthy",
        latency: 12,
        uptime: 99.97,
        lastCheck: "2 min ago",
    },
    {
        id: "2",
        name: "Authentication",
        status: "healthy",
        latency: 45,
        uptime: 99.99,
        lastCheck: "1 min ago",
    },
    {
        id: "3",
        name: "Storage (CDN)",
        status: "healthy",
        latency: 8,
        uptime: 99.95,
        lastCheck: "3 min ago",
    },
    {
        id: "4",
        name: "Realtime (WebSocket)",
        status: "healthy",
        latency: 23,
        uptime: 99.9,
        lastCheck: "1 min ago",
    },
    {
        id: "5",
        name: "Edge Functions",
        status: "healthy",
        latency: 67,
        uptime: 99.85,
        lastCheck: "5 min ago",
    },
    {
        id: "6",
        name: "Email (SMTP)",
        status: "healthy",
        latency: 120,
        uptime: 99.8,
        lastCheck: "10 min ago",
    },
];

const mockAlerts: SystemAlert[] = [
    {
        id: "1",
        severity: "info",
        message: "Database backup completed successfully",
        source: "Supabase",
        timestamp: "10 min ago",
        acknowledged: true,
    },
    {
        id: "2",
        severity: "warning",
        message: "Edge function cold start latency > 500ms detected",
        source: "Edge Functions",
        timestamp: "25 min ago",
        acknowledged: false,
    },
    {
        id: "3",
        severity: "info",
        message: "RLS policy audit: 217 policies active, 0 violations",
        source: "Security",
        timestamp: "1 hour ago",
        acknowledged: true,
    },
    {
        id: "4",
        severity: "info",
        message: "Migration 022 applied: audit remediation schema",
        source: "Database",
        timestamp: "2 hours ago",
        acknowledged: true,
    },
];

const mockSlaMetrics: SlaMetric[] = [
    {
        id: "1",
        name: "Task Completion (48h)",
        target: "< 48 hours",
        current: 92,
        status: "on_track",
    },
    {
        id: "2",
        name: "Approval Turnaround (24h)",
        target: "< 24 hours",
        current: 87,
        status: "on_track",
    },
    {
        id: "3",
        name: "Incident Response (2h)",
        target: "< 2 hours",
        current: 95,
        status: "on_track",
    },
    { id: "4", name: "Invoice Payment (30d)", target: "< 30 days", current: 78, status: "at_risk" },
    { id: "5", name: "Onboarding (5d)", target: "< 5 days", current: 90, status: "on_track" },
    {
        id: "6",
        name: "Support Response (4h)",
        target: "< 4 hours",
        current: 96,
        status: "on_track",
    },
];

const statusIcon = (status: HealthStatus) => {
    switch (status) {
        case "healthy":
            return <CheckCircle2 className="h-4 w-4 text-success" />;
        case "degraded":
            return <AlertTriangle className="h-4 w-4 text-warning" />;
        case "down":
            return <XCircle className="h-4 w-4 text-destructive" />;
    }
};

const statusBadge = (status: HealthStatus) => {
    const variants: Record<HealthStatus, "success" | "warning" | "destructive"> = {
        healthy: "success",
        degraded: "warning",
        down: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
};

const alertIcon = (severity: AlertSeverity) => {
    switch (severity) {
        case "info":
            return <CheckCircle2 className="h-4 w-4 text-info" />;
        case "warning":
            return <AlertTriangle className="h-4 w-4 text-warning" />;
        case "critical":
            return <XCircle className="h-4 w-4 text-destructive" />;
    }
};

const slaStatusColor = (status: string) => {
    switch (status) {
        case "on_track":
            return "text-success";
        case "at_risk":
            return "text-warning";
        case "breached":
            return "text-destructive";
        default:
            return "text-muted-foreground";
    }
};

export default function SystemHealthPage() {
    const healthyCount = mockServices.filter((s) => s.status === "healthy").length;
    const avgLatency = Math.round(
        mockServices.reduce((sum, s) => sum + s.latency, 0) / mockServices.length
    );
    const avgUptime = (
        mockServices.reduce((sum, s) => sum + s.uptime, 0) / mockServices.length
    ).toFixed(2);
    const activeAlerts = mockAlerts.filter((a) => !a.acknowledged).length;

    return (
        <PermissionGate resource="system_health" action="read">
            <div className="space-y-6" id="main-content">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
                    <p className="text-muted-foreground">
                        Real-time monitoring, SLA tracking, and resilience metrics
                    </p>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Services"
                        value={`${healthyCount}/${mockServices.length}`}
                        icon={Activity}
                        description="All operational"
                    />
                    <StatCard
                        title="Avg Latency"
                        value={`${avgLatency}ms`}
                        icon={Gauge}
                        description="Within targets"
                    />
                    <StatCard
                        title="Uptime"
                        value={`${avgUptime}%`}
                        icon={HardDrive}
                        description="30-day average"
                    />
                    <StatCard
                        title="Active Alerts"
                        value={activeAlerts}
                        icon={Bell}
                        description={activeAlerts > 0 ? "Needs attention" : "All clear"}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Service Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Database className="h-4 w-4" />
                                Service Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mockServices.map((service) => (
                                    <div
                                        key={service.id}
                                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            {statusIcon(service.status)}
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {service.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Last checked {service.lastCheck}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-muted-foreground">
                                                {service.latency}ms
                                            </span>
                                            <span className="text-muted-foreground">
                                                {service.uptime}%
                                            </span>
                                            {statusBadge(service.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* SLA Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock className="h-4 w-4" />
                                SLA Compliance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockSlaMetrics.map((sla) => (
                                    <div key={sla.id} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{sla.name}</span>
                                            <span className={slaStatusColor(sla.status)}>
                                                {sla.current}%
                                            </span>
                                        </div>
                                        <ProgressBar value={sla.current} size="md" />
                                        <p className="text-xs text-muted-foreground">
                                            Target: {sla.target}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Alert Feed */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="h-4 w-4" />
                            Alert Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-start gap-3 py-2 border-b border-border last:border-0"
                                >
                                    {alertIcon(alert.severity)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">{alert.message}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">
                                                {alert.source}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {alert.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                    {alert.acknowledged ? (
                                        <Badge variant="ghost" className="text-xs">
                                            Ack
                                        </Badge>
                                    ) : (
                                        <Badge variant="warning" className="text-xs">
                                            New
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Resilience Targets */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Shield className="h-4 w-4" />
                            Resilience Targets (RTO/RPO)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                {
                                    service: "Database",
                                    rto: "15 min",
                                    rpo: "5 min",
                                    backup: "Continuous WAL",
                                    lastTest: "2025-02-20",
                                    result: "passed",
                                },
                                {
                                    service: "Authentication",
                                    rto: "5 min",
                                    rpo: "0 min",
                                    backup: "Replicated",
                                    lastTest: "2025-02-18",
                                    result: "passed",
                                },
                                {
                                    service: "Storage / CDN",
                                    rto: "30 min",
                                    rpo: "1 hour",
                                    backup: "Daily snapshot",
                                    lastTest: "2025-02-15",
                                    result: "passed",
                                },
                                {
                                    service: "Application",
                                    rto: "10 min",
                                    rpo: "0 min",
                                    backup: "Stateless / redeployable",
                                    lastTest: "2025-02-22",
                                    result: "passed",
                                },
                                {
                                    service: "Email / Notifications",
                                    rto: "60 min",
                                    rpo: "N/A",
                                    backup: "Queue-based retry",
                                    lastTest: "2025-02-10",
                                    result: "passed",
                                },
                                {
                                    service: "Edge Functions",
                                    rto: "5 min",
                                    rpo: "0 min",
                                    backup: "Redeployable",
                                    lastTest: "2025-02-21",
                                    result: "passed",
                                },
                            ].map((target) => (
                                <div
                                    key={target.service}
                                    className="p-3 rounded-lg border border-border"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm">
                                            {target.service}
                                        </span>
                                        <Badge variant="success" className="text-xs">
                                            {target.result}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-muted-foreground">RTO:</span>
                                            <span className="ml-1 font-medium">{target.rto}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">RPO:</span>
                                            <span className="ml-1 font-medium">{target.rpo}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">Backup:</span>
                                            <span className="ml-1">{target.backup}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">
                                                Last test:
                                            </span>
                                            <span className="ml-1">{target.lastTest}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Migrations"
                        value={22}
                        icon={Database}
                        description="001–022 contiguous"
                    />
                    <StatCard
                        title="RLS Policies"
                        value={217}
                        icon={Shield}
                        description="All tables covered"
                    />
                    <StatCard
                        title="Active Users"
                        value={"-"}
                        icon={Users}
                        description="Connect Supabase for live data"
                    />
                    <StatCard title="Triggers" value={157} icon={Zap} description="State + audit" />
                </div>
            </div>
        </PermissionGate>
    );
}
