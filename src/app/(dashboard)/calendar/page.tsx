"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React, { useCallback, useRef, useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { PageShell } from "@/components/layouts/page-shell";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_EVENT_CONFIG } from "@/config/create-entity-configs";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useApprovals, useProjects, useTasks } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import type {
    Approval,
    FabricationStatus,
    Project,
    ProjectPhase,
    ProjectStatus,
    Task,
    TaskPriority,
    TaskStatus,
} from "@/types";
import {
    Calendar as CalendarIcon,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Clock,
    FolderKanban,
    Plus,
    ShieldCheck,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

type EventType = "project" | "task" | "approval" | "milestone";

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    type: EventType;
    projectName?: string;
    status?: string;
}

const eventTypeConfig: Record<EventType, { color: string; icon: typeof CalendarIcon }> = {
    project: { color: "bg-primary", icon: FolderKanban },
    task: { color: "bg-info", icon: CheckSquare },
    approval: { color: "bg-warning", icon: ShieldCheck },
    milestone: { color: "bg-success", icon: CalendarIcon },
};

export default function CalendarPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [currentDate, setCurrentDate] = useState(new Date());
    const VIEW_MODES = ["month", "week"] as const;
    const [view, setView] = useQueryTabState({
        key: "view",
        defaultValue: "month",
        validValues: VIEW_MODES,
    });

    const { data: sbProjects, isLoading: loadingProjects } = useProjects();
    const { data: sbTasks, isLoading: loadingTasks } = useTasks();
    const { data: sbApprovals, isLoading: loadingApprovals } = useApprovals();

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

    const allTasks: Task[] = (sbTasks ?? []).map((t) => ({
        id: t.id,
        projectId: t.project_id,
        parentId: t.parent_id ?? undefined,
        title: t.title,
        description: t.description ?? undefined,
        status: t.status as TaskStatus,
        priority: t.priority as TaskPriority,
        assigneeId: t.assignee_id ?? undefined,
        phase: t.phase as ProjectPhase,
        fabricationStatus: t.fabrication_status as FabricationStatus | undefined,
        materialCost: t.material_cost ?? undefined,
        startDate: t.start_date ?? undefined,
        dueDate: t.due_date ?? undefined,
        completedAt: t.completed_at ?? undefined,
        dependencies: [],
        createdAt: t.created_at ?? new Date().toISOString(),
    }));

    const approvals: Approval[] = (sbApprovals ?? []).map((a) => ({
        id: a.id,
        projectId: a.project_id,
        milestoneId: a.milestone_id,
        milestoneName: a.milestone_name,
        status: a.status as Approval["status"],
        requestedAt: a.requested_at,
        deadline: a.deadline,
        approvedAt: a.approved_at ?? undefined,
        approverName:
            (a as unknown as { user_profiles?: { display_name: string } }).user_profiles
                ?.display_name || "",
        deliverableUrl: a.deliverable_url ?? undefined,
        timelineImpactDays: a.timeline_impact_days ?? undefined,
    }));

    const isLoading = loadingProjects || loadingTasks || loadingApprovals;

    if (isLoading) {
        return <LoadingState />;
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const events: CalendarEvent[] = [
        ...projects.map((p) => ({
            id: `proj-start-${p.id}`,
            title: `${p.name} — Start`,
            date: p.startDate,
            type: "project" as EventType,
            projectName: p.client,
            status: p.status,
        })),
        ...projects.map((p) => ({
            id: `proj-end-${p.id}`,
            title: `${p.name} — End`,
            date: p.endDate,
            type: "milestone" as EventType,
            projectName: p.client,
        })),
        ...allTasks
            .filter((t) => t.dueDate)
            .map((t) => ({
                id: `task-${t.id}`,
                title: t.title,
                date: t.dueDate!,
                type: "task" as EventType,
                status: t.status,
            })),
        ...approvals.map((a) => ({
            id: `approval-${a.id}`,
            title: a.milestoneName,
            date: a.deadline.split("T")[0] ?? "",
            type: "approval" as EventType,
            status: a.status,
        })),
    ];

    const getEventsForDate = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return events.filter((e) => e.date === dateStr);
    };

    const navigateMonth = (direction: number) => {
        setCurrentDate(new Date(year, month + direction, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const today = new Date();
    const isToday = (day: number) =>
        today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

    const calendarDays = [];
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    return (
        <PermissionGate resource="calendar" action="read">
            <PageShell
                title="Calendar"
                description="Unified view of projects, tasks, and milestones"
                actions={
                    <div className="flex items-center gap-2">
                        <SegmentedControl
                            value={view}
                            onValueChange={(v) => setView(v as "month" | "week")}
                            options={[
                                { value: "month", label: "Month" },
                                { value: "week", label: "Week" },
                            ]}
                            ariaLabel="Calendar view"
                        />
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="h-4 w-4" />
                            Add Event
                        </Button>
                    </div>
                }
            >
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigateMonth(-1)}
                                    aria-label="Previous month"
                                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <h2
                                    className="text-lg font-bold min-w-48 text-center"
                                    id="calendar-month-label"
                                >
                                    {monthName}
                                </h2>
                                <button
                                    onClick={() => navigateMonth(1)}
                                    aria-label="Next month"
                                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <Button variant="ghost" size="sm" onClick={goToToday}>
                                Today
                            </Button>
                        </div>

                        <CalendarGrid
                            weekDays={weekDays}
                            calendarDays={calendarDays}
                            getEventsForDate={getEventsForDate}
                            isToday={isToday}
                            monthName={monthName}
                        />

                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                            {(
                                Object.entries(eventTypeConfig) as [
                                    EventType,
                                    (typeof eventTypeConfig)[EventType],
                                ][]
                            ).map(([type, config]) => (
                                <div
                                    key={type}
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                                >
                                    <div className={`h-2.5 w-2.5 rounded ${config.color}`} />
                                    <span>
                                        {
                                            {
                                                project: "Project",
                                                task: "Task",
                                                approval: "Approval",
                                                milestone: "Milestone",
                                            }[type]
                                        }
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardContent>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-warning" />
                                Upcoming Deadlines
                            </h3>
                            <div className="space-y-2">
                                {events
                                    .filter((e) => new Date(e.date) >= today)
                                    .sort(
                                        (a, b) =>
                                            new Date(a.date).getTime() - new Date(b.date).getTime()
                                    )
                                    .slice(0, 5)
                                    .map((event) => {
                                        const config = eventTypeConfig[event.type];
                                        const Icon = config.icon;
                                        return (
                                            <div
                                                key={event.id}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                                            >
                                                <div
                                                    className={`h-8 w-8 rounded-lg ${config.color} flex items-center justify-center`}
                                                >
                                                    <Icon className="h-4 w-4 text-primary-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">
                                                        {event.title}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {formatDate(event.date)}
                                                    </p>
                                                </div>
                                                <Badge variant="ghost" className="text-[9px]">
                                                    {event.type}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <FolderKanban className="h-4 w-4 text-primary" />
                                Active Projects Timeline
                            </h3>
                            <div className="space-y-3">
                                {projects
                                    .filter((p) => p.status === "active")
                                    .map((project) => {
                                        const start = new Date(project.startDate);
                                        const end = new Date(project.endDate);
                                        const total = end.getTime() - start.getTime();
                                        const elapsed = today.getTime() - start.getTime();
                                        const progress = Math.min(
                                            100,
                                            Math.max(0, (elapsed / total) * 100)
                                        );

                                        return (
                                            <div key={project.id} className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-medium">
                                                        {project.name}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {formatDate(project.startDate)} —{" "}
                                                        {formatDate(project.endDate)}
                                                    </p>
                                                </div>
                                                <ProgressBar value={progress} size="md" />
                                            </div>
                                        );
                                    })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageShell>
            <CreateEntityDialog
                config={CREATE_EVENT_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}

function CalendarGrid({
    weekDays,
    calendarDays,
    getEventsForDate,
    isToday,
    monthName,
}: {
    weekDays: string[];
    calendarDays: (number | null)[];
    getEventsForDate: (day: number) => CalendarEvent[];
    isToday: (day: number) => boolean;
    monthName: string;
}) {
    const gridRef = useRef<HTMLDivElement>(null);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    const focusableIndices = calendarDays
        .map((day, i) => (day !== null ? i : -1))
        .filter((i) => i !== -1);

    const handleGridKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (focusedIndex === null) return;

            let nextIndex: number | null = null;

            switch (e.key) {
                case "ArrowRight":
                    nextIndex = focusableIndices.find((i) => i > focusedIndex) ?? null;
                    break;
                case "ArrowLeft":
                    nextIndex =
                        [...focusableIndices].reverse().find((i) => i < focusedIndex) ?? null;
                    break;
                case "ArrowDown":
                    nextIndex = focusableIndices.find((i) => i >= focusedIndex + 7) ?? null;
                    break;
                case "ArrowUp":
                    nextIndex =
                        [...focusableIndices].reverse().find((i) => i <= focusedIndex - 7) ?? null;
                    break;
                case "Home":
                    nextIndex = focusableIndices[0] ?? null;
                    break;
                case "End":
                    nextIndex = focusableIndices[focusableIndices.length - 1] ?? null;
                    break;
                default:
                    return;
            }

            if (nextIndex !== null) {
                e.preventDefault();
                setFocusedIndex(nextIndex);
                const cell = gridRef.current?.querySelector(
                    `[data-cell-index="${nextIndex}"]`
                ) as HTMLElement | null;
                cell?.focus();
            }
        },
        [focusedIndex, focusableIndices]
    );

    const rows: (number | null)[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        rows.push(calendarDays.slice(i, i + 7));
    }

    return (
        <div
            ref={gridRef}
            role="grid"
            aria-labelledby="calendar-month-label"
            aria-label={`Calendar for ${monthName}`}
            className="rounded-xl overflow-hidden border border-border"
            onKeyDown={handleGridKeyDown}
        >
            <div role="rowgroup">
                <div role="row" className="grid grid-cols-7 gap-px bg-border">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            role="columnheader"
                            className="bg-secondary/50 p-2 text-center text-xs font-semibold text-muted-foreground"
                        >
                            {day}
                        </div>
                    ))}
                </div>
            </div>
            <div role="rowgroup" className="bg-border">
                {rows.map((row, rowIdx) => (
                    <div key={rowIdx} role="row" className="grid grid-cols-7 gap-px">
                        {row.map((day, colIdx) => {
                            const cellIndex = rowIdx * 7 + colIdx;
                            const dayEvents = day ? getEventsForDate(day) : [];
                            const dateLabel = day
                                ? `${monthName.split(" ")[0]} ${day}${dayEvents.length > 0 ? `, ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}` : ""}`
                                : undefined;

                            return (
                                <div
                                    key={cellIndex}
                                    role="gridcell"
                                    tabIndex={
                                        day
                                            ? focusedIndex === cellIndex ||
                                              (focusedIndex === null && isToday(day))
                                                ? 0
                                                : -1
                                            : undefined
                                    }
                                    aria-label={dateLabel}
                                    aria-selected={day ? isToday(day) : undefined}
                                    data-cell-index={cellIndex}
                                    onFocus={() => day && setFocusedIndex(cellIndex)}
                                    className={`bg-card min-h-28 p-1.5 ${day ? "hover:bg-secondary/30 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset" : "bg-muted/30"}`}
                                >
                                    {day && (
                                        <>
                                            <div
                                                className={`text-xs font-medium mb-1 h-6 w-6 flex items-center justify-center rounded-full ${isToday(day) ? "bg-primary text-primary-foreground" : ""}`}
                                            >
                                                {day}
                                            </div>
                                            <div className="space-y-0.5">
                                                {dayEvents.slice(0, 3).map((event) => {
                                                    const config = eventTypeConfig[event.type];
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            className={`text-[10px] px-1.5 py-0.5 rounded truncate ${config.color} text-primary-foreground`}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    );
                                                })}
                                                {dayEvents.length > 3 && (
                                                    <div className="text-[10px] text-muted-foreground px-1">
                                                        +{dayEvents.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
