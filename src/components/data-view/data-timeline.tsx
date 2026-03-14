"use client";

/* ═══════════════════════════════════════════════════════════════
   DATA TIMELINE — Horizontal date-range bar view

   Renders records with start/end dates as horizontal bars on a
   scrollable time axis. Lighter than Gantt — no dependencies,
   no critical path. Ideal for projects, events, contracts, etc.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { TruncatedText } from "@/components/ui/truncated-text";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ───

export interface TimelineItem {
    id: string;
    label: string;
    sublabel?: string;
    startDate: string;
    endDate: string;
    progress?: number;
    color?: string;
    group?: string;
}

interface DataTimelineProps {
    data: TimelineItem[];
    className?: string;
    actions?: (item: TimelineItem) => React.ReactNode;
    onItemClick?: (item: TimelineItem) => void;
}

// ─── Helpers ───

function daysBetween(a: string, b: string): number {
    return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
}

function formatShort(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

function addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0]!;
}

function generateWeekColumns(start: string, end: string): string[] {
    const cols: string[] = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
        cols.push(current.toISOString().split("T")[0]!);
        current.setDate(current.getDate() + 7);
    }
    return cols;
}

const DEFAULT_COLORS = [
    "bg-primary/30 border-primary/50",
    "bg-info/30 border-info/50",
    "bg-success/30 border-success/50",
    "bg-warning/30 border-warning/50",
    "bg-destructive/30 border-destructive/50",
];

// ─── Component ───

export function DataTimeline({ data, className, actions, onItemClick }: DataTimelineProps) {
    const [offset, setOffset] = React.useState(0);

    // Group items (must be before early return to satisfy hook rules)
    const groups = React.useMemo(() => {
        const map = new Map<string, TimelineItem[]>();
        for (const item of data) {
            const group = item.group ?? "";
            if (!map.has(group)) map.set(group, []);
            map.get(group)!.push(item);
        }
        return Array.from(map.entries());
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                No items with date ranges to display
            </div>
        );
    }

    // Compute date bounds from data
    const allStarts = data.map((d) => new Date(d.startDate).getTime());
    const allEnds = data.map((d) => new Date(d.endDate).getTime());
    const dataStart = new Date(Math.min(...allStarts));
    const dataEnd = new Date(Math.max(...allEnds));

    // Add padding: 1 week before, 1 week after
    const rangeStart = addDays(dataStart.toISOString().split("T")[0]!, -7 + offset * 28);
    const rangeEnd = addDays(dataEnd.toISOString().split("T")[0]!, 7 + offset * 28);

    const totalDays = Math.max(daysBetween(rangeStart, rangeEnd), 1);
    const weekCols = generateWeekColumns(rangeStart, rangeEnd);
    const colWidth = 80;
    const gridWidth = weekCols.length * colWidth;
    const rowHeight = 40;

    const todayStr = new Date().toISOString().split("T")[0]!;
    const todayOffset = daysBetween(rangeStart, todayStr);

    return (
        <div className={cn("space-y-2", className)}>
            {/* Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setOffset((o) => o - 1)}
                        aria-label="Scroll earlier"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setOffset(0)}>
                        Today
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setOffset((o) => o + 1)}
                        aria-label="Scroll later"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                    {formatShort(rangeStart)} &ndash; {formatShort(rangeEnd)}
                </span>
            </div>

            {/* Timeline Grid */}
            <div className="overflow-x-auto border rounded-lg" data-timeline>
                <div style={{ minWidth: 200 + gridWidth }}>
                    {/* Header */}
                    <div className="flex border-b bg-muted/30 sticky top-0 z-10">
                        <div className="w-52 shrink-0 p-3 text-xs font-semibold text-muted-foreground border-r sticky left-0 bg-muted/30 z-20">
                            Item
                        </div>
                        <div className="relative flex" style={{ width: gridWidth }}>
                            {weekCols.map((col) => {
                                const isThisWeek = todayStr >= col && todayStr < addDays(col, 7);
                                return (
                                    <div
                                        key={col}
                                        className={cn(
                                            "shrink-0 text-center text-[10px] py-2 border-r border-border/30",
                                            isThisWeek && "bg-primary/5 font-bold text-primary"
                                        )}
                                        style={{ width: colWidth }}
                                    >
                                        {formatShort(col)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Rows */}
                    {groups.map(([groupLabel, items]) => (
                        <React.Fragment key={groupLabel}>
                            {groupLabel && (
                                <div className="flex border-b border-border/30 bg-muted/10">
                                    <div className="w-52 shrink-0 p-2 pl-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide border-r sticky left-0 bg-muted/10 z-10">
                                        {groupLabel}
                                    </div>
                                    <div style={{ width: gridWidth }} />
                                </div>
                            )}
                            {items.map((item, idx) => {
                                const itemStart = daysBetween(rangeStart, item.startDate);
                                const itemDuration = daysBetween(item.startDate, item.endDate);
                                const leftPercent = (itemStart / totalDays) * 100;
                                const widthPercent = (itemDuration / totalDays) * 100;
                                const progress = item.progress ?? 0;
                                const colorClass =
                                    item.color ?? DEFAULT_COLORS[idx % DEFAULT_COLORS.length];

                                return (
                                    <div
                                        key={item.id}
                                        className="flex border-b border-border/30 hover:bg-secondary/10 group/row"
                                    >
                                        <div className="w-52 shrink-0 p-3 border-r sticky left-0 bg-background z-10 flex items-center gap-1">
                                            <div className="flex-1 min-w-0">
                                                <TruncatedText
                                                    as="p"
                                                    className="text-xs font-medium"
                                                >
                                                    {item.label}
                                                </TruncatedText>
                                                {item.sublabel && (
                                                    <TruncatedText
                                                        as="p"
                                                        className="text-[10px] text-muted-foreground"
                                                    >
                                                        {item.sublabel}
                                                    </TruncatedText>
                                                )}
                                            </div>
                                            {actions && (
                                                <div
                                                    className="shrink-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {actions(item)}
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className="relative"
                                            style={{ width: gridWidth, height: rowHeight }}
                                        >
                                            {/* Grid lines */}
                                            {weekCols.map((col) => (
                                                <div
                                                    key={col}
                                                    className={cn(
                                                        "absolute top-0 bottom-0 border-r border-border/20",
                                                        todayStr >= col &&
                                                            todayStr < addDays(col, 7) &&
                                                            "bg-primary/5"
                                                    )}
                                                    style={{
                                                        left: `${(daysBetween(rangeStart, col) / totalDays) * 100}%`,
                                                        width: `${(7 / totalDays) * 100}%`,
                                                    }}
                                                />
                                            ))}

                                            {/* Bar */}
                                            <Tooltip
                                                content={`${item.label}: ${formatShort(item.startDate)} \u2013 ${formatShort(item.endDate)}${progress > 0 ? `, ${progress}%` : ""}`}
                                                side="top"
                                            >
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "absolute top-2 h-6 rounded-md border transition-all",
                                                        colorClass,
                                                        onItemClick &&
                                                            "cursor-pointer hover:shadow-md"
                                                    )}
                                                    style={{
                                                        left: `${Math.max(0, leftPercent)}%`,
                                                        width: `${Math.max(1, widthPercent)}%`,
                                                    }}
                                                    onClick={() => onItemClick?.(item)}
                                                    aria-label={`${item.label}: ${formatShort(item.startDate)} to ${formatShort(item.endDate)}`}
                                                >
                                                    {/* Progress fill */}
                                                    {progress > 0 && (
                                                        <div
                                                            className="absolute inset-0 rounded-md bg-current opacity-20"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    )}
                                                    <span className="relative z-10 text-[9px] font-medium px-1.5 truncate block leading-6">
                                                        {item.label}
                                                    </span>
                                                </button>
                                            </Tooltip>

                                            {/* Today marker */}
                                            {todayOffset >= 0 && todayOffset <= totalDays && (
                                                <div
                                                    className="absolute top-0 bottom-0 w-px bg-destructive/50 z-5"
                                                    style={{
                                                        left: `${(todayOffset / totalDays) * 100}%`,
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}

DataTimeline.displayName = "DataTimeline";
