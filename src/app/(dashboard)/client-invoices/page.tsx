"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/utils";
import {
    FileText, Plus, Search, DollarSign,
    Send, Eye, AlertTriangle,
} from "lucide-react";

type InvoiceStatus = "draft" | "pending_approval" | "approved" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "disputed" | "void";

interface ClientInvoice {
    id: string;
    number: string;
    title: string;
    project: string;
    client: string;
    status: InvoiceStatus;
    invoiceDate: string;
    dueDate: string;
    subtotal: number;
    tax: number;
    total: number;
    amountPaid: number;
    lineItemCount: number;
    sowNumber: string | null;
}

const mockInvoices: ClientInvoice[] = [
    { id: "1", number: "INV-2026-001", title: "Nike Air Max — Milestone 1", project: "Nike Air Max Launch", client: "Nike", status: "paid", invoiceDate: "2026-01-31", dueDate: "2026-02-28", subtotal: 121250, tax: 9700, total: 130950, amountPaid: 130950, lineItemCount: 4, sowNumber: "SOW-2026-001" },
    { id: "2", number: "INV-2026-002", title: "Nike Air Max — Milestone 2", project: "Nike Air Max Launch", client: "Nike", status: "sent", invoiceDate: "2026-02-15", dueDate: "2026-03-15", subtotal: 121250, tax: 9700, total: 130950, amountPaid: 0, lineItemCount: 4, sowNumber: "SOW-2026-001" },
    { id: "3", number: "INV-2026-003", title: "Red Bull Festival — February T&M", project: "Red Bull Festival", client: "Red Bull", status: "overdue", invoiceDate: "2026-02-01", dueDate: "2026-02-15", subtotal: 80000, tax: 6400, total: 86400, amountPaid: 0, lineItemCount: 8, sowNumber: "SOW-2026-002" },
    { id: "4", number: "INV-2026-004", title: "Red Bull Festival — March T&M", project: "Red Bull Festival", client: "Red Bull", status: "draft", invoiceDate: "2026-03-01", dueDate: "2026-03-31", subtotal: 80000, tax: 6400, total: 86400, amountPaid: 0, lineItemCount: 6, sowNumber: "SOW-2026-002" },
    { id: "5", number: "INV-2026-005", title: "Glossier Pop-Up — Final", project: "Glossier Pop-Up", client: "Glossier", status: "paid", invoiceDate: "2026-01-15", dueDate: "2026-02-14", subtotal: 62500, tax: 5000, total: 67500, amountPaid: 67500, lineItemCount: 3, sowNumber: null },
    { id: "6", number: "INV-2026-006", title: "TechStart — Deposit", project: "TechStart Launch", client: "TechStart", status: "pending_approval", invoiceDate: "2026-02-20", dueDate: "2026-03-20", subtotal: 50000, tax: 4000, total: 54000, amountPaid: 0, lineItemCount: 2, sowNumber: "SOW-2026-005" },
];

export default function ClientInvoicesPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | InvoiceStatus>("all");

    const filtered = mockInvoices.filter((inv) => {
        if (statusFilter !== "all" && inv.status !== statusFilter) return false;
        if (search && !inv.title.toLowerCase().includes(search.toLowerCase()) && !inv.number.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const totalOutstanding = mockInvoices.filter((i) => ["sent", "viewed", "overdue", "partial"].includes(i.status)).reduce((s, i) => s + i.total - i.amountPaid, 0);
    const totalOverdue = mockInvoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total - i.amountPaid, 0);
    const totalPaidThisMonth = mockInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amountPaid, 0);
    const draftCount = mockInvoices.filter((i) => i.status === "draft").length;

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Client Invoices" description="Create, send, and track client-facing invoices">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Invoice
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Outstanding" value={formatCurrency(totalOutstanding)} description="unpaid invoices" icon={DollarSign} />
                <StatCard title="Overdue" value={formatCurrency(totalOverdue)} description="past due date" icon={AlertTriangle} />
                <StatCard title="Collected" value={formatCurrency(totalPaidThisMonth)} description="this period" icon={DollarSign} change={12} />
                <StatCard title="Drafts" value={draftCount} description="ready to finalize" icon={FileText} />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
                </div>
                <div className="flex gap-1 flex-wrap">
                    {(["all", "draft", "sent", "overdue", "paid"] as const).map((f) => (
                        <Button key={f} variant={statusFilter === f ? "default" : "ghost"} size="sm" onClick={() => setStatusFilter(f)} className="text-xs capitalize">
                            {f}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                {filtered.map((inv) => {
                    const balanceDue = inv.total - inv.amountPaid;
                    return (
                        <Card key={inv.id} className="hover:bg-secondary/30 transition-colors cursor-pointer">
                            <CardContent className="flex items-center gap-4 py-3">
                                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-muted-foreground">{inv.number}</span>
                                        <StatusBadge status={inv.status} className="text-[10px]" />
                                        {inv.sowNumber && <span className="text-[10px] text-muted-foreground">{inv.sowNumber}</span>}
                                    </div>
                                    <p className="text-sm font-semibold truncate">{inv.title}</p>
                                    <p className="text-xs text-muted-foreground">{inv.client} · {inv.lineItemCount} line items · Due {inv.dueDate}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold">{formatCurrency(inv.total)}</p>
                                    {balanceDue > 0 && balanceDue < inv.total && (
                                        <p className="text-[10px] text-muted-foreground">Balance: {formatCurrency(balanceDue)}</p>
                                    )}
                                    {inv.status === "paid" && (
                                        <p className="text-[10px] text-success font-medium">Paid in full</p>
                                    )}
                                    {inv.status === "overdue" && (
                                        <p className="text-[10px] text-destructive font-medium">Overdue</p>
                                    )}
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    {inv.status === "draft" && (
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Send">
                                            <Send className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Preview">
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
