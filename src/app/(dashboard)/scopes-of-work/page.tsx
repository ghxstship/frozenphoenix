"use client";

import { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getStatusLabel } from "@/config/ui-variants";
import { CheckCircle2, Clock, DollarSign, FileText, Loader2, Plus } from "lucide-react";
import { useScopesOfWork } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

type SOWStatus =
    | "draft"
    | "pending_review"
    | "pending_approval"
    | "approved"
    | "active"
    | "on_hold"
    | "completed"
    | "cancelled"
    | "amended";

interface SOWItem {
    id: string;
    number: string;
    title: string;
    project: string;
    client: string;
    status: SOWStatus;
    totalValue: number;
    invoiced: number;
    deliverableCount: number;
    completedDeliverables: number;
    effectiveDate: string;
    billingType: string;
}

export default function ScopesOfWorkPage() {
    const [search, setSearch] = useState("");
    const STATUS_FILTERS = ["all", "active", "draft", "pending_approval", "completed"] as const;
    const [statusFilter, setStatusFilter] = useQueryTabState({
        key: "status",
        defaultValue: "all",
        validValues: STATUS_FILTERS,
    });

    const { data: sbSOWs, isLoading } = useScopesOfWork();

    const sows: SOWItem[] = (sbSOWs ?? []).map((s: Record<string, unknown>) => ({
        id: (s.id as string) ?? "",
        number: (s.sow_number as string) ?? "",
        title: (s.title as string) ?? "",
        project: (s.project_name as string) ?? "",
        client: (s.client_name as string) ?? "",
        status: ((s.status as string) ?? "draft") as SOWStatus,
        totalValue: (s.total_value as number) ?? 0,
        invoiced: (s.invoiced_amount as number) ?? 0,
        deliverableCount: (s.deliverable_count as number) ?? 0,
        completedDeliverables: (s.completed_deliverables as number) ?? 0,
        effectiveDate: (s.effective_date as string) ?? "",
        billingType: (s.billing_type as string) ?? "fixed_price",
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filtered = sows.filter((s) => {
        if (statusFilter !== "all" && s.status !== statusFilter) return false;
        if (
            search &&
            !s.title.toLowerCase().includes(search.toLowerCase()) &&
            !s.number.toLowerCase().includes(search.toLowerCase())
        )
            return false;
        return true;
    });

    const totalActive = sows
        .filter((s) => s.status === "active")
        .reduce((sum, s) => sum + s.totalValue, 0);
    const totalInvoiced = sows.reduce((sum, s) => sum + s.invoiced, 0);
    const pendingApproval = sows.filter(
        (s) => s.status === "pending_approval" || s.status === "pending_review"
    ).length;
    const activeCount = sows.filter((s) => s.status === "active").length;

    return (
        <PermissionGate resource="scopes_of_work" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Scopes of Work"
                    description="Manage SOW deliverables, billing, and project scope"
                >
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New SOW
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Active SOW Value"
                        value={formatCurrency(totalActive)}
                        description={`${activeCount} active scopes`}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Total Invoiced"
                        value={formatCurrency(totalInvoiced)}
                        description="across all SOWs"
                        icon={FileText}
                    />
                    <StatCard
                        title="Pending Approval"
                        value={pendingApproval}
                        description="awaiting sign-off"
                        icon={Clock}
                    />
                    <StatCard
                        title="Completion Rate"
                        value="67%"
                        description="deliverables completed"
                        icon={CheckCircle2}
                        change={5}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search SOWs..."
                        className="flex-1 max-w-sm"
                    />
                    <SegmentedControl
                        ariaLabel="SOW status filter"
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as (typeof STATUS_FILTERS)[number])}
                        size="sm"
                        options={[
                            { value: "all", label: "All" },
                            { value: "active", label: getStatusLabel("active") },
                            { value: "draft", label: getStatusLabel("draft") },
                            {
                                value: "pending_approval",
                                label: getStatusLabel("pending_approval"),
                            },
                            { value: "completed", label: getStatusLabel("completed") },
                        ]}
                    />
                </div>

                <div className="space-y-3">
                    {filtered.map((sow) => {
                        const invoicedPct =
                            sow.totalValue > 0 ? (sow.invoiced / sow.totalValue) * 100 : 0;
                        const deliverablePct =
                            sow.deliverableCount > 0
                                ? (sow.completedDeliverables / sow.deliverableCount) * 100
                                : 0;
                        return (
                            <Card
                                key={sow.id}
                                className="hover:bg-secondary/30 transition-colors cursor-pointer"
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    {sow.number}
                                                </span>
                                                <StatusBadge
                                                    status={sow.status}
                                                    className="text-[10px]"
                                                />
                                                <Badge variant="ghost" className="text-[10px]">
                                                    {{
                                                        fixed: "Fixed",
                                                        time_materials: "Time & Materials",
                                                        milestone: "Milestone",
                                                        retainer: "Retainer",
                                                    }[sow.billingType] ?? sow.billingType}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-semibold truncate">
                                                {sow.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {sow.client} · {sow.project} · Effective{" "}
                                                {sow.effectiveDate}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0 ml-4">
                                            <p className="text-lg font-bold">
                                                {formatCurrency(sow.totalValue)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatCurrency(sow.invoiced)} invoiced
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                                <span>Invoiced</span>
                                                <span>{Math.round(invoicedPct)}%</span>
                                            </div>
                                            <ProgressBar
                                                value={invoicedPct}
                                                size="sm"
                                                variant="info"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                                <span>Deliverables</span>
                                                <span>
                                                    {sow.completedDeliverables}/
                                                    {sow.deliverableCount}
                                                </span>
                                            </div>
                                            <ProgressBar
                                                value={deliverablePct}
                                                size="sm"
                                                variant="success"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </PermissionGate>
    );
}
