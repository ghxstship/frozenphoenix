"use client";

import React, { useCallback, useMemo, useState } from "react";
import { CreateEntityDialog, useCreateAction } from "@/components/app/create-entity-dialog";
import { CREATE_SHIFT_CONFIG } from "@/config/create-entity-configs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { HeatmapGrid } from "@/components/ui/heatmap-grid";
import { GanttChart, type GanttTask } from "@/components/ui/gantt-chart";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Avatar } from "@/components/ui/avatar";
import { useCrewMembers, useProjects, useShifts } from "@/lib/supabase";
import { useCrewUtilization } from "@/lib/supabase";
import { useResourceBookings } from "@/lib/supabase";
import { formatDate } from "@/lib/formatters/locale";
import type { CrewMember, Project, ProjectPhase, ProjectStatus } from "@/types";
import {
    AlertTriangle,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Flame,
    GanttChartIcon,
    Plus,
    Users,
} from "lucide-react";
import { EmptyState } from "@/components/layouts/empty-state";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

interface Shift {
    id: string;
    crewMemberId: string;
    projectId: string;
    date: string;
    startTime: string;
    endTime: string;
    role: string;
    status: "scheduled" | "checked_in" | "checked_out" | "no_show";
}

type ScheduleView = "schedule" | "utilization" | "gantt";

const VIEW_OPTIONS: { value: ScheduleView; label: string }[] = [
    { value: "schedule", label: "Schedule" },
    { value: "utilization", label: "Utilization" },
    { value: "gantt", label: "Gantt" },
];

