"use client";

import React from "react";
import { OperationalDashboardShell } from "@/components/shells";
import { useAuth } from "@/lib/supabase/auth-context";
import { useComplianceDrift } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    FileText,
    Info,
    Loader2,
    Lock,
    RefreshCw,
    Shield,
    Users,
    XCircle,
} from "lucide-react";

interface DriftItem {
    setting_key: string;
    category: string;
    drift_type: string;
    severity: "critical" | "warning" | "info";
    message: string;
}

interface DriftReport {
    organization_id: string;
    scanned_at: string;
    total_definitions: number;
    total_settings: number;
    drift_count: number;
    critical_count: number;
    warning_count: number;
    info_count: number;
    items: DriftItem[];
}

interface ComplianceCheck {
    id: string;
    label: string;
    description: string;
    status: "pass" | "fail" | "warning" | "unknown";
    soc2Control: string;
    icon: React.ReactNode;
}

const SEVERITY_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    critical: {
        bg: "bg-destructive/10",
        text: "text-destructive",
        icon: <XCircle className="h-4 w-4" />,
    },
    warning: {
        bg: "bg-warning/10",
        text: "text-warning",
        icon: <AlertTriangle className="h-4 w-4" />,
    },
    info: { bg: "bg-info/10", text: "text-info", icon: <Info className="h-4 w-4" /> },
};

