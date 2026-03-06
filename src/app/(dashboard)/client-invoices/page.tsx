"use client";

import { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { SegmentedControl } from "@/components/ui/segmented-control";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { CreateEntityDialog, useCreateAction } from "@/components/create-entity-dialog";
import { CREATE_CLIENT_INVOICE_CONFIG } from "@/config/create-entity-configs";
import { SearchInput } from "@/components/ui/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/utils";
import { useClientInvoices } from "@/lib/supabase/hooks-pages";
import { PermissionGate } from "@/components/permission-guard";
import { AlertTriangle, DollarSign, Eye, FileText, Loader2, Plus, Send } from "lucide-react";

type InvoiceStatus =
    | "draft"
    | "pending_approval"
    | "approved"
    | "sent"
    | "viewed"
    | "partial"
    | "paid"
    | "overdue"
    | "disputed"
    | "void";

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

export default function ClientInvoicesPage() {
    const [createOpen, openCreate, closeCreate] = useCreateAction();
    const [search, setSearch] = useState("");
    const STATUS_FILTERS = ["all", "draft", "sent", "overdue", "paid"] as const;
    const [statusFilter, setStatusFilter] = useQueryTabState({
        key: "status",
        defaultValue: "all",
        validValues: STATUS_FILTERS,
    });
    const { data: sbInvoices, isLoading } = useClientInvoices(
        statusFilter !== "all" ? statusFilter : undefined
    );

    const invoices: ClientInvoice[] = (sbInvoices ?? []).map((i: Record<string, unknown>) => ({
        id: String(i.id),
        number: String(i.number || ""),
        title: String(i.title || ""),
        project: String((i.projects as Record<string, unknown>)?.name || ""),
        client: String(i.client_name || ""),
        status: String(i.status || "draft") as InvoiceStatus,
        invoiceDate: String(i.invoice_date || ""),
        dueDate: String(i.due_date || ""),
        subtotal: Number(i.subtotal || 0),
        tax: Number(i.tax || 0),
        total: Number(i.total || 0),
        amountPaid: Number(i.amount_paid || 0),
        lineItemCount: Number(i.line_item_count || 0),
        sowNumber: i.sow_number ? String(i.sow_number) : null,
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const filtered = invoices.filter((inv) => {
        if (statusFilter !== "all" && inv.status !== statusFilter) return false;
        if (
            search &&
            !inv.title.toLowerCase().includes(search.toLowerCase()) &&
            !inv.number.toLowerCase().includes(search.toLowerCase())
        )
            return false;
        return true;
    });

    const totalOutstanding = invoices
        .filter((i) => ["sent", "viewed", "overdue", "partial"].includes(i.status))
        .reduce((s, i) => s + i.total - i.amountPaid, 0);
    const totalOverdue = invoices
        .filter((i) => i.status === "overdue")
        .reduce((s, i) => s + i.total - i.amountPaid, 0);
    const totalPaidThisMonth = invoices
        .filter((i) => i.status === "paid")
        .reduce((s, i) => s + i.amountPaid, 0);
    const draftCount = invoices.filter((i) => i.status === "draft").length;

    return (
        <PermissionGate resource="client_invoices" action="read">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="Client Invoices"
                    description="Create, send, and track client-facing invoices"
                >
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Invoice
                    </Button>
                </PageHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Outstanding"
                        value={formatCurrency(totalOutstanding)}
                        description="unpaid invoices"
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Overdue"
                        value={formatCurrency(totalOverdue)}
                        description="past due date"
                        icon={AlertTriangle}
                    />
                    <StatCard
                        title="Collected"
                        value={formatCurrency(totalPaidThisMonth)}
                        description="this period"
                        icon={DollarSign}
                        change={12}
                    />
                    <StatCard
                        title="Drafts"
                        value={draftCount}
                        description="ready to finalize"
                        icon={FileText}
                    />
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <SearchInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search invoices..."
                        className="flex-1 max-w-sm"
                    />
                    <SegmentedControl
                        ariaLabel="Invoice status filter"
                        value={statusFilter}
                        onValueChange={(v) => setStatusFilter(v as (typeof STATUS_FILTERS)[number])}
                        size="sm"
                        options={[
                            { value: "all", label: "All" },
                            { value: "draft", label: "Draft" },
                            { value: "sent", label: "Sent" },
                            { value: "overdue", label: "Overdue" },
                            { value: "paid", label: "Paid" },
                        ]}
                    />
                </div>

                <div className="space-y-2">
                    {filtered.map((inv) => {
                        const balanceDue = inv.total - inv.amountPaid;
                        return (
                            <Card
                                key={inv.id}
                                className="hover:bg-secondary/30 transition-colors cursor-pointer"
                            >
                                <CardContent className="flex items-center gap-4 py-3">
                                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-muted-foreground">
                                                {inv.number}
                                            </span>
                                            <StatusBadge
                                                status={inv.status}
                                                className="text-[10px]"
                                            />
                                            {inv.sowNumber && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {inv.sowNumber}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold truncate">
                                            {inv.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {inv.client} · {inv.lineItemCount} line items · Due{" "}
                                            {inv.dueDate}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold">
                                            {formatCurrency(inv.total)}
                                        </p>
                                        {balanceDue > 0 && balanceDue < inv.total && (
                                            <p className="text-[10px] text-muted-foreground">
                                                Balance: {formatCurrency(balanceDue)}
                                            </p>
                                        )}
                                        {inv.status === "paid" && (
                                            <p className="text-[10px] text-success font-medium">
                                                Paid in full
                                            </p>
                                        )}
                                        {inv.status === "overdue" && (
                                            <p className="text-[10px] text-destructive font-medium">
                                                Overdue
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        {inv.status === "draft" && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0"
                                                title="Send"
                                            >
                                                <Send className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            title="Preview"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
            <CreateEntityDialog
                config={CREATE_CLIENT_INVOICE_CONFIG}
                open={createOpen}
                onClose={closeCreate}
            />
        </PermissionGate>
    );
}
