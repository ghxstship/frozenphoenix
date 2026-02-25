"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
    FileText, Plus, Search, DollarSign,
    CheckCircle2, Clock,
} from "lucide-react";

type SOWStatus = "draft" | "pending_review" | "pending_approval" | "approved" | "active" | "on_hold" | "completed" | "cancelled" | "amended";

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

const mockSOWs: SOWItem[] = [
    { id: "1", number: "SOW-2026-001", title: "Nike Air Max Launch — Full Production", project: "Nike Air Max Launch", client: "Nike", status: "active", totalValue: 485000, invoiced: 242500, deliverableCount: 8, completedDeliverables: 4, effectiveDate: "2026-01-15", billingType: "fixed_price" },
    { id: "2", number: "SOW-2026-002", title: "Red Bull Festival — Stage & AV Package", project: "Red Bull Festival", client: "Red Bull", status: "active", totalValue: 320000, invoiced: 160000, deliverableCount: 6, completedDeliverables: 2, effectiveDate: "2026-02-01", billingType: "time_and_materials" },
    { id: "3", number: "SOW-2026-003", title: "Coachella Experience Zone", project: "Coachella Experience", client: "Goldenvoice", status: "approved", totalValue: 750000, invoiced: 0, deliverableCount: 12, completedDeliverables: 0, effectiveDate: "2026-03-01", billingType: "fixed_price" },
    { id: "4", number: "SOW-2026-004", title: "Glossier Pop-Up — Fabrication & Install", project: "Glossier Pop-Up", client: "Glossier", status: "completed", totalValue: 125000, invoiced: 125000, deliverableCount: 4, completedDeliverables: 4, effectiveDate: "2025-12-01", billingType: "fixed_price" },
    { id: "5", number: "SOW-2026-005", title: "TechStart Launch Event", project: "TechStart Launch", client: "TechStart", status: "draft", totalValue: 200000, invoiced: 0, deliverableCount: 5, completedDeliverables: 0, effectiveDate: "2026-04-01", billingType: "retainer" },
    { id: "6", number: "SOW-2026-006", title: "Nike — Ongoing Retainer Q2", project: "Nike Air Max Launch", client: "Nike", status: "pending_approval", totalValue: 150000, invoiced: 0, deliverableCount: 3, completedDeliverables: 0, effectiveDate: "2026-04-01", billingType: "retainer" },
];

export default function ScopesOfWorkPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | SOWStatus>("all");

    const filtered = mockSOWs.filter((s) => {
        if (statusFilter !== "all" && s.status !== statusFilter) return false;
        if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.number.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const totalActive = mockSOWs.filter((s) => s.status === "active").reduce((sum, s) => sum + s.totalValue, 0);
    const totalInvoiced = mockSOWs.reduce((sum, s) => sum + s.invoiced, 0);
    const pendingApproval = mockSOWs.filter((s) => s.status === "pending_approval" || s.status === "pending_review").length;
    const activeCount = mockSOWs.filter((s) => s.status === "active").length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Scopes of Work" description="Manage SOW deliverables, billing, and project scope">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New SOW
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active SOW Value" value={formatCurrency(totalActive)} description={`${activeCount} active scopes`} icon={DollarSign} />
                <StatCard title="Total Invoiced" value={formatCurrency(totalInvoiced)} description="across all SOWs" icon={FileText} />
                <StatCard title="Pending Approval" value={pendingApproval} description="awaiting sign-off" icon={Clock} />
                <StatCard title="Completion Rate" value="67%" description="deliverables completed" icon={CheckCircle2} change={5} />
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search SOWs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
                </div>
                <div className="flex gap-1">
                    {(["all", "active", "draft", "pending_approval", "completed"] as const).map((f) => (
                        <Button key={f} variant={statusFilter === f ? "default" : "ghost"} size="sm" onClick={() => setStatusFilter(f)} className="text-xs capitalize">
                            {f === "all" ? "All" : f.replace("_", " ")}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filtered.map((sow) => {
                    const invoicedPct = sow.totalValue > 0 ? (sow.invoiced / sow.totalValue) * 100 : 0;
                    const deliverablePct = sow.deliverableCount > 0 ? (sow.completedDeliverables / sow.deliverableCount) * 100 : 0;
                    return (
                        <Card key={sow.id} className="hover:bg-secondary/30 transition-colors cursor-pointer">
                            <CardContent className="py-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-muted-foreground">{sow.number}</span>
                                            <StatusBadge status={sow.status} className="text-[10px]" />
                                            <Badge variant="ghost" className="text-[10px] capitalize">{sow.billingType.replace("_", " & ")}</Badge>
                                        </div>
                                        <p className="text-sm font-semibold truncate">{sow.title}</p>
                                        <p className="text-xs text-muted-foreground">{sow.client} · {sow.project} · Effective {sow.effectiveDate}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <p className="text-lg font-bold">{formatCurrency(sow.totalValue)}</p>
                                        <p className="text-xs text-muted-foreground">{formatCurrency(sow.invoiced)} invoiced</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                            <span>Invoiced</span>
                                            <span>{Math.round(invoicedPct)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-info rounded-full" style={{ width: `${invoicedPct}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                            <span>Deliverables</span>
                                            <span>{sow.completedDeliverables}/{sow.deliverableCount}</span>
                                        </div>
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-success rounded-full" style={{ width: `${deliverablePct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
