"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useDeleteRecurringInvoice,
    useRecurringInvoice,
    useUpdateRecurringInvoice,
} from "@/lib/supabase/hooks-pages";
import { LoadingState } from "@/components/layouts/loading-state";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import { Calendar, DollarSign, Hash, Pause, Play, RefreshCw } from "lucide-react";

type TabId = "details" | "line-items" | "history" | "chatter";
const TAB_VALUES = ["details", "line-items", "history", "chatter"] as const;

interface RILineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface HistoryItem {
    id: string;
    number: string;
    date: string;
    amount: number;
    status: string;
}

function parseLineItems(raw: unknown): RILineItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((li) => ({
        description: (li.description as string) ?? "",
        quantity: (li.quantity as number) ?? 0,
        unitPrice: (li.unit_price as number) ?? (li.unitPrice as number) ?? 0,
        total: (li.total as number) ?? 0,
    }));
}

function parseHistory(raw: unknown): HistoryItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((h, i) => ({
        id: (h.id as string) ?? `h-${i}`,
        number: (h.number as string) ?? "",
        date: (h.date as string) ?? "",
        amount: (h.amount as number) ?? 0,
        status: (h.status as string) ?? "",
    }));
}

export default function RecurringInvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: sbRecord, isLoading } = useRecurringInvoice(entityId);
    const ri = sbRecord as Record<string, unknown> | null;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Recurring Invoice",
        listPath: "/recurring-invoices",
        useUpdateHook: useUpdateRecurringInvoice,
        useDeleteHook: useDeleteRecurringInvoice,
    });
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "details",
        validValues: TAB_VALUES,
    });

    const [chatterComments, setChatterComments] = useState<CommentItem[]>([]);
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

    const frequency = (ri?.frequency as string) ?? "monthly";
    const dayOfMonth = (ri?.day_of_month as number) ?? (ri?.dayOfMonth as number) ?? null;
    const startDate = (ri?.start_date as string) ?? (ri?.startDate as string) ?? "";
    const endDate = (ri?.end_date as string) ?? (ri?.endDate as string) ?? "";
    const nextInvoiceDate = (ri?.next_invoice_date as string) ?? (ri?.nextInvoiceDate as string) ?? "";
    const lastInvoiceDate = (ri?.last_invoice_date as string) ?? (ri?.lastInvoiceDate as string) ?? "";
    const amount = (ri?.amount as number) ?? 0;
    const currency = (ri?.currency as string) ?? "USD";
    const riDescription = (ri?.description as string) ?? "";
    const lineItems = parseLineItems(ri?.line_items ?? ri?.lineItems);
    const isActive = (ri?.is_active as boolean) ?? (ri?.isActive as boolean) ?? true;
    const invoicesGenerated = (ri?.invoices_generated as number) ?? (ri?.invoicesGenerated as number) ?? 0;
    const history = parseHistory(ri?.history);

    if (isLoading) return <LoadingState />;

    const tabs = [
        { id: "details" as const, label: "Details" },
        { id: "line-items" as const, label: "Line Items", count: lineItems.length },
        { id: "history" as const, label: "History", count: history.length },
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
                        <Badge variant={isActive ? "success" : "ghost"}>
                            {isActive ? "Active" : "Paused"}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Frequency</span>
                        <Badge variant="outline" className="capitalize">
                            {frequency}
                        </Badge>
                    </div>
                    {dayOfMonth && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Day</span>
                            <span className="font-medium">
                                {dayOfMonth}st of month
                            </span>
                        </div>
                    )}
                    {nextInvoiceDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Invoice</span>
                            <span className="font-medium">
                                {formatDate(nextInvoiceDate, "compact")}
                            </span>
                        </div>
                    )}
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
                            {formatCurrency(amount, currency)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Generated</span>
                        <span className="font-medium">
                            {invoicesGenerated} invoices
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Billed</span>
                        <span className="font-bold">
                            {formatCurrency(
                                amount * invoicesGenerated,
                                currency
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
                    {startDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Start</span>
                            <span className="font-medium">
                                {formatDate(startDate, "compact")}
                            </span>
                        </div>
                    )}
                    {endDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">End</span>
                            <span className="font-medium">
                                {formatDate(endDate, "compact")}
                            </span>
                        </div>
                    )}
                    {lastInvoiceDate && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Sent</span>
                            <span className="font-medium">
                                {formatDate(lastInvoiceDate, "compact")}
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
            entityType="recurring-invoices"
            entityId={entityId}
            title={`Recurring Invoice — ${formatCurrency(amount, currency)}/mo`}
            subtitle={`${frequency} · ${invoicesGenerated} generated`}
            status={isActive ? "active" : "paused"}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <RefreshCw className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleUpdate({ is_active: !isActive })}>
                        {isActive ? (
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
                    <Button size="sm" onClick={() => router.push(`/invoices/new?fromRecurring=${entityId}`)}>
                        <DollarSign className="h-4 w-4 mr-1" />
                        Generate Now
                    </Button>
                </div>
            }
            menuItems={[
                { label: "Edit Schedule", onClick: () => router.push(`/recurring-invoices/${entityId}/edit`) },
                { label: "Edit Line Items", onClick: () => setActiveTab("line-items") },
                ...crudMenuItems,
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
                                            {formatCurrency(amount, currency)}
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
                                            {invoicesGenerated}
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
                                            {nextInvoiceDate ? formatDate(nextInvoiceDate, "compact") : "TBD"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {riDescription && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {riDescription}
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
                            Line Items ({lineItems.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {lineItems.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                >
                                    <div>
                                        <p className="text-sm font-semibold">{item.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity} ×{" "}
                                            {formatCurrency(item.unitPrice, currency)}
                                        </p>
                                    </div>
                                    <span className="font-bold text-sm">
                                        {formatCurrency(item.total, currency)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2 border-t">
                                <span className="font-medium text-sm">Total</span>
                                <span className="font-bold">
                                    {formatCurrency(amount, currency)}
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
                            Invoice History ({history.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {history.map((inv) => (
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
                                            {formatCurrency(inv.amount, currency)}
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
                    recordId={entityId}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
