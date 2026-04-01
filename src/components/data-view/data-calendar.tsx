"use client";

/* ═══════════════════════════════════════════════════════════════
   DATA CALENDAR — Month grid view for date-bearing records

   Renders records as colored dots/chips on a month calendar grid.
   Supports month navigation and item click. Reusable across any
   entity with a date field.
   ═══════════════════════════════════════════════════════════════ */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBreakpoint } from "@/hooks/use-media-query";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ───

export interface CalendarItem {
    id: string;
    title: string;
    date: string;
    endDate?: string | undefined;
    color?: string | undefined;
}

export interface DataCalendarProps {
    data: CalendarItem[];
    className?: string | undefined;
    actions?: ((item: CalendarItem) => React.ReactNode) | undefined;
    onItemClick?: ((item: CalendarItem) => void) | undefined;
}

// ─── Helpers ───

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function isSameDay(a: string, year: number, month: number, day: number): boolean {
    const d = new Date(a);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
}

function isInRange(
    date: string,
    endDate: string | undefined,
    year: number,
    month: number,
    day: number
): boolean {
    if (!endDate) return false;
    const target = new Date(year, month, day).getTime();
    return (
        target >= new Date(date).setHours(0, 0, 0, 0) &&
        target <= new Date(endDate).setHours(23, 59, 59, 999)
    );
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DEFAULT_DOT_COLORS = ["bg-primary", "bg-info", "bg-success", "bg-warning", "bg-destructive"];

// ─── Component ───

export function DataCalendar({ data, className, actions, onItemClick }: DataCalendarProps) {
    const { isMobile } = useBreakpoint();
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);

    const monthLabel = currentDate.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
    });

    const todayDate = new Date();
    const isCurrentMonth = todayDate.getFullYear() === year && todayDate.getMonth() === month;

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    // Build grid cells
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // Pad to fill last row
    while (cells.length % 7 !== 0) cells.push(null);

    // Get items for a specific day
    const getItemsForDay = (day: number): CalendarItem[] => {
        return data.filter(
            (item) =>
                isSameDay(item.date, year, month, day) ||
                isInRange(item.date, item.endDate, year, month, day)
        );
    };

    return (
        <div className={cn("space-y-3", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={prevMonth}
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={goToday}>
                        Today
                    </Button>
                    <Button size="sm" variant="ghost" onClick={nextMonth} aria-label="Next month">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <h3 className="text-sm font-semibold">{monthLabel}</h3>
            </div>

            {/* Mobile Agenda View */}
            {isMobile && (
                <MobileAgendaView data={data} year={year} month={month} onItemClick={onItemClick} />
            )}

            {/* Desktop Calendar Grid */}
            <div className={cn("border rounded-lg overflow-hidden", isMobile && "hidden")}>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b bg-muted/30">
                    {WEEKDAYS.map((day) => (
                        <div
                            key={day}
                            className="p-2 text-center density-caption font-semibold text-muted-foreground"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                    {cells.map((day, idx) => {
                        if (day === null) {
                            return (
                                <div
                                    key={`empty-${idx}`}
                                    className="min-h-[80px] border-b border-r border-border/30 bg-muted/10"
                                />
                            );
                        }

                        const dayItems = getItemsForDay(day);
                        const isToday = isCurrentMonth && todayDate.getDate() === day;

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "min-h-[80px] border-b border-r border-border/30 p-1.5",
                                    isToday && "bg-primary/5"
                                )}
                            >
                                <span
                                    className={cn(
                                        "inline-flex h-5 w-5 items-center justify-center rounded-full density-caption font-medium",
                                        isToday && "bg-primary text-primary-foreground"
                                    )}
                                >
                                    {day}
                                </span>
                                <div className="mt-1 space-y-0.5">
                                    {dayItems.slice(0, 3).map((item, i) => {
                                        const chipClass = cn(
                                            "w-full text-left rounded px-1 py-0.5 density-caption font-medium truncate transition-colors",
                                            item.color ??
                                                DEFAULT_DOT_COLORS[i % DEFAULT_DOT_COLORS.length],
                                            "text-white",
                                            "cursor-pointer hover:opacity-80"
                                        );

                                        if (actions) {
                                            const dateLabel = item.endDate
                                                ? `${new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} \u2013 ${new Date(item.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                                                : new Date(item.date).toLocaleDateString(
                                                      undefined,
                                                      { month: "short", day: "numeric" }
                                                  );

                                            return (
                                                <DropdownMenu key={item.id}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className={chipClass}
                                                            aria-label={item.title}
                                                        >
                                                            {item.title}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="start"
                                                        className="min-w-[180px]"
                                                    >
                                                        <DropdownMenuLabel className="font-medium">
                                                            {item.title}
                                                        </DropdownMenuLabel>
                                                        <p className="px-2 pb-1.5 density-caption text-muted-foreground">
                                                            {dateLabel}
                                                        </p>
                                                        <DropdownMenuSeparator />
                                                        {actions(item)}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            );
                                        }

                                        return (
                                            <Tooltip key={item.id} content={item.title} side="top">
                                                <Button
                                                    variant="ghost"
                                                    className={chipClass}
                                                    onClick={() => onItemClick?.(item)}
                                                    aria-label={item.title}
                                                >
                                                    {item.title}
                                                </Button>
                                            </Tooltip>
                                        );
                                    })}
                                    {dayItems.length > 3 && (
                                        <span className="density-caption text-muted-foreground pl-1">
                                            +{dayItems.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

DataCalendar.displayName = "DataCalendar";

// ─── Mobile Agenda View ───

function MobileAgendaView({
    data,
    year,
    month,
    onItemClick,
}: {
    data: CalendarItem[];
    year: number;
    month: number;
    onItemClick?: ((item: CalendarItem) => void) | undefined;
}) {
    // Filter items for current month and sort by date
    const monthItems = React.useMemo(() => {
        return data
            .filter((item) => {
                const d = new Date(item.date);
                return d.getFullYear() === year && d.getMonth() === month;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [data, year, month]);

    // Group by date
    const grouped = React.useMemo(() => {
        const map = new Map<string, CalendarItem[]>();
        for (const item of monthItems) {
            const key = new Date(item.date).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
            });
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(item);
        }
        return map;
    }, [monthItems]);

    if (monthItems.length === 0) {
        return (
            <div className="py-12 text-center text-sm text-muted-foreground">
                No events this month
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {Array.from(grouped.entries()).map(([dateLabel, items]) => (
                <div key={dateLabel}>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                        {dateLabel}
                    </p>
                    <div className="space-y-1.5">
                        {items.map((item, i) => (
                            <Button
                                key={item.id}
                                variant="ghost"
                                className="w-full text-left h-auto rounded-lg border border-border p-3 flex items-center gap-3 justify-start"
                                onClick={() => onItemClick?.(item)}
                            >
                                <div
                                    className={cn(
                                        "h-2 w-2 rounded-full shrink-0",
                                        item.color ??
                                            DEFAULT_DOT_COLORS[i % DEFAULT_DOT_COLORS.length]
                                    )}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.title}</p>
                                    {item.endDate && (
                                        <p className="density-caption text-muted-foreground">
                                            {new Date(item.date).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                            {" \u2013 "}
                                            {new Date(item.endDate).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    )}
                                </div>
                                <Badge variant="secondary" className="density-caption shrink-0">
                                    {new Date(item.date).toLocaleTimeString(undefined, {
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </Badge>
                            </Button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
