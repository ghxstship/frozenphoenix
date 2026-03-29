"use client";

import { useMemo } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Activity, AlertTriangle, CheckCircle2, Clock, Radio, Users } from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { useLiveEventInstances } from "@/lib/supabase";
import { useCreateLiveEventInstance } from "@/lib/supabase/hooks-live-ops";
import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CREATE_LIVE_EVENT_INSTANCE_CONFIG } from "@/config/create-entity-configs";
import { ListPageShell } from "@/components/shells";
import type { ListPageConfig } from "@/types/list-page-config";

type Row = Record<string, unknown>;

const BASE_CONFIG: ListPageConfig = {
    entityKey: "live_ops",
    resource: "live_ops",
    action: "read" as const,
    title: "Live Operations — Command Dashboard",
    description: "Real-time operational overview of all active live events",
    headerActions: null,
    emptyIcon: Radio,
    emptyTitle: "No live events",
    emptyDescription: "Live event instances will appear here when events are activated.",
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
] as const;

const PHASE_LABELS: Record<string, string> = {
    all: "All",
    advance: "Advance",
    load_in: "Load In",
    setup: "Setup",
    rehearsal: "Rehearsal",
    ready: "Ready",
    live: "Live",
    hold: "Hold",
    strike: "Strike",
    wrapped: "Wrapped",
};

export function LiveOpsPageClient() {
    const createEvent = useCreateLiveEventInstance();
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [phaseFilter, setPhaseFilter] = useQueryTabState({
        key: "phase",
        defaultValue: "all",
        validValues: PHASES,
    });
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

    const config = useMemo<ListPageConfig>(
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
            headerActions: (
                <Button size="sm" onClick={openCreate}>
                    <Radio className="mr-2 h-4 w-4" />
                    New Live Event
                </Button>
            ),
        }),
        [activeCount, totalAttendance, totalCapacity, alertCount, openCreate]
    );

    return (
        <ListPageShell config={config} data={rows} isLoading={isLoading}>
            <SegmentedControl
                ariaLabel="Phase filter"
                value={phaseFilter}
                onValueChange={(v) => setPhaseFilter(v as (typeof PHASES)[number])}
                size="sm"
                options={PHASES.map((p) => ({ value: p, label: PHASE_LABELS[p] ?? p }))}
            />

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
                                                        className="density-caption"
                                                    />
                                                    <StatusBadge
                                                        status={(evt.risk_level as string) ?? ""}
                                                        className="density-caption"
                                                    />
                                                </div>
                                                <p className="density-caption text-muted-foreground mt-0.5">
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
                                                <p className="density-caption text-muted-foreground">
                                                    of {cap.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <ProgressBar value={capPct} size="md" className="mb-3" />

                                        <div className="flex items-center gap-3 flex-wrap density-caption">
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {(evt.weather_status as string) ??
                                                    "No weather data"}
                                            </span>
                                            {typeof evt.weather_alert_level === "string" &&
                                                evt.weather_alert_level !== "none" && (
                                                    <StatusBadge
                                                        status={evt.weather_alert_level}
                                                        className="density-caption"
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
            <CreateEntityDialog
                config={CREATE_LIVE_EVENT_INSTANCE_CONFIG}
                open={createOpen}
                onClose={closeCreate}
                onSubmit={async (values) => {
                    await createEvent.mutateAsync(
                        values as Parameters<typeof createEvent.mutateAsync>[0]
                    );
                }}
            />
        </ListPageShell>
    );
}
