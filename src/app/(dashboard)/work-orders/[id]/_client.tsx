"use client";

import { useRouter } from "next/navigation";
import { useDeleteWorkOrder, useUpdateWorkOrder, useWorkOrder } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    Building2,
    Calendar,
    ClipboardList,
    Clock,
    DollarSign,
    MapPin,
    Play,
    User,
} from "lucide-react";

interface BidItem {
    id: string;
    vendorName: string;
    amount: number;
    submittedAt: string;
    status: string;
}

function parseBids(raw: unknown): BidItem[] {
    if (!Array.isArray(raw)) return [];
    return (raw as Record<string, unknown>[]).map((b, i) => ({
        id: String(b.id ?? `b-${i}`),
        vendorName: (b.vendor_name as string) ?? (b.vendorName as string) ?? "",
        amount: (b.amount as number) ?? 0,
        submittedAt: (b.submitted_at as string) ?? (b.submittedAt as string) ?? "",
        status: (b.status as string) ?? "pending",
    }));
}

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "work_orders",
    titleKey: "title",
    subtitleFn: (r) => {
        const num = String(r.number ?? "");
        const vendor = (r.vendor_name as string) ?? (r.vendorName as string) ?? "";
        return `${num}${vendor ? ` · ${vendor}` : " · Unassigned"}`;
    },
    statusKey: "status",
    icon: ClipboardList,
    backHref: "/work-orders",
    backLabel: "Work Orders",
    chatterRecordType: "work_order",
    fields: [
        { id: "number", label: "Number", accessorKey: "number" },
        { id: "priority", label: "Priority", accessorKey: "priority", fieldType: "status" },
        {
            id: "estimated_cost",
            label: "Est. Cost",
            accessorKey: "estimated_cost",
            fieldType: "currency",
        },
    ],
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        { id: "number", label: "Number", accessorKey: "number" },
        { id: "priority", label: "Priority", accessorKey: "priority", fieldType: "status" },
        {
            id: "estimated_cost",
            label: "Est. Cost",
            accessorKey: "estimated_cost",
            fieldType: "currency",
        },
        {
            id: "scheduled_start",
            label: "Start",
            accessorKey: "scheduled_start",
            fieldType: "date",
        },
        { id: "scheduled_end", label: "End", accessorKey: "scheduled_end", fieldType: "date" },
    ],
    tabs: [],
};

export function WorkOrderDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { data: woRecord, isLoading } = useWorkOrder(id);
    const wo = (woRecord ?? initialRecord) as Record<string, unknown> | null;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: id,
        entityLabel: "Work Order",
        listPath: "/work-orders",
        useUpdateHook: useUpdateWorkOrder,
        useDeleteHook: useDeleteWorkOrder,
    });

    const woEstimatedCost = (wo?.estimated_cost as number) ?? (wo?.estimatedCost as number) ?? 0;
    const woScheduledStart =
        (wo?.scheduled_start as string) ?? (wo?.scheduledStart as string) ?? "";
    const woVendorName = (wo?.vendor_name as string) ?? (wo?.vendorName as string) ?? "";
    const woLocationName = (wo?.location_name as string) ?? (wo?.locationName as string) ?? "";
    const woDescription = (wo?.description as string) ?? "";
    const woCompletionNotes =
        (wo?.completion_notes as string) ?? (wo?.completionNotes as string) ?? "";
    const woIsOpenForBids =
        (wo?.is_open_for_bids as boolean) ?? (wo?.isOpenForBids as boolean) ?? false;
    const bids = parseBids(wo?.bids);

    const sidebarSlot = (
        <div className="density-gap-section">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {woVendorName && (
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{woVendorName}</span>
                        </div>
                    )}
                    {woLocationName && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs">{woLocationName}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const overviewSlot = (
        <div className="density-gap-page">
            <div className="grid grid-cols-1 sm:grid-cols-3 density-gap-card-grid">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">Estimated Cost</p>
                                <p className="text-lg font-bold">
                                    {woEstimatedCost ? formatCurrency(woEstimatedCost) : "TBD"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-info" />
                            <div>
                                <p className="text-xs text-muted-foreground">Timeline</p>
                                <p className="text-sm font-semibold">
                                    {woScheduledStart ? formatDate(woScheduledStart) : "TBD"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-warning" />
                            <div>
                                <p className="text-xs text-muted-foreground">Open for Bids</p>
                                <p className="text-sm font-semibold">
                                    {woIsOpenForBids ? "Yes" : "No"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {woDescription && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {woDescription}
                        </p>
                    </CardContent>
                </Card>
            )}
            {woCompletionNotes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Completion Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {woCompletionNotes}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        sidebarSlot,
        overviewSlot,
        stats: [
            {
                label: "Estimated Cost",
                icon: DollarSign,
                compute: () => (woEstimatedCost ? formatCurrency(woEstimatedCost) : "TBD"),
            },
            {
                label: "Timeline",
                icon: Calendar,
                compute: () => (woScheduledStart ? formatDate(woScheduledStart) : "TBD"),
            },
            {
                label: "Open for Bids",
                icon: Clock,
                compute: () => (woIsOpenForBids ? "Yes" : "No"),
            },
        ],
        tabs: [
            {
                id: "bids",
                label: "Bids",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Vendor Bids ({bids.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {bids.map((bid) => (
                                    <div
                                        key={bid.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {bid.vendorName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Submitted {formatDate(bid.submittedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold">
                                                {formatCurrency(bid.amount)}
                                            </span>
                                            <Badge variant={getStatusVariant(bid.status)}>
                                                {getStatusLabel(bid.status)}
                                            </Badge>
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
            id={id}
            record={wo}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                { label: "Edit Work Order", onClick: () => router.push(`/work-orders/${id}/edit`) },
                {
                    label: "Reassign Vendor",
                    onClick: () => router.push(`/work-orders/${id}/edit?section=vendor`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <ClipboardList className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <Button size="sm" onClick={() => handleUpdate({ status: "in_progress" })}>
                    <Play className="h-4 w-4 mr-1" />
                    Start Work
                </Button>
            }
        />
    );
}
