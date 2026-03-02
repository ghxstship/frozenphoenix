"use client";

import { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { makeMockActivity, makeMockComments } from "@/lib/mock-chatter-data";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import { Calendar, DollarSign, Hash, Pause, Play, RefreshCw } from "lucide-react";
import type { RecurringInvoice } from "@/types/productive-features";

type TabId = "details" | "line-items" | "history" | "chatter";
const TAB_VALUES = ["details", "line-items", "history", "chatter"] as const;

const mockRecurring: RecurringInvoice = {
    id: "ri-1",
    companyId: "c1",
    projectId: "p1",
    frequency: "monthly",
    dayOfMonth: 1,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    nextInvoiceDate: "2026-04-01",
    lastInvoiceDate: "2026-03-01",
    amount: 15000,
    currency: "USD",
    templateId: "tmpl-1",
    description:
        "Monthly retainer for Nike Air Max 2026 campaign management and creative services.",
    lineItems: [
        {
            description: "Campaign Management Retainer",
            quantity: 1,
            unitPrice: 10000,
            total: 10000,
        },
        { description: "Creative Services Package", quantity: 1, unitPrice: 5000, total: 5000 },
    ],
    isActive: true,
    invoicesGenerated: 3,
    organizationId: "org-1",
    createdAt: "2026-01-01T00:00:00Z",
    createdBy: "u1",
    updatedAt: "2026-03-01T00:00:00Z",
    updatedBy: "u1",
};

const mockHistory = [
    { id: "inv-3", number: "INV-2026-003", date: "2026-03-01", amount: 15000, status: "paid" },
    { id: "inv-2", number: "INV-2026-002", date: "2026-02-01", amount: 15000, status: "paid" },
    { id: "inv-1", number: "INV-2026-001", date: "2026-01-01", amount: 15000, status: "paid" },
];

export default function RecurringInvoiceDetailPage() {
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

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

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "line-items" as const, label: "Line Items", count: mockRecurring.lineItems.length },
        { id: "history" as const, label: "History", count: mockHistory.length },
        { id: "chatter" as const, label: "Chatter" },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Active</span>
                        <Badge variant={mockRecurring.isActive ? "success" : "ghost"}>
                            {mockRecurring.isActive ? "Active" : "Paused"}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Frequency</span>
                        <Badge variant="outline" className="capitalize">
                            {mockRecurring.frequency}
                        </Badge>
                    </div>
                    {mockRecurring.dayOfMonth && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Day</span>
                            <span className="font-medium">
                                {mockRecurring.dayOfMonth}st of month
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Invoice</span>
                        <span className="font-medium">
                            {formatDate(mockRecurring.nextInvoiceDate, "compact")}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Financials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold">
                            {formatCurrency(mockRecurring.amount, mockRecurring.currency)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Generated</span>
                        <span className="font-medium">
                            {mockRecurring.invoicesGenerated} invoices
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Billed</span>
                        <span className="font-bold">
                            {formatCurrency(
                                mockRecurring.amount * mockRecurring.invoicesGenerated,
                                mockRecurring.currency
                            )}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Period</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Start</span>
                        <span className="font-medium">
                            {formatDate(mockRecurring.startDate, "compact")}
                        </span>
                    </div>
                    {mockRecurring.endDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">End</span>
                            <span className="font-medium">
                                {formatDate(mockRecurring.endDate, "compact")}
                            </span>
                        </div>
                    )}
                    {mockRecurring.lastInvoiceDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Sent</span>
                            <span className="font-medium">
                                {formatDate(mockRecurring.lastInvoiceDate, "compact")}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/recurring-invoices"
            backLabel="Recurring Invoices"
            title={`Recurring Invoice — ${formatCurrency(mockRecurring.amount, mockRecurring.currency)}/mo`}
            subtitle={`${mockRecurring.frequency} · ${mockRecurring.invoicesGenerated} generated`}
            status={mockRecurring.isActive ? "active" : "paused"}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <RefreshCw className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        {mockRecurring.isActive ? (
                            <>
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 mr-1" />
                                Resume
                            </>
                        )}
                    </Button>
                    <Button size="sm">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Generate Now
                    </Button>
                </div>
            }
            menuItems={[
                { label: "Edit Schedule", onClick: () => {} },
                { label: "Edit Line Items", onClick: () => {} },
                { label: "Delete", onClick: () => {}, variant: "destructive" },
            ]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "details" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-success" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Per Invoice</p>
                                        <p className="text-lg font-bold">
                                            {formatCurrency(
                                                mockRecurring.amount,
                                                mockRecurring.currency
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Hash className="h-5 w-5 text-info" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Invoices Generated
                                        </p>
                                        <p className="text-lg font-bold">
                                            {mockRecurring.invoicesGenerated}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-warning" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Next Invoice
                                        </p>
                                        <p className="text-sm font-semibold">
                                            {formatDate(mockRecurring.nextInvoiceDate, "compact")}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {mockRecurring.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {mockRecurring.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "line-items" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Line Items ({mockRecurring.lineItems.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockRecurring.lineItems.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                >
                                    <div>
                                        <p className="text-sm font-semibold">{item.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity} ×{" "}
                                            {formatCurrency(item.unitPrice, mockRecurring.currency)}
                                        </p>
                                    </div>
                                    <span className="font-bold text-sm">
                                        {formatCurrency(item.total, mockRecurring.currency)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2 border-t">
                                <span className="font-medium text-sm">Total</span>
                                <span className="font-bold">
                                    {formatCurrency(mockRecurring.amount, mockRecurring.currency)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "history" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Invoice History ({mockHistory.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {mockHistory.map((inv) => (
                                <div
                                    key={inv.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                >
                                    <div>
                                        <p className="text-sm font-semibold">{inv.number}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(inv.date, "compact")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">
                                            {formatCurrency(inv.amount, mockRecurring.currency)}
                                        </span>
                                        <Badge variant="success">{inv.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="recurring_invoice"
                    recordId={mockRecurring.id}
                    activityItems={makeMockActivity("recurring_invoice")}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
