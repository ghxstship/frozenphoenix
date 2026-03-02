"use client";

import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import {
    CalendarDays,
    CheckCircle2,
    Clock,
    GraduationCap,
    Heart,
    Palmtree,
    Plus,
    Stethoscope,
    User,
    XCircle,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

// TODO: Wire to Supabase when leave_requests table is available
void isSupabaseConfigured;

type LeaveType = "vacation" | "sick" | "personal" | "training" | "parental" | "bereavement";

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
    vacation: "Vacation",
    sick: "Sick",
    personal: "Personal",
    training: "Training",
    parental: "Parental",
    bereavement: "Bereavement",
};
type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

interface LeaveRequest {
    id: string;
    person: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    status: LeaveStatus;
    reason: string;
    approver: string;
}

const LEAVE_ICONS: Record<LeaveType, React.ElementType> = {
    vacation: Palmtree,
    sick: Stethoscope,
    personal: Heart,
    training: GraduationCap,
    parental: Heart,
    bereavement: Heart,
};

const mockRequests: LeaveRequest[] = [
    {
        id: "1",
        person: "Sarah Chen",
        type: "vacation",
        startDate: "2026-03-15",
        endDate: "2026-03-22",
        days: 5,
        status: "pending",
        reason: "Spring break trip",
        approver: "Mike Johnson",
    },
    {
        id: "2",
        person: "David Kim",
        type: "sick",
        startDate: "2026-02-24",
        endDate: "2026-02-25",
        days: 2,
        status: "approved",
        reason: "Not feeling well",
        approver: "Sarah Chen",
    },
    {
        id: "3",
        person: "Lisa Wang",
        type: "training",
        startDate: "2026-03-05",
        endDate: "2026-03-07",
        days: 3,
        status: "approved",
        reason: "AWS certification boot camp",
        approver: "Mike Johnson",
    },
    {
        id: "4",
        person: "Tom Harris",
        type: "personal",
        startDate: "2026-03-10",
        endDate: "2026-03-10",
        days: 1,
        status: "pending",
        reason: "Apartment move",
        approver: "Sarah Chen",
    },
    {
        id: "5",
        person: "Mike Johnson",
        type: "vacation",
        startDate: "2026-04-01",
        endDate: "2026-04-10",
        days: 8,
        status: "pending",
        reason: "Family vacation",
        approver: "Director",
    },
    {
        id: "6",
        person: "Sarah Chen",
        type: "sick",
        startDate: "2026-02-10",
        endDate: "2026-02-10",
        days: 1,
        status: "approved",
        reason: "Doctor appointment",
        approver: "Mike Johnson",
    },
];

interface BalanceItem {
    type: LeaveType;
    label: string;
    total: number;
    used: number;
    pending: number;
}

const balances: BalanceItem[] = [
    { type: "vacation", label: "Vacation", total: 20, used: 8, pending: 5 },
    { type: "sick", label: "Sick Leave", total: 10, used: 3, pending: 0 },
    { type: "personal", label: "Personal", total: 3, used: 1, pending: 1 },
    { type: "training", label: "Training", total: 5, used: 3, pending: 0 },
];

export default function TimeOffPage() {
    const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;
    const [filter, setFilter] = useQueryTabState({
        key: "status",
        defaultValue: "all",
        validValues: STATUS_FILTERS,
    });

    const pending = mockRequests.filter((r) => r.status === "pending").length;
    const approved = mockRequests.filter((r) => r.status === "approved").length;
    const totalDaysOff = mockRequests
        .filter((r) => r.status === "approved")
        .reduce((s, r) => s + r.days, 0);

    const filtered =
        filter === "all" ? mockRequests : mockRequests.filter((r) => r.status === filter);

    return (
        <PermissionGate resource="time_off" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Time Off"
                    description="Manage leave requests, approvals, and PTO balances"
                >
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Request Time Off
                    </Button>
                </PageHeader>

                {/* KPI Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Pending Requests"
                        value={pending}
                        description="awaiting approval"
                        icon={Clock}
                    />
                    <StatCard
                        title="Approved This Month"
                        value={approved}
                        description="requests"
                        icon={CheckCircle2}
                    />
                    <StatCard
                        title="Days Used (Team)"
                        value={totalDaysOff}
                        description="this quarter"
                        icon={CalendarDays}
                    />
                    <StatCard title="Team on Leave" value={1} description="today" icon={User} />
                </div>

                {/* Leave Balances */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">My Leave Balances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {balances.map((b) => {
                                const Icon = LEAVE_ICONS[b.type];
                                const remaining = b.total - b.used - b.pending;
                                return (
                                    <div
                                        key={b.type}
                                        className="p-4 rounded-xl bg-secondary/50 space-y-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs font-semibold">{b.label}</span>
                                        </div>
                                        <div className="flex items-end gap-1">
                                            <span className="text-2xl font-bold">{remaining}</span>
                                            <span className="text-xs text-muted-foreground mb-1">
                                                / {b.total} days
                                            </span>
                                        </div>
                                        <ProgressBar
                                            value={((b.used + b.pending) / b.total) * 100}
                                            size="sm"
                                        />
                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                            <span>{b.used} used</span>
                                            {b.pending > 0 && <span>{b.pending} pending</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Filter Tabs */}
                <SegmentedControl
                    ariaLabel="Leave request status filter"
                    value={filter}
                    onValueChange={(v) => setFilter(v as (typeof STATUS_FILTERS)[number])}
                    options={[
                        { value: "all", label: "All" },
                        { value: "pending", label: `Pending${pending > 0 ? ` (${pending})` : ""}` },
                        { value: "approved", label: "Approved" },
                        { value: "rejected", label: "Rejected" },
                    ]}
                />

                {/* Requests List */}
                <div className="space-y-2">
                    {filtered.map((req) => {
                        const Icon = LEAVE_ICONS[req.type];
                        return (
                            <Card
                                key={req.id}
                                className="hover:bg-secondary/30 transition-colors cursor-pointer"
                            >
                                <CardContent className="flex items-center gap-4 py-3">
                                    <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold">{req.person}</p>
                                            <StatusBadge
                                                status={req.status}
                                                className="text-[10px]"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {LEAVE_TYPE_LABELS[req.type]} — {req.reason}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-medium">
                                            {req.days} day{req.days > 1 ? "s" : ""}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {req.startDate}
                                            {req.days > 1 ? ` — ${req.endDate}` : ""}
                                        </p>
                                    </div>
                                    {req.status === "pending" && (
                                        <div className="flex gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-success hover:bg-success/10"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </PermissionGate>
    );
}
