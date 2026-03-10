"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertTriangle, DollarSign, FileBarChart, Users } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { LoadingState } from "@/components/layouts/loading-state";
import { formatCurrency } from "@/lib/utils";
import { usePostEventReports } from "@/lib/supabase/hooks-live-ops";

function formatVariance(mins: number): string {
    const abs = Math.abs(mins);
    const sign = mins > 0 ? "+" : mins < 0 ? "-" : "";
    return `${sign}${abs}m`;
}

export default function PostEventReportsPage() {
    const { data: reports, isLoading } = usePostEventReports();

    if (isLoading) return <LoadingState />;

    const rows = reports ?? [];

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Post-Event Reports"
                description="Compiled event summaries with attendance, financials, incidents, and lessons learned"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Reports" value={rows.length} icon={FileBarChart} />
                <StatCard
                    title="Approved"
                    value={rows.filter((r) => r.status === "approved").length}
                    icon={FileBarChart}
                />
                <StatCard
                    title="In Review"
                    value={rows.filter((r) => r.status === "in_review").length}
                    icon={FileBarChart}
                />
                <StatCard
                    title="Draft"
                    value={rows.filter((r) => r.status === "draft").length}
                    icon={FileBarChart}
                />
            </div>

            <div className="space-y-4">
                {rows.map((report, i) => (
                    <StaggerItem key={report.id} index={i} stagger="relaxed">
                        <Card className="hover:shadow-sm transition-all">
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold">
                                                {report.live_event_id}
                                            </h3>
                                            <StatusBadge
                                                status={report.status ?? "draft"}
                                                className="text-[10px]"
                                            />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            {report.compiled_by && `By ${report.compiled_by}`}
                                            {report.compiled_at && ` — ${new Date(report.compiled_at).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Users className="h-3 w-3" /> Attendance
                                        </p>
                                        <p className="font-semibold">
                                            {(report.total_attendance ?? 0).toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Peak: {(report.peak_attendance ?? 0).toLocaleString()} | VIP:{" "}
                                            {report.vip_count ?? 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" /> Financial
                                        </p>
                                        <p className="font-semibold">
                                            {formatCurrency(report.total_revenue ?? 0)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Spent: {formatCurrency(report.total_spent ?? 0)} | Margin:{" "}
                                            {report.final_margin_percent ?? 0}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> Incidents
                                        </p>
                                        <p className="font-semibold">{report.total_incidents ?? 0}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Damaged: {report.assets_damaged ?? 0} | Missing:{" "}
                                            {report.assets_missing ?? 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Timeline Variance
                                        </p>
                                        <div className="flex gap-2 text-[11px] mt-0.5">
                                            <span
                                                className={
                                                    (report.load_in_variance_minutes ?? 0) > 15
                                                        ? "text-warning"
                                                        : ""
                                                }
                                            >
                                                Load-in:{" "}
                                                {formatVariance(report.load_in_variance_minutes ?? 0)}
                                            </span>
                                            <span
                                                className={
                                                    (report.show_start_variance_minutes ?? 0) > 5
                                                        ? "text-warning"
                                                        : ""
                                                }
                                            >
                                                Show:{" "}
                                                {formatVariance(report.show_start_variance_minutes ?? 0)}
                                            </span>
                                            <span
                                                className={
                                                    (report.strike_variance_minutes ?? 0) > 30
                                                        ? "text-warning"
                                                        : ""
                                                }
                                            >
                                                Strike:{" "}
                                                {formatVariance(report.strike_variance_minutes ?? 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </StaggerItem>
                ))}
            </div>
        </div>
    );
}
