"use client";

import { useParams, useRouter } from "next/navigation";
import { useChangeOrder, useDeleteChangeOrder, useUpdateChangeOrder } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { formatCurrency } from "@/lib/utils";
import { formatDate } from "@/lib/locale";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { Calendar, CheckCircle2, Clock, DollarSign, FileEdit, User } from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "change-orders",
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

export default function ChangeOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.id as string;
    const { data: changeOrder, isLoading } = useChangeOrder(entityId);
    const co = changeOrder;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId,
        entityLabel: "Change Order",
        listPath: "/change-orders",
        useUpdateHook: useUpdateChangeOrder,
        useDeleteHook: useDeleteChangeOrder,
    });

    const sidebarSlot = co ? (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Value Impact</span>
                        <span
                            className={`font-bold ${co.value_impact >= 0 ? "text-success" : "text-destructive"}`}
                        >
                            {co.value_impact >= 0 ? "+" : ""}
                            {formatCurrency(co.value_impact)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Schedule Impact</span>
                        <span
                            className={`font-medium ${(co.schedule_impact_days ?? 0) > 0 ? "text-warning" : "text-success"}`}
                        >
                            {(co.schedule_impact_days ?? 0) > 0
                                ? `+${co.schedule_impact_days} days`
                                : "No delay"}
                        </span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {co.project_id && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Project</span>
                            <span className="font-medium text-xs text-right max-w-[140px]">
                                {co.project_id}
                            </span>
                        </div>
                    )}
                    {co.company_id && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Company</span>
                            <span className="font-medium text-xs">{co.company_id}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                        {(co.tags ?? []).length > 0 ? (
                            (co.tags ?? []).map((t: string) => (
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
        <div className="space-y-6">
            {!!co.description && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {co.description}
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
                        <p className="text-sm text-muted-foreground leading-relaxed">{co.reason}</p>
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
                            {co.business_case}
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
                        <span className="font-medium">{co.requested_by ?? "—"}</span>
                    </div>
                    {co.reviewed_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Reviewed</span>
                            <span className="font-medium">
                                {formatDate(co.reviewed_at, "compact")}
                            </span>
                        </div>
                    )}
                    {co.approved_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Approved</span>
                            <span className="font-medium">
                                {formatDate(co.approved_at, "compact")}
                            </span>
                        </div>
                    )}
                    {co.client_approved_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Client Approved</span>
                            <span className="font-medium">
                                {formatDate(co.client_approved_at, "compact")}
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
                        <p className="text-sm text-muted-foreground leading-relaxed">{co.notes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => (co ? `${co.number} · ${co.project_id ?? "—"}` : ""),
        sidebarSlot,
        overviewSlot,
        stats: [
            {
                label: "Value Impact",
                icon: DollarSign,
                compute: () =>
                    `${co?.value_impact >= 0 ? "+" : ""}${formatCurrency(co?.value_impact ?? 0)}`,
            },
            {
                label: "Schedule Impact",
                icon: Clock,
                compute: () =>
                    (co?.schedule_impact_days ?? 0) > 0
                        ? `+${co?.schedule_impact_days} days`
                        : "No delay",
            },
            {
                label: "Requested",
                icon: Calendar,
                compute: () => (co?.requested_at ? formatDate(co.requested_at, "compact") : "—"),
            },
        ],
        tabs: [
            {
                id: "scope",
                label: "Scope Changes",
                content: co ? (
                    <div className="space-y-4">
                        {co.scope_additions && (
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
                        {co.scope_removals && (
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
                        {Array.isArray(co.deliverables_added) &&
                            co.deliverables_added.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            Deliverables Added ({co.deliverables_added.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {co.deliverables_added.map((d: unknown, i: number) => (
                                                <div
                                                    key={i}
                                                    className="p-3 rounded-lg bg-success/5 border border-success/20"
                                                >
                                                    <p className="text-sm font-mono">
                                                        {JSON.stringify(d)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        {Array.isArray(co.deliverables_removed) &&
                            co.deliverables_removed.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            Deliverables Removed ({co.deliverables_removed.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {co.deliverables_removed.map(
                                                (d: unknown, i: number) => (
                                                    <div
                                                        key={i}
                                                        className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                                                    >
                                                        <p className="text-sm font-mono">
                                                            {JSON.stringify(d)}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        {!co.scope_additions &&
                            !co.scope_removals &&
                            (!Array.isArray(co.deliverables_added) ||
                                co.deliverables_added.length === 0) &&
                            (!Array.isArray(co.deliverables_removed) ||
                                co.deliverables_removed.length === 0) && (
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
            id={entityId}
            record={record}
            isLoading={isLoading}
            menuItems={[
                {
                    label: "Edit Change Order",
                    onClick: () => router.push(`/change-orders/${entityId}/edit`),
                },
                {
                    label: "Duplicate",
                    onClick: () => router.push(`/change-orders/new?duplicateFrom=${entityId}`),
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
