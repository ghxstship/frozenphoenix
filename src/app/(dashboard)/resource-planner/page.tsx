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

// NEXT: Wire to Supabase when resource_bookings queries are available
type BookingStatus = "tentative" | "confirmed" | "cancelled";
type BookingType = "project_work" | "internal" | "time_off" | "training" | "admin";

interface ResourceBooking {
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

interface CrewMember {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar?: string;
    utilizationPercent: number;
}

const mockCrewMembers: CrewMember[] = [
    {
        id: "1",
        name: "Alex Rivera",
        role: "Production Manager",
        department: "Production",
        utilizationPercent: 85,
    },
    {
        id: "2",
        name: "Jordan Kim",
        role: "Technical Director",
        department: "Technical",
        utilizationPercent: 92,
    },
    {
        id: "3",
        name: "Sam Chen",
        role: "Fabrication Lead",
        department: "Fabrication",
        utilizationPercent: 78,
    },
    {
        id: "4",
        name: "Taylor Morgan",
        role: "Logistics Coordinator",
        department: "Logistics",
        utilizationPercent: 65,
    },
    {
        id: "5",
        name: "Casey Johnson",
        role: "AV Technician",
        department: "Technical",
        utilizationPercent: 45,
    },
    {
        id: "6",
        name: "Morgan Lee",
        role: "Scenic Artist",
        department: "Scenic",
        utilizationPercent: 100,
    },
];

const mockBookings: ResourceBooking[] = [
    {
        id: "1",
        crewMemberId: "1",
        crewMemberName: "Alex Rivera",
        projectId: "p1",
        projectName: "Nike Air Max Launch",
        bookingType: "project_work",
        status: "confirmed",
        startDate: "2026-02-23",
        endDate: "2026-02-27",
        hoursPerDay: 8,
        role: "Production Manager",
        hasConflict: false,
    },
    {
        id: "2",
        crewMemberId: "2",
        crewMemberName: "Jordan Kim",
        projectId: "p1",
        projectName: "Nike Air Max Launch",
        bookingType: "project_work",
        status: "confirmed",
        startDate: "2026-02-24",
        endDate: "2026-02-28",
        hoursPerDay: 8,
        role: "Technical Director",
        hasConflict: false,
    },
    {
        id: "3",
        crewMemberId: "3",
        crewMemberName: "Sam Chen",
        projectId: "p2",
        projectName: "Red Bull Festival",
        bookingType: "project_work",
        status: "tentative",
        startDate: "2026-02-25",
        endDate: "2026-03-01",
        hoursPerDay: 8,
        role: "Fabrication Lead",
        hasConflict: false,
    },
    {
        id: "4",
        crewMemberId: "4",
        crewMemberName: "Taylor Morgan",
        bookingType: "time_off",
        status: "confirmed",
        startDate: "2026-02-26",
        endDate: "2026-02-28",
        hoursPerDay: 8,
        hasConflict: false,
    },
    {
        id: "5",
        crewMemberId: "5",
        crewMemberName: "Casey Johnson",
        projectId: "p1",
        projectName: "Nike Air Max Launch",
        bookingType: "project_work",
        status: "confirmed",
        startDate: "2026-02-23",
        endDate: "2026-02-25",
        hoursPerDay: 4,
        role: "AV Technician",
        hasConflict: false,
    },
    {
        id: "6",
        crewMemberId: "6",
        crewMemberName: "Morgan Lee",
        projectId: "p1",
        projectName: "Nike Air Max Launch",
        bookingType: "project_work",
        status: "confirmed",
        startDate: "2026-02-23",
        endDate: "2026-02-28",
        hoursPerDay: 8,
        role: "Scenic Artist",
        hasConflict: true,
    },
];

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
        return mockBookings.filter(
            (b) => b.crewMemberId === crewMemberId && isDateInRange(date, b.startDate, b.endDate)
        );
    };

    const stats = {
        totalCrew: mockCrewMembers.length,
        avgUtilization: Math.round(
            mockCrewMembers.reduce((sum, c) => sum + c.utilizationPercent, 0) /
                mockCrewMembers.length
        ),
        overbooked: mockCrewMembers.filter((c) => c.utilizationPercent >= 100).length,
        available: mockCrewMembers.filter((c) => c.utilizationPercent < 50).length,
    };

    return (
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
                    <Button>
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
                            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
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
                            <div className="text-2xl font-bold text-success">{stats.available}</div>
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
                        <div className="min-w-[900px]" role="grid" aria-label="Weekly resource schedule">
                            {/* Header Row */}
                            <div role="row" className="grid grid-cols-8 border-b">
                                <div role="columnheader" className="p-3 font-medium text-sm border-r bg-muted/50">
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
                            {mockCrewMembers.map((crew) => (
                                <div
                                    key={crew.id}
                                    role="row"
                                    className="grid grid-cols-8 border-b last:border-b-0 hover:bg-muted/20"
                                >
                                    {/* Crew Info */}
                                    <div role="rowheader" className="p-3 border-r flex items-center gap-3">
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
                                        const bookings = getBookingsForCrewOnDate(crew.id, dateStr);
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
                                                            booking.bookingType.replace("_", " ")}
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Senior AV Tech</div>
                                    <div className="text-sm text-muted-foreground">
                                        Nike Launch • Mar 1-5
                                    </div>
                                </div>
                                <Button size="sm" variant="outline">
                                    Assign
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Rigger (2)</div>
                                    <div className="text-sm text-muted-foreground">
                                        Red Bull Festival • Mar 10-15
                                    </div>
                                </div>
                                <Button size="sm" variant="outline">
                                    Assign
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <div className="font-medium">Scenic Painter</div>
                                    <div className="text-sm text-muted-foreground">
                                        Coachella • Mar 20-25
                                    </div>
                                </div>
                                <Button size="sm" variant="outline">
                                    Assign
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PermissionGate>
    );
}
