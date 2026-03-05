"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
import { CurrencyField, DateField } from "@/components/data-view/field-renderers";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import { MOCK_CHANGE_ORDERS } from "@/lib/demo-data-crm-revenue";
import { CHANGE_ORDER_TYPE_MAP } from "@/config/domain-config";
import { useChangeOrders } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import type { ChangeOrder } from "@/types";
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    FolderKanban,
    Loader2,
    Plus,
} from "lucide-react";

const tableColumns: ColumnDef<ChangeOrder>[] = [
    {
        id: "number",
        header: "#",
        accessorKey: "number",
        minWidth: 80,
        render: (value) => <span className="font-mono text-sm font-medium">{String(value)}</span>,
    },
    {
        id: "title",
        header: "Change Order",
        accessorKey: "title",
        sticky: true,
        minWidth: 250,
        render: (value, row) => (
            <div>
                <div className="font-medium text-sm">{String(value)}</div>
                <div className="text-xs text-muted-foreground">
                    {row.projectName} — {row.companyName}
                </div>
            </div>
        ),
    },
    {
        id: "changeType",
        header: "Type",
        accessorKey: "changeType",
        minWidth: 130,
        render: (value) => {
            const config = CHANGE_ORDER_TYPE_MAP[value as keyof typeof CHANGE_ORDER_TYPE_MAP];
            return config ? <Badge variant="outline">{config.label}</Badge> : String(value);
        },
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        minWidth: 130,
        render: (value) => <StatusBadge status={String(value)} />,
    },
    {
        id: "valueImpact",
        header: "Value Impact",
        accessorKey: "valueImpact",
        minWidth: 130,
        align: "right",
        render: (value) => {
            const num = Number(value);
            const isPositive = num > 0;
            return (
                <div
                    className={`flex items-center justify-end gap-1 font-medium text-sm ${isPositive ? "text-success" : "text-destructive"}`}
                >
                    {isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                    ) : (
                        <ArrowDownRight className="h-3 w-3" />
                    )}
                    <CurrencyField value={Math.abs(num)} />
                </div>
            );
        },
    },
    {
        id: "scheduleImpactDays",
        header: "Schedule",
        accessorKey: "scheduleImpactDays",
        minWidth: 100,
        align: "right",
        render: (value) => {
            const days = Number(value);
            if (days === 0) return <span className="text-muted-foreground">None</span>;
            return (
                <span className={days > 0 ? "text-warning" : "text-success"}>
                    {days > 0 ? `+${days}` : days} days
                </span>
            );
        },
    },
    {
        id: "requestedAt",
        header: "Requested",
        accessorKey: "requestedAt",
        minWidth: 120,
        render: (value) => <DateField value={String(value)} />,
    },
    {
        id: "approvedAt",
        header: "Approved",
        accessorKey: "approvedAt",
        minWidth: 120,
        render: (value) =>
            value ? (
                <DateField value={String(value)} />
            ) : (
                <span className="text-muted-foreground">—</span>
            ),
    },
];

