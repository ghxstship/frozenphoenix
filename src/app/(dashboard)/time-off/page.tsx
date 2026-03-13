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
import { PermissionGate } from "@/components/permission-guard";
import { LoadingState } from "@/components/layouts/loading-state";
import { useTimeOffRequests } from "@/lib/supabase/hooks-productive";

type LeaveType = "vacation" | "sick" | "personal" | "training" | "parental" | "bereavement";

const LEAVE_TYPE_LABELS: Record<string, string> = {
    vacation: "Vacation",
    sick: "Sick",
    personal: "Personal",
    training: "Training",
    parental: "Parental",
    bereavement: "Bereavement",
};

interface LeaveView {
    id: string;
    person: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    status: string;
    reason: string;
    approver: string;
}

const LEAVE_ICONS: Record<string, React.ElementType> = {
    vacation: Palmtree,
    sick: Stethoscope,
    personal: Heart,
    training: GraduationCap,
    parental: Heart,
    bereavement: Heart,
};

function daysBetween(a: string, b: string): number {
    const ms = new Date(b).getTime() - new Date(a).getTime();
    return Math.max(1, Math.round(ms / 86400000) + 1);
}

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
    const { data: sbRequests, isLoading } = useTimeOffRequests();

    if (isLoading) return <LoadingState />;

    const requests: LeaveView[] = (sbRequests ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        person: ((r.crew_members as Record<string, unknown>)?.name as string) ?? "Unknown",
        type: (r.time_off_type as string) ?? "personal",
        startDate: r.start_date as string,
        endDate: r.end_date as string,
        days: daysBetween(r.start_date as string, r.end_date as string),
        status: (r.status as string) ?? "pending",
        reason: (r.reason as string) ?? "",
        approver: ((r.profiles as Record<string, unknown>)?.name as string) ?? "",
    }));

    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const totalDaysOff = requests
        .filter((r) => r.status === "approved")
        .reduce((s, r) => s + r.days, 0);

    const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

    return (
        <PermissionGate resource="time_off" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Time Off"
                    description="Manage leave requests, approvals, and PTO balances"
                >
                    <Button onClick={() => void 0}>
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
                                const Icon = LEAVE_ICONS[b.type] ?? Heart;
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
                        const Icon = LEAVE_ICONS[req.type] ?? Heart;
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
                                            {LEAVE_TYPE_LABELS[req.type] ?? req.type} — {req.reason}
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
                                                onClick={() => void 0}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                                onClick={() => void 0}
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
