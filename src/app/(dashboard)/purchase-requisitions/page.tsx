"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ClipboardList, Plus, CheckCircle2, Clock, AlertTriangle, Loader2,
} from "lucide-react";
import { MOCK_PURCHASE_REQUISITIONS } from "@/lib/demo-data-governance";
import { formatCurrency } from "@/lib/utils";
import type { PurchaseRequisition, RequisitionStatus } from "@/types/governance";
import { usePurchaseRequisitions, isSupabaseConfigured } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";

const REQ_STATUSES: RequisitionStatus[] = [
    "draft", "pending_approval", "approved", "rejected", "converted_to_po", "cancelled",
];

const URGENCY_VARIANTS: Record<string, "destructive" | "warning" | "default" | "success"> = {
    critical: "destructive", high: "warning", normal: "default", low: "success",
};

export default function PurchaseRequisitionsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data: sbReqs, isLoading } = usePurchaseRequisitions();

    const reqs: PurchaseRequisition[] = isSupabaseConfigured && sbReqs
        ? sbReqs.map((r: Record<string, unknown>) => ({
            id: (r.id as string) ?? "",
            number: (r.number as string) ?? "",
            title: (r.title as string) ?? "",
            status: ((r.status as string) ?? "draft") as RequisitionStatus,
            urgency: (r.urgency as string) ?? "normal",
            estimated_cost: (r.estimated_cost as number) ?? 0,
            justification: (r.justification as string) ?? "",
            needed_by: (r.needed_by as string) ?? undefined,
            line_items: (r.line_items as unknown[]) ?? [],
            requested_by: (r.requested_by as string) ?? "",
            requested_at: (r.requested_at as string) ?? "",
            department: (r.department as string) ?? "",
        } as PurchaseRequisition))
        : MOCK_PURCHASE_REQUISITIONS;

    if (isSupabaseConfigured && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filtered = reqs.filter(r => {
        const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.number.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pending = reqs.filter(r => r.status === "pending_approval").length;
    const approved = reqs.filter(r => r.status === "approved" || r.status === "converted_to_po").length;
    const totalEstimated = reqs.reduce((sum, r) => sum + r.estimated_cost, 0);

    return (
        <PermissionGate resource="purchase_requisitions" action="read">
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Purchase Requisitions" description="Pre-PO approval workflow — request, justify, and approve purchases before PO issuance">
                <Button size="sm"><Plus className="h-4 w-4" /> New Requisition</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Pending Approval" value={pending} icon={Clock} />
                <StatCard title="Approved / Converted" value={approved} icon={CheckCircle2} />
                <StatCard title="Total Estimated" value={formatCurrency(totalEstimated)} icon={AlertTriangle} />
            </div>

            <div className="flex items-center gap-3">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search requisitions..." className="flex-1 max-w-sm" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">All Statuses</option>
                    {REQ_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Requisitions ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left p-3 font-medium">Number</th>
                                    <th className="text-left p-3 font-medium">Title</th>
                                    <th className="text-left p-3 font-medium">Urgency</th>
                                    <th className="text-left p-3 font-medium">Est. Cost</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-left p-3 font-medium">Needed By</th>
                                    <th className="text-left p-3 font-medium">Items</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(r => (
                                    <tr key={r.id} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                                        <td className="p-3 font-mono text-xs">{r.number}</td>
                                        <td className="p-3">
                                            <div className="font-medium text-xs">{r.title}</div>
                                            {r.justification && <div className="text-[10px] text-muted-foreground line-clamp-1">{r.justification}</div>}
                                        </td>
                                        <td className="p-3">
                                            <Badge variant={URGENCY_VARIANTS[r.urgency] || "default"} className="text-[10px]">
                                                {r.urgency}
                                            </Badge>
                                        </td>
                                        <td className="p-3 font-medium text-xs">{formatCurrency(r.estimated_cost)}</td>
                                        <td className="p-3"><StatusBadge status={r.status} className="text-[10px]" /></td>
                                        <td className="p-3 text-xs">{r.needed_by ? new Date(r.needed_by).toLocaleDateString() : "—"}</td>
                                        <td className="p-3 text-xs text-muted-foreground">{(r.line_items as unknown[]).length} items</td>
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
