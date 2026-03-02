"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import { StaggerItem } from "@/components/ui/stagger-container";
import { CheckCircle2, Clock, Loader2, MapPin, Navigation, Plus, Truck, Users } from "lucide-react";
import { MOCK_DISPATCH_ENTRIES, MOCK_WORK_ORDERS } from "@/lib/demo-data-vendor-lifecycle";
import { isSupabaseConfigured, useDispatch } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import type { DispatchStatus } from "@/types/vendor-lifecycle";

const DISPATCH_STATUSES: DispatchStatus[] = [
    "unassigned",
    "offered",
    "accepted",
    "declined",
    "en_route",
    "on_site",
    "in_progress",
    "completed",
    "no_show",
];

export default function DispatchPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { data: sbDispatch, isLoading } = useDispatch();

    const dispatches =
        isSupabaseConfigured && sbDispatch
            ? (sbDispatch as unknown as typeof MOCK_DISPATCH_ENTRIES)
            : MOCK_DISPATCH_ENTRIES;
    const filtered = dispatches.filter((d) => {
        const matchesSearch =
            !search ||
            (d.vendorName || "").toLowerCase().includes(search.toLowerCase()) ||
            (d.crewMemberName || "").toLowerCase().includes(search.toLowerCase()) ||
            (d.workOrderTitle || "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || d.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const active = dispatches.filter((d) =>
        ["en_route", "on_site", "in_progress"].includes(d.status)
    );
    const pending = dispatches.filter((d) => ["unassigned", "offered"].includes(d.status));
    const completed = dispatches.filter((d) => d.status === "completed");

    const getWorkOrderTitle = (woId: string) => {
        const wo = MOCK_WORK_ORDERS.find((w) => w.id === woId);
        return wo ? `${wo.number} — ${wo.title}` : woId;
    };

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="dispatch" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Dispatch Board"
                    description="Real-time crew and vendor dispatch tracking across all active work orders"
                >
                    <Link href="/dispatch/new">
                        <Button size="sm">
                            <Plus className="h-4 w-4" /> New Dispatch
                        </Button>
                    </Link>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Active Dispatches" value={active.length} icon={Navigation} />
                    <StatCard title="Pending" value={pending.length} icon={Clock} />
                    <StatCard
                        title="Completed Today"
                        value={completed.length}
                        icon={CheckCircle2}
                    />
                    <StatCard title="Total Personnel" value={dispatches.length} icon={Users} />
                </div>

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search dispatches..."
                        className="flex-1 max-w-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="all">All Statuses</option>
                        {DISPATCH_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {getStatusLabel(s)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Navigation className="h-4 w-4" /> Active Dispatches
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {filtered
                                .filter(
                                    (d) => !["completed", "no_show", "declined"].includes(d.status)
                                )
                                .map((dispatch, i) => (
                                    <StaggerItem key={dispatch.id} index={i} stagger="relaxed">
                                        <div className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium truncate">
                                                        {dispatch.vendorName ||
                                                            dispatch.crewMemberName}
                                                    </h4>
                                                    {dispatch.role && (
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {dispatch.role}
                                                        </p>
                                                    )}
                                                </div>
                                                <StatusBadge
                                                    status={dispatch.status}
                                                    className="text-[10px] ml-2"
                                                />
                                            </div>

                                            <p className="text-xs text-muted-foreground mb-2 truncate">
                                                {getWorkOrderTitle(dispatch.workOrderId)}
                                            </p>

                                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                                {dispatch.dispatchedAt && (
                                                    <span className="flex items-center gap-1">
                                                        <Truck className="h-3 w-3" /> Dispatched{" "}
                                                        {new Date(
                                                            dispatch.dispatchedAt
                                                        ).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                )}
                                                {dispatch.arrivedAt && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> Arrived{" "}
                                                        {new Date(
                                                            dispatch.arrivedAt
                                                        ).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                )}
                                            </div>

                                            {dispatch.dispatchNotes && (
                                                <p className="text-[10px] text-muted-foreground mt-1 italic">
                                                    Note: {dispatch.dispatchNotes}
                                                </p>
                                            )}
                                        </div>
                                    </StaggerItem>
                                ))}
                            {filtered.filter(
                                (d) => !["completed", "no_show", "declined"].includes(d.status)
                            ).length === 0 && (
                                <div className="text-center py-8 text-sm text-muted-foreground">
                                    No active dispatches
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Completed / Closed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {filtered
                                .filter((d) =>
                                    ["completed", "no_show", "declined"].includes(d.status)
                                )
                                .map((dispatch, i) => (
                                    <StaggerItem key={dispatch.id} index={i} stagger="relaxed">
                                        <div className="p-3 rounded-lg border border-border opacity-75">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium truncate">
                                                        {dispatch.vendorName ||
                                                            dispatch.crewMemberName}
                                                    </h4>
                                                    {dispatch.role && (
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {dispatch.role}
                                                        </p>
                                                    )}
                                                </div>
                                                <StatusBadge
                                                    status={dispatch.status}
                                                    className="text-[10px] ml-2"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {getWorkOrderTitle(dispatch.workOrderId)}
                                            </p>
                                            {dispatch.completedAt && (
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    Completed{" "}
                                                    {new Date(
                                                        dispatch.completedAt
                                                    ).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </StaggerItem>
                                ))}
                            {filtered.filter((d) =>
                                ["completed", "no_show", "declined"].includes(d.status)
                            ).length === 0 && (
                                <div className="text-center py-8 text-sm text-muted-foreground">
                                    No completed dispatches
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PermissionGate>
    );
}
