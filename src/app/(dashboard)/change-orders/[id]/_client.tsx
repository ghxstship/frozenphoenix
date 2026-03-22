"use client";

import { useRouter } from "next/navigation";
import { useChangeOrder, useDeleteChangeOrder, useUpdateChangeOrder } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/formatters/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { Calendar, CheckCircle2, Clock, DollarSign, FileEdit, User } from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "change_order",
    titleKey: "title",
    statusKey: "status",
    icon: FileEdit,
    backHref: "/change-orders",
    backLabel: "Change Orders",
    chatterRecordType: "change_order",
    fields: [
        { id: "number", label: "Number", accessorKey: "number" },
        { id: "change_type", label: "Type", accessorKey: "change_type", fieldType: "status" },
        {
            id: "value_impact",
            label: "Value Impact",
            accessorKey: "value_impact",
            fieldType: "currency",
            icon: DollarSign,
        },
        {
            id: "requested_at",
            label: "Requested",
            accessorKey: "requested_at",
            fieldType: "date",
            icon: Calendar,
        },
    ],
    sidebarFields: [
        { id: "status", label: "Status", accessorKey: "status", fieldType: "status" },
        { id: "number", label: "Number", accessorKey: "number" },
        { id: "change_type", label: "Type", accessorKey: "change_type", fieldType: "status" },
    ],
    tabs: [],
};

export function ChangeOrderDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { data: changeOrder, isLoading } = useChangeOrder(id);
    const co = (changeOrder ?? initialRecord) as Record<string, unknown> | null;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: id,
        entityLabel: "Change Order",
        listPath: "/change-orders",
        useUpdateHook: useUpdateChangeOrder,
        useDeleteHook: useDeleteChangeOrder,
    });

    const sidebarSlot = co ? (
        <div className="density-gap-section">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Value Impact</span>
                        <span
                            className={`font-bold ${(co.value_impact as number) >= 0 ? "text-success" : "text-destructive"}`}
                        >
                            {(co.value_impact as number) >= 0 ? "+" : ""}
                            {formatCurrency(co.value_impact as number)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Schedule Impact</span>
                        <span
                            className={`font-medium ${((co.schedule_impact_days as number) ?? 0) > 0 ? "text-warning" : "text-success"}`}
                        >
                            {((co.schedule_impact_days as number) ?? 0) > 0
                                ? `+${co.schedule_impact_days} days`
                                : "No delay"}
                        </span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                        {((co.tags as string[]) ?? []).length > 0 ? (
                            ((co.tags as string[]) ?? []).map((t: string) => (
                                <Chip key={t} size="sm">
                                    {t}
                                </Chip>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground">No tags</span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    ) : undefined;

    const overviewSlot = co ? (
        <div className="density-gap-page">
            {!!co.description && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {String(co.description)}
                        </p>
                    </CardContent>
                </Card>
            )}
            {!!co.reason && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Reason</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {String(co.reason)}
                        </p>
                    </CardContent>
                </Card>
            )}
            {!!co.business_case && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Business Case</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {String(co.business_case)}
                        </p>
                    </CardContent>
                </Card>
            )}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Approval Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Requested By</span>
                        <span className="font-medium">{String(co.requested_by ?? "—")}</span>
                    </div>
                    {typeof co.reviewed_at === "string" && co.reviewed_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Reviewed</span>
                            <span className="font-medium">
                                {String(formatDate(co.reviewed_at, "compact"))}
                            </span>
                        </div>
                    )}
                    {typeof co.approved_at === "string" && co.approved_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Approved</span>
                            <span className="font-medium">
                                {String(formatDate(co.approved_at, "compact"))}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
            {!!co.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {String(co.notes)}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => (co ? `${String(co.number)} · ${String(co.project_id ?? "—")}` : ""),
        sidebarSlot,
        overviewSlot,
        stats: [
            {
                label: "Value Impact",
                icon: DollarSign,
                compute: () =>
                    `${((co?.value_impact as number) ?? 0) >= 0 ? "+" : ""}${formatCurrency((co?.value_impact as number) ?? 0)}`,
            },
            {
                label: "Schedule Impact",
                icon: Clock,
                compute: () =>
                    ((co?.schedule_impact_days as number) ?? 0) > 0
                        ? `+${co?.schedule_impact_days} days`
                        : "No delay",
            },
            {
                label: "Requested",
                icon: Calendar,
                compute: () =>
                    typeof co?.requested_at === "string"
                        ? String(formatDate(co.requested_at, "compact"))
                        : "—",
            },
        ],
        tabs: [
            {
                id: "scope",
                label: "Scope Changes",
                content: co ? (
                    <div className="density-gap-section">
                        {typeof co.scope_additions === "string" && co.scope_additions && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base text-success">
                                        Scope Additions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {co.scope_additions}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                        {typeof co.scope_removals === "string" && co.scope_removals && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base text-destructive">
                                        Scope Removals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {co.scope_removals}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                        {!co.scope_additions && !co.scope_removals && (
                            <Card>
                                <CardContent className="py-8">
                                    <p className="text-sm text-muted-foreground text-center">
                                        No scope changes documented yet.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : null,
            },
        ],
    };

    const record = co ? { ...(co as Record<string, unknown>) } : null;

    return (
        <DetailPageShell
            config={config}
            id={id}
            record={record}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                {
                    label: "Edit Change Order",
                    onClick: () => router.push(`/change-orders/${id}/edit`),
                },
                {
                    label: "Duplicate",
                    onClick: () => router.push(`/change-orders/new?duplicateFrom=${id}`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FileEdit className="h-7 w-7 text-primary-foreground" />
                </div>
            }
            actions={
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdate({ status: "in_review" })}
                    >
                        <User className="h-4 w-4 mr-1" />
                        Request Review
                    </Button>
                    <Button size="sm" onClick={() => handleUpdate({ status: "approved" })}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                    </Button>
                </div>
            }
        />
    );
}
