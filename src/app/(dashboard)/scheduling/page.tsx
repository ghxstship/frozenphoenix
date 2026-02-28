"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { useCrewMembers, useProjects, useShifts, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { MOCK_CREW, MOCK_PROJECTS } from "@/lib/demo-data";
import { formatDate } from "@/lib/locale";
import type { CrewMember, Project, ProjectStatus, ProjectPhase } from "@/types";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    Users,
    AlertTriangle,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { PermissionGate } from "@/components/permission-guard";

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

const MOCK_SHIFTS: Shift[] = [
    { id: "sh1", crewMemberId: "c1", projectId: "p1", date: "2026-02-24", startTime: "07:00", endTime: "17:00", role: "Lead Fabricator", status: "scheduled" },
    { id: "sh2", crewMemberId: "c2", projectId: "p1", date: "2026-02-24", startTime: "08:00", endTime: "18:00", role: "Rigging Specialist", status: "scheduled" },
    { id: "sh3", crewMemberId: "c3", projectId: "p2", date: "2026-02-24", startTime: "09:00", endTime: "17:00", role: "Electrician", status: "checked_in" },
    { id: "sh4", crewMemberId: "c1", projectId: "p1", date: "2026-02-25", startTime: "07:00", endTime: "17:00", role: "Lead Fabricator", status: "scheduled" },
    { id: "sh5", crewMemberId: "c2", projectId: "p1", date: "2026-02-25", startTime: "08:00", endTime: "18:00", role: "Rigging Specialist", status: "scheduled" },
    { id: "sh6", crewMemberId: "c4", projectId: "p2", date: "2026-02-25", startTime: "06:00", endTime: "14:00", role: "General Labor", status: "scheduled" },
];

export default function SchedulingPage() {
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day;
        return new Date(today.setDate(diff));
    });
    const [selectedProject, setSelectedProject] = useState<string>("all");

    const { data: sbCrew, isLoading: loadingCrew } = useCrewMembers();
    const { data: sbProjects, isLoading: loadingProjects } = useProjects();
    const { data: sbShifts, isLoading: loadingShifts } = useShifts();

    const crew: CrewMember[] = isSupabaseConfigured && sbCrew ? sbCrew.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        avatar: c.avatar_url ?? undefined,
        hourlyRate: c.hourly_rate,
        status: c.status as "available" | "assigned" | "unavailable",
        certifications: [],
    })) : MOCK_CREW;

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

    const shifts: Shift[] = isSupabaseConfigured && sbShifts ? sbShifts.map(s => ({
        id: s.id,
        crewMemberId: s.crew_member_id,
        projectId: s.project_id,
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
        role: s.role ?? '',
        status: s.status as Shift["status"],
    })) : MOCK_SHIFTS;

    const isLoading = isSupabaseConfigured && (loadingCrew || loadingProjects || loadingShifts);

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

    const filteredCrew = selectedProject === "all"
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
            <PageHeader title="Crew Scheduling" description="Shift management and labor allocation across productions">
                <div className="flex items-center gap-2">
                    <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                    >
                        <option value="all">All Projects</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <Button size="sm">
                        <Plus className="h-4 w-4" />
                        Add Shift
                    </Button>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Crew Scheduled" value={filteredCrew.length} icon={Users} />
                <StatCard title="Total Hours This Week" value={totalScheduledHours} icon={Clock} />
                <StatCard title="Currently On-Site" value={shifts.filter((s) => s.status === "checked_in").length} icon={CheckCircle2} />
            </div>

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
                                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground w-48">Crew Member</th>
                                    {weekDays.map((day) => {
                                        const isToday = formatDateKey(day) === formatDateKey(new Date());
                                        return (
                                            <th
                                                key={day.toISOString()}
                                                className={`text-center p-3 text-xs font-semibold ${isToday ? "bg-primary/5 text-primary" : "text-muted-foreground"}`}
                                            >
                                                <div>{new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(day)}</div>
                                                <div className="text-sm font-bold">{day.getDate()}</div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCrew.map((crew) => (
                                    <tr key={crew.id} className="border-b border-border/50 hover:bg-secondary/20">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <Avatar name={crew.name} size="sm" />
                                                <div>
                                                    <p className="text-xs font-medium">{crew.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{crew.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {weekDays.map((day) => {
                                            const shifts = getShiftsForDateAndCrew(day, crew.id);
                                            const isToday = formatDateKey(day) === formatDateKey(new Date());
                                            return (
                                                <td
                                                    key={day.toISOString()}
                                                    className={`p-1.5 ${isToday ? "bg-primary/5" : ""}`}
                                                >
                                                    {shifts.map((shift) => {
                                                        const project = projects.find((p) => p.id === shift.projectId);
                                                        const config = statusConfig[shift.status];
                                                        return (
                                                            <div
                                                                key={shift.id}
                                                                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer mb-1"
                                                            >
                                                                <p className="text-[10px] font-medium truncate">{project?.name}</p>
                                                                <p className="text-[9px] text-muted-foreground">
                                                                    {shift.startTime} — {shift.endTime}
                                                                </p>
                                                                <Badge variant={config.variant} className="text-[8px] mt-1 px-1">
                                                                    {config.label}
                                                                </Badge>
                                                            </div>
                                                        );
                                                    })}
                                                    {shifts.length === 0 && (
                                                        <div className="h-16 flex items-center justify-center">
                                                            <span className="text-[10px] text-muted-foreground/50">—</span>
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
        </div>
        </PermissionGate>
    );
}
