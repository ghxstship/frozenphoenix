"use client";

import { useParams, useRouter } from "next/navigation";
import {
    useDeleteRecurringInvoice,
    useRecurringInvoice,
    useUpdateRecurringInvoice,
} from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { DollarSign, Pause, Play, RefreshCw } from "lucide-react";

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

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "recurring_invoices",
    titleFn: (r) => {
        const amt = (r.amount as number) ?? 0;
        const cur = (r.currency as string) ?? "USD";
        return `Recurring Invoice — ${formatCurrency(amt, cur)}/mo`;
    },
    subtitleFn: (r) => {
        const freq = (r.frequency as string) ?? "monthly";
        const gen = (r.invoices_generated as number) ?? (r.invoicesGenerated as number) ?? 0;
        return `${freq} · ${gen} generated`;
    },
    statusFn: (r) =>
        ((r.is_active as boolean) ?? (r.isActive as boolean) ?? true) ? "active" : "paused",
    icon: RefreshCw,
    backHref: "/recurring-invoices",
    backLabel: "Recurring Invoices",
    chatterRecordType: "recurring_invoice",
    fields: [
        { id: "frequency", label: "Frequency", accessorKey: "frequency", fieldType: "status" },
        { id: "amount", label: "Amount", accessorKey: "amount", fieldType: "currency" },
    ],
    sidebarFields: [
        { id: "frequency", label: "Frequency", accessorKey: "frequency", fieldType: "status" },
        { id: "amount", label: "Amount", accessorKey: "amount", fieldType: "currency" },
        { id: "start_date", label: "Start", accessorKey: "start_date", fieldType: "date" },
        { id: "end_date", label: "End", accessorKey: "end_date", fieldType: "date" },
    ],
    tabs: [],
};

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

    const _frequency = (ri?.frequency as string) ?? "monthly";
    const dayOfMonth = (ri?.day_of_month as number) ?? (ri?.dayOfMonth as number) ?? null;
    const _startDate = (ri?.start_date as string) ?? (ri?.startDate as string) ?? "";
    const _endDate = (ri?.end_date as string) ?? (ri?.endDate as string) ?? "";
    const nextInvoiceDate =
        (ri?.next_invoice_date as string) ?? (ri?.nextInvoiceDate as string) ?? "";
    const lastInvoiceDate =
        (ri?.last_invoice_date as string) ?? (ri?.lastInvoiceDate as string) ?? "";
    const amount = (ri?.amount as number) ?? 0;
    const currency = (ri?.currency as string) ?? "USD";
    const lineItems = parseLineItems(ri?.line_items ?? ri?.lineItems);
    const isActive = (ri?.is_active as boolean) ?? (ri?.isActive as boolean) ?? true;
    const invoicesGenerated =
        (ri?.invoices_generated as number) ?? (ri?.invoicesGenerated as number) ?? 0;
    const history = parseHistory(ri?.history);

    const sidebarSlot = (
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
                    {dayOfMonth && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Day</span>
                            <span className="font-medium">{dayOfMonth}st of month</span>
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
                        <span className="text-muted-foreground">Generated</span>
                        <span className="font-medium">{invoicesGenerated} invoices</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Billed</span>
                        <span className="font-bold">
                            {formatCurrency(amount * invoicesGenerated, currency)}
                        </span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Period</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
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

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        sidebarSlot,
        stats: [
            {
                label: "Per Invoice",
                icon: DollarSign,
                compute: () => formatCurrency(amount, currency),
            },
            { label: "Generated", icon: RefreshCw, compute: () => `${invoicesGenerated} invoices` },
            {
                label: "Next Invoice",
                icon: RefreshCw,
                compute: () => (nextInvoiceDate ? formatDate(nextInvoiceDate, "compact") : "TBD"),
            },
        ],
        overviewSlot: (
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
                                <RefreshCw className="h-5 w-5 text-info" />
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Invoices Generated
                                    </p>
                                    <p className="text-lg font-bold">{invoicesGenerated}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <RefreshCw className="h-5 w-5 text-warning" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Next Invoice</p>
                                    <p className="text-sm font-semibold">
                                        {nextInvoiceDate
                                            ? formatDate(nextInvoiceDate, "compact")
                                            : "TBD"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {(ri?.description as string) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {String(ri?.description)}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        ),
        tabs: [
            {
                id: "line-items",
                label: "Line Items",
                content: (
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
                                            <p className="text-sm font-semibold">
                                                {item.description}
                                            </p>
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
                ),
            },
            {
                id: "history",
                label: "History",
                content: (
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
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={entityId}
            record={ri}
            isLoading={isLoading}
            menuItems={[
                {
                    label: "Edit Schedule",
                    onClick: () => router.push(`/recurring-invoices/${entityId}/edit`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <RefreshCw className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdate({ is_active: !isActive })}
                    >
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
                    <Button
                        size="sm"
                        onClick={() => router.push(`/invoices/new?fromRecurring=${entityId}`)}
                    >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Generate Now
                    </Button>
                </div>
            }
        />
    );
}
