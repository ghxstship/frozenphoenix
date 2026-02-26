"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getStatusLabel } from "@/config/ui-variants";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import {
    HardDriveDownload, Plus, CheckCircle2, AlertTriangle, Package,
} from "lucide-react";
import { MOCK_GOODS_RECEIPTS } from "@/lib/demo-data-governance";
import type { GoodsReceiptStatus } from "@/types/governance";

const GR_STATUSES: GoodsReceiptStatus[] = [
    "pending", "partial", "complete", "rejected", "discrepancy",
];

export default function GoodsReceiptsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const receipts = MOCK_GOODS_RECEIPTS;

    const filtered = receipts.filter(r => {
        const matchesSearch = !search || r.receipt_number.toLowerCase().includes(search.toLowerCase()) || (r.delivery_location || "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const complete = receipts.filter(r => r.status === "complete").length;
    const discrepancies = receipts.filter(r => r.status === "discrepancy").length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Goods Receipts" description="Delivery confirmation for 3-way matching — PO + goods receipt + vendor invoice">
                <Button size="sm"><Plus className="h-4 w-4" /> Record Receipt</Button>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Total Receipts" value={receipts.length} icon={Package} />
                <StatCard title="Complete" value={complete} icon={CheckCircle2} />
                <StatCard title="Discrepancies" value={discrepancies} icon={AlertTriangle} />
            </div>

            <div className="flex items-center gap-3">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search receipts..." className="flex-1 max-w-sm" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">All Statuses</option>
                    {GR_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                </select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2"><HardDriveDownload className="h-4 w-4" /> Goods Receipts ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left p-3 font-medium">Receipt #</th>
                                    <th className="text-left p-3 font-medium">PO</th>
                                    <th className="text-left p-3 font-medium">Location</th>
                                    <th className="text-left p-3 font-medium">Status</th>
                                    <th className="text-left p-3 font-medium">Received</th>
                                    <th className="text-left p-3 font-medium">Items</th>
                                    <th className="text-left p-3 font-medium">Discrepancies</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(r => (
                                    <tr key={r.id} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer">
                                        <td className="p-3 font-mono font-medium text-xs">{r.receipt_number}</td>
                                        <td className="p-3 text-xs text-muted-foreground">{r.purchase_order_id}</td>
                                        <td className="p-3 text-xs">{r.delivery_location || "—"}</td>
                                        <td className="p-3"><StatusBadge status={r.status} className="text-[10px]" /></td>
                                        <td className="p-3 text-xs">{new Date(r.received_at).toLocaleDateString()}</td>
                                        <td className="p-3 text-xs">{(r.line_items as unknown[]).length} items</td>
                                        <td className="p-3 text-xs max-w-[200px] truncate">{r.discrepancies || "None"}</td>
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
