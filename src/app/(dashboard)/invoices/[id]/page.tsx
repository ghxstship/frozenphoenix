"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteInvoice, useInvoice, useUpdateInvoice } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    INVOICE_DELIVERY_STATUS_MAP,
    type InvoiceDeliveryStatusType,
} from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    FileText,
    Send,
} from "lucide-react";

interface InvoiceLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface PaymentRecord {
    id: string;
    date: string;
    amount: number;
    method: string;
    reference: string;
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "invoices",
    titleFn: (r) => `Invoice ${String(r.number ?? "")}`,
    subtitleFn: (r) => `${String(r.company_name ?? "")} · ${String(r.project_name ?? "")}`,
    statusKey: "delivery_status",
    icon: DollarSign,
    backHref: "/invoices",
    backLabel: "Invoices",
    chatterRecordType: "invoice",
    fields: [
        {
            id: "issued_date",
            label: "Issued",
            accessorKey: "issued_date",
            fieldType: "date",
            icon: Calendar,
        },
        { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date", icon: Clock },
        { id: "currency", label: "Currency", accessorKey: "currency" },
        { id: "tax_rate", label: "Tax Rate", accessorKey: "tax_rate", fieldType: "percentage" },
        { id: "po_number", label: "PO Number", accessorKey: "po_number" },
    ],
    sidebarFields: [
        {
            id: "delivery_status",
            label: "Status",
            accessorKey: "delivery_status",
            fieldType: "status",
        },
        { id: "issued_date", label: "Issued", accessorKey: "issued_date", fieldType: "date" },
        { id: "due_date", label: "Due", accessorKey: "due_date", fieldType: "date" },
        { id: "currency", label: "Currency", accessorKey: "currency" },
        { id: "tax_rate", label: "Tax Rate", accessorKey: "tax_rate", fieldType: "percentage" },
        { id: "po_number", label: "PO Number", accessorKey: "po_number" },
    ],
    tabs: [],
};

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord, isLoading } = useInvoice(entityId);
    const inv = sbRecord as Record<string, unknown> | null;
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId,
        entityLabel: "Invoice",
        listPath: "/invoices",
        useUpdateHook: useUpdateInvoice,
        useDeleteHook: useDeleteInvoice,
    });

    const lineItems = ((inv?.line_items ?? []) as Record<string, unknown>[]).map(
        (li): InvoiceLineItem => ({
            id: (li.id as string) ?? "",
            description: (li.description as string) ?? "",
            quantity: (li.quantity as number) ?? 0,
            unitPrice: (li.unit_price as number) ?? 0,
            total: ((li.quantity as number) ?? 0) * ((li.unit_price as number) ?? 0),
        })
    );
    const payments = ((inv?.payments ?? []) as Record<string, unknown>[]).map(
        (p): PaymentRecord => ({
            id: (p.id as string) ?? "",
            date: (p.date as string) ?? "",
            amount: (p.amount as number) ?? 0,
            method: (p.method as string) ?? "",
            reference: (p.reference as string) ?? "",
        })
    );

    const companyName = (inv?.company_name as string) ?? "";
    const companyAddress = (inv?.company_address as string) ?? "";
    const projectName = (inv?.project_name as string) ?? "";
    const invoiceStatus = (inv?.delivery_status as InvoiceDeliveryStatusType) ?? "draft";
    const _issueDate = (inv?.issued_date as string) ?? "";
    const _dueDate = (inv?.due_date as string) ?? "";
    const _currency = (inv?.currency as string) ?? "USD";
    const taxRate = (inv?.tax_rate as number) ?? 0;
    const paidAmount = (inv?.paid_amount as number) ?? 0;
    const invoiceNotes = (inv?.notes as string) ?? "";
    const _poNumber = (inv?.po_number as string) ?? "";
    const createdBy = (inv?.created_by_name as string) ?? "";

    const subtotal = useMemo(
        () => lineItems.reduce((sum, item) => sum + item.total, 0),
        [lineItems]
    );
    const taxAmount = useMemo(() => subtotal * (taxRate / 100), [subtotal, taxRate]);
    const total = subtotal + taxAmount;
    const balance = total - paidAmount;

    const _statusCfg = INVOICE_DELIVERY_STATUS_MAP[invoiceStatus];

    const sidebarSlot = (
        <Card>
            <CardContent className="py-4 space-y-4">
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">Balance Due</p>
                    <p className="text-3xl font-bold mt-1">{formatCurrency(balance)}</p>
                </div>
                <ProgressBar
                    value={total > 0 ? (paidAmount / total) * 100 : 0}
                    size="md"
                    variant="success"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Paid: {formatCurrency(paidAmount)}</span>
                    <span>Total: {formatCurrency(total)}</span>
                </div>
            </CardContent>
        </Card>
    );

    const overviewSlot = (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Billing Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">
                                Bill To
                            </p>
                            <p className="text-sm font-semibold">{companyName}</p>
                            <p className="text-xs text-muted-foreground mt-1">{companyAddress}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">
                                Project
                            </p>
                            <p className="text-sm font-semibold">{projectName}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {createdBy ? `Created by ${createdBy}` : ""}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Line Items
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-muted-foreground">
                                <th className="text-left py-2 font-medium">Description</th>
                                <th className="text-right py-2 font-medium">Qty</th>
                                <th className="text-right py-2 font-medium">Unit Price</th>
                                <th className="text-right py-2 font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineItems.map((item) => (
                                <tr key={item.id} className="border-b border-border/50">
                                    <td className="py-2.5">{item.description}</td>
                                    <td className="py-2.5 text-right">{item.quantity}</td>
                                    <td className="py-2.5 text-right">
                                        {formatCurrency(item.unitPrice)}
                                    </td>
                                    <td className="py-2.5 text-right font-medium">
                                        {formatCurrency(item.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-b border-border/50">
                                <td colSpan={3} className="py-2 text-right text-muted-foreground">
                                    Subtotal
                                </td>
                                <td className="py-2 text-right font-medium">
                                    {formatCurrency(subtotal)}
                                </td>
                            </tr>
                            <tr className="border-b border-border/50">
                                <td colSpan={3} className="py-2 text-right text-muted-foreground">
                                    Tax ({taxRate}%)
                                </td>
                                <td className="py-2 text-right font-medium">
                                    {formatCurrency(taxAmount)}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="py-2 text-right font-bold">
                                    Total
                                </td>
                                <td className="py-2 text-right font-bold text-lg">
                                    {formatCurrency(total)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                    {invoiceNotes && (
                        <div className="mt-4 p-3 rounded-lg bg-secondary/30">
                            <p className="text-xs text-muted-foreground font-medium mb-1">Notes</p>
                            <p className="text-xs">{invoiceNotes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        sidebarSlot,
        overviewSlot,
        stats: [
            { label: "Total", icon: DollarSign, compute: () => formatCurrency(total) },
            { label: "Paid", icon: CheckCircle2, compute: () => formatCurrency(paidAmount) },
            { label: "Balance", icon: CreditCard, compute: () => formatCurrency(balance) },
        ],
        tabs: [
            {
                id: "payments",
                label: "Payments",
                content: (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Payment History
                            </CardTitle>
                            <Button size="sm" onClick={() => void 0}>
                                <CreditCard className="h-4 w-4 mr-1" />
                                Record Payment
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {payments.length > 0 ? (
                                <div className="space-y-3">
                                    {payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="h-4 w-4 text-success" />
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        {formatCurrency(payment.amount)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {payment.method} · {payment.reference}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(payment.date)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No payments recorded yet
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={entityId}
            record={inv}
            isLoading={isLoading}
            menuItems={[
                {
                    label: "Record Payment",
                    onClick: () => router.push(`/invoices/${entityId}/edit?section=payments`),
                },
                {
                    label: "Duplicate",
                    onClick: () => router.push(`/invoices/new?duplicateFrom=${entityId}`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                    <DollarSign className="h-6 w-6" />
                </div>
            }
            actions={
                <>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Download className="h-4 w-4" />
                        PDF
                    </Button>
                    <Button onClick={() => router.push(`/invoices/${entityId}/edit?section=send`)}>
                        <Send className="h-4 w-4" />
                        Send
                    </Button>
                </>
            }
        />
    );
}
