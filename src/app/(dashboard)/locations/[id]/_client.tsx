"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    useActivations,
    useDeleteLocation,
    useEvents,
    useLocation,
    useProjects,
    useUpdateLocation,
} from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { EntityLink } from "@/components/linked-records";
import { PermissionGate } from "@/components/app/permission-guard";
import { LOCATION_TYPE_CONFIG } from "@/config/production-config";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { Calendar, DollarSign, Edit, MapPin, Sparkles, Users } from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "location",
    titleKey: "name",
    statusKey: "type",
    icon: MapPin,
    backHref: "/locations",
    backLabel: "Locations",
    chatter: false,
    fields: [
        { id: "type", label: "Type", accessorKey: "type", fieldType: "status" },
        { id: "capacity", label: "Capacity", accessorKey: "capacity", fieldType: "number" },
        {
            id: "square_footage",
            label: "Square Footage",
            accessorKey: "square_footage",
            fieldType: "number",
        },
        {
            id: "daily_rate",
            label: "Daily Rate",
            accessorKey: "daily_rate",
            fieldType: "currency",
            icon: DollarSign,
        },
        {
            id: "total_cost",
            label: "Total Cost",
            accessorKey: "total_cost",
            fieldType: "currency",
            icon: DollarSign,
        },
    ],
    sidebarFields: [
        { id: "type", label: "Type", accessorKey: "type", fieldType: "status" },
        { id: "capacity", label: "Capacity", accessorKey: "capacity", fieldType: "number" },
        {
            id: "square_footage",
            label: "Square Footage",
            accessorKey: "square_footage",
            fieldType: "number",
        },
        { id: "daily_rate", label: "Daily Rate", accessorKey: "daily_rate", fieldType: "currency" },
        { id: "total_cost", label: "Total Cost", accessorKey: "total_cost", fieldType: "currency" },
    ],
    tabs: [],
};

