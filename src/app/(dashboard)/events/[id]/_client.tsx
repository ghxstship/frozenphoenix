"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    useActivations,
    useCreateRecordComment,
    useCrewShifts,
    useDeleteEvent,
    useEvent,
    useLocations,
    useProjects,
    useRecordActivityLog,
    useRecordComments,
    useUpdateEvent,
} from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem, CommentItem } from "@/components/activity";
import { EntityLink } from "@/components/linked-records/entity-link";
import { EVENT_TYPE_CONFIG } from "@/config/production-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { Calendar, Clock, DollarSign, Edit, MapPin, Play, Users } from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "events",
    titleKey: "name",
    statusKey: "status",
    icon: Calendar,
    backHref: "/events",
    backLabel: "Events",
    chatter: false,
    fields: [
        { id: "date", label: "Date", accessorKey: "date", fieldType: "date", icon: Calendar },
        { id: "start_time", label: "Start Time", accessorKey: "start_time" },
        { id: "end_time", label: "End Time", accessorKey: "end_time" },
        { id: "doors_time", label: "Doors", accessorKey: "doors_time" },
        {
            id: "attendee_count",
            label: "Attendees",
            accessorKey: "attendee_count",
            fieldType: "number",
        },
        {
            id: "budget",
            label: "Budget",
            accessorKey: "budget",
            fieldType: "currency",
            icon: DollarSign,
        },
    ],
    sidebarFields: [
        { id: "type", label: "Type", accessorKey: "type", fieldType: "status" },
        { id: "date", label: "Date", accessorKey: "date", fieldType: "date" },
        { id: "start_time", label: "Start", accessorKey: "start_time" },
        { id: "end_time", label: "End", accessorKey: "end_time" },
        {
            id: "attendee_count",
            label: "Attendees",
            accessorKey: "attendee_count",
            fieldType: "number",
        },
        { id: "budget", label: "Budget", accessorKey: "budget", fieldType: "currency" },
    ],
    tabs: [],
};

