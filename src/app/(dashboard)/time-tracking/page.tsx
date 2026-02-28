"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
    Clock, Plus, Play, Pause, Square,
    Calendar, AlertTriangle, Timer,
    ChevronLeft, ChevronRight, BarChart3, Loader2,
} from "lucide-react";
import { useTimeEntries, isSupabaseConfigured } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

type TimeEntryStatus = "draft" | "submitted" | "approved" | "rejected";
type TrackingMode = "daily" | "weekly" | "timer";

interface TimeEntry {
    id: string;
    date: string;
    project: string;
    task: string;
    hours: number;
    description: string;
    billable: boolean;
    status: TimeEntryStatus;
    rate: number;
}


const mockEntries: TimeEntry[] = [
    { id: "1", date: "2026-02-25", project: "Nike Air Max Launch", task: "Stage design revisions", hours: 4.5, description: "Updated 3D renders for client review", billable: true, status: "draft", rate: 150 },
    { id: "2", date: "2026-02-25", project: "Red Bull Festival", task: "Vendor coordination", hours: 2.0, description: "Calls with AV and lighting vendors", billable: true, status: "draft", rate: 125 },
    { id: "3", date: "2026-02-25", project: "Internal", task: "Team standup", hours: 0.5, description: "Daily sync", billable: false, status: "draft", rate: 0 },
    { id: "4", date: "2026-02-24", project: "Nike Air Max Launch", task: "Site survey", hours: 6.0, description: "On-site measurements and photos", billable: true, status: "submitted", rate: 150 },
    { id: "5", date: "2026-02-24", project: "Glossier Pop-Up", task: "Fabrication oversight", hours: 3.0, description: "Checked progress on custom fixtures", billable: true, status: "approved", rate: 150 },
    { id: "6", date: "2026-02-23", project: "Red Bull Festival", task: "Budget reconciliation", hours: 2.5, description: "Updated expense tracking", billable: true, status: "approved", rate: 125 },
    { id: "7", date: "2026-02-23", project: "Nike Air Max Launch", task: "CAD drawings", hours: 5.0, description: "Floor plan and elevation drawings", billable: true, status: "approved", rate: 150 },
    { id: "8", date: "2026-02-22", project: "Internal", task: "Training", hours: 2.0, description: "Safety certification renewal", billable: false, status: "approved", rate: 0 },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekDates = ["Feb 19", "Feb 20", "Feb 21", "Feb 22", "Feb 23", "Feb 24", "Feb 25"];

interface WeeklyRow {
    project: string;
    task: string;
    hours: number[];
    billable: boolean;
}

const weeklyData: WeeklyRow[] = [
    { project: "Nike Air Max Launch", task: "Stage design revisions", hours: [4, 3, 5, 4, 5, 0, 4.5], billable: true },
    { project: "Red Bull Festival", task: "Vendor coordination", hours: [2, 1.5, 2, 1, 2.5, 0, 2], billable: true },
    { project: "Glossier Pop-Up", task: "Fabrication oversight", hours: [0, 3, 0, 3, 0, 0, 0], billable: true },
    { project: "Internal", task: "Team standup", hours: [0.5, 0.5, 0.5, 0.5, 0.5, 0, 0.5], billable: false },
];

export default function TimeTrackingPage() {
    const [mode, setMode] = useState<TrackingMode>("daily");
    const [search, setSearch] = useState("");
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerProject] = useState("Nike Air Max Launch");

    const { data: sbEntries, isLoading } = useTimeEntries();

    const entries: TimeEntry[] = isSupabaseConfigured && sbEntries
        ? sbEntries.map((e: Record<string, unknown>) => ({
            id: (e.id as string) ?? "",
            date: (e.entry_date as string) ?? "",
            project: (e.project_name as string) ?? "",
            task: (e.task as string) ?? "",
            hours: (e.hours as number) ?? 0,
            description: (e.description as string) ?? "",
            billable: (e.billable as boolean) ?? false,
            status: ((e.status as string) ?? "draft") as TimeEntryStatus,
            rate: (e.rate as number) ?? 0,
        }))
        : mockEntries;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const todayEntries = entries.filter((e) => e.date === "2026-02-25");
    const totalHoursToday = todayEntries.reduce((s, e) => s + e.hours, 0);
    const billableToday = todayEntries.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0);
    const totalWeekHours = entries.reduce((s, e) => s + e.hours, 0);
    const billableWeek = entries.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0);
    const pendingApproval = entries.filter((e) => e.status === "submitted").length;

    const formatTimer = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const filtered = entries.filter((e) =>
        !search || e.project.toLowerCase().includes(search.toLowerCase()) || e.task.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PermissionGate resource="time_tracking" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Time Tracking"
                description="Track hours, manage timesheets, and monitor billable utilization"
            >
                <Button variant="outline" onClick={() => setTimerRunning(!timerRunning)}>
                    {timerRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {timerRunning ? "Pause" : "Start"} Timer
                </Button>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Log Time
                </Button>
            </PageHeader>

            {/* Active Timer Banner */}
            {timerRunning && (
                <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                            <div>
                                <p className="text-sm font-semibold">Timer Running — {timerProject}</p>
                                <p className="text-xs text-muted-foreground">Click to add task details</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-2xl font-bold tabular-nums">{formatTimer(timerSeconds)}</span>
                            <Button variant="outline" size="sm" onClick={() => setTimerRunning(false)}>
                                <Square className="mr-1 h-3 w-3" /> Stop
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Today" value={`${totalHoursToday}h`} description={`${billableToday}h billable`} icon={Clock} />
                <StatCard title="This Week" value={`${totalWeekHours}h`} description={`${billableWeek}h billable`} icon={Calendar} change={5} />
                <StatCard title="Billable Rate" value={`${Math.round((billableWeek / totalWeekHours) * 100)}%`} description="target: 75%" icon={BarChart3} />
                <StatCard title="Pending Approval" value={pendingApproval} description="entries awaiting review" icon={AlertTriangle} />
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-2 border-b pb-2">
                {(["daily", "weekly", "timer"] as TrackingMode[]).map((m) => (
                    <Button key={m} variant={mode === m ? "default" : "ghost"} size="sm" onClick={() => setMode(m)}>
                        {m === "timer" && <Timer className="mr-1 h-3.5 w-3.5" />}
                        {m === "daily" && <Clock className="mr-1 h-3.5 w-3.5" />}
                        {m === "weekly" && <Calendar className="mr-1 h-3.5 w-3.5" />}
                        {{ daily: "Daily", weekly: "Weekly", timer: "Timer" }[m]}
                    </Button>
                ))}
                <div className="flex-1" />
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search entries..." className="w-64" />
            </div>

            {/* Daily View */}
            {mode === "daily" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
                            <span className="text-sm font-semibold">Tuesday, February 25, 2026</span>
                            <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                        <Button variant="outline" size="sm">Submit Day for Approval</Button>
                    </div>

                    <div className="space-y-2">
                        {filtered.map((entry) => (
                            <Card key={entry.id} className="hover:bg-secondary/30 transition-colors cursor-pointer">
                                <CardContent className="flex items-center gap-4 py-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold truncate">{entry.project}</p>
                                            {entry.billable && <Badge variant="info" className="text-[10px]">Billable</Badge>}
                                            <StatusBadge status={entry.status} className="text-[10px]" />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{entry.task} — {entry.description}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold tabular-nums">{entry.hours}h</p>
                                        {entry.billable && (
                                            <p className="text-[10px] text-muted-foreground">{formatCurrency(entry.hours * entry.rate)}</p>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground w-20 text-right">{entry.date}</span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Timesheet View */}
            {mode === "weekly" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
                            <span className="text-sm font-semibold">Week of Feb 19 – Feb 25, 2026</span>
                            <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                        <Button variant="outline" size="sm">Submit Week for Approval</Button>
                    </div>

                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-3 font-medium w-64">Project / Task</th>
                                        {weekDays.map((day, i) => (
                                            <th key={day} className="text-center p-3 font-medium w-20">
                                                <div>{day}</div>
                                                <div className="text-[10px] text-muted-foreground font-normal">{weekDates[i]}</div>
                                            </th>
                                        ))}
                                        <th className="text-center p-3 font-medium w-20">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {weeklyData.map((row, i) => (
                                        <tr key={i} className="border-b hover:bg-secondary/30 transition-colors">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <p className="font-medium text-xs">{row.project}</p>
                                                        <p className="text-[10px] text-muted-foreground">{row.task}</p>
                                                    </div>
                                                    {row.billable && <Badge variant="info" className="text-[9px]">$</Badge>}
                                                </div>
                                            </td>
                                            {row.hours.map((h, j) => (
                                                <td key={j} className="text-center p-3">
                                                    <span className={`text-xs tabular-nums ${h > 0 ? "font-medium" : "text-muted-foreground"}`}>
                                                        {h > 0 ? h : "—"}
                                                    </span>
                                                </td>
                                            ))}
                                            <td className="text-center p-3 font-bold text-xs tabular-nums">
                                                {row.hours.reduce((a, b) => a + b, 0)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-muted/30 font-bold">
                                        <td className="p-3 text-xs">Daily Total</td>
                                        {weekDays.map((_, i) => (
                                            <td key={i} className="text-center p-3 text-xs tabular-nums">
                                                {weeklyData.reduce((s, r) => s + r.hours[i], 0)}
                                            </td>
                                        ))}
                                        <td className="text-center p-3 text-xs tabular-nums">
                                            {weeklyData.reduce((s, r) => s + r.hours.reduce((a, b) => a + b, 0), 0)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Timer View */}
            {mode === "timer" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Active Timer</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="font-mono text-5xl font-bold tabular-nums">{formatTimer(timerSeconds)}</p>
                                <p className="text-sm text-muted-foreground mt-2">{timerProject}</p>
                            </div>
                            <div className="flex justify-center gap-3">
                                <Button size="lg" onClick={() => setTimerRunning(!timerRunning)}>
                                    {timerRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                                    {timerRunning ? "Pause" : "Start"}
                                </Button>
                                <Button variant="outline" size="lg" onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}>
                                    <Square className="mr-2 h-5 w-5" /> Stop & Save
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-base">Recent Timer Sessions</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { project: "Nike Air Max Launch", task: "3D render updates", duration: "02:15:30", date: "Today" },
                                { project: "Red Bull Festival", task: "Vendor calls", duration: "01:45:00", date: "Today" },
                                { project: "Glossier Pop-Up", task: "Material sourcing", duration: "03:10:22", date: "Yesterday" },
                            ].map((session, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                                    <div>
                                        <p className="text-xs font-semibold">{session.project}</p>
                                        <p className="text-[10px] text-muted-foreground">{session.task}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-mono font-bold tabular-nums">{session.duration}</p>
                                        <p className="text-[10px] text-muted-foreground">{session.date}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
        </PermissionGate>
    );
}
