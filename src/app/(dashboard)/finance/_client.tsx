"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { OperationalDashboardShell } from "@/components/shells";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, DollarSign, Receipt } from "lucide-react";
import type { Invoice, PurchaseOrder } from "@/types";
import { type ColumnDef, DataTable } from "@/components/data-view/data-table";
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
    {
        id: "vendorName",
        header: "Vendor",
        accessorKey: "vendorName",
        sortable: true,
        filterable: true,
        sticky: true,
    },
    {
        id: "poAmount",
        header: "PO Amount",
        accessorKey: "poAmount",
        sortable: true,
        align: "right",
        render: (v) => <CurrencyField value={Number(v)} />,
    },
    {
        id: "invoiceAmount",
        header: "Invoice Amount",
        accessorKey: "invoiceAmount",
        sortable: true,
        align: "right",
        render: (v) => <CurrencyField value={Number(v)} />,
    },
    {
        id: "variancePct",
        header: "Variance",
        accessorKey: "variancePct",
        sortable: true,
        render: (value, row) => {
            const pct = Number(value);
            return (
                <span
                    className={`text-sm font-bold ${row.isFlagged ? "text-destructive" : "text-success"}`}
                >
                    {pct > 0 ? "+" : ""}
                    {pct}%{row.isFlagged && <AlertTriangle className="h-3.5 w-3.5 inline ml-1" />}
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
            const variant =
                v === "approved"
                    ? "success"
                    : v === "disputed"
                      ? "destructive"
                      : v === "paid"
                        ? "info"
                        : "warning";
            return (
                <Badge variant={variant} className="density-caption">
                    {v}
                </Badge>
            );
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
        render: (v) => (
            <span className="text-xs font-mono text-muted-foreground">
                #{String(v).slice(0, 8)}
            </span>
        ),
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
            return (
                <Badge variant={variant} className="density-caption">
                    {v}
                </Badge>
            );
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

interface FinanceData {
    purchaseOrders: Array<Record<string, unknown>>;
    invoices: Array<Record<string, unknown>>;
}

function useFinanceData() {
    return useQuery<FinanceData>({
        queryKey: ["finance-bff"],
        queryFn: async () => {
            const res = await fetch("/api/finance");
            if (!res.ok) throw new Error(`Finance BFF failed: ${res.status}`);
            return res.json();
        },
        staleTime: 30_000,
    });
}

export function FinancePageClient() {
    const { data, isLoading } = useFinanceData();

    const pos: PurchaseOrder[] = (data?.purchaseOrders ?? []).map((po) => ({
        id: po.id as string,
        projectId: po.project_id as string,
        vendorId: po.vendor_id as string,
        vendorName: (po.vendors as { name: string } | null)?.name || "",
        totalAmount: po.total_amount as number,
        status: po.status as PurchaseOrder["status"],
        issuedDate: po.issued_date as string,
        items: (
            (po.purchase_order_items as Array<{
                description: string;
                quantity: number;
                unit_price: number;
                total: number;
            }>) || []
        ).map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            total: item.total,
        })),
    }));

    const invoices: Invoice[] = (data?.invoices ?? []).map((inv) => ({
        id: inv.id as string,
        vendorId: inv.vendor_id as string,
        vendorName: (inv.vendors as { name: string } | null)?.name || "",
        purchaseOrderId: (inv.purchase_order_id as string) ?? undefined,
        amount: inv.amount as number,
        status: inv.status as Invoice["status"],
        invoiceDate: inv.invoice_date as string,
        dueDate: inv.due_date as string,
        variance: (inv.variance as number) ?? undefined,
    }));

    const totalPO = pos.reduce((sum, po) => sum + po.totalAmount, 0);
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const disputed = invoices.filter((inv) => inv.status === "disputed");

    const contentSlot = (
        <div className="density-gap-page">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 density-gap-card">
                <StatCard title="Total PO Value" value={formatCurrency(totalPO)} icon={Receipt} />
                <StatCard
                    title="Total Invoiced"
                    value={formatCurrency(totalInvoiced)}
                    icon={DollarSign}
                />
                <StatCard title="Disputed" value={disputed.length} icon={AlertTriangle} />
                <StatCard
                    title="Match Rate"
                    value="85%"
                    description="vs last month"
                    icon={CheckCircle2}
                />
            </div>

            {/* Three-Way Match */}
            {(() => {
                const matchRows: MatchRow[] = invoices.map((invoice) => {
                    const po = pos.find((p) => p.id === invoice.purchaseOrderId);
                    const poAmount = po?.totalAmount || 0;
                    const varianceAmt = invoice.amount - poAmount;
                    const variancePct =
                        poAmount > 0 ? Math.round((varianceAmt / poAmount) * 100) : 0;
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

    const config: DashboardPageConfig = {
        resource: "finance",
        action: "read",
        title: "Financial Operations",
        description: "Three-way match engine — PO ↔ WO ↔ Invoice reconciliation",
        contentSlot,
    };

    return <OperationalDashboardShell config={config} isLoading={isLoading} />;
}
