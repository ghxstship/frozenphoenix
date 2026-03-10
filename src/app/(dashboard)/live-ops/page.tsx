"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LoadingState } from "@/components/layouts/loading-state";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Radio,
    Users,
} from "lucide-react";
import { useLiveEventInstances } from "@/lib/supabase/hooks-live-ops";
import { PermissionGate } from "@/components/permission-guard";

export default function LiveOpsPage() {
    const [phaseFilter, setPhaseFilter] = useState("all");
    const { data: events, isLoading } = useLiveEventInstances();

    if (isLoading) return <LoadingState />;

    const rows = events ?? [];
    const activeCount = rows.filter((e) =>
        ["show", "load_in", "rehearsal"].includes(e.phase ?? "")
    ).length;
    const totalAttendance = rows.reduce((s, e) => s + (e.current_attendance ?? 0), 0);
    const totalCapacity = rows.reduce((s, e) => s + (e.permitted_capacity ?? 0), 0);

    const filtered = rows.filter(
        (e) =>
            phaseFilter === "all" || e.phase === phaseFilter
    );

    return (
        <PermissionGate resource="live_ops" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Live Operations — Command Dashboard"
                    description="Real-time operational overview of all active live events"
                >
                    <Button size="sm">
                        <Radio className="mr-2 h-4 w-4" />
                        New Live Event
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Active Events" value={activeCount} icon={Activity} />
                    <StatCard title="Total Attendance" value={totalAttendance.toLocaleString()} icon={Users} />
                    <StatCard
                        title="Capacity Used"
                        value={totalCapacity > 0 ? `${Math.round((totalAttendance / totalCapacity) * 100)}%` : "—"}
                        icon={CheckCircle2}
                    />
                    <StatCard title="Alerts" value={rows.filter((e) => e.weather_alert_level && e.weather_alert_level !== "none").length} icon={AlertTriangle} />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {[
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
                    ].map((phase) => (
                        <Button
                            key={phase}
                            variant={phase === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPhaseFilter(phase)}
                        >
                            {phase === "all" ? "All" : phase}
                        </Button>
                    ))}
                </div>

                <div className="space-y-3">
                    {filtered.map((evt, i) => {
                        const cap = evt.permitted_capacity ?? 0;
                        const att = evt.current_attendance ?? 0;
                        const capPct = cap > 0 ? Math.round((att / cap) * 100) : 0;
                        return (
                            <StaggerItem key={evt.id} index={i}>
                                <Card className="hover:shadow-sm transition-all">
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-semibold">{evt.event_id}</h3>
                                                    <StatusBadge status={evt.phase ?? ""} className="text-[10px]" />
                                                    <StatusBadge status={evt.risk_level ?? ""} className="text-[10px]" />
                                                </div>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {evt.project_id ?? ""} — {evt.created_at ? new Date(evt.created_at).toLocaleDateString() : ""}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold">{att.toLocaleString()}</p>
                                                <p className="text-[10px] text-muted-foreground">of {cap.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <ProgressBar value={capPct} size="md" className="mb-3" />

                                        <div className="flex items-center gap-3 flex-wrap text-[11px]">
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {evt.weather_status ?? "No weather data"}
                                            </span>
                                            {evt.weather_alert_level && evt.weather_alert_level !== "none" && (
                                                <StatusBadge status={evt.weather_alert_level} className="text-[10px]" />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Radio className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-1">No live events</h3>
                            <p className="text-muted-foreground text-center">
                                No events match the selected phase filter
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PermissionGate>
    );
}
