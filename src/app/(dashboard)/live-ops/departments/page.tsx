"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertTriangle, CheckCircle2, LayoutList, Users } from "lucide-react";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LoadingState } from "@/components/layouts/loading-state";
import { useDepartmentStatuses } from "@/lib/supabase/hooks-live-ops";

export default function DepartmentStatusPage() {
    const { data: depts, isLoading } = useDepartmentStatuses();

    if (isLoading) return <LoadingState />;

    const rows = depts ?? [];
    const ready = rows.filter((d) => d.status === "ready" || d.status === "active").length;
    const withIssues = rows.filter((d) => d.issues).length;
    const totalCrew = rows.reduce((s, d) => s + (d.crew_count ?? 0), 0);
    const checkedIn = rows.reduce((s, d) => s + (d.crew_checked_in ?? 0), 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Department Status"
                description="Real-time department readiness and crew check-in status"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Departments Ready"
                    value={`${ready}/${rows.length}`}
                    icon={CheckCircle2}
                />
                <StatCard title="Issues Flagged" value={withIssues} icon={AlertTriangle} />
                <StatCard
                    title="Crew Checked In"
                    value={`${checkedIn}/${totalCrew}`}
                    icon={Users}
                />
                <StatCard title="Total Departments" value={rows.length} icon={LayoutList} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {rows.map((dept, i) => {
                    const crewTotal = dept.crew_count ?? 0;
                    const crewIn = dept.crew_checked_in ?? 0;
                    const pct = crewTotal > 0 ? Math.round((crewIn / crewTotal) * 100) : 0;
                    return (
                        <StaggerItem key={dept.id} index={i} stagger="tight">
                            <Card className="hover:shadow-sm transition-all">
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-semibold">{dept.department}</h3>
                                        <StatusBadge status={dept.status} className="text-[10px]" />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mb-2">
                                        Lead: {dept.department_lead_id ?? "—"}
                                    </p>
                                    <div className="flex items-center gap-2 mb-1">
                                        <ProgressBar
                                            value={pct}
                                            size="xs"
                                            className="flex-1"
                                        />
                                        <span className="text-[10px] font-medium">
                                            {crewIn}/{crewTotal}
                                        </span>
                                    </div>
                                    {dept.issues && (
                                        <p className="text-[10px] text-warning mt-2 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3 shrink-0" />
                                            {dept.issues}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    );
                })}
            </div>
        </div>
    );
}
