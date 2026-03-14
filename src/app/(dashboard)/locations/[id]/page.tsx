"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteLocation, useUpdateLocation } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { CommentItem } from "@/components/activity";
import { EntityLink } from "@/components/linked-records";
import { useActivations, useEvents, useLocation, useProjects } from "@/lib/supabase/hooks";
import { PermissionGate } from "@/components/permission-guard";
import { LOCATION_TYPE_CONFIG } from "@/config/production-config";
import { getStatusLabel, getStatusVariant } from "@/config/ui-variants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    Calendar,
    Clock,
    DollarSign,
    Edit,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    Phone,
    Sparkles,
    Users,
    Wifi,
    Zap,
} from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "locations",
    titleKey: "name",
    statusKey: "type",
    icon: MapPin,
    backHref: "/locations",
    backLabel: "Locations",
    chatter: false,
    fields: [],
    tabs: [],
};

export default function LocationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const locationId = params.id as string;
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: locationId,
        entityLabel: "Location",
        listPath: "/locations",
        useUpdateHook: useUpdateLocation,
        useDeleteHook: useDeleteLocation,
    });

    const chatterComments: CommentItem[] = [];
    const handleAddComment = async (content: string) => {
        void content;
    };

    const { data: sbLocation, isLoading: loadingLocation } = useLocation(locationId);
    const { data: sbActivations, isLoading: loadingActivations } = useActivations();
    const { data: sbEvents, isLoading: loadingEvents } = useEvents();
    const { data: sbProjects } = useProjects();

    const isLoading = loadingLocation || loadingActivations || loadingEvents;

    const location = sbLocation
        ? {
              id: sbLocation.id,
              projectId: sbLocation.project_id,
              name: sbLocation.name,
              type: sbLocation.type,
              address: (
                  sbLocation as unknown as {
                      address?: {
                          street1: string;
                          street2?: string;
                          city: string;
                          state: string;
                          postalCode: string;
                      };
                  }
              ).address,
              capacity: sbLocation.capacity ?? undefined,
              squareFootage: sbLocation.square_footage ?? undefined,
              dailyRate: sbLocation.daily_rate ?? undefined,
              totalCost: sbLocation.total_cost ?? undefined,
              contactName: sbLocation.contact_name ?? undefined,
              contactEmail: sbLocation.contact_email ?? undefined,
              contactPhone: sbLocation.contact_phone ?? undefined,
              accessStartDate: sbLocation.access_start_date ?? undefined,
              accessEndDate: sbLocation.access_end_date ?? undefined,
              powerAvailable: sbLocation.power_available ?? undefined,
              internetAvailable: sbLocation.internet_available ?? false,
              insuranceRequired: sbLocation.insurance_required ?? false,
              permitsRequired:
                  (sbLocation as unknown as { permits_required?: string[] }).permits_required ?? [],
              amenities: (sbLocation as unknown as { amenities?: string[] }).amenities ?? [],
              restrictions:
                  (sbLocation as unknown as { restrictions?: string[] }).restrictions ?? [],
              loadInWindows:
                  (
                      sbLocation as unknown as {
                          load_in_windows?: {
                              date: string;
                              startTime: string;
                              endTime: string;
                          }[];
                      }
                  ).load_in_windows ?? [],
              loadOutWindows:
                  (
                      sbLocation as unknown as {
                          load_out_windows?: {
                              date: string;
                              startTime: string;
                              endTime: string;
                          }[];
                      }
                  ).load_out_windows ?? [],
          }
        : null;

    const project =
        sbProjects && location
            ? (sbProjects.find((p) => p.id === location.projectId) ?? null)
            : null;

    const activations = sbActivations
        ? sbActivations
              .filter((a) => a.location_id === locationId)
              .map((a) => ({
                  id: a.id,
                  name: a.name,
                  type: a.type,
                  status: a.status,
                  zone: a.zone ?? undefined,
                  locationId: a.location_id ?? undefined,
              }))
        : [];

    const events = sbEvents
        ? sbEvents
              .filter((e) => e.location_id === locationId)
              .map((e) => ({
                  id: e.id,
                  name: e.name,
                  status: e.status,
                  date: e.date ?? "",
                  startTime: e.start_time ?? "",
                  endTime: e.end_time ?? "",
                  locationId: e.location_id ?? undefined,
              }))
        : [];

    const typeConfig = location
        ? LOCATION_TYPE_CONFIG[location.type as keyof typeof LOCATION_TYPE_CONFIG]
        : undefined;
    const Icon = typeConfig?.icon || MapPin;

    const sidebarSlot = location ? (
        <div className="space-y-4">
            {project && (
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
            )}

            {(location.contactName || location.contactEmail || location.contactPhone) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Venue Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {location.contactName && (
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{location.contactName}</span>
                            </div>
                        )}
                        {location.contactEmail && (
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a
                                    href={`mailto:${location.contactEmail}`}
                                    className="text-primary hover:underline"
                                >
                                    {location.contactEmail}
                                </a>
                            </div>
                        )}
                        {location.contactPhone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a
                                    href={`tel:${location.contactPhone}`}
                                    className="hover:underline"
                                >
                                    {location.contactPhone}
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {location.address && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Address</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <p>{location.address.street1}</p>
                        {(location.address as { street2?: string }).street2 && (
                            <p>{(location.address as { street2?: string }).street2}</p>
                        )}
                        <p>
                            {location.address.city}, {location.address.state}{" "}
                            {location.address.postalCode}
                        </p>
                        <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(`${location.address.street1}, ${location.address.city}, ${location.address.state}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-xs flex items-center gap-1 mt-2"
                        >
                            View on Map
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </CardContent>
                </Card>
            )}

            {(location.insuranceRequired ||
                (location.permitsRequired && location.permitsRequired.length > 0)) && (
                <Card className="border-warning/50 bg-warning/5">
                    <CardHeader>
                        <CardTitle className="text-sm">Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {location.insuranceRequired && (
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-warning" />
                                <span>Insurance Required</span>
                            </div>
                        )}
                        {location.permitsRequired?.map((permit: string) => (
                            <div key={permit} className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-warning" />
                                <span>{permit}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    ) : undefined;

    const overviewSlot = location ? (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {location.capacity && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Users className="h-4 w-4" />
                                <span className="text-xs">Capacity</span>
                            </div>
                            <p className="text-xl font-bold">
                                {location.capacity.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                )}
                {location.squareFootage && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <MapPin className="h-4 w-4" />
                                <span className="text-xs">Square Footage</span>
                            </div>
                            <p className="text-xl font-bold">
                                {location.squareFootage.toLocaleString()} sq ft
                            </p>
                        </CardContent>
                    </Card>
                )}
                {location.dailyRate && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs">Daily Rate</span>
                            </div>
                            <p className="text-xl font-bold">
                                {formatCurrency(location.dailyRate)}
                            </p>
                        </CardContent>
                    </Card>
                )}
                {location.totalCost && (
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs">Total Cost</span>
                            </div>
                            <p className="text-xl font-bold">
                                {formatCurrency(location.totalCost)}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {(location.accessStartDate || location.accessEndDate) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Access Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {location.accessStartDate &&
                                        formatDate(location.accessStartDate)}
                                    {location.accessStartDate && location.accessEndDate && " — "}
                                    {location.accessEndDate && formatDate(location.accessEndDate)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
                {location.amenities && location.amenities.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Amenities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {location.amenities.map((amenity: string) => (
                                    <Badge key={amenity} variant="secondary">
                                        {amenity}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Utilities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {location.powerAvailable && (
                            <div className="flex items-center gap-2 text-sm">
                                <Zap className="h-4 w-4 text-warning" />
                                <span>Power: {location.powerAvailable}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                            <Wifi className="h-4 w-4 text-info" />
                            <span>
                                Internet:{" "}
                                {location.internetAvailable ? "Available" : "Not Available"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {((location.loadInWindows && location.loadInWindows.length > 0) ||
                (location.loadOutWindows && location.loadOutWindows.length > 0)) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Load In/Out Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-6">
                            {location.loadInWindows && location.loadInWindows.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2 text-success">
                                        Load In
                                    </h4>
                                    <div className="space-y-1">
                                        {location.loadInWindows.map(
                                            (
                                                window: {
                                                    date: string;
                                                    startTime: string;
                                                    endTime: string;
                                                },
                                                i: number
                                            ) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-2 text-sm"
                                                >
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    <span>
                                                        {formatDate(window.date)}:{" "}
                                                        {window.startTime} - {window.endTime}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                            {location.loadOutWindows && location.loadOutWindows.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2 text-warning">
                                        Load Out
                                    </h4>
                                    <div className="space-y-1">
                                        {location.loadOutWindows.map(
                                            (
                                                window: {
                                                    date: string;
                                                    startTime: string;
                                                    endTime: string;
                                                },
                                                i: number
                                            ) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-2 text-sm"
                                                >
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    <span>
                                                        {formatDate(window.date)}:{" "}
                                                        {window.startTime} - {window.endTime}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {location.restrictions && location.restrictions.length > 0 && (
                <Card className="border-destructive/30">
                    <CardHeader>
                        <CardTitle className="text-base text-destructive">Restrictions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1 text-sm">
                            {location.restrictions.map((restriction: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-destructive">•</span>
                                    {restriction}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () =>
            location?.address ? `${location.address.city}, ${location.address.state}` : "",
        sidebarSlot,
        overviewSlot,
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
                                onClick={() =>
                                    router.push(`/activations/new?locationId=${locationId}`)
                                }
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
                                            router.push(
                                                `/activations/new?locationId=${locationId}`
                                            ),
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
                                onClick={() => router.push(`/events/new?locationId=${locationId}`)}
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
                                        onClick: () =>
                                            router.push(`/events/new?locationId=${locationId}`),
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
                        recordId={locationId}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    const rec = sbLocation as unknown as Record<string, unknown> | null;
    const record = rec ? { ...rec } : null;

    return (
        <PermissionGate resource="locations" action="read">
            <DetailPageShell
                config={config}
                id={locationId}
                record={record}
                isLoading={isLoading}
                menuItems={[
                    {
                        label: "Add Activation",
                        onClick: () => router.push(`/activations/new?locationId=${locationId}`),
                    },
                    {
                        label: "Schedule Event",
                        onClick: () => router.push(`/events/new?locationId=${locationId}`),
                    },
                    {
                        label: "View on Map",
                        onClick: () =>
                            window.open(
                                `https://maps.google.com/?q=${encodeURIComponent(location?.name ?? "")}`,
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
                    <Button onClick={() => router.push(`/locations/${locationId}/edit`)}>
                        <Edit className="h-4 w-4" />
                        Edit
                    </Button>
                }
            />
        </PermissionGate>
    );
}
