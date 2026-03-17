"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Activity, AlertTriangle, CheckCircle2, Clock, Radio, Users } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { useLiveEventInstances } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

const BASE_CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    action: "read" as const,
    title: "Live Operations — Command Dashboard",
    description: "Real-time operational overview of all active live events",
    headerActions: (
        <Button size="sm">
            <Radio className="mr-2 h-4 w-4" />
            New Live Event
        </Button>
    ),
    emptyState: {
        icon: Radio,
        title: "No live events",
        description: "Live event instances will appear here when events are activated.",
    },
};

const PHASES = [
    "all",
    "advance",
    "load_in",
    "setup",
    "rehearsal",
    "ready",
    "live",
    "hold",
    "strike",
    "wrapped",
];

export default function LiveOpsPage() {
    const [phaseFilter, setPhaseFilter] = useState("all");
    const { data: events, isLoading } = useLiveEventInstances();

    const rows = useMemo(() => (events ?? []) as Row[], [events]);

    const activeCount = rows.filter((e) =>
        ["show", "load_in", "rehearsal"].includes(e.phase as string)
    ).length;
    const totalAttendance = rows.reduce((s, e) => s + (Number(e.current_attendance) || 0), 0);
    const totalCapacity = rows.reduce((s, e) => s + (Number(e.permitted_capacity) || 0), 0);
    const alertCount = rows.filter(
        (e) => typeof e.weather_alert_level === "string" && e.weather_alert_level !== "none"
    ).length;

    const filtered = rows.filter((e) => phaseFilter === "all" || e.phase === phaseFilter);

    const config = useMemo<DashboardPageConfig>(
        () => ({
            ...BASE_CONFIG,
            stats: [
                { label: "Active Events", icon: Activity, value: activeCount },
                { label: "Total Attendance", icon: Users, value: totalAttendance.toLocaleString() },
                {
                    label: "Capacity Used",
                    icon: CheckCircle2,
                    value:
                        totalCapacity > 0
                            ? `${Math.round((totalAttendance / totalCapacity) * 100)}%`
                            : "—",
                },
                { label: "Alerts", icon: AlertTriangle, value: alertCount },
            ],
        }),
        [activeCount, totalAttendance, totalCapacity, alertCount]
    );

    return (
        <OperationalDashboardShell config={config} data={rows} isLoading={isLoading}>
            <div className="flex gap-2 flex-wrap">
                {PHASES.map((phase) => (
                    <Button
                        key={phase}
                        variant={phaseFilter === phase ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPhaseFilter(phase)}
                    >
                        {phase === "all" ? "All" : phase}
                    </Button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <EmptyState
                    icon={Radio}
                    title="No live events"
                    description="No events match the selected phase filter"
                />
            ) : (
                <div className="space-y-3">
                    {filtered.map((evt, i) => {
                        const cap = Number(evt.permitted_capacity) || 0;
                        const att = Number(evt.current_attendance) || 0;
                        const capPct = cap > 0 ? Math.round((att / cap) * 100) : 0;
                        return (
                            <StaggerItem key={evt.id as string} index={i}>
                                <Card className="hover:shadow-sm transition-all">
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-semibold">
                                                        {evt.event_id as string}
                                                    </h3>
                                                    <StatusBadge
                                                        status={(evt.phase as string) ?? ""}
                                                        className="text-[10px]"
                                                    />
                                                    <StatusBadge
                                                        status={(evt.risk_level as string) ?? ""}
                                                        className="text-[10px]"
                                                    />
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {(evt.project_id as string) ?? ""} —{" "}
                                                    {typeof evt.created_at === "string"
                                                        ? new Date(
                                                              evt.created_at
                                                          ).toLocaleDateString()
                                                        : ""}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold">
                                                    {att.toLocaleString()}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    of {cap.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <ProgressBar value={capPct} size="md" className="mb-3" />

                                        <div className="flex items-center gap-3 flex-wrap text-[11px]">
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {(evt.weather_status as string) ??
                                                    "No weather data"}
                                            </span>
                                            {typeof evt.weather_alert_level === "string" &&
                                                evt.weather_alert_level !== "none" && (
                                                    <StatusBadge
                                                        status={evt.weather_alert_level}
                                                        className="text-[10px]"
                                                    />
                                                )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        );
                    })}
                </div>
            )}
        </OperationalDashboardShell>
    );
}
