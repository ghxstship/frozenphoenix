"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteShipment, useUpdateShipment } from "@/lib/supabase/hooks-pages";
import {
    useCreateRecordComment,
    useRecordActivityLog,
    useRecordComments,
} from "@/lib/supabase/hooks-feature-gaps";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem, CommentItem } from "@/components/activity";
import { EntityLink } from "@/components/linked-records/entity-link";
import { useShipment } from "@/lib/supabase/hooks-pages";
import { useLocations, useProjects } from "@/lib/supabase/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    AlertCircle,
    Calendar,
    DollarSign,
    Edit,
    MapPin,
    Package,
    Truck,
    Weight,
} from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "shipments",
    titleKey: "description",
    statusKey: "status",
    icon: Truck,
    backHref: "/logistics/shipments",
    backLabel: "Shipments",
    chatter: false,
    fields: [],
    tabs: [],
};

export default function ShipmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const shipmentId = params.id as string;
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: shipmentId,
        entityLabel: "Shipment",
        listPath: "/shipments",
        useUpdateHook: useUpdateShipment,
        useDeleteHook: useDeleteShipment,
    });
    const { data: shipment, isLoading } = useShipment(shipmentId);
    const { data: sbActivity } = useRecordActivityLog("shipment", shipmentId);
    const { data: sbComments } = useRecordComments("shipment", shipmentId);
    const createComment = useCreateRecordComment();

    const activityItems: ActivityItem[] = useMemo(
        () =>
            (sbActivity ?? []).map((a) => ({
                id: a.id,
                action: a.action as ActivityItem["action"],
                actorName: a.user_profiles?.display_name ?? "System",
                entityType: a.entity_type,
                description: (a.metadata?.description as string) ?? undefined,
                createdAt: a.created_at,
            })),
        [sbActivity]
    );

    const chatterComments: CommentItem[] = useMemo(
        () =>
            (sbComments ?? []).map((c) => ({
                id: c.id,
                authorId: c.author_id,
                authorName: c.user_profiles?.display_name ?? "",
                content: c.body,
                createdAt: c.created_at,
                updatedAt: c.updated_at,
            })),
        [sbComments]
    );
    const { data: sbLocations } = useLocations();
    const { data: sbProjects } = useProjects();
    const s = shipment as Record<string, unknown> | null;
    const locs = sbLocations ?? [];
    const project = s
        ? (sbProjects ?? []).find((p: Record<string, unknown>) => p.id === s.project_id)
        : null;
    const originLoc = s
        ? locs.find((l: Record<string, unknown>) => l.id === s.origin_location_id)
        : null;
    const destLoc = s
        ? locs.find((l: Record<string, unknown>) => l.id === s.destination_location_id)
        : null;

    const handleAddComment = async (content: string) => {
        await createComment.mutateAsync({
            entity_type: "shipment",
            entity_id: shipmentId,
            author_id: "u1",
            body: content,
        });
    };

    const formatAddress = (addr: unknown) => {
        if (!addr || typeof addr !== "object") return "—";
        const a = addr as Record<string, unknown>;
        return `${a.street1 ?? ""}, ${a.city ?? ""}, ${a.state ?? ""} ${a.postal_code ?? a.postalCode ?? ""}`;
    };

    const sidebarSlot = shipment ? (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Shipment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Number</span>
                        <span className="font-mono text-xs">{shipment.number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="secondary" className="capitalize">
                            {shipment.type}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Carrier</span>
                        <span>{shipment.carrier_name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority</span>
                        <Badge
                            variant={shipment.priority === "expedited" ? "warning" : "secondary"}
                            className="capitalize"
                        >
                            {shipment.priority}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost</span>
                        <span className="font-medium">{formatCurrency(shipment.cost ?? 0)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight</span>
                        <span>
                            {shipment.total_weight?.toLocaleString()} {shipment.weight_unit}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Pieces</span>
                        <span>{shipment.total_pieces}</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        {shipment.liftgate_required ? (
                            <Badge variant="warning">Liftgate</Badge>
                        ) : (
                            <Badge variant="secondary">No Liftgate</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {shipment.inside_delivery ? (
                            <Badge variant="info">Inside Delivery</Badge>
                        ) : (
                            <Badge variant="secondary">Dock Delivery</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {shipment.appointment_required ? (
                            <Badge variant="warning">Appointment Required</Badge>
                        ) : (
                            <Badge variant="secondary">No Appointment</Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Related Records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {project && (
                        <EntityLink
                            entityType="project"
                            entityId={project.id}
                            entityName={project.name}
                            status={project.status}
                        />
                    )}
                    {originLoc && (
                        <EntityLink
                            entityType="location"
                            entityId={originLoc.id}
                            entityName={`Origin: ${originLoc.name}`}
                        />
                    )}
                    {destLoc && (
                        <EntityLink
                            entityType="location"
                            entityId={destLoc.id}
                            entityName={`Dest: ${destLoc.name}`}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    ) : null;

    const overviewSlot = shipment ? (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs">Pickup</span>
                        </div>
                        <p className="text-xl font-bold">{formatDate(shipment.pickup_date)}</p>
                        <p className="text-xs text-muted-foreground">{shipment.pickup_time}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs">Est. Delivery</span>
                        </div>
                        <p className="text-xl font-bold">
                            {formatDate(shipment.estimated_delivery_date)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Weight className="h-4 w-4" />
                            <span className="text-xs">Total Weight</span>
                        </div>
                        <p className="text-xl font-bold">
                            {shipment.total_weight?.toLocaleString()} {shipment.weight_unit}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-xs">Shipping Cost</span>
                        </div>
                        <p className="text-xl font-bold">{formatCurrency(shipment.cost ?? 0)}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Origin</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium">{originLoc?.name ?? "—"}</p>
                                <p className="text-muted-foreground">
                                    {formatAddress(shipment.origin_address as unknown)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Destination</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium">{destLoc?.name ?? "—"}</p>
                                <p className="text-muted-foreground">
                                    {formatAddress(shipment.destination_address as unknown)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {shipment.special_instructions && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Special Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground">
                                {shipment.special_instructions}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    ) : null;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: (r) =>
            `${(r as Record<string, unknown>).number ?? ""} · ${(r as Record<string, unknown>).carrier_name ?? ""}`,
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "items",
                label: "Items",
                count: shipment && Array.isArray(shipment.items) ? shipment.items.length : 0,
                content: shipment ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Shipment Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!Array.isArray(shipment.items) || shipment.items.length === 0 ? (
                                <EmptyState
                                    icon={Package}
                                    title="No items"
                                    description="No items in this shipment"
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left">
                                                <th className="py-2 pr-4 font-medium text-muted-foreground">
                                                    Description
                                                </th>
                                                <th className="py-2 pr-4 font-medium text-muted-foreground text-right">
                                                    Qty
                                                </th>
                                                <th className="py-2 pr-4 font-medium text-muted-foreground text-right">
                                                    Weight
                                                </th>
                                                <th className="py-2 font-medium text-muted-foreground text-right">
                                                    Value
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shipment.items.map((rawItem: unknown, i: number) => {
                                                const item = rawItem as Record<string, unknown>;
                                                return (
                                                    <tr
                                                        key={String(item.id ?? i)}
                                                        className="border-b last:border-0 hover:bg-secondary/30 transition-colors"
                                                    >
                                                        <td className="py-3 pr-4 font-medium">
                                                            {String(item.description ?? "")}
                                                        </td>
                                                        <td className="py-3 pr-4 text-right">
                                                            {String(item.quantity ?? 0)}
                                                        </td>
                                                        <td className="py-3 pr-4 text-right">
                                                            {Number(
                                                                item.weight ?? 0
                                                            ).toLocaleString()}{" "}
                                                            lbs
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            {formatCurrency(
                                                                Number(item.value ?? 0)
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : null,
            },
            {
                id: "tracking",
                label: "Tracking",
                content: shipment ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Tracking History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Shipment Created</p>
                                        <p className="text-xs text-muted-foreground">
                                            {shipment.created_at
                                                ? formatDate(shipment.created_at)
                                                : "—"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Pickup Scheduled</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(shipment.pickup_date)} at{" "}
                                            {shipment.pickup_time}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : null,
            },
            {
                id: "chatter",
                label: "Chatter",
                count: chatterComments.length,
                content: (
                    <RecordChatter
                        recordType="shipment"
                        recordId={shipmentId}
                        activityItems={activityItems}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={shipmentId}
            record={shipment}
            isLoading={isLoading}
            menuItems={[{ label: "Print BOL", onClick: () => window.print() }, ...crudMenuItems]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                    <Truck className="h-6 w-6" />
                </div>
            }
            actions={
                <Button onClick={() => router.push(`/shipments/${shipmentId}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            }
        />
    );
}
