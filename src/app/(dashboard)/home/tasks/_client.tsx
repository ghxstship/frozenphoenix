"use client";

import { TaskRow, TimeHorizonGroup } from "@/components/home";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyTaskCounts, useMyTasks } from "@/lib/supabase";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import type { TaskPriority, TaskStatus } from "@/types";
import { useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    CircleDot,
    ClipboardList,
    ListFilter,
    Plus,
} from "lucide-react";
import Link from "next/link";

const STATUS_FILTERS = ["all", "active", "overdue", "completed"] as const;

export function TasksHomePageClient() {
    const { data: myTasks, isLoading } = useMyTasks();
    const { data: counts } = useMyTaskCounts();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useQueryTabState({
        key: "filter",
        defaultValue: "all",
        validValues: STATUS_FILTERS,
    });

    const tasks = useMemo(() => {
        return (myTasks ?? []).map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status as TaskStatus,
            priority: t.priority as TaskPriority,
            dueDate: t.due_date,
            projectName: t.projects?.name ?? null,
        }));
    }, [myTasks]);

    const filtered = useMemo(() => {
        let list = tasks;

        if (statusFilter === "active") {
            list = list.filter((t) => !["done", "completed", "cancelled"].includes(t.status));
        } else if (statusFilter === "overdue") {
            const today = new Date().toISOString().slice(0, 10);
            list = list.filter(
                (t) =>
                    t.dueDate &&
                    t.dueDate < today &&
                    !["done", "completed", "cancelled"].includes(t.status)
            );
        } else if (statusFilter === "completed") {
            list = list.filter((t) => ["done", "completed"].includes(t.status));
        }

        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (t) => t.title.toLowerCase().includes(q) || t.projectName?.toLowerCase().includes(q)
            );
        }

        return list;
    }, [tasks, statusFilter, search]);

    const { overdue, dueToday, dueThisWeek, later } = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        const endOfWeekStr = endOfWeek.toISOString().slice(0, 10);

        const active = filtered.filter(
            (t) => !["done", "completed", "cancelled"].includes(t.status)
        );

        return {
            overdue: active.filter((t) => t.dueDate && t.dueDate < todayStr),
            dueToday: active.filter((t) => t.dueDate === todayStr),
            dueThisWeek: active.filter(
                (t) => t.dueDate && t.dueDate > todayStr && t.dueDate <= endOfWeekStr
            ),
            later: active.filter((t) => !t.dueDate || t.dueDate > endOfWeekStr),
        };
    }, [filtered]);

    const contentSlot = (
        <div className="density-gap-page">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard label="Total Active" value={counts?.total ?? 0} icon={ClipboardList} />
                <KpiCard
                    label="Overdue"
                    value={counts?.overdue ?? 0}
                    icon={AlertTriangle}
                    variant="destructive"
                />
                <KpiCard
                    label="In Progress"
                    value={counts?.inProgress ?? 0}
                    icon={CircleDot}
                    variant="info"
                />
                <KpiCard
                    label="Due Today"
                    value={counts?.dueToday ?? 0}
                    icon={CheckCircle2}
                    variant="warning"
                />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <SearchInput
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search tasks..."
                    className="flex-1 max-w-sm"
                />
                <SegmentedControl
                    ariaLabel="Task status filter"
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v as (typeof STATUS_FILTERS)[number])}
                    size="sm"
                    options={[
                        { value: "all", label: "All" },
                        { value: "active", label: "Active" },
                        { value: "overdue", label: "Overdue" },
                        { value: "completed", label: "Completed" },
                    ]}
                />
            </div>

            {/* Time Horizon Groups */}
            {statusFilter !== "completed" ? (
                <div className="density-gap-section">
                    <TimeHorizonGroup label="Overdue" variant="overdue" count={overdue.length}>
                        {overdue.map((t) => (
                            <TaskRow key={t.id} task={t} />
                        ))}
                    </TimeHorizonGroup>
                    <TimeHorizonGroup label="Due Today" variant="today" count={dueToday.length}>
                        {dueToday.map((t) => (
                            <TaskRow key={t.id} task={t} />
                        ))}
                    </TimeHorizonGroup>
                    <TimeHorizonGroup
                        label="This Week"
                        variant="this-week"
                        count={dueThisWeek.length}
                    >
                        {dueThisWeek.map((t) => (
                            <TaskRow key={t.id} task={t} />
                        ))}
                    </TimeHorizonGroup>
                    <TimeHorizonGroup
                        label="Later / No Due Date"
                        variant="later"
                        count={later.length}
                    >
                        {later.map((t) => (
                            <TaskRow key={t.id} task={t} />
                        ))}
                    </TimeHorizonGroup>

                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No tasks found</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-0.5">
                    {filtered.map((t) => (
                        <TaskRow key={t.id} task={t} />
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-muted-foreground">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No completed tasks found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const config: DashboardPageConfig = {
        resource: "tasks",
        action: "read",
        title: "Tasks",
        description: "Your assigned tasks across all projects",
        headerActions: (
            <>
                <Link href="/tasks">
                    <Button variant="outline" size="sm">
                        <ListFilter className="mr-1.5 h-3.5 w-3.5" />
                        All Tasks
                    </Button>
                </Link>
                <Link href="/tasks?view=board">
                    <Button size="sm">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        New Task
                    </Button>
                </Link>
            </>
        ),
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={isLoading} />;
}

function KpiCard({
    label,
    value,
    icon: Icon,
    variant,
}: {
    label: string;
    value: number;
    icon: React.ElementType;
    variant?: "destructive" | "info" | "warning";
}) {
    const colorClass =
        variant === "destructive"
            ? "text-destructive"
            : variant === "info"
              ? "text-info"
              : variant === "warning"
                ? "text-warning"
                : "text-foreground";

    return (
        <Card>
            <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-5 w-5 ${colorClass}`} />
                <div>
                    <p className={`text-2xl font-bold tabular-nums ${colorClass}`}>{value}</p>
                    <p className="density-caption text-muted-foreground uppercase tracking-wider">
                        {label}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
