"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeleteIncident, useUpdateIncident } from "@/lib/supabase";
import { useCreateRecordComment, useRecordActivityLog, useRecordComments } from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem, CommentItem } from "@/components/activity";
import { EntityLink } from "@/components/linked-records/entity-link";
import { useIncident } from "@/lib/supabase";
import { useLocations, useProjects } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import {
    AlertTriangle,
    Clock,
    DollarSign,
    Edit,
    FileText,
    MapPin,
    Shield,
    Users,
} from "lucide-react";

const SEVERITY_CONFIG: Record<string, { label: string; variant: string; color: string }> = {
    minor: { label: "Minor", variant: "secondary", color: "text-muted-foreground" },
    moderate: { label: "Moderate", variant: "warning", color: "text-warning" },
    major: { label: "Major", variant: "destructive", color: "text-destructive" },
    critical: { label: "Critical", variant: "destructive", color: "text-destructive" },
};

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "incidents",
    titleKey: "title",
    statusKey: "status",
    icon: AlertTriangle,
    backHref: "/incidents",
    backLabel: "Incidents",
    chatter: false,
    fields: [
        { id: "number", label: "Number", accessorKey: "number" },
        { id: "type", label: "Type", accessorKey: "type", fieldType: "status" },
        { id: "severity", label: "Severity", accessorKey: "severity", fieldType: "status" },
        { id: "occurred_at", label: "Occurred", accessorKey: "occurred_at", fieldType: "date" },
        { id: "reported_at", label: "Reported", accessorKey: "reported_at", fieldType: "date" },
        {
            id: "estimated_cost",
            label: "Est. Cost",
            accessorKey: "estimated_cost",
            fieldType: "currency",
            icon: DollarSign,
        },
        {
            id: "insurance_claim",
            label: "Insurance Claim",
            accessorKey: "insurance_claim",
            fieldType: "boolean",
        },
    ],
    sidebarFields: [
        { id: "number", label: "Number", accessorKey: "number" },
        { id: "type", label: "Type", accessorKey: "type", fieldType: "status" },
        { id: "severity", label: "Severity", accessorKey: "severity", fieldType: "status" },
        { id: "occurred_at", label: "Occurred", accessorKey: "occurred_at", fieldType: "date" },
        { id: "reported_at", label: "Reported", accessorKey: "reported_at", fieldType: "date" },
        {
            id: "estimated_cost",
            label: "Est. Cost",
            accessorKey: "estimated_cost",
            fieldType: "currency",
        },
        {
            id: "insurance_claim",
            label: "Insurance",
            accessorKey: "insurance_claim",
            fieldType: "boolean",
        },
    ],
    tabs: [],
};

export default function IncidentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const incidentId = params.id as string;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: incidentId,
        entityLabel: "Incident",
        listPath: "/incidents",
        useUpdateHook: useUpdateIncident,
        useDeleteHook: useDeleteIncident,
    });
    const { data: incident, isLoading } = useIncident(incidentId);
    const { data: sbActivity } = useRecordActivityLog("incident", incidentId);
    const { data: sbComments } = useRecordComments("incident", incidentId);
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
    const inc = incident as Record<string, unknown> | null;
    const location = incident
        ? (sbLocations ?? []).find(
              (l: Record<string, unknown>) =>
                  l.id === (incident as Record<string, unknown>).location_id
          )
        : null;
    const project = incident
        ? (sbProjects ?? []).find(
              (p: Record<string, unknown>) =>
                  p.id === (incident as Record<string, unknown>).project_id
          )
        : null;
    const [now] = useState(() => Date.now());
    const daysSince = incident?.occurred_at
        ? Math.ceil((now - new Date(incident.occurred_at).getTime()) / 86400000)
        : 0;

    const severityCfg = incident
        ? (SEVERITY_CONFIG[incident.severity] ?? {
              label: "Minor",
              variant: "secondary",
              color: "text-muted-foreground",
          })
        : { label: "Minor", variant: "secondary", color: "text-muted-foreground" };

    const handleAddComment = async (content: string) => {
        await createComment.mutateAsync({
            entity_type: "incident",
            entity_id: incidentId,
            author_id: "u1",
            body: content,
        });
    };

    const sidebarSlot =
        project || location ? (
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
                </CardContent>
            </Card>
        ) : undefined;

    const overviewSlot = incident ? (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {incident.description}
                    </p>
                </CardContent>
            </Card>
            {incident.immediate_actions && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Immediate Actions Taken</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {incident.immediate_actions}
                        </p>
                    </CardContent>
                </Card>
            )}
            {incident.specific_location && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{incident.specific_location}</span>
                        </div>
                        {location && (
                            <p className="text-sm text-muted-foreground mt-1 ml-6">
                                {location.name}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    ) : undefined;

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => (incident ? `${incident.number} · ${incident.specific_location}` : ""),
        sidebarSlot,
        overviewSlot,
        stats: [
            { label: "Severity", icon: Shield, compute: () => severityCfg.label },
            { label: "Time Since", icon: Clock, compute: () => `${daysSince}d` },
            {
                label: "Est. Cost",
                icon: DollarSign,
                compute: (r) => formatCurrency(Number(r.estimated_cost ?? 0)),
            },
            {
                label: "Witnesses",
                icon: Users,
                compute: (r) => ((r.witness_ids as string[]) ?? []).length,
            },
        ],
        tabs: [
            {
                id: "investigation",
                label: "Investigation",
                content: incident ? (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Root Cause Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {incident.root_cause ? (
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {incident.root_cause}
                                    </p>
                                ) : (
                                    <EmptyState
                                        icon={FileText}
                                        title="Not yet determined"
                                        description="Root cause analysis is pending"
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : null,
            },
            {
                id: "resolution",
                label: "Resolution",
                content: incident ? (
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Resolution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {incident.resolution ? (
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {incident.resolution}
                                    </p>
                                ) : (
                                    <EmptyState
                                        icon={Shield}
                                        title="Not yet resolved"
                                        description="This incident is still open"
                                    />
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Preventive Measures</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {incident.preventive_measures ? (
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {incident.preventive_measures}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No preventive measures documented yet
                                    </p>
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
                        recordType="incident"
                        recordId={incidentId}
                        activityItems={activityItems}
                        comments={chatterComments}
                        currentUserId="u1"
                        onAddComment={handleAddComment}
                    />
                ),
            },
        ],
    };

    const record = inc ? { ...(inc as Record<string, unknown>) } : null;

    return (
        <DetailPageShell
            config={config}
            id={incidentId}
            record={record}
            isLoading={isLoading}
            menuItems={[
                {
                    label: "File Insurance Claim",
                    onClick: () => router.push(`/insurance-policies/new?incidentId=${incidentId}`),
                },
                { label: "Close Incident", onClick: () => handleUpdate({ status: "closed" }) },
                ...crudMenuItems,
            ]}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className={`h-6 w-6 ${severityCfg.color}`} />
                </div>
            }
            actions={
                <Button onClick={() => router.push(`/incidents/${incidentId}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            }
        />
    );
}
