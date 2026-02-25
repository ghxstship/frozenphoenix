"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { INVOICE_DELIVERY_STATUS_MAP, type InvoiceDeliveryStatusType } from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StaggerItem } from "@/components/ui/stagger-container";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
    FileText, Plus, Building2, Calendar,
    DollarSign, CheckCircle2, AlertTriangle, Send,
} from "lucide-react";

interface InvoiceListItem {
    id: string;
    invoiceNumber: string;
    companyName: string;
    projectName: string;
    amount: number;
    currency: string;
    status: InvoiceDeliveryStatusType;
    issueDate: string;
    dueDate: string;
    paidAmount: number;
    daysOverdue: number;
}

const mockInvoices: InvoiceListItem[] = [
    { id: "1", invoiceNumber: "INV-2026-0001", companyName: "Nike", projectName: "Air Max Launch", amount: 125000, currency: "USD", status: "paid", issueDate: "2026-01-15", dueDate: "2026-02-14", paidAmount: 125000, daysOverdue: 0 },
    { id: "2", invoiceNumber: "INV-2026-0002", companyName: "Red Bull", projectName: "Festival Activation", amount: 85000, currency: "USD", status: "sent", issueDate: "2026-02-10", dueDate: "2026-03-12", paidAmount: 0, daysOverdue: 0 },
    { id: "3", invoiceNumber: "INV-2026-0003", companyName: "Nike", projectName: "Air Max Launch — Phase 2", amount: 195000, currency: "USD", status: "overdue", issueDate: "2026-01-01", dueDate: "2026-01-31", paidAmount: 0, daysOverdue: 25 },
    { id: "4", invoiceNumber: "INV-2026-0004", companyName: "Coachella Valley Music", projectName: "Stage Design", amount: 375000, currency: "USD", status: "draft", issueDate: "2026-02-24", dueDate: "2026-03-26", paidAmount: 0, daysOverdue: 0 },
    { id: "5", invoiceNumber: "INV-2026-0005", companyName: "TechStart Inc", projectName: "Product Launch", amount: 62500, currency: "USD", status: "viewed", issueDate: "2026-02-18", dueDate: "2026-03-20", paidAmount: 0, daysOverdue: 0 },
    { id: "6", invoiceNumber: "INV-2026-0006", companyName: "Momentum Worldwide", projectName: "Partnership Retainer", amount: 25000, currency: "USD", status: "disputed", issueDate: "2026-02-01", dueDate: "2026-03-03", paidAmount: 0, daysOverdue: 0 },
];

export default function InvoicesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filtered = mockInvoices.filter((inv) => {
        const matchesSearch =
            inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.projectName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalOutstanding = mockInvoices.filter(i => !["paid", "void"].includes(i.status)).reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);
    const totalOverdue = mockInvoices.filter(i => i.status === "overdue").reduce((sum, i) => sum + i.amount, 0);
    const totalPaid = mockInvoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.paidAmount, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Invoice Management" description="Create, send, and track invoices across all projects">
                <Link href="/invoices/new">
                    <Button><Plus className="mr-2 h-4 w-4" />New Invoice</Button>
                </Link>
            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Outstanding" value={formatCurrency(totalOutstanding)} icon={DollarSign} />
                <StatCard title="Overdue" value={formatCurrency(totalOverdue)} icon={AlertTriangle} />
                <StatCard title="Paid (YTD)" value={formatCurrency(totalPaid)} icon={CheckCircle2} />
                <StatCard title="Invoices Sent" value={mockInvoices.filter(i => i.status !== "draft").length} icon={Send} />
            </div>

            {totalOverdue > 0 && (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="py-3">
                        <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            {formatCurrency(totalOverdue)} in overdue invoices require immediate attention
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search invoices..." className="flex-1 max-w-sm" />
                <div className="flex gap-2 flex-wrap">
                    {["all", "draft", "sent", "viewed", "paid", "overdue", "disputed"].map((s) => (
                        <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(s)}>
                            {s === "all" ? "All" : INVOICE_DELIVERY_STATUS_MAP[s as InvoiceDeliveryStatusType]?.label ?? s}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {filtered.map((invoice, i) => {
                    const statusCfg = INVOICE_DELIVERY_STATUS_MAP[invoice.status];
                    return (
                        <StaggerItem key={invoice.id} index={i} stagger="relaxed">
                        <Link href={`/invoices/${invoice.id}`}>
                            <Card className={`cursor-pointer hover:shadow-md transition-all ${invoice.status === "overdue" ? "border-destructive/30" : ""}`}>
                                <CardContent className="py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${invoice.status === "paid" ? "bg-success/10" : invoice.status === "overdue" ? "bg-destructive/10" : "bg-primary/10"}`}>
                                                <FileText className={`h-5 w-5 ${invoice.status === "paid" ? "text-success" : invoice.status === "overdue" ? "text-destructive" : "text-primary"}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-mono text-muted-foreground">{invoice.invoiceNumber}</span>
                                                    <Badge variant={statusCfg?.variant}>{statusCfg?.label}</Badge>
                                                </div>
                                                <h3 className="text-sm font-semibold mt-1">{invoice.projectName}</h3>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{invoice.companyName}</span>
                                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Due {formatDate(invoice.dueDate)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-lg font-bold">{formatCurrency(invoice.amount)}</p>
                                            {invoice.status === "overdue" && (
                                                <p className="text-xs text-destructive font-medium">{invoice.daysOverdue}d overdue</p>
                                            )}
                                            {invoice.paidAmount > 0 && invoice.paidAmount < invoice.amount && (
                                                <p className="text-xs text-muted-foreground">{formatCurrency(invoice.paidAmount)} paid</p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Payment progress bar */}
                                    {invoice.amount > 0 && (
                                        <div className="mt-3">
                                            <ProgressBar value={Math.min(100, (invoice.paidAmount / invoice.amount) * 100)} size="xs" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                        </StaggerItem>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No invoices found</h3>
                        <p className="text-muted-foreground text-center">
                            {searchQuery || statusFilter !== "all" ? "Try adjusting your search or filters" : "Create your first invoice to get started"}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
