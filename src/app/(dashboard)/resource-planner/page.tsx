"use client";

import { useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Plus,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate as formatDisplayDate } from "@/lib/locale";
import { PermissionGate } from "@/components/permission-guard";
import { LoadingState } from "@/components/layouts/loading-state";
import {
    useCreateResourceBooking,
    useResourceBookings,
    useUpdateResourceBooking,
} from "@/lib/supabase";
import { useCrewMembers } from "@/lib/supabase";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_RESOURCE_BOOKING_CONFIG } from "@/config/create-entity-configs";

type BookingStatus = "tentative" | "confirmed" | "cancelled";
type BookingType = "project_work" | "internal" | "time_off" | "training" | "admin";

interface ResourceBookingView {
    id: string;
    crewMemberId: string;
    crewMemberName: string;
    projectId?: string;
    projectName?: string;
    placeholderName?: string;
    bookingType: BookingType;
    status: BookingStatus;
    startDate: string;
    endDate: string;
    hoursPerDay: number;
    role?: string;
    department?: string;
    hasConflict: boolean;
}

interface CrewMemberView {
    id: string;
    name: string;
    role: string;
    department: string;
    utilizationPercent: number;
}

const bookingColors: Record<BookingType, string> = {
    project_work: "bg-info",
    internal: "bg-primary",
    time_off: "bg-muted-foreground",
    training: "bg-success",
    admin: "bg-warning",
};

const statusOpacity: Record<BookingStatus, string> = {
    tentative: "opacity-60 border-dashed border-2",
    confirmed: "opacity-100",
    cancelled: "opacity-30 line-through",
};

function getWeekDates(startDate: Date): Date[] {
    const dates: Date[] = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Start from Monday

    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(date);
    }
    return dates;
}

function formatDate(date: Date): string {
    return date.toISOString().split("T")[0] ?? "";
}

function isDateInRange(date: string, startDate: string, endDate: string): boolean {
    return date >= startDate && date <= endDate;
}

function getUtilizationColor(percent: number): string {
    if (percent >= 100) return "text-destructive";
    if (percent >= 80) return "text-warning";
    if (percent >= 50) return "text-success";
    return "text-muted-foreground";
}

