"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { TruncatedText } from "@/components/ui/truncated-text";
import { useBreakpoint } from "@/hooks/use-media-query";

export interface GanttTask {
    id: string;
    label: string;
    sublabel?: string | undefined;
    startDate: string;
    endDate: string;
    progress?: number | undefined;
    color?: string | undefined;
    dependencies?: string[] | undefined;
    hasConflict?: boolean | undefined;
    resourceId?: string | undefined;
}

interface GanttChartProps {
    tasks: GanttTask[];
    startDate: string;
    endDate: string;
    granularity?: "day" | "week" | undefined;
    className?: string | undefined;
    onTaskClick?: ((task: GanttTask) => void) | undefined;
}

function daysBetween(a: string, b: string): number {
    return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
}

function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function generateDateColumns(start: string, end: string, granularity: "day" | "week"): string[] {
    const columns: string[] = [];
    const current = new Date(start);
    const endDate = new Date(end);
    const step = granularity === "week" ? 7 : 1;

    while (current <= endDate) {
        columns.push(current.toISOString().split("T")[0]!);
        current.setDate(current.getDate() + step);
    }
    return columns;
}

export function GanttChart({
    tasks,
    startDate,
    endDate,
    granularity = "day",
    className,
    onTaskClick,
}: GanttChartProps) {
    const { isMobile } = useBreakpoint();
    const columns = generateDateColumns(startDate, endDate, granularity);
    const totalDays = daysBetween(startDate, endDate) || 1;
    const colWidth = granularity === "week" ? 80 : 40;
    const gridWidth = columns.length * colWidth;
    const rowHeight = 40;

    const todayStr = new Date().toISOString().split("T")[0]!;
    const todayOffset = daysBetween(startDate, todayStr);

    if (isMobile) {
        return (
            <div className={cn("space-y-2", className)}>
                {tasks.map((task) => {
                    const progress = task.progress ?? 0;
                    const durationDays = daysBetween(task.startDate, task.endDate);
                    return (
                        <button
                            key={task.id}
                            type="button"
                            className="w-full text-left rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors space-y-2"
                            onClick={() => onTaskClick?.(task)}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    {task.hasConflict && (
                                        <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                                    )}
                                    <p className="text-sm font-medium truncate">{task.label}</p>
                                </div>
                                <Badge
                                    variant={task.hasConflict ? "destructive" : "secondary"}
                                    className="density-caption shrink-0"
                                >
                                    {durationDays}d
                                </Badge>
                            </div>
                            {task.sublabel && (
                                <p className="density-caption text-muted-foreground truncate">
                                    {task.sublabel}
                                </p>
                            )}
                            <div className="flex items-center gap-2 density-caption text-muted-foreground">
                                <span>{formatShortDate(task.startDate)}</span>
                                <span>\u2013</span>
                                <span>{formatShortDate(task.endDate)}</span>
                                {progress > 0 && (
                                    <span className="ml-auto font-medium">{progress}%</span>
                                )}
                            </div>
                            {progress > 0 && (
                                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full",
                                            task.hasConflict ? "bg-destructive/50" : "bg-primary/50"
                                        )}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={cn("overflow-x-auto border rounded-lg", className)} data-gantt-chart>
            <div style={{ minWidth: 240 + gridWidth }}>
                {/* Header */}
                <div className="flex border-b bg-muted/30 sticky top-0 z-10">
                    <div className="w-60 shrink-0 p-3 text-xs font-semibold text-muted-foreground border-r sticky left-0 bg-muted/30 z-20">
                        Task
                    </div>
                    <div className="relative flex" style={{ width: gridWidth }}>
                        {columns.map((col, i) => {
                            const isToday = col === todayStr;
                            return (
                                <div
                                    key={col}
                                    className={cn(
                                        "shrink-0 text-center density-caption py-2 border-r border-border/30",
                                        isToday && "bg-primary/5 font-bold text-primary"
                                    )}
                                    style={{ width: colWidth }}
                                >
                                    {granularity === "week"
                                        ? `W${Math.ceil(i + 1)}`
                                        : formatShortDate(col)}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Task Rows */}
                {tasks.map((task) => {
                    const taskStart = daysBetween(startDate, task.startDate);
                    const taskDuration = daysBetween(task.startDate, task.endDate);
                    const leftPercent = (taskStart / totalDays) * 100;
                    const widthPercent = (taskDuration / totalDays) * 100;
                    const progress = task.progress ?? 0;

                    return (
                        <div
                            key={task.id}
                            className="flex border-b border-border/30 hover:bg-secondary/10"
                        >
                            <div className="w-60 shrink-0 p-3 border-r sticky left-0 bg-background z-10">
                                <div className="flex items-center gap-2">
                                    {task.hasConflict && (
                                        <Tooltip content="Scheduling conflict" side="right">
                                            <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                                        </Tooltip>
                                    )}
                                    <div className="min-w-0">
                                        <TruncatedText as="p" className="text-xs font-medium">
                                            {task.label}
                                        </TruncatedText>
                                        {task.sublabel && (
                                            <TruncatedText
                                                as="p"
                                                className="density-caption text-muted-foreground"
                                            >
                                                {task.sublabel}
                                            </TruncatedText>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div
                                className="relative"
                                style={{ width: gridWidth, height: rowHeight }}
                            >
                                {/* Grid lines */}
                                {columns.map((col) => (
                                    <div
                                        key={col}
                                        className={cn(
                                            "absolute top-0 bottom-0 border-r border-border/20",
                                            col === todayStr && "bg-primary/5"
                                        )}
                                        style={{
                                            left: `${(daysBetween(startDate, col) / totalDays) * 100}%`,
                                            width: `${(1 / totalDays) * 100 * (granularity === "week" ? 7 : 1)}%`,
                                        }}
                                    />
                                ))}

                                {/* Task bar */}
                                <Tooltip
                                    content={`${task.label}: ${formatShortDate(task.startDate)} – ${formatShortDate(task.endDate)}, ${progress}% complete`}
                                    side="top"
                                >
                                    <button
                                        type="button"
                                        data-gantt-bar
                                        className={cn(
                                            "absolute top-2 h-6 rounded-md transition-all group",
                                            task.hasConflict
                                                ? "bg-destructive/20 border border-destructive/40"
                                                : "bg-primary/20 border border-primary/30",
                                            onTaskClick && "cursor-pointer hover:shadow-md"
                                        )}
                                        style={{
                                            left: `${Math.max(0, leftPercent)}%`,
                                            width: `${Math.max(1, widthPercent)}%`,
                                        }}
                                        onClick={() => onTaskClick?.(task)}
                                        aria-label={`${task.label}: ${formatShortDate(task.startDate)} to ${formatShortDate(task.endDate)}, ${progress}% complete`}
                                        onKeyDown={(e) => {
                                            const bars = Array.from(
                                                (
                                                    e.currentTarget.closest("[data-gantt-chart]") ??
                                                    document
                                                ).querySelectorAll<HTMLElement>("[data-gantt-bar]")
                                            );
                                            const idx = bars.indexOf(e.currentTarget);
                                            if (idx < 0) return;
                                            let next: number | null = null;
                                            if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                                                e.preventDefault();
                                                next = idx < bars.length - 1 ? idx + 1 : 0;
                                            } else if (
                                                e.key === "ArrowUp" ||
                                                e.key === "ArrowLeft"
                                            ) {
                                                e.preventDefault();
                                                next = idx > 0 ? idx - 1 : bars.length - 1;
                                            } else if (e.key === "Home") {
                                                e.preventDefault();
                                                next = 0;
                                            } else if (e.key === "End") {
                                                e.preventDefault();
                                                next = bars.length - 1;
                                            }
                                            if (next !== null) bars[next]?.focus();
                                        }}
                                    >
                                        {/* Progress fill */}
                                        <div
                                            className={cn(
                                                "absolute inset-0 rounded-md",
                                                task.hasConflict
                                                    ? "bg-destructive/30"
                                                    : "bg-primary/40"
                                            )}
                                            style={{ width: `${progress}%` }}
                                        />
                                        <span className="relative z-10 density-caption font-medium px-1.5 truncate block leading-6">
                                            {task.label}
                                        </span>
                                    </button>
                                </Tooltip>

                                {/* Today marker */}
                                {todayOffset >= 0 && todayOffset <= totalDays && (
                                    <div
                                        className="absolute top-0 bottom-0 w-px bg-destructive/50 z-5"
                                        style={{ left: `${(todayOffset / totalDays) * 100}%` }}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
