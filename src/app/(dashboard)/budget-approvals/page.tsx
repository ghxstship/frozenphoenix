"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import { CheckCircle2, Clock, Loader2, ShieldCheck, XCircle } from "lucide-react";
import type { BudgetApproval } from "@/types/governance";
import { useBudgetApprovals } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import { formatCurrency } from "@/lib/utils";
import type { ApprovalStatus } from "@/types/governance";

const APPROVAL_STATUSES: ApprovalStatus[] = [
    "pending",
    "approved",
    "rejected",
    "revision_requested",
    "escalated",
    "expired",
    "delegated",
];

export default function BudgetApprovalsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { data: sbApprovals, isLoading } = useBudgetApprovals();

    const approvals = (sbApprovals ?? []) as BudgetApproval[];

    const filtered = approvals.filter((a) => {
        const matchesSearch =
            !search ||
            a.entity_type.toLowerCase().includes(search.toLowerCase()) ||
            (a.justification || "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const approved = approvals.filter((a) => a.status === "approved").length;
    const pending = approvals.filter((a) => a.status === "pending").length;
    const rejected = approvals.filter((a) => a.status === "rejected").length;
    const totalApproved = approvals
        .filter((a) => a.status === "approved")
        .reduce((sum, a) => sum + a.amount, 0);

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    return (
        <PermissionGate resource="budget_approvals" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Budget Approvals"
                    description="Multi-tier budget approval workflow with delegation and threshold-based routing"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Approved" value={approved} icon={CheckCircle2} />
                    <StatCard title="Pending" value={pending} icon={Clock} />
                    <StatCard title="Rejected" value={rejected} icon={XCircle} />
                    <StatCard
                        title="Total Approved"
                        value={formatCurrency(totalApproved)}
                        icon={ShieldCheck}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search approvals..."
                        className="flex-1 max-w-sm"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="all">All Statuses</option>
                        {APPROVAL_STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {getStatusLabel(s)}
                            </option>
                        ))}
                    </select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Budget Approvals ({filtered.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left p-3 font-medium">Entity</th>
                                        <th className="text-left p-3 font-medium">Amount</th>
                                        <th className="text-left p-3 font-medium">
                                            Threshold Rule
                                        </th>
                                        <th className="text-left p-3 font-medium">Level</th>
                                        <th className="text-left p-3 font-medium">Status</th>
                                        <th className="text-left p-3 font-medium">Requested</th>
                                        <th className="text-left p-3 font-medium">Approved</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((a) => (
                                        <tr
                                            key={a.id}
                                            className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                                        >
                                            <td className="p-3">
                                                <div className="font-medium text-xs">
                                                    {a.entity_type}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {a.entity_id}
                                                </div>
                                            </td>
                                            <td className="p-3 font-medium">
                                                {formatCurrency(a.amount)}
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">
                                                {a.threshold_rule || "—"}
                                            </td>
                                            <td className="p-3 text-xs">
                                                Level {a.approval_level}
                                            </td>
                                            <td className="p-3">
                                                <StatusBadge
                                                    status={a.status}
                                                    className="text-[10px]"
                                                />
                                            </td>
                                            <td className="p-3 text-xs">
                                                {new Date(a.requested_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-xs">
                                                {a.approved_at
                                                    ? new Date(a.approved_at).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PermissionGate>
    );
}
