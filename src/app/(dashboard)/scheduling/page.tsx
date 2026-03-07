"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { MetricCard } from "@/components/ui/metric-card";
import { HeatmapGrid } from "@/components/ui/heatmap-grid";
import { GanttChart, type GanttTask } from "@/components/ui/gantt-chart";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Avatar } from "@/components/ui/avatar";
import { useCrewMembers, useProjects, useShifts } from "@/lib/supabase/hooks";
import { useCrewUtilization } from "@/lib/supabase/hooks-feature-gaps";
import { formatDate } from "@/lib/locale";
import type { CrewMember, Project, ProjectPhase, ProjectStatus } from "@/types";
import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Flame,
    GanttChartIcon,
    Loader2,
    Plus,
    Users,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";
import { useQueryTabState } from "@/hooks/use-query-tab-state";

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

// Mock utilization data for demo mode
const PLACEHOLDER_UTILIZATION = [
    {
        id: "c1",
        name: "Sarah Chen",
        role: "Lead Fabricator",
        department: "Production",
        utilizationWeek: 95,
        utilizationMonth: 82,
        bookedWeek: 38,
        conflicts: 0,
    },
    {
        id: "c2",
        name: "Mike Rodriguez",
        role: "Rigging Specialist",
        department: "Production",
        utilizationWeek: 110,
        utilizationMonth: 88,
        bookedWeek: 44,
        conflicts: 1,
    },
    {
        id: "c3",
        name: "Aisha Patel",
        role: "Electrician",
        department: "Technical",
        utilizationWeek: 60,
        utilizationMonth: 72,
        bookedWeek: 24,
        conflicts: 0,
    },
    {
        id: "c4",
        name: "James Wilson",
        role: "General Labor",
        department: "Production",
        utilizationWeek: 40,
        utilizationMonth: 55,
        bookedWeek: 16,
        conflicts: 0,
    },
    {
        id: "c5",
        name: "Lisa Thompson",
        role: "AV Technician",
        department: "Technical",
        utilizationWeek: 85,
        utilizationMonth: 78,
        bookedWeek: 34,
        conflicts: 0,
    },
    {
        id: "c6",
        name: "David Kim",
        role: "Scenic Artist",
        department: "Creative",
        utilizationWeek: 75,
        utilizationMonth: 70,
        bookedWeek: 30,
        conflicts: 0,
    },
    {
        id: "c7",
        name: "Emma Davis",
        role: "Production Manager",
        department: "Management",
        utilizationWeek: 100,
        utilizationMonth: 92,
        bookedWeek: 40,
        conflicts: 2,
    },
    {
        id: "c8",
        name: "Carlos Ramirez",
        role: "Carpenter",
        department: "Production",
        utilizationWeek: 0,
        utilizationMonth: 45,
        bookedWeek: 0,
        conflicts: 0,
    },
];

// Mock Gantt tasks for demo mode
const PLACEHOLDER_GANTT_TASKS: GanttTask[] = [
    {
        id: "g1",
        label: "CES Booth Build",
        sublabel: "Sarah, Mike",
        startDate: "2026-02-20",
        endDate: "2026-03-05",
        progress: 65,
        resourceId: "c1",
    },
    {
        id: "g2",
        label: "SXSW Activation",
        sublabel: "Aisha, James",
        startDate: "2026-02-24",
        endDate: "2026-03-12",
        progress: 30,
        resourceId: "c3",
    },
    {
        id: "g3",
        label: "Brand Launch NYC",
        sublabel: "Lisa, David",
        startDate: "2026-03-01",
        endDate: "2026-03-15",
        progress: 10,
        resourceId: "c5",
    },
    {
        id: "g4",
        label: "Corporate Gala Setup",
        sublabel: "Emma, Carlos",
        startDate: "2026-02-26",
        endDate: "2026-03-02",
        progress: 80,
        resourceId: "c7",
    },
    {
        id: "g5",
        label: "Festival Stage Build",
        sublabel: "Mike, Carlos",
        startDate: "2026-03-03",
        endDate: "2026-03-18",
        progress: 0,
        hasConflict: true,
        resourceId: "c2",
    },
    {
        id: "g6",
        label: "Product Demo Install",
        sublabel: "Sarah",
        startDate: "2026-03-08",
        endDate: "2026-03-14",
        progress: 0,
        resourceId: "c1",
    },
];

