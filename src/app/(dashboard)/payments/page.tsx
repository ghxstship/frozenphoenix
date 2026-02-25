"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import {
    Banknote, Plus,
    TrendingUp, ArrowDownRight, ArrowUpRight,
} from "lucide-react";

type PaymentMethod = "bank_transfer" | "credit_card" | "check" | "ach" | "wire" | "other";
type PaymentDirection = "incoming" | "outgoing";

interface Payment {
    id: string;
    direction: PaymentDirection;
    invoiceNumber: string;
    counterparty: string;
    amount: number;
    method: PaymentMethod;
    date: string;
    reference: string;
    project: string;
    notes: string;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
    bank_transfer: "Bank Transfer",
    credit_card: "Credit Card",
    check: "Check",
    ach: "ACH",
    wire: "Wire",
    other: "Other",
};

const mockPayments: Payment[] = [
    { id: "1", direction: "incoming", invoiceNumber: "INV-2026-001", counterparty: "Nike", amount: 130950, method: "wire", date: "2026-02-20", reference: "WR-29481", project: "Nike Air Max Launch", notes: "Milestone 1 payment" },
    { id: "2", direction: "incoming", invoiceNumber: "INV-2026-005", counterparty: "Glossier", amount: 67500, method: "ach", date: "2026-02-10", reference: "ACH-8837", project: "Glossier Pop-Up", notes: "Final invoice payment" },
    { id: "3", direction: "outgoing", invoiceNumber: "PO-2026-012", counterparty: "AV Solutions Inc", amount: 45000, method: "bank_transfer", date: "2026-02-18", reference: "BT-11294", project: "Red Bull Festival", notes: "AV equipment deposit" },
    { id: "4", direction: "outgoing", invoiceNumber: "PO-2026-015", counterparty: "Custom Fab Works", amount: 28000, method: "check", date: "2026-02-22", reference: "CHK-4412", project: "Nike Air Max Launch", notes: "Fabrication progress payment" },
    { id: "5", direction: "incoming", invoiceNumber: "INV-2025-089", counterparty: "TechStart", amount: 25000, method: "credit_card", date: "2026-02-05", reference: "CC-7721", project: "TechStart Launch", notes: "Deposit payment" },
    { id: "6", direction: "outgoing", invoiceNumber: "PO-2026-018", counterparty: "StageCraft Rentals", amount: 18500, method: "ach", date: "2026-02-24", reference: "ACH-9012", project: "Coachella Experience", notes: "Stage rental deposit" },
];

export default function PaymentsPage() {
    const [search, setSearch] = useState("");
    const [dirFilter, setDirFilter] = useState<"all" | PaymentDirection>("all");

    const filtered = mockPayments.filter((p) => {
        if (dirFilter !== "all" && p.direction !== dirFilter) return false;
        if (search && !p.counterparty.toLowerCase().includes(search.toLowerCase()) && !p.invoiceNumber.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const totalIncoming = mockPayments.filter((p) => p.direction === "incoming").reduce((s, p) => s + p.amount, 0);
    const totalOutgoing = mockPayments.filter((p) => p.direction === "outgoing").reduce((s, p) => s + p.amount, 0);
    const netCashFlow = totalIncoming - totalOutgoing;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Payments" description="Track incoming and outgoing payments across all projects">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Record Payment
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Received" value={formatCurrency(totalIncoming)} description="this period" icon={ArrowDownRight} change={15} />
                <StatCard title="Paid Out" value={formatCurrency(totalOutgoing)} description="this period" icon={ArrowUpRight} />
                <StatCard title="Net Cash Flow" value={formatCurrency(netCashFlow)} description="incoming - outgoing" icon={TrendingUp} change={8} />
                <StatCard title="Transactions" value={mockPayments.length} description="this period" icon={Banknote} />
            </div>

            <div className="flex items-center gap-4">
                <SearchInput value={search} onValueChange={setSearch} placeholder="Search payments..." className="flex-1 max-w-sm" />
                <div className="flex gap-1">
                    {(["all", "incoming", "outgoing"] as const).map((f) => (
                        <Button key={f} variant={dirFilter === f ? "default" : "ghost"} size="sm" onClick={() => setDirFilter(f)} className="text-xs capitalize">
                            {f}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                {filtered.map((p) => (
                    <Card key={p.id} className="hover:bg-secondary/30 transition-colors cursor-pointer">
                        <CardContent className="flex items-center gap-4 py-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${p.direction === "incoming" ? "bg-success/10" : "bg-destructive/10"}`}>
                                {p.direction === "incoming" ? (
                                    <ArrowDownRight className="h-5 w-5 text-success" />
                                ) : (
                                    <ArrowUpRight className="h-5 w-5 text-destructive" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold">{p.counterparty}</p>
                                    <Badge variant="ghost" className="text-[10px]">{METHOD_LABELS[p.method]}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{p.invoiceNumber} · {p.project} · Ref: {p.reference}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className={`text-sm font-bold ${p.direction === "incoming" ? "text-success" : "text-destructive"}`}>
                                    {p.direction === "incoming" ? "+" : "-"}{formatCurrency(p.amount)}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{p.date}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
