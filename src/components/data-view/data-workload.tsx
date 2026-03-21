"use client";

/* ═══════════════════════════════════════════════════════════════
   DATA WORKLOAD — Resource capacity visualization

   Renders per-resource stacked bars showing allocated hours vs
   capacity over a weekly time range. Ideal for crew scheduling,
   resource planning, and project staffing views.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useBreakpoint } from "@/hooks/use-media-query";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ───

export interface WorkloadAllocation {
    id: string;
    resource: string;
    resourceAvatar?: string;
    startDate: string;
    endDate: string;
    hours?: number;
    category?: string;
    color?: string;
}

export interface DataWorkloadProps {
    data: WorkloadAllocation[];
    capacityHoursPerDay?: number;
    className?: string;
    actions?: (item: WorkloadAllocation) => React.ReactNode;
    onItemClick?: (item: WorkloadAllocation) => void;
}

// ─── Helpers ───

function getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff);
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatWeek(date: Date): string {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function dateKey(d: Date): string {
    return d.toISOString().split("T")[0]!;
}

// ─── Component ───

export function DataWorkload({
    data,
    capacityHoursPerDay = 8,
    className,
    actions,
    onItemClick: _onItemClick,
}: DataWorkloadProps) {
    const { isMobile } = useBreakpoint();
    const [weekOffset, setWeekOffset] = React.useState(0);

    // Compute 4-week window
    const baseMonday = getMonday(new Date());
    const windowStart = addDays(baseMonday, weekOffset * 7);
    const weeks = Array.from({ length: 4 }, (_, i) => addDays(windowStart, i * 7));
    const windowEnd = addDays(weeks[3]!, 7);

    // Group by resource
    const resources = React.useMemo(() => {
        const map = new Map<string, WorkloadAllocation[]>();
        for (const item of data) {
            if (!map.has(item.resource)) map.set(item.resource, []);
            map.get(item.resource)!.push(item);
        }
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [data]);

    // Compute hours per resource per week
    const computeWeekHours = (allocations: WorkloadAllocation[], weekStart: Date): number => {
        const weekEnd = addDays(weekStart, 5); // Mon–Fri
        let total = 0;
        for (const alloc of allocations) {
            const aStart = new Date(alloc.startDate);
            const aEnd = new Date(alloc.endDate);
            // Check overlap
            if (aStart <= weekEnd && aEnd >= weekStart) {
                const overlapStart = aStart > weekStart ? aStart : weekStart;
                const overlapEnd = aEnd < weekEnd ? aEnd : weekEnd;
                const overlapDays =
                    Math.ceil(
                        (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
                    ) + 1;
                total += (alloc.hours ?? capacityHoursPerDay) * Math.max(0, overlapDays);
            }
        }
        return total;
    };

    const weeklyCapacity = capacityHoursPerDay * 5;

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                No workload data to display
            </div>
        );
    }

    return (
        <div className={cn("space-y-3", className)}>
            {/* Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setWeekOffset((o) => o - 4)}
                        aria-label="Previous 4 weeks"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setWeekOffset(0)}>
                        Current
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setWeekOffset((o) => o + 4)}
                        aria-label="Next 4 weeks"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                    {formatWeek(windowStart)} &ndash; {formatWeek(addDays(windowEnd, -1))}
                </span>
            </div>

            {/* Mobile Card View */}
            {isMobile && (
                <div className="space-y-3">
                    {resources.map(([resourceName, allocations]) => {
                        const totalHours = weeks.reduce(
                            (sum, w) => sum + computeWeekHours(allocations, w),
                            0
                        );
                        const totalCapacity = weeklyCapacity * 4;
                        const utilPct = Math.round((totalHours / totalCapacity) * 100);
                        const isOver = totalHours > totalCapacity;
                        return (
                            <div
                                key={resourceName}
                                className="rounded-lg border border-border p-3 space-y-2"
                            >
                                <div className="flex items-center gap-2">
                                    {allocations[0]?.resourceAvatar ? (
                                        <Image
                                            src={allocations[0].resourceAvatar}
                                            alt=""
                                            width={24}
                                            height={24}
                                            className="h-6 w-6 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center density-caption font-medium">
                                            {resourceName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium flex-1 truncate">
                                        {resourceName}
                                    </span>
                                    <Badge
                                        variant={
                                            isOver
                                                ? "destructive"
                                                : utilPct > 80
                                                  ? "warning"
                                                  : "secondary"
                                        }
                                        className="density-caption"
                                    >
                                        {utilPct}%
                                    </Badge>
                                </div>
                                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all",
                                            isOver
                                                ? "bg-destructive/60"
                                                : utilPct > 80
                                                  ? "bg-warning/60"
                                                  : "bg-primary/40"
                                        )}
                                        style={{ width: `${Math.min(100, utilPct)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between density-caption text-muted-foreground">
                                    <span>{totalHours}h allocated</span>
                                    <span>{totalCapacity}h capacity</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Desktop Workload Grid */}
            <div className={cn("border rounded-lg overflow-x-auto", isMobile && "hidden")}>
                <table className="w-full text-sm" role="table">
                    <thead>
                        <tr className="border-b bg-muted/30">
                            <th className="text-left p-3 text-xs font-semibold text-muted-foreground w-48 sticky left-0 bg-muted/30 z-10">
                                Resource
                            </th>
                            {weeks.map((w) => (
                                <th
                                    key={dateKey(w)}
                                    className="text-center p-3 text-xs font-semibold text-muted-foreground min-w-[120px]"
                                >
                                    {formatWeek(w)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {resources.map(([resourceName, allocations]) => (
                            <tr
                                key={resourceName}
                                className="border-b border-border/30 hover:bg-secondary/5 group/row"
                            >
                                <td className="p-3 sticky left-0 bg-background z-10">
                                    <div className="flex items-center gap-2">
                                        {allocations[0]?.resourceAvatar ? (
                                            <Image
                                                src={allocations[0].resourceAvatar}
                                                alt=""
                                                width={24}
                                                height={24}
                                                className="h-6 w-6 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center density-caption font-medium">
                                                {resourceName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-xs font-medium truncate max-w-[140px] flex-1">
                                            {resourceName}
                                        </span>
                                        {actions && allocations[0] && (
                                            <div
                                                className="shrink-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {actions(allocations[0])}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                {weeks.map((w) => {
                                    const hours = computeWeekHours(allocations, w);
                                    const utilization = Math.min(
                                        (hours / weeklyCapacity) * 100,
                                        150
                                    );
                                    const isOver = hours > weeklyCapacity;

                                    return (
                                        <td key={dateKey(w)} className="p-3">
                                            <Tooltip
                                                content={`${resourceName}: ${hours}h / ${weeklyCapacity}h capacity`}
                                                side="top"
                                            >
                                                <div className="space-y-1">
                                                    {/* Bar */}
                                                    <div className="h-6 bg-muted/30 rounded-md overflow-hidden relative">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-md transition-all",
                                                                isOver
                                                                    ? "bg-destructive/60"
                                                                    : utilization > 80
                                                                      ? "bg-warning/60"
                                                                      : "bg-primary/40"
                                                            )}
                                                            style={{
                                                                width: `${Math.min(100, (utilization / 100) * 100)}%`,
                                                            }}
                                                        />
                                                        {/* Capacity line */}
                                                        <div
                                                            className="absolute top-0 bottom-0 w-px bg-foreground/20"
                                                            style={{ left: "100%" }}
                                                        />
                                                    </div>
                                                    {/* Label */}
                                                    <div className="flex items-center justify-between">
                                                        <span
                                                            className={cn(
                                                                "density-caption tabular-nums",
                                                                isOver
                                                                    ? "text-destructive font-semibold"
                                                                    : "text-muted-foreground"
                                                            )}
                                                        >
                                                            {hours}h
                                                        </span>
                                                        {isOver && (
                                                            <AlertTriangle className="h-3 w-3 text-destructive" />
                                                        )}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

DataWorkload.displayName = "DataWorkload";
