"use client";

import { useRouter } from "next/navigation";
import { useDeleteEstimate, useEstimate, useUpdateEstimate } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { FileSignature, Send } from "lucide-react";

interface EstLineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

function parseLineItems(raw: unknown): EstLineItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((li, i) => ({
        id: String(li.id ?? `li-${i}`),
        description: (li.description as string) ?? "",
        quantity: (li.quantity as number) ?? 0,
        unitPrice: (li.unit_price as number) ?? (li.unitPrice as number) ?? 0,
        total: (li.total as number) ?? 0,
    }));
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "estimates",
    titleKey: "title",
    subtitleFn: (r) => `${String(r.number ?? "")} · ${String(r.company_name ?? "")}`,
    statusKey: "status",
    icon: FileSignature,
    backHref: "/estimates",
    backLabel: "Estimates",
    chatterRecordType: "estimate",
    sidebarFields: [
        { id: "number", label: "Number", accessorKey: "number" },
        { id: "status", label: "Status", accessorKey: "status" },
        { id: "total", label: "Total", accessorKey: "total", fieldType: "currency" },
        { id: "created_at", label: "Created", accessorKey: "created_at", fieldType: "date" },
        { id: "valid_until", label: "Valid Until", accessorKey: "valid_until", fieldType: "date" },
        { id: "company_name", label: "Company", accessorKey: "company_name" },
        { id: "contact_name", label: "Contact", accessorKey: "contact_name" },
    ],
    fields: [
        { id: "total", label: "Total", accessorKey: "total", fieldType: "currency" },
        { id: "created_at", label: "Created", accessorKey: "created_at", fieldType: "date" },
        { id: "valid_until", label: "Valid Until", accessorKey: "valid_until", fieldType: "date" },
        { id: "client_notes", label: "Notes", accessorKey: "client_notes", fullWidth: true },
    ],
    tabs: [],
};

export function EstimateDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { data: sbRecord, isLoading } = useEstimate(id);
    const rec = (sbRecord ?? initialRecord) as Record<string, unknown> | null;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: id,
        entityLabel: "Estimate",
        listPath: "/estimates",
        useUpdateHook: useUpdateEstimate,
        useDeleteHook: useDeleteEstimate,
    });

    const lineItems = parseLineItems(rec?.line_items ?? rec?.lineItems);

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
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
                            <div className="space-y-2">
                                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-3 py-2">
                                    <span className="col-span-5">Description</span>
                                    <span className="col-span-2 text-right">Qty</span>
                                    <span className="col-span-2 text-right">Unit Price</span>
                                    <span className="col-span-3 text-right">Total</span>
                                </div>
                                {lineItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid grid-cols-12 gap-2 px-3 py-2.5 rounded-lg bg-secondary/20 text-sm"
                                    >
                                        <span className="col-span-5 font-medium">
                                            {item.description}
                                        </span>
                                        <span className="col-span-2 text-right text-muted-foreground">
                                            {item.quantity}
                                        </span>
                                        <span className="col-span-2 text-right text-muted-foreground">
                                            {formatCurrency(item.unitPrice)}
                                        </span>
                                        <span className="col-span-3 text-right font-medium">
                                            {formatCurrency(item.total)}
                                        </span>
                                    </div>
                                ))}
                                <div className="grid grid-cols-12 gap-2 px-3 py-3 border-t font-semibold text-sm">
                                    <span className="col-span-9">Total</span>
                                    <span className="col-span-3 text-right">
                                        {formatCurrency(
                                            lineItems.reduce((s, li) => s + li.total, 0)
                                        )}
                                    </span>
                                </div>
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
            id={id}
            record={rec}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                { label: "Edit Estimate", onClick: () => router.push(`/estimates/${id}/edit`) },
                {
                    label: "Duplicate",
                    onClick: () => router.push(`/estimates/new?duplicateFrom=${id}`),
                },
                {
                    label: "Convert to Invoice",
                    onClick: () => router.push(`/invoices/new?fromEstimate=${id}`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileSignature className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm" onClick={() => handleUpdate({ status: "sent" })}>
                    <Send className="h-4 w-4 mr-1" />
                    Send
                </Button>
            }
        />
    );
}
