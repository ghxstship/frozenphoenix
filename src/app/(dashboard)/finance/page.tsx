"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { usePurchaseOrders, useInvoices, isSupabaseConfigured } from "@/lib/supabase/hooks";
import { MOCK_POS, MOCK_INVOICES } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Receipt, AlertTriangle, CheckCircle2, DollarSign, Loader2 } from "lucide-react";
import type { PurchaseOrder, Invoice } from "@/types";
import { DataTable, type ColumnDef } from "@/components/data-view/data-table";
import { CurrencyField, DateField } from "@/components/data-view/field-renderers";

type MatchRow = {
    id: string;
    vendorName: string;
    poAmount: number;
    invoiceAmount: number;
    variancePct: number;
    isFlagged: boolean;
    status: string;
};

const matchColumns: ColumnDef<MatchRow>[] = [
    { id: "vendorName", header: "Vendor", accessorKey: "vendorName", sortable: true, filterable: true, sticky: true },
    { id: "poAmount", header: "PO Amount", accessorKey: "poAmount", sortable: true, align: "right", render: (v) => <CurrencyField value={Number(v)} /> },
    { id: "invoiceAmount", header: "Invoice Amount", accessorKey: "invoiceAmount", sortable: true, align: "right", render: (v) => <CurrencyField value={Number(v)} /> },
    {
        id: "variancePct",
        header: "Variance",
        accessorKey: "variancePct",
        sortable: true,
        render: (value, row) => {
            const pct = Number(value);
            return (
                <span className={`text-sm font-bold ${row.isFlagged ? "text-destructive" : "text-success"}`}>
                    {pct > 0 ? "+" : ""}{pct}%
                    {row.isFlagged && <AlertTriangle className="h-3.5 w-3.5 inline ml-1" />}
                </span>
            );
        },
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        sortable: true,
        filterable: true,
        render: (value) => {
            const v = String(value);
            const variant = v === "approved" ? "success" : v === "disputed" ? "destructive" : v === "paid" ? "info" : "warning";
            return <Badge variant={variant} className="text-[10px]">{v}</Badge>;
        },
    },
];

const poColumns: ColumnDef<PurchaseOrder>[] = [
    {
        id: "vendorName",
        header: "Vendor",
        accessorKey: "vendorName",
        sortable: true,
        filterable: true,
        sticky: true,
    },
    {
        id: "id",
        header: "PO #",
        accessorKey: "id",
        render: (v) => <span className="text-xs font-mono text-muted-foreground">#{String(v).slice(0, 8)}</span>,
    },
    {
        id: "totalAmount",
        header: "Amount",
        accessorKey: "totalAmount",
        sortable: true,
        align: "right",
        render: (v) => <CurrencyField value={Number(v)} />,
    },
    {
        id: "status",
        header: "Status",
        accessorKey: "status",
        sortable: true,
        filterable: true,
        render: (value) => {
            const v = String(value);
            const variant = v === "received" ? "success" : v === "issued" ? "info" : "ghost";
            return <Badge variant={variant} className="text-[10px]">{v}</Badge>;
        },
    },
    {
        id: "issuedDate",
        header: "Issued",
        accessorKey: "issuedDate",
        sortable: true,
        render: (v) => <DateField value={String(v)} />,
    },
    {
        id: "items",
        header: "Items",
        accessorFn: (row) => row.items.length,
        render: (v) => <span className="text-xs text-muted-foreground">{Number(v)} items</span>,
    },
];

export default function FinancePage() {
    const { data: sbPOs, isLoading: loadingPOs } = usePurchaseOrders();
    const { data: sbInvoices, isLoading: loadingInvoices } = useInvoices();

    const pos: PurchaseOrder[] = isSupabaseConfigured && sbPOs ? sbPOs.map(po => ({
        id: po.id,
        projectId: po.project_id,
        vendorId: po.vendor_id,
        vendorName: (po as { vendors?: { name: string } }).vendors?.name || "",
        totalAmount: po.total_amount,
        status: po.status as PurchaseOrder["status"],
        issuedDate: po.issued_date,
        items: ((po as { purchase_order_items?: Array<{ description: string; quantity: number; unit_price: number; total: number }> }).purchase_order_items || []).map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            total: item.total,
        })),
    })) : MOCK_POS;

    const invoices: Invoice[] = isSupabaseConfigured && sbInvoices ? sbInvoices.map(inv => ({
        id: inv.id,
        vendorId: inv.vendor_id,
        vendorName: (inv as { vendors?: { name: string } }).vendors?.name || "",
        purchaseOrderId: inv.purchase_order_id ?? undefined,
        amount: inv.amount,
        status: inv.status as Invoice["status"],
        invoiceDate: inv.invoice_date,
        dueDate: inv.due_date,
        variance: inv.variance ?? undefined,
    })) : MOCK_INVOICES;

    const isLoading = isSupabaseConfigured && (loadingPOs || loadingInvoices);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const totalPO = pos.reduce((sum, po) => sum + po.totalAmount, 0);
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const disputed = invoices.filter(inv => inv.status === "disputed");

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Financial Operations" description="Three-way match engine — PO ↔ WO ↔ Invoice reconciliation" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total PO Value" value={formatCurrency(totalPO)} icon={Receipt} />
                <StatCard title="Total Invoiced" value={formatCurrency(totalInvoiced)} icon={DollarSign} />
                <StatCard title="Disputed" value={disputed.length} icon={AlertTriangle} />
                <StatCard title="Match Rate" value="85%" change={5} description="vs last month" icon={CheckCircle2} />
            </div>

            {/* Three-Way Match */}
            {(() => {
                const matchRows: MatchRow[] = invoices.map(invoice => {
                    const po = pos.find(p => p.id === invoice.purchaseOrderId);
                    const poAmount = po?.totalAmount || 0;
                    const varianceAmt = invoice.amount - poAmount;
                    const variancePct = poAmount > 0 ? Math.round((varianceAmt / poAmount) * 100) : 0;
                    return {
                        id: invoice.id,
                        vendorName: invoice.vendorName,
                        poAmount,
                        invoiceAmount: invoice.amount,
                        variancePct,
                        isFlagged: Math.abs(variancePct) > 2,
                        status: invoice.status,
                    };
                });
                return (
                    <DataTable<MatchRow>
                        data={matchRows}
                        columns={matchColumns}
                        keyField="id"
                        searchable
                        searchPlaceholder="Search matches..."
                        hoverable
                        stickyHeader
                    />
                );
            })()}

            {/* Purchase Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Purchase Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable<PurchaseOrder>
                        data={pos}
                        columns={poColumns}
                        keyField="id"
                        searchable
                        searchPlaceholder="Search POs..."
                        hoverable
                        pageSize={10}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