export function LocationDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Location",
        listPath: "/locations",
        useUpdateHook: useUpdateLocation,
        useDeleteHook: useDeleteLocation,
    });
    const chatterComments: CommentItem[] = [];
    const handleAddComment = async (content: string) => {
        void content;
    };

    const { data: sbLocation, isLoading: loadingLocation } = useLocation(id);
    const { data: sbActivations } = useActivations();
    const { data: sbEvents } = useEvents();
    const { data: sbProjects } = useProjects();
    const isLoading = loadingLocation;

    const loc = sbLocation as Record<string, unknown> | null;
    const project =
        sbProjects && loc ? (sbProjects.find((p) => p.id === loc.project_id) ?? null) : null;
    const activations = sbActivations
        ? sbActivations
              .filter((a) => a.location_id === id)
              .map((a) => ({
                  id: a.id,
                  name: a.name,
                  type: a.type,
                  status: a.status,
                  zone: a.zone ?? undefined,
              }))
        : [];
    const events = sbEvents
        ? sbEvents
              .filter((e) => e.location_id === id)
              .map((e) => ({
                  id: e.id,
                  name: e.name,
                  status: e.status,
                  date: e.date ?? "",
                  startTime: e.start_time ?? "",
                  endTime: e.end_time ?? "",
              }))
        : [];
    const typeConfig = loc
        ? LOCATION_TYPE_CONFIG[loc.type as keyof typeof LOCATION_TYPE_CONFIG]
        : undefined;
    const Icon = typeConfig?.icon || MapPin;

    const sidebarSlot = project ? (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Project</CardTitle>
            </CardHeader>
            <CardContent>
                <EntityLink
                    entityType="project"
                    entityId={project.id}
                    entityName={project.name}
                    status={project.status}
                />
            </CardContent>
        </Card>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => {
            const r = loc;
            return r ? `${String(r.address_city ?? "")}, ${String(r.address_state ?? "")}` : "";
        },
        sidebarSlot,
        stats: [
            ...(loc?.capacity
                ? [
                      {
                          label: "Capacity",
                          icon: Users,
                          compute: () => Number(loc.capacity).toLocaleString(),
                      },
                  ]
                : []),
            ...(loc?.daily_rate
                ? [
                      {
                          label: "Daily Rate",
                          icon: DollarSign,
                          compute: () => formatCurrency(Number(loc.daily_rate)),
                      },
                  ]
                : []),
            ...(loc?.total_cost
                ? [
                      {
                          label: "Total Cost",
                          icon: DollarSign,
                          compute: () => formatCurrency(Number(loc.total_cost)),
                      },
                  ]
                : []),
        ],
        tabs: [
            {
                id: "activations",
                label: "Activations",
                count: activations.length,
                content: (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">
                                Activations at this Location
                            </CardTitle>
                            <Button
                                size="sm"
                                onClick={() => router.push(`/activations/new?locationId=${id}`)}
                            >
                                <Sparkles className="h-4 w-4" />
                                Add Activation
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {activations.length === 0 ? (
                                <EmptyState
                                    icon={Sparkles}
                                    title="No activations"
                                    description="Add an activation to this location"
                                    action={{
                                        label: "Add Activation",
                                        onClick: () =>
                                            router.push(`/activations/new?locationId=${id}`),
                                    }}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {activations.map((activation) => (
                                        <div
                                            key={activation.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                                            onClick={() =>
                                                router.push(`/activations/${activation.id}`)
                                            }
                                        >
                                            <div>
                                                <p className="font-medium">{activation.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activation.type} •{" "}
                                                    {activation.zone || "No zone assigned"}
                                                </p>
                                            </div>
                                            <Badge variant={getStatusVariant(activation.status)}>
                                                {getStatusLabel(activation.status)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "events",
                label: "Events",
                count: events.length,
                content: (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Events at this Location</CardTitle>
                            <Button
                                size="sm"
                                onClick={() => router.push(`/events/new?locationId=${id}`)}
                            >
                                <Calendar className="h-4 w-4" />
                                Schedule Event
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {events.length === 0 ? (
                                <EmptyState
                                    icon={Calendar}
                                    title="No events scheduled"
                                    description="Schedule an event at this location"
                                    action={{
                                        label: "Schedule Event",
                                        onClick: () => router.push(`/events/new?locationId=${id}`),
                                    }}
                                />
                            ) : (
                                <div className="space-y-3">
                                    {events.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                                            onClick={() => router.push(`/events/${event.id}`)}
                                        >
                                            <div>
                                                <p className="font-medium">{event.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(event.date)} • {event.startTime} -{" "}
                                                    {event.endTime}
                                                </p>
                                            </div>
                                            <Badge variant={getStatusVariant(event.status)}>
                                                {getStatusLabel(event.status)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "schedule",
                label: "Schedule",
                content: (
                    <EmptyState
                        icon={Calendar}
                        title="No scheduled events"
                        description="A calendar view of events and bookings at this location will appear here."
                        compact
                    />
                ),
            },
            {
                id: "chatter",
                label: "Chatter",
                content: (
                    <RecordChatter
                        recordType="location"
                        recordId={id}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    const record = (loc ?? initialRecord) as Record<string, unknown> | null;

    return (
        <PermissionGate resource="locations" action="read">
            <DetailPageShell
                config={config}
                id={id}
                record={record ? { ...record } : null}
                isLoading={isLoading && !initialRecord}
                menuItems={[
                    {
                        label: "Add Activation",
                        onClick: () => router.push(`/activations/new?locationId=${id}`),
                    },
                    {
                        label: "Schedule Event",
                        onClick: () => router.push(`/events/new?locationId=${id}`),
                    },
                    {
                        label: "View on Map",
                        onClick: () =>
                            window.open(
                                `https://maps.google.com/?q=${encodeURIComponent(String(loc?.name ?? ""))}`,
                                "_blank"
                            ),
                    },
                    ...crudMenuItems,
                ]}
                avatar={
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                }
                actions={
                    <Button onClick={() => router.push(`/locations/${id}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                }
            />
        </PermissionGate>
    );
}
