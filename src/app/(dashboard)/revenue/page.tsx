"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type ColumnDef } from "@/components/data-view/data-table";
import { CurrencyField, DateField } from "@/components/data-view/field-renderers";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MOCK_REVENUE_SCHEDULES } from "@/lib/demo-data-crm-revenue";
// REVENUE_SCHEDULE_STATUS_MAP available for drill-down views
import type { RevenueSchedule } from "@/types";
import {
    DollarSign, TrendingUp, CheckCircle, Clock,
    ArrowRight, Receipt, Loader2,
} from "lucide-react";
import { useRevenueSchedules, isSupabaseConfigured } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

const tableColumns: ColumnDef<RevenueSchedule>[] = [
    {
        id: "description",
        header: "Description",
        accessorKey: "description",
        sticky: true,
        minWidth: 250,
        render: (value, row) => (
            <div>
                <div className="font-medium text-sm">{String(value)}</div>
                <div className="text-xs text-muted-foreground">{row.projectName}</div>
            </div>
        ),
    },
    {
        id: "type",
        header: "Type",
        accessorKey: "type",
        minWidth: 120,
        render: (value) => {
            const labels: Record<string, string> = {
                milestone: "Milestone",
                percentage_of_completion: "% Complete",
                time_based: "Time-Based",
                event_based: "Event-Based",
            };
            return <span className="text-sm">{labels[String(value)] ?? String(value)}</span>;
        },
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        minWidth: 120,
        render: (value) => <StatusBadge status={String(value)} />,
    },
    {
        id: "contractedAmount",
        header: "Contracted",
        accessorKey: "contractedAmount",
        minWidth: 120,
        align: "right",
        render: (value) => <CurrencyField value={Number(value)} />,
    },
    {
        id: "invoicedAmount",
        header: "Invoiced",
        accessorKey: "invoicedAmount",
        minWidth: 120,
        align: "right",
        render: (value) => <CurrencyField value={Number(value)} />,
    },
    {
        id: "recognizedAmount",
        header: "Recognized",
        accessorKey: "recognizedAmount",
        minWidth: 120,
        align: "right",
        render: (value) => <CurrencyField value={Number(value)} />,
    },
    {
        id: "scheduledDate",
        header: "Scheduled",
        accessorKey: "scheduledDate",
        minWidth: 120,
        render: (value) => <DateField value={String(value)} />,
    },
    {
        id: "recognizedAt",
        header: "Recognized At",
        accessorKey: "recognizedAt",
        minWidth: 130,
        render: (value) => value ? <DateField value={String(value)} /> : <span className="text-muted-foreground">—</span>,
    },
];

function WaterfallBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
    const pct = total > 0 ? (value / total) * 100 : 0;
    const variant = color.includes("success") ? "success" : color.includes("warning") ? "warning" : color.includes("destructive") ? "destructive" : color.includes("info") ? "info" : "default";
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{formatCurrency(value)}</span>
            </div>
            <ProgressBar value={pct} size="lg" variant={variant} />
        </div>
    );
}

export default function RevenuePage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbSchedules, isLoading } = useRevenueSchedules();

    const schedules: RevenueSchedule[] = isSupabaseConfigured && sbSchedules
        ? sbSchedules.map((r: Record<string, unknown>) => ({
            id: (r.id as string) ?? "",
            dealId: (r.deal_id as string) ?? "",
            dealTitle: (r.deal_title as string) ?? "",
            projectId: (r.project_id as string) ?? undefined,
            projectName: (r.project_name as string) ?? undefined,
            description: (r.description as string) ?? "",
            type: (r.type as string) ?? "milestone",
            status: (r.status as string) ?? "scheduled",
            contractedAmount: (r.contracted_amount as number) ?? 0,
            invoicedAmount: (r.invoiced_amount as number) ?? 0,
            recognizedAmount: (r.recognized_amount as number) ?? 0,
            scheduledDate: (r.scheduled_date as string) ?? "",
            recognizedAt: (r.recognized_at as string) ?? undefined,
            currency: (r.currency as string) ?? "USD",
        } as RevenueSchedule))
        : MOCK_REVENUE_SCHEDULES;

    const filtered = useMemo(() => {
        let result = schedules;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (r) =>
                    r.description.toLowerCase().includes(q) ||
                    (r.projectName ?? "").toLowerCase().includes(q) ||
                    (r.dealTitle ?? "").toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "all") result = result.filter((r) => r.status === statusFilter);
        return result;
    }, [schedules, search, statusFilter]);

    const stats = useMemo(() => {
        const totalContracted = schedules.reduce((s, r) => s + r.contractedAmount, 0);
        const totalInvoiced = schedules.reduce((s, r) => s + r.invoicedAmount, 0);
        const totalRecognized = schedules.reduce((s, r) => s + r.recognizedAmount, 0);
        const backlog = totalContracted - totalRecognized;
        return { totalContracted, totalInvoiced, totalRecognized, backlog };
    }, [schedules]);

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <PermissionGate resource="revenue" action="read">
        <div className="space-y-6">
            <PageHeader title="Revenue Recognition" description="ASC 606-compliant revenue tracking across all projects">
                <Button size="sm">
                    <Receipt className="mr-2 h-4 w-4" /> New Schedule Entry
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Contracted" value={formatCurrency(stats.totalContracted)} icon={DollarSign} />
                <StatCard title="Total Invoiced" value={formatCurrency(stats.totalInvoiced)} icon={TrendingUp} />
                <StatCard title="Total Recognized" value={formatCurrency(stats.totalRecognized)} icon={CheckCircle} />
                <StatCard title="Revenue Backlog" value={formatCurrency(stats.backlog)} icon={Clock} />
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Revenue Waterfall</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <WaterfallBar
                        label="Contracted"
                        value={stats.totalContracted}
                        total={stats.totalContracted}
                        color="bg-primary"
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
                        <ArrowRight className="h-3 w-3" />
                        <span>Invoiced ({stats.totalContracted > 0 ? Math.round((stats.totalInvoiced / stats.totalContracted) * 100) : 0}%)</span>
                    </div>
                    <WaterfallBar
                        label="Invoiced"
                        value={stats.totalInvoiced}
                        total={stats.totalContracted}
                        color="bg-info"
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
                        <ArrowRight className="h-3 w-3" />
                        <span>Recognized ({stats.totalContracted > 0 ? Math.round((stats.totalRecognized / stats.totalContracted) * 100) : 0}%)</span>
                    </div>
                    <WaterfallBar
                        label="Recognized"
                        value={stats.totalRecognized}
                        total={stats.totalContracted}
                        color="bg-success"
                    />
                </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search schedules..." />
                <select
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="invoiced">Invoiced</option>
                    <option value="recognized">Recognized</option>
                    <option value="deferred">Deferred</option>
                    <option value="reversed">Reversed</option>
                </select>
            </div>

            <DataTable columns={tableColumns} data={filtered} keyField="id" />
        </div>
        </PermissionGate>
    );
}
