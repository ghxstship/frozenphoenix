"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AlertTriangle, CheckCircle2, LayoutList, Users } from "lucide-react";
import { useDepartmentStatuses } from "@/lib/supabase";
import {
    useCreateDepartmentStatus,
    useUpdateDepartmentStatus,
} from "@/lib/supabase/hooks-live-ops";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

const CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "Department Status",
    description: "Real-time department readiness and crew check-in status",
    stats: [
        {
            label: "Departments Ready",
            icon: CheckCircle2,
            compute: (d) => {
                const ready = d.filter((r) => r.status === "ready" || r.status === "active").length;
                return `${ready}/${d.length}`;
            },
        },
        {
            label: "Issues Flagged",
            icon: AlertTriangle,
            compute: (d) => d.filter((r) => r.issues).length,
        },
        {
            label: "Crew Checked In",
            icon: Users,
            compute: (d) => {
                const total = d.reduce((s, r) => s + (Number(r.crew_count) || 0), 0);
                const checkedIn = d.reduce((s, r) => s + (Number(r.crew_checked_in) || 0), 0);
                return `${checkedIn}/${total}`;
            },
        },
        { label: "Total Departments", icon: LayoutList, compute: (d) => d.length },
    ],
    cardLayout: "grid",
    gridCols: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
    cardRenderer: (item: Row) => {
        const crewTotal = Number(item.crew_count) || 0;
        const crewIn = Number(item.crew_checked_in) || 0;
        const pct = crewTotal > 0 ? Math.round((crewIn / crewTotal) * 100) : 0;
        return (
            <Card className="hover:shadow-sm transition-all">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold">{item.department as string}</h3>
                        <StatusBadge status={item.status as string} className="text-[10px]" />
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">
                        Lead: {(item.department_lead_id as string) ?? "—"}
                    </p>
                    <div className="flex items-center gap-2 mb-1">
                        <ProgressBar value={pct} size="xs" className="flex-1" />
                        <span className="text-[10px] font-medium">
                            {crewIn}/{crewTotal}
                        </span>
                    </div>
                    {typeof item.issues === "string" && item.issues && (
                        <p className="text-[10px] text-warning mt-2 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            {item.issues}
                        </p>
                    )}
                </CardContent>
            </Card>
        );
    },
    emptyState: {
        icon: LayoutList,
        title: "No departments",
        description: "Department statuses will appear here during live events.",
    },
};

export default function DepartmentStatusPage() {
    const { data, isLoading } = useDepartmentStatuses();
    const _createDeptStatus = useCreateDepartmentStatus();
    const _updateDeptStatus = useUpdateDepartmentStatus();

    return (
        <OperationalDashboardShell
            config={CONFIG}
            data={data as Row[] | null}
            isLoading={isLoading}
        />
    );
}
