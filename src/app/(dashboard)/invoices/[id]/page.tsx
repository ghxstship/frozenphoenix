"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteInvoice, useInvoice, useUpdateInvoice } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    INVOICE_DELIVERY_STATUS_MAP,
    type InvoiceDeliveryStatusType,
} from "@/config/domain-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
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

const mockInvoice = {
    id: "inv-001",
    invoiceNumber: "INV-2026-0042",
    companyName: "Nike Inc.",
    companyAddress: "One Bowerman Drive, Beaverton, OR 97005",
    projectName: "Air Max Launch Experience",
    status: "sent" as InvoiceDeliveryStatusType,
    issueDate: "2026-02-01",
    dueDate: "2026-03-03",
    amount: 125000,
    paidAmount: 50000,
    currency: "USD",
    taxRate: 8.875,
    notes: "Payment terms: Net 30. Late payments subject to 1.5% monthly interest.",
    poNumber: "PO-NIKE-2026-0089",
    createdBy: "Sarah Chen",
};

const mockLineItems: InvoiceLineItem[] = [
    {
        id: "1",
        description: "Stage Design & Fabrication",
        quantity: 1,
        unitPrice: 45000,
        total: 45000,
    },
    {
        id: "2",
        description: "LED Panel Rental (50x P2.5 Indoor)",
        quantity: 50,
        unitPrice: 800,
        total: 40000,
    },
    {
        id: "3",
        description: "Lighting Package — Wash + Spot",
        quantity: 1,
        unitPrice: 18000,
        total: 18000,
    },
    {
        id: "4",
        description: "Audio System — Line Array + Subs",
        quantity: 1,
        unitPrice: 12000,
        total: 12000,
    },
    {
        id: "5",
        description: "Project Management (160 hrs @ $62.50)",
        quantity: 160,
        unitPrice: 62.5,
        total: 10000,
    },
];

const mockPayments: PaymentRecord[] = [
    {
        id: "1",
        date: "2026-02-15",
        amount: 50000,
        method: "Wire Transfer",
        reference: "WT-2026-4421",
    },
];

type TabId = "details" | "payments" | "chatter";
const TAB_VALUES = ["details", "payments", "chatter"] as const;

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord } = useInvoice(entityId);
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Invoice",
        listPath: "/invoices",
        useUpdateHook: useUpdateInvoice,
        useDeleteHook: useDeleteInvoice,
    });
    void router;
    void sbRecord;
    void handleUpdate;
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const subtotal = useMemo(() => mockLineItems.reduce((sum, item) => sum + item.total, 0), []);
    const taxAmount = useMemo(() => subtotal * (mockInvoice.taxRate / 100), [subtotal]);
    const total = subtotal + taxAmount;
    const balance = total - mockInvoice.paidAmount;
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(makeMockComments());
    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "Sarah Chen",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const statusCfg = INVOICE_DELIVERY_STATUS_MAP[mockInvoice.status as InvoiceDeliveryStatusType];

    const tabs = [
        { id: "details" as const, label: "Details", count: mockLineItems.length },
        { id: "payments" as const, label: "Payments", count: mockPayments.length },
        { id: "chatter" as const, label: "Chatter", count: chatterComments.length },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardContent className="py-4 space-y-4">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">Balance Due</p>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(balance)}</p>
                    </div>
                    <ProgressBar
                        value={(mockInvoice.paidAmount / total) * 100}
                        size="md"
                        variant="success"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Paid: {formatCurrency(mockInvoice.paidAmount)}</span>
                        <span>Total: {formatCurrency(total)}</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={statusCfg?.variant}>{statusCfg?.label}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Issued</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(mockInvoice.issueDate)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Due</span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(mockInvoice.dueDate)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency</span>
                        <span>{mockInvoice.currency}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax Rate</span>
                        <span>{mockInvoice.taxRate}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Terms</span>
                        <span>Net 30</span>
                    </div>
                    {mockInvoice.poNumber && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">PO Number</span>
                            <span className="font-mono text-xs">{mockInvoice.poNumber}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <Send className="mr-2 h-3.5 w-3.5" />
                        Send Reminder
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <CreditCard className="mr-2 h-3.5 w-3.5" />
                        Record Payment
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        <Download className="mr-2 h-3.5 w-3.5" />
                        Export PDF
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/invoices"
            backLabel="Invoices"
            entityType="invoices"
            entityId={entityId}
            title={`Invoice ${mockInvoice.invoiceNumber}`}
            subtitle={`${mockInvoice.companyName} · ${mockInvoice.projectName}`}
            status={mockInvoice.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                    <DollarSign className="h-6 w-6" />
                </div>
            }
            actions={
                <>
                    <Button variant="outline" onClick={() => {}}>
                        <Download className="h-4 w-4" />
                        PDF
                    </Button>
                    <Button onClick={() => {}}>
                        <Send className="h-4 w-4" />
                        Send
                    </Button>
                </>
            }
            menuItems={[
                { label: "Record Payment", onClick: () => {} },
                { label: "Duplicate", onClick: () => {} },
                ...crudMenuItems,
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "details" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Billing Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">
                                        Bill To
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {mockInvoice.companyName}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {mockInvoice.companyAddress}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">
                                        Project
                                    </p>
                                    <p className="text-sm font-semibold">
                                        {mockInvoice.projectName}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Created by {mockInvoice.createdBy}
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
                                    {mockLineItems.map((item) => (
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
                                        <td
                                            colSpan={3}
                                            className="py-2 text-right text-muted-foreground"
                                        >
                                            Subtotal
                                        </td>
                                        <td className="py-2 text-right font-medium">
                                            {formatCurrency(subtotal)}
                                        </td>
                                    </tr>
                                    <tr className="border-b border-border/50">
                                        <td
                                            colSpan={3}
                                            className="py-2 text-right text-muted-foreground"
                                        >
                                            Tax ({mockInvoice.taxRate}%)
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
                            {mockInvoice.notes && (
                                <div className="mt-4 p-3 rounded-lg bg-secondary/30">
                                    <p className="text-xs text-muted-foreground font-medium mb-1">
                                        Notes
                                    </p>
                                    <p className="text-xs">{mockInvoice.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "payments" && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Payment History
                        </CardTitle>
                        <Button size="sm">
                            <CreditCard className="h-4 w-4 mr-1" />
                            Record Payment
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {mockPayments.length > 0 ? (
                            <div className="space-y-3">
                                {mockPayments.map((payment) => (
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
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="invoice"
                    recordId={mockInvoice.id}
                    activityItems={makeMockActivity("invoice")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
