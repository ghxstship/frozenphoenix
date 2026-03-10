"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ApprovalStatus, PaymentApproval } from "@/types/governance";
import { useBudgetApprovals } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

const APPROVAL_STATUSES: ApprovalStatus[] = [
    "pending",
    "approved",
    "rejected",
    "revision_requested",
    "escalated",
    "expired",
    "delegated",
];

export default function PaymentApprovalsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbApprovals, isLoading } = useBudgetApprovals();

    const approvals: PaymentApproval[] = (sbApprovals ?? []).map((a: Record<string, unknown>) => ({
        id: (a.id as string) ?? "",
        payment_type: ((a.payment_type as string) ??
            "vendor_invoice") as PaymentApproval["payment_type"],
        entity_id: (a.entity_id as string) ?? "",
        amount: (a.amount as number) ?? 0,
        currency: (a.currency as string) ?? "USD",
        payee_name: (a.payee_name as string) ?? "",
        status: ((a.status as string) ?? "pending") as ApprovalStatus,
        requested_by: (a.requested_by as string) ?? "",
        requested_at: (a.requested_at as string) ?? "",
        three_way_match_verified: (a.three_way_match_verified as boolean) ?? false,
        vendor_compliance_verified: (a.vendor_compliance_verified as boolean) ?? false,
        budget_within_limit: (a.budget_within_limit as boolean) ?? false,
        threshold_rule: (a.threshold_rule as string) ?? "",
        organization_id: (a.organization_id as string) ?? "",
        created_at: (a.created_at as string) ?? "",
        updated_at: (a.updated_at as string) ?? "",
    }));

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    const filtered = approvals.filter((a) => {
        const matchesSearch =
            !search ||
            (a.payee_name || "").toLowerCase().includes(search.toLowerCase()) ||
            a.payment_type.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const approved = approvals.filter((a) => a.status === "approved").length;
    const pending = approvals.filter((a) => a.status === "pending").length;
    const totalPending = approvals
        .filter((a) => a.status === "pending")
        .reduce((sum, a) => sum + a.amount, 0);

    return (
        <PermissionGate resource="payment_approvals" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Payment Approvals"
                    description="Payment authorization workflow with threshold-based routing and 3-way match verification"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Approved" value={approved} icon={CheckCircle2} />
                    <StatCard title="Pending" value={pending} icon={Clock} />
                    <StatCard
                        title="Pending Amount"
                        value={formatCurrency(totalPending)}
                        icon={XCircle}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search payments..."
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
                            <ShieldCheck className="h-4 w-4" /> Payment Approvals ({filtered.length}
                            )
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left p-3 font-medium">Payee</th>
                                        <th className="text-left p-3 font-medium">Type</th>
                                        <th className="text-left p-3 font-medium">Amount</th>
                                        <th className="text-left p-3 font-medium">Verification</th>
                                        <th className="text-left p-3 font-medium">Threshold</th>
                                        <th className="text-left p-3 font-medium">Status</th>
                                        <th className="text-left p-3 font-medium">Requested</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((a) => (
                                        <tr
                                            key={a.id}
                                            className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                                        >
                                            <td className="p-3 font-medium">
                                                {a.payee_name || "—"}
                                            </td>
                                            <td className="p-3 text-xs">
                                                {a.payment_type.replace(/_/g, " ")}
                                            </td>
                                            <td className="p-3 font-medium">
                                                {formatCurrency(a.amount)}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {a.three_way_match_verified && (
                                                        <Badge
                                                            variant="success"
                                                            className="text-[9px]"
                                                        >
                                                            3-Way Match
                                                        </Badge>
                                                    )}
                                                    {a.vendor_compliance_verified && (
                                                        <Badge
                                                            variant="success"
                                                            className="text-[9px]"
                                                        >
                                                            Compliance
                                                        </Badge>
                                                    )}
                                                    {a.budget_within_limit && (
                                                        <Badge
                                                            variant="success"
                                                            className="text-[9px]"
                                                        >
                                                            Budget OK
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 text-xs text-muted-foreground">
                                                {a.threshold_rule || "—"}
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
