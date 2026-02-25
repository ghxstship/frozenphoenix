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
    ClipboardMinus, Plus, CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import { MOCK_CONTRACT_OBLIGATIONS } from "@/lib/mock-data-governance";
import type { ObligationStatus } from "@/types/governance";

const OBLIGATION_STATUSES: ObligationStatus[] = [
    "pending", "in_progress", "fulfilled", "breached", "waived", "expired",
];

const PARTY_LABELS: Record<string, string> = {
    us: "Us (Company)", counterparty: "Counterparty", mutual: "Mutual", third_party: "Third Party",
};

const PARTY_VARIANTS: Record<string, "info" | "warning" | "secondary" | "default"> = {
    us: "info", counterparty: "warning", mutual: "secondary", third_party: "default",
};

export default function ObligationsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const obligations = MOCK_CONTRACT_OBLIGATIONS;

    const filtered = obligations.filter(o => {
        const matchesSearch = !search || o.description.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const pending = obligations.filter(o => o.status === "pending" || o.status === "in_progress").length;
    const fulfilled = obligations.filter(o => o.status === "fulfilled").length;
    const critical = obligations.filter(o => o.is_critical).length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Contract Obligations" description="Track what each party must do — deadlines, recurring obligations, and fulfillment evidence">
                <Button size="sm"><Plus className="h-4 w-4" /> Add Obligation</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Pending / In Progress" value={pending} icon={Clock} />
                <StatCard title="Fulfilled" value={fulfilled} icon={CheckCircle2} />
                <StatCard title="Critical" value={critical} icon={AlertTriangle} />
            </div>

            <div className="flex items-center gap-3">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search obligations..." className="flex-1 max-w-sm" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">All Statuses</option>
                    {OBLIGATION_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><ClipboardMinus className="h-4 w-4" /> Obligations ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left p-3 font-medium">Description</th>
                                    <th className="text-left p-3 font-medium">Party</th>
                                    <th className="text-left p-3 font-medium">Contract</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-left p-3 font-medium">Due Date</th>
                                    <th className="text-left p-3 font-medium">Flags</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(o => (
                                    <tr key={o.id} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                                        <td className="p-3">
                                            <div className="font-medium text-xs">{o.description}</div>
                                            {o.clause_reference && <div className="text-[10px] text-muted-foreground">Clause: {o.clause_reference}</div>}
                                        </td>
                                        <td className="p-3">
                                            <Badge variant={PARTY_VARIANTS[o.party] || "default"} className="text-[10px]">
                                                {PARTY_LABELS[o.party] || o.party}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-xs text-muted-foreground">{o.contract_id}</td>
                                        <td className="p-3"><StatusBadge status={o.status} className="text-[10px]" /></td>
                                        <td className="p-3 text-xs">
                                            {o.due_date ? new Date(o.due_date).toLocaleDateString() : "—"}
                                            {o.is_recurring && <div className="text-[10px] text-muted-foreground">Recurring: {o.recurrence_pattern}</div>}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                {o.is_critical && <Badge variant="destructive" className="text-[9px]">Critical</Badge>}
                                                {o.is_recurring && <Badge variant="secondary" className="text-[9px]">Recurring</Badge>}
                                            </div>
                                        </td>
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
