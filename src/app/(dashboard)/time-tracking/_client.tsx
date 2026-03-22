"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { TabBar } from "@/components/ui/tab-bar";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { MetricCard } from "@/components/ui/metric-card";
import { EmptyState } from "@/components/layouts/empty-state";
import { ApprovalFlow } from "@/components/ui/approval-flow";
import { useCreateAction } from "@/components/app/create-entity-dialog";
import { formatCurrency } from "@/lib/utils";
import {
    AlertTriangle,
    BarChart3,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    FileText,
    Loader2,
    Pause,
    Play,
    Plus,
    Send,
    Square,
    Timer,
} from "lucide-react";
import { useSubmitTimeEntries } from "@/lib/supabase";
import { useCreateTimeEntry, useTimeEntries } from "@/lib/supabase";
import { useActiveTimer, useStartTimer, useStopTimer } from "@/lib/supabase";
import { useAuth } from "@/lib/supabase/auth-context";

type TimeEntryStatus = "draft" | "submitted" | "approved" | "rejected";
type TrackingMode = "daily" | "weekly" | "timer" | "invoicing";

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

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeeklyRow {
    project: string;
    task: string;
    hours: number[];
    billable: boolean;
}

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getWeekDates(start: Date): string[] {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });
}

function buildWeeklyRows(entries: TimeEntry[], weekStart: Date): WeeklyRow[] {
    const grouped = new Map<string, { task: string; billable: boolean; hours: number[] }>();
    for (const entry of entries) {
        const entryDate = new Date(entry.date);
        const dayIndex = Math.round((entryDate.getTime() - weekStart.getTime()) / 86400000);
        if (dayIndex < 0 || dayIndex > 6) continue;
        const key = `${entry.project}||${entry.task}`;
        if (!grouped.has(key)) {
            grouped.set(key, {
                task: entry.task,
                billable: entry.billable,
                hours: [0, 0, 0, 0, 0, 0, 0],
            });
        }
        const row = grouped.get(key)!;
        row.hours[dayIndex] = (row.hours[dayIndex] ?? 0) + entry.hours;
    }
    return Array.from(grouped.entries()).map(([key, val]) => ({
        project: key.split("||")[0] ?? "",
        task: val.task,
        hours: val.hours,
        billable: val.billable,
    }));
}

// ─── Invoicing Pipeline Sub-component ───
interface ProjectInvoiceGroup {
    project: string;
    entries: TimeEntry[];
    totalHours: number;
    totalAmount: number;
}

const APPROVAL_STEPS: import("@/components/ui/approval-flow").ApprovalStep[] = [
    { id: "submit", label: "Submit Time", assigneeName: "Employee", status: "approved" },
    { id: "approve", label: "PM Approval", assigneeName: "Project Manager", status: "in_progress" },
    { id: "finance", label: "Finance Review", assigneeName: "Finance Team", status: "pending" },
    { id: "invoice", label: "Generate Invoice", assigneeName: "System", status: "pending" },
];