export default function ChangeOrdersPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const { data: sbChangeOrders, isLoading } = useChangeOrders();

    const changeOrders = sbChangeOrders
        ? (sbChangeOrders as unknown as ChangeOrder[])
        : MOCK_CHANGE_ORDERS;

    const filtered = useMemo(() => {
        let result = changeOrders;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (co) =>
                    co.title.toLowerCase().includes(q) ||
                    co.number.toLowerCase().includes(q) ||
                    (co.projectName ?? "").toLowerCase().includes(q) ||
                    (co.companyName ?? "").toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") result = result.filter((co) => co.status === statusFilter);
        if (typeFilter !== "all") result = result.filter((co) => co.changeType === typeFilter);
        return result;
    }, [changeOrders, search, statusFilter, typeFilter]);

    const stats = useMemo(() => {
        const totalImpact = changeOrders.reduce((s, co) => s + co.valueImpact, 0);
        const approvedImpact = changeOrders
            .filter((co) => co.status === "approved")
            .reduce((s, co) => s + co.valueImpact, 0);
        const pendingCount = changeOrders.filter(
            (co) => co.status === "pending_review" || co.status === "pending_client"
        ).length;
        const totalScheduleImpact = changeOrders
            .filter((co) => co.status === "approved")
            .reduce((s, co) => s + co.scheduleImpactDays, 0);
        return { totalImpact, approvedImpact, pendingCount, totalScheduleImpact };
    }, [changeOrders]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="change_orders" action="read">
            <div className="space-y-6">
                <PageHeader
                    title="Change Orders"
                    description="Track and manage post-contract scope modifications"
                >
                    <Link href="/change-orders/new">
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" /> New Change Order
                        </Button>
                    </Link>
                </PageHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Net Value Impact"
                        value={formatCurrency(stats.totalImpact)}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Approved Impact"
                        value={formatCurrency(stats.approvedImpact)}
                        icon={CheckCircle}
                    />
                    <StatCard
                        title="Pending Approval"
                        value={stats.pendingCount}
                        icon={AlertTriangle}
                    />
                    <StatCard
                        title="Schedule Impact"
                        value={`${stats.totalScheduleImpact > 0 ? "+" : ""}${stats.totalScheduleImpact} days`}
                        icon={Clock}
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search change orders..."
                    />
                    <select
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="pending_review">Pending Review</option>
                        <option value="pending_client">Pending Client</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="void">Void</option>
                    </select>
                    <select
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="scope_addition">Scope Addition</option>
                        <option value="scope_reduction">Scope Reduction</option>
                        <option value="timeline_change">Timeline Change</option>
                        <option value="budget_adjustment">Budget Adjustment</option>
                        <option value="combined">Combined</option>
                    </select>
                </div>

                <DataTable columns={tableColumns} data={filtered} keyField="id" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((co) => (
                        <ChangeOrderCard key={co.id} co={co} />
                    ))}
                </div>
            </div>
        </PermissionGate>
    );
}

function ChangeOrderCard({ co }: { co: ChangeOrder }) {
    const typeConfig = CHANGE_ORDER_TYPE_MAP[co.changeType as keyof typeof CHANGE_ORDER_TYPE_MAP];
    const isPositive = co.valueImpact > 0;

    return (
        <Card className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-muted-foreground">
                                {co.number}
                            </span>
                            <StatusBadge status={co.status} />
                        </div>
                        <CardTitle className="text-base">{co.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <FolderKanban className="h-3 w-3" />
                            <span>{co.projectName}</span>
                            <span>•</span>
                            <span>{co.companyName}</span>
                        </div>
                    </div>
                    <div
                        className={`text-lg font-bold ${isPositive ? "text-success" : "text-destructive"}`}
                    >
                        {isPositive ? "+" : ""}
                        {formatCurrency(co.valueImpact)}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {co.description && (
                    <p className="text-sm text-muted-foreground">{co.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs">
                    {typeConfig && <Badge variant="outline">{typeConfig.label}</Badge>}
                    {co.scheduleImpactDays !== 0 && (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span
                                className={
                                    co.scheduleImpactDays > 0 ? "text-warning" : "text-success"
                                }
                            >
                                {co.scheduleImpactDays > 0 ? "+" : ""}
                                {co.scheduleImpactDays} days
                            </span>
                        </div>
                    )}
                </div>

                {(co.scopeAdditions || co.scopeRemovals) && (
                    <div className="space-y-1 text-xs">
                        {co.scopeAdditions && (
                            <div className="flex items-start gap-1.5">
                                <ArrowUpRight className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                                <span>{co.scopeAdditions}</span>
                            </div>
                        )}
                        {co.scopeRemovals && (
                            <div className="flex items-start gap-1.5">
                                <ArrowDownRight className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                                <span>{co.scopeRemovals}</span>
                            </div>
                        )}
                    </div>
                )}

                {co.reason && (
                    <div className="text-xs border-t pt-2">
                        <span className="text-muted-foreground">Reason: </span>
                        <span>{co.reason}</span>
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                    <span>Requested by {co.requestedByName ?? "—"}</span>
                    {co.approvedAt && <span>Approved {formatDate(co.approvedAt, "medium")}</span>}
                    {co.clientApprovedBy && <span>Client: {co.clientApprovedBy}</span>}
                </div>
            </CardContent>
        </Card>
    );
}