export function SchedulingPageClient() {
    const [activeView, setActiveView] = useQueryTabState({
        key: "view",
        defaultValue: "schedule",
        validValues: ["schedule", "utilization", "gantt"] as const,
    });
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day;
        return new Date(today.setDate(diff));
    });
    const [selectedProject, setSelectedProject] = useState<string>("all");
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const { data: utilizationData } = useCrewUtilization();
    const { data: sbBookings } = useResourceBookings();

    const ganttTasks: GanttTask[] = useMemo(() => {
        if (!sbBookings?.length) return [];
        const nowMs = new Date().getTime();
        return (sbBookings as Record<string, unknown>[]).map((b) => {
            const proj = b.projects as { name: string } | null;
            const member = b.user_profiles as { display_name: string } | null;
            const startD = new Date(b.start_date as string);
            const endD = new Date(b.end_date as string);
            const totalDays = Math.max(
                1,
                Math.ceil((endD.getTime() - startD.getTime()) / 86400000)
            );
            const elapsed = Math.max(0, Math.ceil((nowMs - startD.getTime()) / 86400000));
            const progress = Math.min(100, Math.round((elapsed / totalDays) * 100));
            return {
                id: b.id as string,
                label: proj?.name ?? "Unassigned",
                sublabel: member?.display_name ?? (b.placeholder_name as string) ?? "",
                startDate: b.start_date as string,
                endDate: b.end_date as string,
                progress,
                hasConflict: (b.has_conflict as boolean) ?? false,
                resourceId: (b.crew_member_id as string) ?? undefined,
            };
        });
    }, [sbBookings]);

    const ganttDateRange = useMemo(() => {
        if (!ganttTasks.length) {
            const now = new Date();
            const start = new Date(now);
            start.setDate(start.getDate() - 7);
            const end = new Date(now);
            end.setDate(end.getDate() + 30);
            return {
                start: start.toISOString().split("T")[0]!,
                end: end.toISOString().split("T")[0]!,
            };
        }
        const starts = ganttTasks.map((t) => t.startDate).sort();
        const ends = ganttTasks.map((t) => t.endDate).sort();
        return { start: starts[0]!, end: ends[ends.length - 1]! };
    }, [ganttTasks]);

    const { data: sbCrew, isLoading: loadingCrew } = useCrewMembers();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();
    const { data: sbShifts, isLoading: loadingShifts } = useShifts();

    const crew: CrewMember[] = (sbCrew ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        avatar: c.avatar_url ?? undefined,
        hourlyRate: c.hourly_rate,
        status: c.status as "available" | "assigned" | "unavailable",
        certifications: [],
    }));

    const projects: Project[] = (sbProjects ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        client: p.companies?.name ?? "",
        clientLogo: p.client_logo ?? undefined,
        status: p.status as ProjectStatus,
        currentPhase: p.current_phase as ProjectPhase,
        startDate: p.start_date,
        endDate: p.end_date,
        budgetPlanned: p.budget_planned,
        budgetActual: p.budget_actual,
        progress: p.progress,
        managerId: p.manager_id ?? "",
        teamIds: [],
        createdAt: p.created_at ?? new Date().toISOString(),
    }));

    const shifts: Shift[] = (sbShifts ?? []).map((s) => ({
        id: s.id,
        crewMemberId: s.crew_member_id,
        projectId: s.project_id,
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
        role: s.role ?? "",
        status: s.status as Shift["status"],
    }));

    const isLoading = loadingCrew || loadingProjects || loadingShifts;

    const weekDays = useMemo(
        () =>
            Array.from({ length: 7 }, (_, i) => {
                const date = new Date(currentWeekStart);
                date.setDate(date.getDate() + i);
                return date;
            }),
        [currentWeekStart]
    );

    const navigateWeek = useCallback(
        (direction: number) => {
            const newDate = new Date(currentWeekStart);
            newDate.setDate(newDate.getDate() + direction * 7);
            setCurrentWeekStart(newDate);
        },
        [currentWeekStart]
    );

    const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

    const getShiftsForDateAndCrew = useCallback(
        (date: Date, crewId: string) => {
            const dateKey = formatDateKey(date);
            return shifts.filter(
                (s) =>
                    s.date === dateKey &&
                    s.crewMemberId === crewId &&
                    (selectedProject === "all" || s.projectId === selectedProject)
            );
        },
        [shifts, selectedProject]
    );

    const filteredCrew = useMemo(
        () =>
            selectedProject === "all"
                ? crew
                : crew.filter((c) =>
                      shifts.some((s) => s.crewMemberId === c.id && s.projectId === selectedProject)
                  ),
        [crew, shifts, selectedProject]
    );

    const totalScheduledHours = useMemo(
        () =>
            shifts.reduce((sum, shift) => {
                const start = parseInt(shift.startTime.split(":")[0] ?? "0");
                const end = parseInt(shift.endTime.split(":")[0] ?? "0");
                return sum + (end - start);
            }, 0),
        [shifts]
    );

    const statusConfig = useMemo(
        () => ({
            scheduled: { label: "Scheduled", variant: "ghost" as const, icon: Clock },
            checked_in: { label: "Checked In", variant: "success" as const, icon: CheckCircle2 },
            checked_out: { label: "Checked Out", variant: "info" as const, icon: CheckCircle2 },
            no_show: { label: "No Show", variant: "destructive" as const, icon: AlertTriangle },
        }),
        []
    );

    const config: DashboardPageConfig = useMemo(
        () => ({
            resource: "scheduling",
            action: "read",
            title: "Crew Scheduling",
            description: "Shift management and labor allocation across productions",
            searchable: false,
            headerActions: (
                <div className="flex items-center gap-2">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                    >
                        <option value="all">All Projects</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="h-4 w-4" />
                        Add Shift
                    </Button>
                </div>
            ),
            stats: [
                { label: "Crew Scheduled", icon: Users, value: filteredCrew.length },
                { label: "Total Hours This Week", icon: Clock, value: totalScheduledHours },
                {
                    label: "Currently On-Site",
                    icon: CheckCircle2,
                    value: shifts.filter((s) => s.status === "checked_in").length,
                },
                {
                    label: "Avg Utilization",
                    icon: BarChart3,
                    compute: () => {
                        const util = utilizationData ?? [];
                        const avgUtil =
                            util.length > 0
                                ? Math.round(
                                      util.reduce((s, u) => s + u.utilization_percent_week, 0) /
                                          util.length
                                  )
                                : 0;
                        return `${avgUtil}%`;
                    },
                },
            ],
            contentSlot: (
                <>
                    {/* View Toggle */}
                    <div className="flex items-center justify-between">
                        <SegmentedControl
                            value={activeView}
                            onValueChange={setActiveView}
                            options={VIEW_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                        />
                    </div>

                    {/* Utilization Heatmap View */}
                    {activeView === "utilization" && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-primary" />
                                        Crew Utilization Heatmap
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    const util = utilizationData ?? [];
                                    const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];

                                    const heatmapRows = util.map((u) => {
                                        const dailyBase = u.utilization_percent_week / 5;
                                        const cells = weekDayLabels.map((_, i) => {
                                            const variance =
                                                i % 3 === 0 ? 10 : i % 2 === 0 ? -5 : 5;
                                            const val = Math.max(
                                                0,
                                                Math.min(150, Math.round(dailyBase + variance))
                                            );
                                            return {
                                                value: val,
                                                tooltip: `${u.name}: ${val}% on ${weekDayLabels[i]}`,
                                            };
                                        });

                                        return {
                                            id: u.crew_member_id,
                                            label: u.name,
                                            sublabel: `${u.role}${u.conflict_count > 0 ? ` • ${u.conflict_count} conflict${u.conflict_count !== 1 ? "s" : ""}` : ""}`,
                                            cells,
                                        };
                                    });

                                    const overAllocated = util.filter(
                                        (u) => u.utilization_percent_week > 100
                                    ).length;
                                    const underUtilized = util.filter(
                                        (u) => u.utilization_percent_week < 50
                                    ).length;
                                    const totalConflicts = util.reduce(
                                        (s, u) => s + u.conflict_count,
                                        0
                                    );

                                    return (
                                        <div className="density-gap-section">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <MetricCard
                                                    label="Over-Allocated"
                                                    value={overAllocated}
                                                    icon={Flame}
                                                    variant={
                                                        overAllocated > 0 ? "danger" : "default"
                                                    }
                                                    unit="people"
                                                />
                                                <MetricCard
                                                    label="Under-Utilized"
                                                    value={underUtilized}
                                                    icon={Clock}
                                                    variant={
                                                        underUtilized > 2 ? "warning" : "default"
                                                    }
                                                    unit="people"
                                                />
                                                <MetricCard
                                                    label="Scheduling Conflicts"
                                                    value={totalConflicts}
                                                    icon={AlertTriangle}
                                                    variant={
                                                        totalConflicts > 0 ? "warning" : "success"
                                                    }
                                                />
                                            </div>
                                            <HeatmapGrid
                                                rows={heatmapRows}
                                                columnLabels={weekDayLabels}
                                                maxValue={100}
                                                formatValue={(v) => `${v}%`}
                                                colorScale="utilization"
                                            />
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    )}

                    {/* Gantt View */}
                    {activeView === "gantt" && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <GanttChartIcon className="h-4 w-4 text-primary" />
                                        Production Timeline
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <GanttChart
                                    tasks={ganttTasks}
                                    startDate={ganttDateRange.start}
                                    endDate={ganttDateRange.end}
                                    granularity="day"
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Schedule View (existing) */}
                    {activeView === "schedule" && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Weekly Schedule</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigateWeek(-1)}
                                            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                                            aria-label="Previous week"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <span className="text-sm font-medium min-w-40 text-center">
                                            {weekDays[0] ? formatDate(weekDays[0], "compact") : ""}{" "}
                                            — {weekDays[6] ? formatDate(weekDays[6], "medium") : ""}
                                        </span>
                                        <button
                                            onClick={() => navigateWeek(1)}
                                            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                                            aria-label="Next week"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px]">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left p-3 text-xs font-semibold text-muted-foreground w-48">
                                                    Crew Member
                                                </th>
                                                {weekDays.map((day) => {
                                                    const isToday =
                                                        formatDateKey(day) ===
                                                        formatDateKey(new Date());
                                                    return (
                                                        <th
                                                            key={day.toISOString()}
                                                            className={`text-center p-3 text-xs font-semibold ${isToday ? "bg-primary/5 text-primary" : "text-muted-foreground"}`}
                                                        >
                                                            <div>
                                                                {new Intl.DateTimeFormat(
                                                                    undefined,
                                                                    {
                                                                        weekday: "short",
                                                                    }
                                                                ).format(day)}
                                                            </div>
                                                            <div className="text-sm font-bold">
                                                                {day.getDate()}
                                                            </div>
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredCrew.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="p-0">
                                                        <EmptyState
                                                            icon={CalendarDays}
                                                            title="No crew members found"
                                                            description="No crew members match the current filters"
                                                            compact
                                                        />
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredCrew.map((crew) => (
                                                    <tr
                                                        key={crew.id}
                                                        className="border-b border-border/50 hover:bg-secondary/20"
                                                    >
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar
                                                                    name={crew.name}
                                                                    size="sm"
                                                                />
                                                                <div>
                                                                    <p className="text-xs font-medium">
                                                                        {crew.name}
                                                                    </p>
                                                                    <p className="density-caption text-muted-foreground">
                                                                        {crew.role}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {weekDays.map((day) => {
                                                            const shifts = getShiftsForDateAndCrew(
                                                                day,
                                                                crew.id
                                                            );
                                                            const isToday =
                                                                formatDateKey(day) ===
                                                                formatDateKey(new Date());
                                                            return (
                                                                <td
                                                                    key={day.toISOString()}
                                                                    className={`p-1.5 ${isToday ? "bg-primary/5" : ""}`}
                                                                >
                                                                    {shifts.map((shift) => {
                                                                        const project =
                                                                            projects.find(
                                                                                (p) =>
                                                                                    p.id ===
                                                                                    shift.projectId
                                                                            );
                                                                        const config =
                                                                            statusConfig[
                                                                                shift.status
                                                                            ];
                                                                        return (
                                                                            <div
                                                                                key={shift.id}
                                                                                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer mb-1"
                                                                            >
                                                                                <p className="density-caption font-medium truncate">
                                                                                    {project?.name}
                                                                                </p>
                                                                                <p className="density-caption text-muted-foreground">
                                                                                    {
                                                                                        shift.startTime
                                                                                    }{" "}
                                                                                    —{" "}
                                                                                    {shift.endTime}
                                                                                </p>
                                                                                <Badge
                                                                                    variant={
                                                                                        config.variant
                                                                                    }
                                                                                    className="density-micro mt-1 px-1"
                                                                                >
                                                                                    {config.label}
                                                                                </Badge>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    {shifts.length === 0 && (
                                                                        <div className="h-16 flex items-center justify-center">
                                                                            <span className="density-caption text-muted-foreground/50">
                                                                                —
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            ),
        }),
        [
            activeView,
            setActiveView,
            selectedProject,
            projects,
            openCreate,
            filteredCrew,
            totalScheduledHours,
            shifts,
            utilizationData,
            ganttTasks,
            ganttDateRange,
            weekDays,
            navigateWeek,
            getShiftsForDateAndCrew,
            statusConfig,
        ]
    );

    return (
        <>
            <OperationalDashboardShell
                config={config}
                data={shifts as unknown as Record<string, unknown>[]}
                isLoading={isLoading}
            />
            <CreateEntityDialog
                config={CREATE_SHIFT_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </>
    );
}