function InvoicingPipeline({ entries }: { entries: TimeEntry[] }) {
    const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

    const projectGroups = useMemo(() => {
        const approvedBillable = entries.filter((e) => e.status === "approved" && e.billable);
        const groups = new Map<string, TimeEntry[]>();
        for (const entry of approvedBillable) {
            const existing = groups.get(entry.project) ?? [];
            existing.push(entry);
            groups.set(entry.project, existing);
        }
        const result: ProjectInvoiceGroup[] = [];
        for (const [project, items] of groups) {
            result.push({
                project,
                entries: items,
                totalHours: items.reduce((s, e) => s + e.hours, 0),
                totalAmount: items.reduce((s, e) => s + e.hours * e.rate, 0),
            });
        }
        return result.sort((a, b) => b.totalAmount - a.totalAmount);
    }, [entries]);

    const totalReadyAmount = projectGroups.reduce((s, g) => s + g.totalAmount, 0);
    const totalReadyHours = projectGroups.reduce((s, g) => s + g.totalHours, 0);
    const pendingCount = entries.filter((e) => e.status === "submitted" && e.billable).length;

    const toggleProject = (project: string) => {
        setSelectedProjects((prev) => {
            const next = new Set(prev);
            if (next.has(project)) next.delete(project);
            else next.add(project);
            return next;
        });
    };

    const selectedAmount = projectGroups
        .filter((g) => selectedProjects.has(g.project))
        .reduce((s, g) => s + g.totalAmount, 0);

    return (
        <div className="density-gap-page">
            {/* Approval Workflow */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Time-to-Invoice Workflow
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ApprovalFlow steps={APPROVAL_STEPS} />
                </CardContent>
            </Card>

            {/* Pipeline Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 density-gap-card">
                <MetricCard
                    label="Ready to Invoice"
                    value={formatCurrency(totalReadyAmount)}
                    description={`${totalReadyHours}h approved & billable`}
                    icon={DollarSign}
                />
                <MetricCard
                    label="Projects Ready"
                    value={projectGroups.length}
                    description="with approved time"
                    icon={FileText}
                />
                <MetricCard
                    label="Pending Approval"
                    value={pendingCount}
                    description="entries awaiting PM sign-off"
                    icon={Send}
                />
                <MetricCard
                    label="Selected for Invoice"
                    value={formatCurrency(selectedAmount)}
                    description={`${selectedProjects.size} project(s) selected`}
                    icon={CheckCircle2}
                />
            </div>

            {/* Project Groups */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Approved Time by Project</CardTitle>
                        <Button size="sm" disabled={selectedProjects.size === 0}>
                            <FileText className="h-4 w-4 mr-1" />
                            Generate Draft Invoice ({selectedProjects.size})
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {projectGroups.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No approved billable time entries found. Approve time entries to
                            generate invoices.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {projectGroups.map((group) => {
                                const isSelected = selectedProjects.has(group.project);
                                return (
                                    <div
                                        key={group.project}
                                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                                            isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:bg-secondary/30"
                                        }`}
                                        onClick={() => toggleProject(group.project)}
                                        role="checkbox"
                                        aria-checked={isSelected}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === " " || e.key === "Enter") {
                                                e.preventDefault();
                                                toggleProject(group.project);
                                            }
                                        }}
                                    >
                                        <div
                                            className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                                isSelected
                                                    ? "border-primary bg-primary"
                                                    : "border-muted-foreground/30"
                                            }`}
                                        >
                                            {isSelected && (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold">{group.project}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {group.entries.length} entries &middot;{" "}
                                                {group.totalHours}h
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold tabular-nums">
                                                {formatCurrency(group.totalAmount)}
                                            </p>
                                            <Badge variant="success" className="density-caption">
                                                Approved
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pending entries needing approval */}
            {pendingCount > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            Pending Approval ({pendingCount} entries)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {entries
                                .filter((e) => e.status === "submitted" && e.billable)
                                .map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center gap-4 py-2 border-b border-border/30 last:border-0"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">{entry.project}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {entry.task} &middot; {entry.date}
                                            </p>
                                        </div>
                                        <span className="text-sm tabular-nums font-medium">
                                            {entry.hours}h
                                        </span>
                                        <span className="text-sm tabular-nums text-muted-foreground">
                                            {formatCurrency(entry.hours * entry.rate)}
                                        </span>
                                        <StatusBadge
                                            status="submitted"
                                            className="density-caption"
                                        />
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export function TimeTrackingPageClient() {
    const TRACKING_MODES = ["daily", "weekly", "timer", "invoicing"] as const;
    const [mode, setMode] = useQueryTabState({
        key: "tab",
        defaultValue: "daily",
        validValues: TRACKING_MODES,
    });
    const [search, setSearch] = useState("");
    const { user } = useAuth();
    const userId = user?.id ?? "";
    const { data: activeTimerRecord } = useActiveTimer(userId);
    const startTimerMutation = useStartTimer();
    const stopTimerMutation = useStopTimer();

    const [timerRunning, setTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerProject, _setTimerProject] = useState("");
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const hydratedRef = useRef(false);

    // Hydrate once from DB active timer using requestAnimationFrame to avoid
    // the eslint "setState in effect" cascading-render warning
    const dbStartedAt = activeTimerRecord
        ? new Date(
              String((activeTimerRecord as Record<string, unknown>).started_at ?? "")
          ).getTime()
        : 0;
    useEffect(() => {
        if (dbStartedAt > 0 && !hydratedRef.current) {
            hydratedRef.current = true;
            requestAnimationFrame(() => {
                setTimerRunning(true);
                setTimerSeconds(Math.floor((Date.now() - dbStartedAt) / 1000));
            });
        }
    }, [dbStartedAt]);

    useEffect(() => {
        if (timerRunning) {
            timerRef.current = setInterval(() => {
                setTimerSeconds((s) => s + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timerRunning]);

    const handleStartTimer = () => {
        setTimerRunning(true);
        setTimerSeconds(0);
        startTimerMutation.mutate({
            user_id: userId,
            started_at: new Date().toISOString(),
        } as never);
    };

    const handleStopTimer = () => {
        setTimerRunning(false);
        if (activeTimerRecord) {
            stopTimerMutation.mutate((activeTimerRecord as Record<string, unknown>).id as string);
        }
    };

    const createEntry = useCreateTimeEntry();
    const submitEntries = useSubmitTimeEntries();
    const [weekOffset, setWeekOffset] = useState(0);

    const currentWeekStart = useMemo(() => {
        const ws = getWeekStart(new Date());
        ws.setDate(ws.getDate() + weekOffset * 7);
        return ws;
    }, [weekOffset]);

    const { data: sbEntries, isLoading } = useTimeEntries();

    const entries: TimeEntry[] = (sbEntries ?? []).map((e: Record<string, unknown>) => ({
        id: (e.id as string) ?? "",
        date: (e.entry_date as string) ?? "",
        project: (e.project_name as string) ?? "",
        task: (e.task as string) ?? "",
        hours: (e.hours as number) ?? 0,
        description: (e.description as string) ?? "",
        billable: (e.billable as boolean) ?? false,
        status: ((e.status as string) ?? "draft") as TimeEntryStatus,
        rate: (e.rate as number) ?? 0,
    }));

    const today = new Date().toISOString().split("T")[0] ?? "";
    const todayEntries = entries.filter((e) => e.date === today);
    const totalHoursToday = todayEntries.reduce((s, e) => s + e.hours, 0);
    const billableToday = todayEntries.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0);
    const totalWeekHours = entries.reduce((s, e) => s + e.hours, 0);
    const billableWeek = entries.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0);
    const pendingApproval = entries.filter((e) => e.status === "submitted").length;
    const draftCount = entries.filter((e) => e.status === "draft").length;
    const [, openCreate] = useCreateAction();

    const formatTimer = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const filtered = entries.filter(
        (e) =>
            !search ||
            e.project.toLowerCase().includes(search.toLowerCase()) ||
            e.task.toLowerCase().includes(search.toLowerCase())
    );

    const contentSlot = (
        <>
            {/* Active Timer Banner */}
            {timerRunning && (
                <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                            <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                            <div>
                                <p className="text-sm font-semibold">
                                    Timer Running — {timerProject}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Click to add task details
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span
                                className="font-mono text-2xl font-bold tabular-nums"
                                role="timer"
                                aria-live="off"
                                aria-label={`Timer: ${formatTimer(timerSeconds)}`}
                            >
                                {formatTimer(timerSeconds)}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => handleStopTimer()}>
                                <Square className="mr-1 h-3 w-3" /> Stop
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 density-gap-card">
                <StatCard
                    title="Today"
                    value={`${totalHoursToday}h`}
                    description={`${billableToday}h billable`}
                    icon={Clock}
                />
                <StatCard
                    title="This Week"
                    value={`${totalWeekHours}h`}
                    description={`${billableWeek}h billable`}
                    icon={Calendar}
                />
                <StatCard
                    title="Billable Rate"
                    value={`${Math.round((billableWeek / totalWeekHours) * 100)}%`}
                    description="target: 75%"
                    icon={BarChart3}
                />
                <StatCard
                    title="Pending Approval"
                    value={pendingApproval}
                    description="entries awaiting review"
                    icon={AlertTriangle}
                />
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-2">
                <TabBar
                    items={[
                        {
                            id: "daily",
                            label: "Daily",
                            icon: <Clock className="h-3.5 w-3.5" />,
                        },
                        {
                            id: "weekly",
                            label: "Weekly",
                            icon: <Calendar className="h-3.5 w-3.5" />,
                        },
                        {
                            id: "timer",
                            label: "Timer",
                            icon: <Timer className="h-3.5 w-3.5" />,
                        },
                        {
                            id: "invoicing",
                            label: "Time → Invoice",
                            icon: <FileText className="h-3.5 w-3.5" />,
                        },
                    ]}
                    value={mode}
                    onValueChange={(v) => setMode(v as TrackingMode)}
                    ariaLabel="Time tracking mode"
                />
                <div className="flex-1" />
                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search entries..."
                    className="w-64"
                />
            </div>

            {/* Daily View */}
            {mode === "daily" && (
                <div className="density-gap-section">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-semibold">
                                {new Date().toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                            <Button variant="ghost" size="sm">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={submitEntries.isPending}
                            onClick={() => {
                                const draftIds = todayEntries
                                    .filter((e) => e.status === "draft")
                                    .map((e) => e.id);
                                if (draftIds.length > 0) submitEntries.mutate(draftIds);
                            }}
                        >
                            {submitEntries.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Submit Day for Approval
                        </Button>
                    </div>

                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={Clock}
                            title="No time entries found"
                            description={
                                search
                                    ? "Try adjusting your search"
                                    : "No time entries recorded yet"
                            }
                        />
                    ) : (
                        <div className="space-y-2">
                            {filtered.map((entry) => (
                                <Card
                                    key={entry.id}
                                    className="hover:bg-secondary/30 transition-colors cursor-pointer"
                                >
                                    <CardContent className="flex items-center gap-4 py-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold truncate">
                                                    {entry.project}
                                                </p>
                                                {entry.billable && (
                                                    <Badge
                                                        variant="info"
                                                        className="density-caption"
                                                    >
                                                        Billable
                                                    </Badge>
                                                )}
                                                <StatusBadge
                                                    status={entry.status}
                                                    className="density-caption"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {entry.task} — {entry.description}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold tabular-nums">
                                                {entry.hours}h
                                            </p>
                                            {entry.billable && (
                                                <p className="density-caption text-muted-foreground">
                                                    {formatCurrency(entry.hours * entry.rate)}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground w-20 text-right">
                                            {entry.date}
                                        </span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Weekly Timesheet View */}
            {mode === "weekly" && (
                <div className="density-gap-section">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setWeekOffset((p) => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-semibold">
                                Week of{" "}
                                {currentWeekStart.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                                {" – "}
                                {new Date(
                                    currentWeekStart.getTime() + 6 * 86400000
                                ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setWeekOffset((p) => p + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={submitEntries.isPending}
                            onClick={() => {
                                const draftIds = entries
                                    .filter((e) => e.status === "draft")
                                    .map((e) => e.id);
                                if (draftIds.length > 0) submitEntries.mutate(draftIds);
                            }}
                        >
                            {submitEntries.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Submit Week for Approval
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-3 font-medium w-64">
                                            Project / Task
                                        </th>
                                        {weekDays.map((day, i) => (
                                            <th
                                                key={day}
                                                className="text-center p-3 font-medium w-20"
                                            >
                                                <div>{day}</div>
                                                <div className="density-caption text-muted-foreground font-normal">
                                                    {getWeekDates(currentWeekStart)[i]}
                                                </div>
                                            </th>
                                        ))}
                                        <th className="text-center p-3 font-medium w-20">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {buildWeeklyRows(entries, currentWeekStart).map((row, i) => (
                                        <tr
                                            key={i}
                                            className="border-b hover:bg-secondary/30 transition-colors"
                                        >
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <p className="font-medium text-xs">
                                                            {row.project}
                                                        </p>
                                                        <p className="density-caption text-muted-foreground">
                                                            {row.task}
                                                        </p>
                                                    </div>
                                                    {row.billable && (
                                                        <Badge
                                                            variant="info"
                                                            className="density-caption"
                                                        >
                                                            $
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            {row.hours.map((h, j) => (
                                                <td key={j} className="text-center p-3">
                                                    <span
                                                        className={`text-xs tabular-nums ${h > 0 ? "font-medium" : "text-muted-foreground"}`}
                                                    >
                                                        {h > 0 ? h : "—"}
                                                    </span>
                                                </td>
                                            ))}
                                            <td className="text-center p-3 font-bold text-xs tabular-nums">
                                                {row.hours.reduce((a, b) => a + b, 0)}
                                            </td>
                                        </tr>
                                    ))}
                                    {(() => {
                                        const rows = buildWeeklyRows(entries, currentWeekStart);
                                        return (
                                            <tr className="bg-muted/30 font-bold">
                                                <td className="p-3 text-xs">Daily Total</td>
                                                {weekDays.map((_, i) => (
                                                    <td
                                                        key={i}
                                                        className="text-center p-3 text-xs tabular-nums"
                                                    >
                                                        {rows.reduce(
                                                            (s, r) => s + (r.hours[i] ?? 0),
                                                            0
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="text-center p-3 text-xs tabular-nums">
                                                    {rows.reduce(
                                                        (s, r) =>
                                                            s + r.hours.reduce((a, b) => a + b, 0),
                                                        0
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })()}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Invoicing Pipeline View */}
            {mode === "invoicing" && <InvoicingPipeline entries={entries} />}

            {/* Timer View */}
            {mode === "timer" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 density-gap-card">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Active Timer</CardTitle>
                        </CardHeader>
                        <CardContent className="density-gap-page">
                            <div className="text-center">
                                <p className="font-mono text-5xl font-bold tabular-nums">
                                    {formatTimer(timerSeconds)}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">{timerProject}</p>
                            </div>
                            <div className="flex justify-center gap-3">
                                <Button
                                    size="lg"
                                    onClick={() =>
                                        timerRunning ? handleStopTimer() : handleStartTimer()
                                    }
                                >
                                    {timerRunning ? (
                                        <Pause className="mr-2 h-5 w-5" />
                                    ) : (
                                        <Play className="mr-2 h-5 w-5" />
                                    )}
                                    {timerRunning ? "Stop" : "Start"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    disabled={createEntry.isPending}
                                    onClick={() => {
                                        handleStopTimer();
                                        if (timerSeconds > 0) {
                                            createEntry.mutate({
                                                entry_date: today,
                                                hours:
                                                    Math.round((timerSeconds / 3600) * 100) / 100,
                                                billable: true,
                                                status: "draft",
                                                description: timerProject
                                                    ? `Timer: ${timerProject}`
                                                    : "Timer session",
                                            });
                                        }
                                        setTimerSeconds(0);
                                    }}
                                >
                                    <Square className="mr-2 h-5 w-5" /> Stop & Save
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Recent Timer Sessions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {entries.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">
                                    No recent timer sessions. Start a timer to log time.
                                </p>
                            ) : (
                                entries.slice(0, 5).map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                                    >
                                        <div>
                                            <p className="text-xs font-semibold">{entry.project}</p>
                                            <p className="density-caption text-muted-foreground">
                                                {entry.task}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-mono font-bold tabular-nums">
                                                {formatTimer(Math.round(entry.hours * 3600))}
                                            </p>
                                            <p className="density-caption text-muted-foreground">
                                                {entry.date === today ? "Today" : entry.date}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );

    const config: DashboardPageConfig = {
        resource: "time_tracking",
        action: "read",
        title: "Time Tracking",
        description: "Track hours, manage timesheets, and monitor billable utilization",
        headerActions: (
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    disabled={submitEntries.isPending || draftCount === 0}
                    onClick={() => {
                        const draftIds = entries
                            .filter((e) => e.status === "draft")
                            .map((e) => e.id);
                        if (draftIds.length > 0) submitEntries.mutate(draftIds);
                    }}
                >
                    {submitEntries.isPending ? (
                        <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                    Submit {draftCount > 0 ? `(${draftCount})` : ""}
                </Button>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" /> New Entry
                </Button>
            </div>
        ),
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={isLoading} />;
}
