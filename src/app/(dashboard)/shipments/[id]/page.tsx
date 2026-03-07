"use client";

import React, { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { useParams, useRouter } from "next/navigation";
import { useDeleteShipment, useUpdateShipment } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailLayout } from "@/components/layouts/detail-layout";
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
import {
    AlertCircle,
    Calendar,
    DollarSign,
    Edit,
    Loader2,
    MapPin,
    Package,
    Truck,
    Weight,
} from "lucide-react";

type TabId = "overview" | "items" | "tracking" | "chatter";
const TAB_VALUES = ["overview", "items", "tracking", "chatter"] as const;

const PLACEHOLDER_ACTIVITY: ActivityItem[] = [
    {
        id: "a1",
        action: "created",
        actorName: "Sarah Chen",
        entityType: "shipment",
        entityName: "this shipment",
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
        id: "a2",
        action: "status_changed",
        actorName: "System",
        entityType: "shipment",
        description: "Status changed to Booked",
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
];

const PLACEHOLDER_COMMENTS: CommentItem[] = [
    {
        id: "c1",
        authorId: "u1",
        authorName: "Sarah Chen",
        content: "Carrier confirmed pickup for 6 AM. Need to have staging area clear by 5:30 AM.",
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
];

export default function ShipmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const shipmentId = params.id as string;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: shipmentId,
        entityLabel: "Shipment",
        listPath: "/shipments",
        useUpdateHook: useUpdateShipment,
        useDeleteHook: useDeleteShipment,
    });
    void handleUpdate;
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(PLACEHOLDER_COMMENTS);

    const { data: shipment, isLoading } = useShipment(shipmentId);
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!shipment) {
        return (
            <EmptyState
                icon={Truck}
                title="Shipment not found"
                description="The shipment you're looking for doesn't exist or has been deleted."
                action={{
                    label: "Back to Shipments",
                    onClick: () => router.push("/logistics/shipments"),
                }}
            />
        );
    }

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
        { id: "overview" as const, label: "Overview" },
        { id: "items" as const, label: "Items", count: shipment.items?.length ?? 0 },
        { id: "tracking" as const, label: "Tracking" },
        { id: "chatter" as const, label: "Chatter", count: chatterComments.length },
    ];

    const formatAddress = (addr: {
        street1: string;
        city: string;
        state: string;
        postalCode: string;
    }) => `${addr.street1}, ${addr.city}, ${addr.state} ${addr.postalCode}`;

    const sidebar = (
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
                        <span>{shipment.carrierName}</span>
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
                        <span className="font-medium">{formatCurrency(shipment.cost)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight</span>
                        <span>
                            {shipment.totalWeight?.toLocaleString()} {shipment.weightUnit}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Pieces</span>
                        <span>{shipment.totalPieces}</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        {shipment.liftgateRequired ? (
                            <Badge variant="warning">Liftgate</Badge>
                        ) : (
                            <Badge variant="secondary">No Liftgate</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {shipment.insideDelivery ? (
                            <Badge variant="info">Inside Delivery</Badge>
                        ) : (
                            <Badge variant="secondary">Dock Delivery</Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {shipment.appointmentRequired ? (
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
    );

    return (
        <DetailLayout
            backHref="/logistics/shipments"
            backLabel="Shipments"
            entityType="shipments"
            entityId={shipmentId}
            title={shipment.description}
            subtitle={`${shipment.number} · ${shipment.carrierName}`}
            status={shipment.status}
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
            menuItems={[{ label: "Print BOL", onClick: () => {} }, ...crudMenuItems]}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabId)}
            sidebar={sidebar}
        >
            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs">Pickup</span>
                                </div>
                                <p className="text-xl font-bold">
                                    {formatDate(shipment.pickupDate)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {shipment.pickupTime}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs">Est. Delivery</span>
                                </div>
                                <p className="text-xl font-bold">
                                    {formatDate(shipment.estimatedDeliveryDate)}
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
                                    {shipment.totalWeight?.toLocaleString()} {shipment.weightUnit}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="text-xs">Shipping Cost</span>
                                </div>
                                <p className="text-xl font-bold">{formatCurrency(shipment.cost)}</p>
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
                                            {formatAddress(shipment.originAddress)}
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
                                            {formatAddress(shipment.destinationAddress)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {shipment.specialInstructions && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Special Instructions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                                    <p className="text-sm text-muted-foreground">
                                        {shipment.specialInstructions}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "items" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Shipment Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!shipment.items || shipment.items.length === 0 ? (
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
                                        {shipment.items.map(
                                            (item: {
                                                id: string;
                                                description: string;
                                                quantity: number;
                                                weight: number;
                                                value: number;
                                            }) => (
                                                <tr
                                                    key={item.id}
                                                    className="border-b last:border-0 hover:bg-secondary/30 transition-colors"
                                                >
                                                    <td className="py-3 pr-4 font-medium">
                                                        {item.description}
                                                    </td>
                                                    <td className="py-3 pr-4 text-right">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="py-3 pr-4 text-right">
                                                        {item.weight.toLocaleString()} lbs
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        {formatCurrency(item.value)}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === "tracking" && (
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
                                        {formatDate(shipment.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium">Pickup Scheduled</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(shipment.pickupDate)} at {shipment.pickupTime}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="shipment"
                    recordId={shipmentId}
                    activityItems={PLACEHOLDER_ACTIVITY}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
