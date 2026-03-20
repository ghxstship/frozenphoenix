"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertTriangle, DollarSign, FileBarChart, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { usePostEventReports } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

function formatVariance(mins: number): string {
    const abs = Math.abs(mins);
    const sign = mins > 0 ? "+" : mins < 0 ? "-" : "";
    return `${sign}${abs}m`;
}

const CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "Post-Event Reports",
    description:
        "Compiled event summaries with attendance, financials, incidents, and lessons learned",
    cardLayout: "list",
    stats: [
        { label: "Total Reports", icon: FileBarChart, compute: (d) => d.length },
        {
            label: "Approved",
            icon: FileBarChart,
            compute: (d) => d.filter((r) => r.status === "approved").length,
        },
        {
            label: "In Review",
            icon: FileBarChart,
            compute: (d) => d.filter((r) => r.status === "in_review").length,
        },
        {
            label: "Draft",
            icon: FileBarChart,
            compute: (d) => d.filter((r) => r.status === "draft").length,
        },
    ],
    cardRenderer: (report: Row) => (
        <Card className="hover:shadow-sm transition-all">
            <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold">
                                {report.live_event_id as string}
                            </h3>
                            <StatusBadge
                                status={(report.status as string) ?? "draft"}
                                className="density-caption"
                            />
                        </div>
                        <p className="density-caption text-muted-foreground mt-0.5">
                            {typeof report.compiled_by === "string" && `By ${report.compiled_by}`}
                            {typeof report.compiled_at === "string" &&
                                ` — ${new Date(report.compiled_at).toLocaleDateString()}`}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 density-gap-card text-sm">
                    <div>
                        <p className="density-caption text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> Attendance
                        </p>
                        <p className="font-semibold">
                            {(Number(report.total_attendance) || 0).toLocaleString()}
                        </p>
                        <p className="density-caption text-muted-foreground">
                            Peak: {(Number(report.peak_attendance) || 0).toLocaleString()} | VIP:{" "}
                            {Number(report.vip_count) || 0}
                        </p>
                    </div>
                    <div>
                        <p className="density-caption text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> Financial
                        </p>
                        <p className="font-semibold">
                            {formatCurrency(Number(report.total_revenue) || 0)}
                        </p>
                        <p className="density-caption text-muted-foreground">
                            Spent: {formatCurrency(Number(report.total_spent) || 0)} | Margin:{" "}
                            {Number(report.final_margin_percent) || 0}%
                        </p>
                    </div>
                    <div>
                        <p className="density-caption text-muted-foreground flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Incidents
                        </p>
                        <p className="font-semibold">{Number(report.total_incidents) || 0}</p>
                        <p className="density-caption text-muted-foreground">
                            Damaged: {Number(report.assets_damaged) || 0} | Missing:{" "}
                            {Number(report.assets_missing) || 0}
                        </p>
                    </div>
                    <div>
                        <p className="density-caption text-muted-foreground">Timeline Variance</p>
                        <div className="flex gap-2 density-caption mt-0.5">
                            <span
                                className={
                                    (Number(report.load_in_variance_minutes) || 0) > 15
                                        ? "text-warning"
                                        : ""
                                }
                            >
                                Load-in:{" "}
                                {formatVariance(Number(report.load_in_variance_minutes) || 0)}
                            </span>
                            <span
                                className={
                                    (Number(report.show_start_variance_minutes) || 0) > 5
                                        ? "text-warning"
                                        : ""
                                }
                            >
                                Show:{" "}
                                {formatVariance(Number(report.show_start_variance_minutes) || 0)}
                            </span>
                            <span
                                className={
                                    (Number(report.strike_variance_minutes) || 0) > 30
                                        ? "text-warning"
                                        : ""
                                }
                            >
                                Strike:{" "}
                                {formatVariance(Number(report.strike_variance_minutes) || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    ),
    emptyState: {
        icon: FileBarChart,
        title: "No reports",
        description: "Post-event reports will appear here after events are completed.",
    },
};

export function PostEventReportsPageClient() {
    const { data, isLoading } = usePostEventReports();

    return (
        <OperationalDashboardShell
            config={CONFIG}
            data={data as Row[] | null}
            isLoading={isLoading}
        />
    );
}
