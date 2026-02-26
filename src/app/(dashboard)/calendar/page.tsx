"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useProjects, useTasks, useApprovals, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { MOCK_PROJECTS, MOCK_TASKS, MOCK_APPROVALS } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Loader2 } from "lucide-react";
import type { Project, Task, Approval, ProjectStatus, ProjectPhase, TaskStatus, TaskPriority, FabricationStatus } from "@/types";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    FolderKanban,
    CheckSquare,
    ShieldCheck,
} from "lucide-react";

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
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"month" | "week">("month");

    const { data: sbProjects, isLoading: loadingProjects } = useProjects();
    const { data: sbTasks, isLoading: loadingTasks } = useTasks();
    const { data: sbApprovals, isLoading: loadingApprovals } = useApprovals();

    const projects: Project[] = isSupabaseConfigured && sbProjects ? sbProjects.map(p => ({
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
        managerId: p.manager_id ?? '',
        teamIds: [],
        createdAt: p.created_at ?? new Date().toISOString(),
    })) : MOCK_PROJECTS;

    const allTasks: Task[] = isSupabaseConfigured && sbTasks ? sbTasks.map(t => ({
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
    })) : MOCK_TASKS;

    const approvals: Approval[] = isSupabaseConfigured && sbApprovals ? sbApprovals.map(a => ({
        id: a.id,
        projectId: a.project_id,
        milestoneId: a.milestone_id,
        milestoneName: a.milestone_name,
        status: a.status as Approval["status"],
        requestedAt: a.requested_at,
        deadline: a.deadline,
        approvedAt: a.approved_at ?? undefined,
        approverName: ((a as unknown as { profiles?: { name: string } }).profiles?.name) || "",
        deliverableUrl: a.deliverable_url ?? undefined,
        timelineImpactDays: a.timeline_impact_days ?? undefined,
    })) : MOCK_APPROVALS;

    const isLoading = isSupabaseConfigured && (loadingProjects || loadingTasks || loadingApprovals);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
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
        ...allTasks.filter((t) => t.dueDate).map((t) => ({
            id: `task-${t.id}`,
            title: t.title,
            date: t.dueDate!,
            type: "task" as EventType,
            status: t.status,
        })),
        ...approvals.map((a) => ({
            id: `approval-${a.id}`,
            title: a.milestoneName,
            date: a.deadline.split("T")[0],
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
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Calendar" description="Unified view of projects, tasks, and milestones">
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-input overflow-hidden">
                        <button
                            onClick={() => setView("month")}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "month" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setView("week")}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "week" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                        >
                            Week
                        </button>
                    </div>
                    <Button size="sm">
                        <Plus className="h-4 w-4" />
                        Add Event
                    </Button>
                </div>
            </PageHeader>

            <Card>
                <CardContent>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <h2 className="text-lg font-bold min-w-48 text-center">{monthName}</h2>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={goToToday}>
                            Today
                        </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
                        {weekDays.map((day) => (
                            <div key={day} className="bg-secondary/50 p-2 text-center text-xs font-semibold text-muted-foreground">
                                {day}
                            </div>
                        ))}

                        {calendarDays.map((day, index) => {
                            const dayEvents = day ? getEventsForDate(day) : [];
                            return (
                                <div
                                    key={index}
                                    className={`bg-card min-h-28 p-1.5 ${day ? "hover:bg-secondary/30 cursor-pointer transition-colors" : "bg-muted/30"}`}
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
                                                            className={`text-[10px] px-1.5 py-0.5 rounded truncate ${config.color} text-white`}
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

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                        {(Object.entries(eventTypeConfig) as [EventType, typeof eventTypeConfig[EventType]][]).map(([type, config]) => (
                            <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <div className={`h-2.5 w-2.5 rounded ${config.color}`} />
                                <span className="capitalize">{type}</span>
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
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .slice(0, 5)
                                .map((event) => {
                                    const config = eventTypeConfig[event.type];
                                    const Icon = config.icon;
                                    return (
                                        <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                                            <div className={`h-8 w-8 rounded-lg ${config.color} flex items-center justify-center`}>
                                                <Icon className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{event.title}</p>
                                                <p className="text-[10px] text-muted-foreground">{formatDate(event.date)}</p>
                                            </div>
                                            <Badge variant="ghost" className="text-[9px]">{event.type}</Badge>
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
                            {projects.filter((p) => p.status === "active").map((project) => {
                                const start = new Date(project.startDate);
                                const end = new Date(project.endDate);
                                const total = end.getTime() - start.getTime();
                                const elapsed = today.getTime() - start.getTime();
                                const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));

                                return (
                                    <div key={project.id} className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium">{project.name}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatDate(project.startDate)} — {formatDate(project.endDate)}
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
        </div>
    );
}
