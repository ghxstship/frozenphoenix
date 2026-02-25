"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { ClipboardCheck, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MockReconciliation {
    id: string;
    assetName: string;
    barcode: string;
    conditionOnArrival: string;
    conditionOnReturn: string;
    status: string;
    quantityExpected: number;
    quantityReturned: number;
    quantityMissing: number;
    quantityDamaged: number;
    estimatedRepairCost?: number;
    notes?: string;
}

const mockItems: MockReconciliation[] = [
    { id: "1", assetName: "Meyer Sound LEOPARD Line Array (x8)", barcode: "MSL-2024-001", conditionOnArrival: "excellent", conditionOnReturn: "excellent", status: "reconciled", quantityExpected: 8, quantityReturned: 8, quantityMissing: 0, quantityDamaged: 0 },
    { id: "2", assetName: "Robe BMFL Spot (x12)", barcode: "RB-BMFL-042", conditionOnArrival: "good", conditionOnReturn: "fair", status: "discrepancy", quantityExpected: 12, quantityReturned: 11, quantityMissing: 1, quantityDamaged: 0, estimatedRepairCost: 0, notes: "1 unit missing — last seen stage left truss" },
    { id: "3", assetName: "Disguise D3 Media Server", barcode: "DG-D3-007", conditionOnArrival: "excellent", conditionOnReturn: "damaged", status: "discrepancy", quantityExpected: 1, quantityReturned: 1, quantityMissing: 0, quantityDamaged: 1, estimatedRepairCost: 2400, notes: "Fan failure during show — overheated" },
    { id: "4", assetName: "CM Lodestar 1-Ton Chain Hoist (x6)", barcode: "CM-LS1T-019", conditionOnArrival: "good", conditionOnReturn: "good", status: "reconciled", quantityExpected: 6, quantityReturned: 6, quantityMissing: 0, quantityDamaged: 0 },
    { id: "5", assetName: "Crowd Barrier Sections (x40)", barcode: "CB-STD-100", conditionOnArrival: "fair", conditionOnReturn: "fair", status: "pending", quantityExpected: 40, quantityReturned: 38, quantityMissing: 2, quantityDamaged: 0, notes: "2 sections unaccounted — checking loading dock" },
    { id: "6", assetName: "XL Video LED Panel P2.9 (x24)", barcode: "XLV-P29-060", conditionOnArrival: "excellent", conditionOnReturn: "good", status: "reconciled", quantityExpected: 24, quantityReturned: 24, quantityMissing: 0, quantityDamaged: 0 },
];

export default function ReconciliationPage() {
    const [search, setSearch] = useState("");

    const reconciled = mockItems.filter(i => i.status === "reconciled").length;
    const discrepancies = mockItems.filter(i => i.status === "discrepancy").length;
    const totalDamageCost = mockItems.reduce((s, i) => s + (i.estimatedRepairCost ?? 0), 0);
    const totalMissing = mockItems.reduce((s, i) => s + i.quantityMissing, 0);

    const filtered = mockItems.filter(i =>
        !search || i.assetName.toLowerCase().includes(search.toLowerCase()) || i.barcode.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Asset Reconciliation" description="Post-event asset condition tracking, damage logging, and discrepancy resolution" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Reconciled" value={`${reconciled}/${mockItems.length}`} icon={CheckCircle2} />
                <StatCard title="Discrepancies" value={discrepancies} icon={AlertTriangle} />
                <StatCard title="Missing Items" value={totalMissing} icon={ClipboardCheck} />
                <StatCard title="Damage Cost" value={formatCurrency(totalDamageCost)} icon={AlertTriangle} />
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>

            <div className="space-y-2">
                {filtered.map((item, i) => (
                    <Card key={item.id} className={`hover:shadow-sm transition-all animate-slide-up ${item.status === "discrepancy" ? "border-l-2 border-l-destructive" : item.status === "reconciled" ? "border-l-2 border-l-success" : ""}`} style={{ animationDelay: `${i * 30}ms` }}>
                        <CardContent className="py-3">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold truncate">{item.assetName}</h3>
                                        <StatusBadge status={item.status} className="text-[10px] shrink-0" />
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                                        <span className="font-mono">{item.barcode}</span>
                                        <span>Expected: {item.quantityExpected}</span>
                                        <span>Returned: {item.quantityReturned}</span>
                                        {item.quantityMissing > 0 && <span className="text-destructive">Missing: {item.quantityMissing}</span>}
                                        {item.quantityDamaged > 0 && <span className="text-warning">Damaged: {item.quantityDamaged}</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                                        <span>Arrival: <StatusBadge status={item.conditionOnArrival} className="text-[9px]" /></span>
                                        <span>Return: <StatusBadge status={item.conditionOnReturn} className="text-[9px]" /></span>
                                        {item.estimatedRepairCost && item.estimatedRepairCost > 0 && <span className="text-destructive">Repair: {formatCurrency(item.estimatedRepairCost)}</span>}
                                    </div>
                                    {item.notes && <p className="text-[10px] text-muted-foreground mt-1">{item.notes}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