export function EventDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { menuItems: crudMenuItems } = useDetailCrud({
        entityId: id,
        entityLabel: "Event",
        listPath: "/events",
        useUpdateHook: useUpdateEvent,
        useDeleteHook: useDeleteEvent,
    });
    const { data: event, isLoading } = useEvent(id);
    const { data: sbActivity } = useRecordActivityLog("event", id);
    const { data: sbComments } = useRecordComments("event", id);
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
    const { data: sbActivations } = useActivations();
    const { data: sbShifts } = useCrewShifts();
    const ev = (event ?? initialRecord) as Record<string, unknown> | null;
    const location = ev
        ? (sbLocations ?? []).find((l: Record<string, unknown>) => l.id === ev.location_id)
        : null;
    const project = ev
        ? (sbProjects ?? []).find((p: Record<string, unknown>) => p.id === ev.project_id)
        : null;
    const activation = ev?.activation_id
        ? (sbActivations ?? []).find((a: Record<string, unknown>) => a.id === ev.activation_id)
        : null;
    const eventShifts = event
        ? (sbShifts ?? []).filter((s: Record<string, unknown>) => s.event_id === id)
        : [];
    const typeConfig = event
        ? EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG]
        : undefined;
    const TypeIcon = typeConfig?.icon ?? Calendar;

    const handleAddComment = async (content: string) => {
        await createComment.mutateAsync({
            entity_type: "event",
            entity_id: id,
            author_id: "u1",
            body: content,
        });
    };

    const sidebarSlot =
        project || location || activation ? (
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
                    {location && (
                        <EntityLink
                            entityType="location"
                            entityId={location.id}
                            entityName={location.name}
                        />
                    )}
                    {activation && (
                        <EntityLink
                            entityType="activation"
                            entityId={activation.id}
                            entityName={activation.name}
                            status={activation.status}
                        />
                    )}
                </CardContent>
            </Card>
        ) : undefined;

    const overviewSlot = event ? (
        <div className="space-y-6">
            {event.description && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{String(event.description)}</p>
                    </CardContent>
                </Card>
            )}
            {event.purpose && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Purpose</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{String(event.purpose)}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () =>
            event
                ? `${formatDate(event.date)} · ${String(event.start_time)}–${String(event.end_time)}`
                : "",
        sidebarSlot,
        overviewSlot,
        stats: [
            { label: "Attendees", icon: Users, compute: (r) => Number(r.attendee_count ?? 0) },
            {
                label: "Duration",
                icon: Clock,
                compute: (r) => `${String(r.start_time ?? "")}–${String(r.end_time ?? "")}`,
            },
            {
                label: "Cues",
                icon: Play,
                compute: (r) =>
                    Array.isArray(r.run_of_show) ? (r.run_of_show as unknown[]).length : 0,
            },
            {
                label: "Budget",
                icon: DollarSign,
                compute: (r) => formatCurrency(Number(r.budget ?? 0)),
            },
        ],
        tabs: [
            {
                id: "run-of-show",
                label: "Run of Show",
                count: event && Array.isArray(event.run_of_show) ? event.run_of_show.length : 0,
                content: event ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Run of Show</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!Array.isArray(event.run_of_show) || event.run_of_show.length === 0 ? (
                                <EmptyState
                                    icon={Play}
                                    title="No cues"
                                    description="Run of show hasn't been defined yet"
                                />
                            ) : (
                                <div className="space-y-1">
                                    {event.run_of_show.map((rawCue: unknown, i: number) => {
                                        const cue = rawCue as Record<string, unknown>;
                                        return (
                                            <div
                                                key={String(cue.id ?? i)}
                                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                                            >
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono text-xs shrink-0"
                                                >
                                                    {String(cue.cue_number ?? cue.cueNumber ?? "")}
                                                </Badge>
                                                <span className="text-sm font-mono font-medium shrink-0 w-12">
                                                    {String(cue.time ?? "")}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">
                                                        {String(cue.description ?? "")}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {String(
                                                            cue.responsible_party ??
                                                                cue.responsibleParty ??
                                                                ""
                                                        )}{" "}
                                                        · {String(cue.duration ?? 0)} min
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : null,
            },
            {
                id: "crew",
                label: "Crew",
                count: eventShifts.length,
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Crew Assignments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {eventShifts.length === 0 ? (
                                <EmptyState
                                    icon={Users}
                                    title="No crew assigned"
                                    description="Assign crew members to this event"
                                />
                            ) : (
                                <div className="space-y-2">
                                    {eventShifts.map((shift) => (
                                        <div
                                            key={shift.id}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                                                    {String(
                                                        (shift as Record<string, unknown>)
                                                            .crew_member_name ?? ""
                                                    )
                                                        .split(" ")
                                                        .map((n: string) => n[0])
                                                        .join("")}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {String(
                                                            (shift as Record<string, unknown>)
                                                                .crew_member_name ?? ""
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {shift.role} ·{" "}
                                                        {String(
                                                            (shift as Record<string, unknown>)
                                                                .call_time ?? ""
                                                        )}
                                                        –
                                                        {String(
                                                            (shift as Record<string, unknown>)
                                                                .end_time ?? ""
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={shift.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "logistics",
                label: "Logistics",
                content: event ? (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Venue Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {location && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{location.name}</span>
                                        </div>
                                    </>
                                )}
                                {event.cancellation_policy && (
                                    <div>
                                        <span className="text-muted-foreground">
                                            Cancellation Policy:
                                        </span>{" "}
                                        <span>{String(event.cancellation_policy)}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : null,
            },
            {
                id: "chatter",
                label: "Chatter",
                count: chatterComments.length,
                content: (
                    <RecordChatter
                        recordType="event"
                        recordId={id}
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
            id={id}
            record={ev ? { ...ev } : null}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                {
                    label: "Duplicate",
                    onClick: () => router.push(`/events/new?duplicateFrom=${id}`),
                },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                    <TypeIcon className="h-6 w-6" />
                </div>
            }
            actions={
                <Button onClick={() => router.push(`/events/${id}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            }
        />
    );
}
