"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck, Search, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { MOCK_PAYMENT_APPROVALS } from "@/lib/mock-data-governance";
import { formatCurrency } from "@/lib/utils";
import type { ApprovalStatus } from "@/types/governance";

const APPROVAL_STATUSES: ApprovalStatus[] = [
    "pending", "approved", "rejected", "revision_requested", "escalated", "expired", "delegated",
];

export default function PaymentApprovalsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const approvals = MOCK_PAYMENT_APPROVALS;

    const filtered = approvals.filter(a => {
        const matchesSearch = !search || (a.payee_name || "").toLowerCase().includes(search.toLowerCase()) || a.payment_type.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || a.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const approved = approvals.filter(a => a.status === "approved").length;
    const pending = approvals.filter(a => a.status === "pending").length;
    const totalPending = approvals.filter(a => a.status === "pending").reduce((sum, a) => sum + a.amount, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Payment Approvals" description="Payment authorization workflow with threshold-based routing and 3-way match verification" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Approved" value={approved} icon={CheckCircle2} />
                <StatCard title="Pending" value={pending} icon={Clock} />
                <StatCard title="Pending Amount" value={formatCurrency(totalPending)} icon={XCircle} />
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">All Statuses</option>
                    {APPROVAL_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Payment Approvals ({filtered.length})</CardTitle>
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
                                {filtered.map(a => (
                                    <tr key={a.id} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                                        <td className="p-3 font-medium">{a.payee_name || "—"}</td>
                                        <td className="p-3 text-xs">{a.payment_type.replace(/_/g, " ")}</td>
                                        <td className="p-3 font-medium">{formatCurrency(a.amount)}</td>
                                        <td className="p-3">
                                            <div className="flex flex-wrap gap-1">
                                                {a.three_way_match_verified && <Badge variant="success" className="text-[9px]">3-Way Match</Badge>}
                                                {a.vendor_compliance_verified && <Badge variant="success" className="text-[9px]">Compliance</Badge>}
                                                {a.budget_within_limit && <Badge variant="success" className="text-[9px]">Budget OK</Badge>}
                                            </div>
                                        </td>
                                        <td className="p-3 text-xs text-muted-foreground">{a.threshold_rule || "—"}</td>
                                        <td className="p-3"><StatusBadge status={a.status} className="text-[10px]" /></td>
                                        <td className="p-3 text-xs">{new Date(a.requested_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