export default function ResourcePlannerPage() {
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        return monday;
    });

    const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);

    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const { data: sbBookings, isLoading: loadingBookings } = useResourceBookings();
    const { data: sbCrew, isLoading: loadingCrew } = useCrewMembers();
    const createBooking = useCreateResourceBooking();
    const updateBooking = useUpdateResourceBooking();

    const handleAssignPlaceholder = (bookingId: string, crewMemberId: string) => {
        updateBooking.mutate({ id: bookingId, crew_member_id: crewMemberId, status: "confirmed" });
    };

    const bookings: ResourceBookingView[] = useMemo(
        () =>
            (sbBookings ?? []).map((r: Record<string, unknown>) => ({
                id: (r.id as string) ?? "",
                crewMemberId: (r.crew_member_id as string) ?? "",
                crewMemberName:
                    ((r.crew_members as Record<string, unknown>)?.name as string) ?? "Unassigned",
                projectId: (r.project_id as string) ?? undefined,
                projectName: ((r.projects as Record<string, unknown>)?.name as string) ?? undefined,
                placeholderName: (r.placeholder_name as string) ?? undefined,
                bookingType: ((r.booking_type as string) ?? "project_work") as BookingType,
                status: ((r.status as string) ?? "confirmed") as BookingStatus,
                startDate: (r.start_date as string) ?? "",
                endDate: (r.end_date as string) ?? "",
                hoursPerDay: (r.hours_per_day as number) ?? 8,
                role: (r.role as string) ?? undefined,
                department: (r.department as string) ?? undefined,
                hasConflict: (r.has_conflict as boolean) ?? false,
            })),
        [sbBookings]
    );

    const crewMembers: CrewMemberView[] = useMemo(() => {
        const members = (sbCrew ?? []).map((c: Record<string, unknown>) => {
            const memberId = c.id as string;
            const memberBookings = bookings.filter((b) => b.crewMemberId === memberId);
            // Simple utilization: total booked hours / (40h week) as percentage
            const totalHours = memberBookings.reduce((sum, b) => {
                const days = Math.max(
                    1,
                    Math.round(
                        (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / 86400000
                    ) + 1
                );
                return sum + b.hoursPerDay * days;
            }, 0);
            // Rough weekly utilization (cap at 200)
            const utilizationPercent = Math.min(200, Math.round((totalHours / 40) * 100));
            return {
                id: memberId,
                name: (c.name as string) ?? "Unknown",
                role: (c.role as string) ?? "",
                department: (c.department as string) ?? "",
                utilizationPercent,
            };
        });
        return members;
    }, [sbCrew, bookings]);

    if (loadingBookings || loadingCrew) return <LoadingState />;

    const navigateWeek = (direction: "prev" | "next") => {
        setCurrentWeekStart((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7));
            return newDate;
        });
    };

    const goToToday = () => {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        setCurrentWeekStart(monday);
    };

    const getBookingsForCrewOnDate = (crewMemberId: string, date: string) => {
        return bookings.filter(
            (b) => b.crewMemberId === crewMemberId && isDateInRange(date, b.startDate, b.endDate)
        );
    };

    const stats = {
        totalCrew: crewMembers.length,
        avgUtilization: crewMembers.length
            ? Math.round(
                  crewMembers.reduce((sum, c) => sum + c.utilizationPercent, 0) / crewMembers.length
              )
            : 0,
        overbooked: crewMembers.filter((c) => c.utilizationPercent >= 100).length,
        available: crewMembers.filter((c) => c.utilizationPercent < 50).length,
    };

    return (
        <>
            <PermissionGate resource="resource_planner" action="read">
                <div className="flex flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Resource Planner</h1>
                            <p className="text-muted-foreground">
                                Schedule and manage team capacity across projects
                            </p>
                        </div>
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Booking
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalCrew}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Avg Utilization
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={cn(
                                        "text-2xl font-bold",
                                        getUtilizationColor(stats.avgUtilization)
                                    )}
                                >
                                    {stats.avgUtilization}%
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Overbooked</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-destructive">
                                    {stats.overbooked}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Available</CardTitle>
                                <CheckCircle className="h-4 w-4 text-success" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-success">
                                    {stats.available}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Calendar Navigation */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigateWeek("prev")}
                                aria-label="Previous week"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={goToToday}>
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigateWeek("next")}
                                aria-label="Next week"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <span className="ml-4 text-lg font-semibold">
                                {weekDates[0] ? formatDisplayDate(weekDates[0], "long") : ""}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-3 w-3 rounded bg-info" />
                                <span>Project</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-3 w-3 rounded bg-muted-foreground" />
                                <span>Time Off</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-3 w-3 rounded bg-success" />
                                <span>Training</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-3 w-3 rounded border-2 border-dashed border-info opacity-60" />
                                <span>Tentative</span>
                            </div>
                        </div>
                    </div>

                    {/* Resource Grid */}
                    <Card>
                        <div className="overflow-x-auto">
                            <div
                                className="min-w-[900px]"
                                role="grid"
                                aria-label="Weekly resource schedule"
                            >
                                {/* Header Row */}
                                <div role="row" className="grid grid-cols-8 border-b">
                                    <div
                                        role="columnheader"
                                        className="p-3 font-medium text-sm border-r bg-muted/50"
                                    >
                                        Team Member
                                    </div>
                                    {weekDates.map((date) => (
                                        <div
                                            key={date.toISOString()}
                                            role="columnheader"
                                            className={cn(
                                                "p-3 text-center border-r last:border-r-0",
                                                date.getDay() === 0 || date.getDay() === 6
                                                    ? "bg-muted/30"
                                                    : "bg-muted/50"
                                            )}
                                        >
                                            <div className="text-xs text-muted-foreground">
                                                {new Intl.DateTimeFormat(undefined, {
                                                    weekday: "short",
                                                }).format(date)}
                                            </div>
                                            <div className="font-medium">{date.getDate()}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Crew Rows */}
                                {crewMembers.map((crew) => (
                                    <div
                                        key={crew.id}
                                        role="row"
                                        className="grid grid-cols-8 border-b last:border-b-0 hover:bg-muted/20"
                                    >
                                        {/* Crew Info */}
                                        <div
                                            role="rowheader"
                                            className="p-3 border-r flex items-center gap-3"
                                        >
                                            <div
                                                className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground text-xs font-medium",
                                                    crew.utilizationPercent >= 100
                                                        ? "bg-destructive"
                                                        : crew.utilizationPercent >= 80
                                                          ? "bg-warning"
                                                          : "bg-success"
                                                )}
                                            >
                                                {crew.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">
                                                    {crew.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {crew.role}
                                                </div>
                                            </div>
                                            <div
                                                className={cn(
                                                    "text-xs font-medium",
                                                    getUtilizationColor(crew.utilizationPercent)
                                                )}
                                            >
                                                {crew.utilizationPercent}%
                                            </div>
                                        </div>

                                        {/* Day Cells */}
                                        {weekDates.map((date) => {
                                            const dateStr = formatDate(date);
                                            const bookings = getBookingsForCrewOnDate(
                                                crew.id,
                                                dateStr
                                            );
                                            const isWeekend =
                                                date.getDay() === 0 || date.getDay() === 6;

                                            return (
                                                <div
                                                    key={dateStr}
                                                    role="gridcell"
                                                    aria-label={`${crew.name}, ${new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(date)}${bookings.length > 0 ? `: ${bookings.map((b) => b.projectName || b.bookingType.replace("_", " ")).join(", ")}` : ": Available"}`}
                                                    className={cn(
                                                        "p-1 border-r last:border-r-0 min-h-[60px] relative",
                                                        isWeekend && "bg-muted/20"
                                                    )}
                                                >
                                                    {bookings.map((booking) => (
                                                        <div
                                                            key={booking.id}
                                                            className={cn(
                                                                "rounded px-1 py-0.5 text-xs text-primary-foreground mb-1 cursor-pointer hover:opacity-80 truncate",
                                                                bookingColors[booking.bookingType],
                                                                statusOpacity[booking.status],
                                                                booking.hasConflict &&
                                                                    "ring-2 ring-destructive"
                                                            )}
                                                            title={
                                                                booking.projectName ||
                                                                booking.bookingType
                                                            }
                                                        >
                                                            {booking.hoursPerDay < 8 && (
                                                                <span className="mr-1">
                                                                    {booking.hoursPerDay}h
                                                                </span>
                                                            )}
                                                            {booking.projectName ||
                                                                booking.bookingType.replace(
                                                                    "_",
                                                                    " "
                                                                )}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Placeholder Bookings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Placeholder Bookings</CardTitle>
                            <CardDescription>
                                Unassigned resource needs for upcoming projects
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const placeholders = bookings.filter(
                                    (b) => b.placeholderName && !b.crewMemberId
                                );
                                if (placeholders.length === 0) {
                                    return (
                                        <p className="text-sm text-muted-foreground text-center py-6">
                                            No unassigned placeholder bookings.
                                        </p>
                                    );
                                }
                                return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {placeholders.map((b) => (
                                            <div
                                                key={b.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div>
                                                    <div className="font-medium">
                                                        {b.placeholderName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {b.projectName ?? "Unassigned"} •{" "}
                                                        {formatDisplayDate(
                                                            new Date(b.startDate),
                                                            "compact"
                                                        )}
                                                        –
                                                        {formatDisplayDate(
                                                            new Date(b.endDate),
                                                            "compact"
                                                        )}
                                                    </div>
                                                </div>
                                                <select
                                                    className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                                                    defaultValue=""
                                                    onChange={(e) => {
                                                        if (e.target.value)
                                                            handleAssignPlaceholder(
                                                                b.id,
                                                                e.target.value
                                                            );
                                                    }}
                                                    disabled={updateBooking.isPending}
                                                >
                                                    <option value="" disabled>
                                                        Assign
                                                    </option>
                                                    {crewMembers.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </div>
            </PermissionGate>
            <CreateEntityDialog
                open={createOpen}
                onClose={closeCreate}
                config={CREATE_RESOURCE_BOOKING_CONFIG}
                onSubmit={(values) => {
                    createBooking.mutate(values as Parameters<typeof createBooking.mutate>[0]);
                    closeCreate();
                }}
            />
        </>
    );
}