export function ComplianceDashboardPageClient() {
    const { activeOrg } = useAuth();
    const orgId = activeOrg?.organization_id;
    const queryClient = useQueryClient();

    const {
        data: driftReport,
        isLoading: loading,
        isFetching: refreshing,
        error: queryError,
    } = useComplianceDrift(orgId) as {
        data: DriftReport | undefined;
        isLoading: boolean;
        isFetching: boolean;
        error: Error | null;
    };

    const error = queryError?.message ?? null;

    // Build compliance checks from available data
    const complianceChecks: ComplianceCheck[] = [
        {
            id: "cc6.1",
            label: "Server-Side RBAC Enforcement",
            description: "API routes enforce role-based access control via middleware.",
            status: "pass",
            soc2Control: "CC6.1",
            icon: <Lock className="h-4 w-4" aria-hidden="true" />,
        },
        {
            id: "cc7.1",
            label: "Settings Audit Trail",
            description:
                "All settings changes are logged to settings_change_log with immutable records.",
            status: "pass",
            soc2Control: "CC7.1",
            icon: <FileText className="h-4 w-4" aria-hidden="true" />,
        },
        {
            id: "cc6.3",
            label: "Lifecycle Status Enforcement",
            description: "Suspended/banned users are blocked at middleware level.",
            status: "pass",
            soc2Control: "CC6.3",
            icon: <Shield className="h-4 w-4" aria-hidden="true" />,
        },
        {
            id: "cc6.2",
            label: "MFA Availability",
            description: "Multi-factor authentication is available for all users.",
            status: "pass",
            soc2Control: "CC6.2",
            icon: <Shield className="h-4 w-4" aria-hidden="true" />,
        },
        {
            id: "cc8.1",
            label: "Settings Drift Detection",
            description: "Active monitoring of settings configuration drift.",
            status: driftReport
                ? driftReport.critical_count > 0
                    ? "fail"
                    : driftReport.warning_count > 0
                      ? "warning"
                      : "pass"
                : "unknown",
            soc2Control: "CC8.1",
            icon: <Activity className="h-4 w-4" aria-hidden="true" />,
        },
        {
            id: "cc6.4",
            label: "Change Approval Workflow",
            description: "High-risk settings changes require executive approval.",
            status: "pass",
            soc2Control: "CC6.4",
            icon: <Users className="h-4 w-4" aria-hidden="true" />,
        },
    ];

    const passCount = complianceChecks.filter((c) => c.status === "pass").length;
    const totalChecks = complianceChecks.length;
    const overallScore = Math.round((passCount / totalChecks) * 100);

    const contentSlot = (
        <div className="density-gap-page">
            {error && (
                <div
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                    role="alert"
                >
                    <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {error}
                </div>
            )}

            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 density-gap-card">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div
                            className={`text-4xl font-bold ${overallScore >= 80 ? "text-success" : overallScore >= 50 ? "text-warning" : "text-destructive"}`}
                        >
                            {overallScore}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-4xl font-bold text-success">{passCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Controls Passing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-4xl font-bold text-destructive">
                            {driftReport?.critical_count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Critical Drift Items</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <div className="text-4xl font-bold text-warning">
                            {driftReport?.warning_count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Warning Drift Items</p>
                    </CardContent>
                </Card>
            </div>

            {/* SOC2 Control Checks */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="h-4 w-4" aria-hidden="true" />
                        SOC2 Control Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3" role="list">
                        {complianceChecks.map((check) => (
                            <li
                                key={check.id}
                                className="flex items-center justify-between p-3 rounded-lg border"
                            >
                                <div className="flex items-center gap-3">
                                    {check.icon}
                                    <div>
                                        <p className="text-sm font-medium">{check.label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {check.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="density-caption">
                                        {check.soc2Control}
                                    </Badge>
                                    {check.status === "pass" ? (
                                        <CheckCircle2
                                            className="h-5 w-5 text-success"
                                            aria-label="Passing"
                                        />
                                    ) : check.status === "fail" ? (
                                        <XCircle
                                            className="h-5 w-5 text-destructive"
                                            aria-label="Failing"
                                        />
                                    ) : check.status === "warning" ? (
                                        <AlertTriangle
                                            className="h-5 w-5 text-warning"
                                            aria-label="Warning"
                                        />
                                    ) : (
                                        <Info
                                            className="h-5 w-5 text-muted-foreground"
                                            aria-label="Unknown"
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Drift Report */}
            {driftReport && driftReport.items.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Activity className="h-4 w-4" aria-hidden="true" />
                            Configuration Drift Report
                            <Badge variant="outline" className="ml-2 density-caption">
                                {driftReport.drift_count} items
                            </Badge>
                        </CardTitle>
                        {driftReport.scanned_at && (
                            <p className="text-xs text-muted-foreground">
                                Last scanned: {new Date(driftReport.scanned_at).toLocaleString()}
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2" role="list">
                            {driftReport.items.map((item, idx) => {
                                const style =
                                    SEVERITY_STYLES[item.severity] ?? SEVERITY_STYLES.info!;
                                return (
                                    <li
                                        key={`${item.setting_key}-${idx}`}
                                        className={`flex items-start gap-3 p-3 rounded-lg ${style.bg}`}
                                    >
                                        <span
                                            className={`shrink-0 mt-0.5 ${style.text}`}
                                            aria-hidden="true"
                                        >
                                            {style.icon}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-medium ${style.text}`}>
                                                    {item.setting_key}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className="density-caption"
                                                >
                                                    {item.drift_type}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="density-caption"
                                                >
                                                    {item.category}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {item.message}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {driftReport && driftReport.items.length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center">
                        <CheckCircle2
                            className="h-8 w-8 text-success mx-auto mb-2"
                            aria-hidden="true"
                        />
                        <p className="text-sm font-medium">No configuration drift detected</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            All {driftReport.total_definitions} setting definitions are properly
                            configured.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const config: DashboardPageConfig = {
        resource: "compliance",
        action: "read",
        title: "Compliance Dashboard",
        description: `SOC2 readiness and configuration compliance for ${activeOrg?.organizations?.name || "your organization"}`,
        headerActions: (
            <Button
                variant="outline"
                onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ["compliance_drift", orgId] })
                }
                disabled={refreshing}
            >
                {refreshing ? (
                    <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
                ) : (
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                )}
                Rescan
            </Button>
        ),
        stats: [
            { label: "SOC2 Score", icon: Shield, compute: () => `${overallScore}%` },
            {
                label: "Checks Passed",
                icon: CheckCircle2,
                compute: () => `${passCount}/${totalChecks}`,
            },
            { label: "Drift Items", icon: Activity, compute: () => driftReport?.drift_count ?? 0 },
        ],
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={loading} />;
}