type ScheduleView = "schedule" | "utilization" | "gantt";

const VIEW_OPTIONS: { value: ScheduleView; label: string }[] = [
    { value: "schedule", label: "Schedule" },
    { value: "utilization", label: "Utilization" },
    { value: "gantt", label: "Gantt" },
];

export default function SchedulingPage() {
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
    const { data: utilizationData } = useCrewUtilization();

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
        client: p.client,
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        return date;
    });

    const navigateWeek = (direction: number) => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + direction * 7);
        setCurrentWeekStart(newDate);
    };

    const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

    const getShiftsForDateAndCrew = (date: Date, crewId: string) => {
        const dateKey = formatDateKey(date);
        return shifts.filter(
            (s) =>
                s.date === dateKey &&
                s.crewMemberId === crewId &&
                (selectedProject === "all" || s.projectId === selectedProject)
        );
    };

    const filteredCrew =
        selectedProject === "all"
            ? crew
            : crew.filter((c) =>
                  shifts.some((s) => s.crewMemberId === c.id && s.projectId === selectedProject)
              );

    const totalScheduledHours = shifts.reduce((sum, shift) => {
        const start = parseInt(shift.startTime.split(":")[0] ?? "0");
        const end = parseInt(shift.endTime.split(":")[0] ?? "0");
        return sum + (end - start);
    }, 0);

    const statusConfig = {
        scheduled: { label: "Scheduled", variant: "ghost" as const, icon: Clock },
        checked_in: { label: "Checked In", variant: "success" as const, icon: CheckCircle2 },
        checked_out: { label: "Checked Out", variant: "info" as const, icon: CheckCircle2 },
        no_show: { label: "No Show", variant: "destructive" as const, icon: AlertTriangle },
    };

    return (
        <PermissionGate resource="scheduling" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Crew Scheduling"
                    description="Shift management and labor allocation across productions"
                >
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
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            Add Shift
                        </Button>
                    </div>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Crew Scheduled" value={filteredCrew.length} icon={Users} />
                    <StatCard
                        title="Total Hours This Week"
                        value={totalScheduledHours}
                        icon={Clock}
                    />
                    <StatCard
                        title="Currently On-Site"
                        value={shifts.filter((s) => s.status === "checked_in").length}
                        icon={CheckCircle2}
                    />
                    {(() => {
                        const util = utilizationData ?? PLACEHOLDER_UTILIZATION;
                        const avgUtil =
                            util.length > 0
                                ? Math.round(
                                      util.reduce(
                                          (s, u) =>
                                              s +
                                              ("utilizationWeek" in u
                                                  ? u.utilizationWeek
                                                  : (u as { utilization_percent_week: number })
                                                        .utilization_percent_week),
                                          0
                                      ) / util.length
                                  )
                                : 0;
                        return (
                            <StatCard
                                title="Avg Utilization"
                                value={`${avgUtil}%`}
                                icon={BarChart3}
                                change={avgUtil > 80 ? 5 : -3}
                                description="this week"
                            />
                        );
                    })()}
                </div>

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
                                const util = utilizationData ?? PLACEHOLDER_UTILIZATION;
                                const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];

                                const heatmapRows = util.map((u) => {
                                    const name = "name" in u ? u.name : "";
                                    const role = "role" in u ? u.role : "";
                                    const weekUtil =
                                        "utilizationWeek" in u
                                            ? u.utilizationWeek
                                            : (u as { utilization_percent_week: number })
                                                  .utilization_percent_week;
                                    const conflicts =
                                        "conflicts" in u
                                            ? u.conflicts
                                            : (u as { conflict_count: number }).conflict_count;

                                    // Distribute weekly utilization across days with some variance
                                    const dailyBase = weekUtil / 5;
                                    const cells = weekDayLabels.map((_, i) => {
                                        const variance = i % 3 === 0 ? 10 : i % 2 === 0 ? -5 : 5;
                                        const val = Math.max(
                                            0,
                                            Math.min(150, Math.round(dailyBase + variance))
                                        );
                                        return {
                                            value: val,
                                            tooltip: `${name}: ${val}% on ${weekDayLabels[i]}`,
                                        };
                                    });

                                    return {
                                        id:
                                            "id" in u
                                                ? (u as { id: string }).id
                                                : (u as { crew_member_id: string }).crew_member_id,
                                        label: name,
                                        sublabel: `${role}${conflicts > 0 ? ` • ${conflicts} conflict${conflicts !== 1 ? "s" : ""}` : ""}`,
                                        cells,
                                    };
                                });

                                // Summary metrics
                                const overAllocated = util.filter((u) => {
                                    const v =
                                        "utilizationWeek" in u
                                            ? u.utilizationWeek
                                            : (u as { utilization_percent_week: number })
                                                  .utilization_percent_week;
                                    return v > 100;
                                }).length;
                                const underUtilized = util.filter((u) => {
                                    const v =
                                        "utilizationWeek" in u
                                            ? u.utilizationWeek
                                            : (u as { utilization_percent_week: number })
                                                  .utilization_percent_week;
                                    return v < 50;
                                }).length;
                                const totalConflicts = util.reduce((s, u) => {
                                    const c =
                                        "conflicts" in u
                                            ? u.conflicts
                                            : (u as { conflict_count: number }).conflict_count;
                                    return s + c;
                                }, 0);

                                return (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <MetricCard
                                                label="Over-Allocated"
                                                value={overAllocated}
                                                icon={Flame}
                                                variant={overAllocated > 0 ? "danger" : "default"}
                                                unit="people"
                                            />
                                            <MetricCard
                                                label="Under-Utilized"
                                                value={underUtilized}
                                                icon={Clock}
                                                variant={underUtilized > 2 ? "warning" : "default"}
                                                unit="people"
                                            />
                                            <MetricCard
                                                label="Scheduling Conflicts"
                                                value={totalConflicts}
                                                icon={AlertTriangle}
                                                variant={totalConflicts > 0 ? "warning" : "success"}
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
                                tasks={PLACEHOLDER_GANTT_TASKS}
                                startDate="2026-02-17"
                                endDate="2026-03-22"
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
                                        {weekDays[0] ? formatDate(weekDays[0], "compact") : ""} —{" "}
                                        {weekDays[6] ? formatDate(weekDays[6], "medium") : ""}
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
                                                            {new Intl.DateTimeFormat(undefined, {
                                                                weekday: "short",
                                                            }).format(day)}
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
                                        {filteredCrew.map((crew) => (
                                            <tr
                                                key={crew.id}
                                                className="border-b border-border/50 hover:bg-secondary/20"
                                            >
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar name={crew.name} size="sm" />
                                                        <div>
                                                            <p className="text-xs font-medium">
                                                                {crew.name}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground">
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
                                                                const project = projects.find(
                                                                    (p) => p.id === shift.projectId
                                                                );
                                                                const config =
                                                                    statusConfig[shift.status];
                                                                return (
                                                                    <div
                                                                        key={shift.id}
                                                                        className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer mb-1"
                                                                    >
                                                                        <p className="text-[10px] font-medium truncate">
                                                                            {project?.name}
                                                                        </p>
                                                                        <p className="text-[9px] text-muted-foreground">
                                                                            {shift.startTime} —{" "}
                                                                            {shift.endTime}
                                                                        </p>
                                                                        <Badge
                                                                            variant={config.variant}
                                                                            className="text-[8px] mt-1 px-1"
                                                                        >
                                                                            {config.label}
                                                                        </Badge>
                                                                    </div>
                                                                );
                                                            })}
                                                            {shifts.length === 0 && (
                                                                <div className="h-16 flex items-center justify-center">
                                                                    <span className="text-[10px] text-muted-foreground/50">
                                                                        —
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PermissionGate>
    );
}
