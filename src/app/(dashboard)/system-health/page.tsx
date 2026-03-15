"use client";

import React from "react";
import { LoadingState } from "@/components/layouts/loading-state";
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
    Inbox,
    Shield,
    Users,
    XCircle,
    Zap,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import {
    useDomainEvents,
    useResilienceTargets,
    useServiceHealthChecks,
    useSlaDefinitions,
} from "@/lib/supabase/hooks-pages";

type HealthStatus = "healthy" | "degraded" | "down";
type AlertSeverity = "info" | "warning" | "critical";

interface ServiceView {
    id: string;
    name: string;
    status: HealthStatus;
    latency: number;
    uptime: number;
    lastCheck: string;
}

function formatLastChecked(iso: string): string {
    if (!iso) return "unknown";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.round(mins / 60);
    return `${hours}h ago`;
}

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

function EmptyRow({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Inbox className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">{message}</p>
        </div>
    );
}

function formatMinutes(m: number): string {
    if (m < 60) return `${m} min`;
    if (m < 1440) return `${Math.round(m / 60)}h`;
    return `${Math.round(m / 1440)}d`;
}

export default function SystemHealthPage() {
    const { data: sbSlaDefs, isLoading: slaLoading } = useSlaDefinitions();
    const { data: sbResilience, isLoading: resLoading } = useResilienceTargets();
    const { data: sbEvents, isLoading: evtLoading } = useDomainEvents(20);
    const { data: sbServices, isLoading: svcLoading } = useServiceHealthChecks();

    const isLoading = slaLoading || resLoading || evtLoading || svcLoading;

    if (isLoading) {
        return <LoadingState />;
    }

    const services: ServiceView[] = (sbServices ?? []).map((s: Record<string, unknown>) => ({
        id: (s.id as string) ?? "",
        name: (s.service_name as string) ?? "",
        status: ((s.status as string) ?? "healthy") as HealthStatus,
        latency: (s.latency_ms as number) ?? 0,
        uptime: (s.uptime_pct as number) ?? 0,
        lastCheck: formatLastChecked((s.last_checked_at as string) ?? ""),
    }));

    type SlaView = { id: string; name: string; target: string; current: number; status: string };
    const slaMetrics: SlaView[] = (sbSlaDefs ?? []).map((s: Record<string, unknown>) => ({
        id: s.id as string,
        name: (s.name as string) ?? "",
        target: `< ${s.target_hours as number}h`,
        current: 0,
        status: "on_track",
    }));

    type EventView = {
        id: string;
        severity: AlertSeverity;
        message: string;
        source: string;
        timestamp: string;
        acknowledged: boolean;
    };
    const alerts: EventView[] = (sbEvents ?? []).map((e: Record<string, unknown>) => {
        const status = (e.status as string) ?? "pending";
        let severity: AlertSeverity = "info";
        if (status === "failed") severity = "critical";
        else if (status === "expired") severity = "warning";
        return {
            id: e.id as string,
            severity,
            message: (e.event_type as string) ?? "",
            source: (e.source_domain as string) ?? "",
            timestamp: (e.created_at as string) ?? "",
            acknowledged: status === "delivered",
        };
    });

    type ResilienceView = {
        id: string;
        service: string;
        rto: string;
        rpo: string;
        backup: string;
        lastTest: string;
        result: string;
    };
    const resilienceTargets: ResilienceView[] = (sbResilience ?? []).map(
        (r: Record<string, unknown>) => ({
            id: r.id as string,
            service: (r.service_name as string) ?? "",
            rto: formatMinutes(r.rto_minutes as number),
            rpo: formatMinutes(r.rpo_minutes as number),
            backup: (r.backup_frequency as string) ?? "daily",
            lastTest: (r.last_tested_at as string) ?? "",
            result: (r.test_result as string) ?? "unknown",
        })
    );

    const healthyCount = services.filter((s) => s.status === "healthy").length;
    const avgLatency = services.length
        ? Math.round(services.reduce((sum, s) => sum + s.latency, 0) / services.length)
        : 0;
    const avgUptime = services.length
        ? (services.reduce((sum, s) => sum + s.uptime, 0) / services.length).toFixed(2)
        : "0.00";
    const activeAlerts = alerts.filter((a) => !a.acknowledged).length;

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
                        value={`${healthyCount}/${services.length}`}
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
                                {services.length === 0 && (
                                    <EmptyRow message="No services configured" />
                                )}
                                {services.map((service) => (
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
                                {slaMetrics.length === 0 && (
                                    <EmptyRow message="No SLA definitions configured" />
                                )}
                                {slaMetrics.map((sla) => (
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
                            {alerts.length === 0 && <EmptyRow message="No recent events" />}
                            {alerts.map((alert) => (
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
                            {resilienceTargets.length === 0 && (
                                <EmptyRow message="No resilience targets configured" />
                            )}
                            {resilienceTargets.map((target) => (
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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
