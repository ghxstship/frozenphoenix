"use client";

import { LoadingState } from "@/components/layouts/loading-state";
import React, { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { useParams, useRouter } from "next/navigation";
import { useDeleteIncident, useUpdateIncident } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem, CommentItem } from "@/components/activity";
import { EntityLink } from "@/components/linked-records/entity-link";
import { useIncident } from "@/lib/supabase/hooks-pages";
import { useLocations, useProjects } from "@/lib/supabase/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    AlertTriangle,
    Clock,
    DollarSign,
    Edit,
    FileText,
    Loader2,
    MapPin,
    Shield,
    Users,
} from "lucide-react";

type TabId = "overview" | "investigation" | "resolution" | "chatter";
const TAB_VALUES = ["overview", "investigation", "resolution", "chatter"] as const;

const SEVERITY_CONFIG: Record<string, { label: string; variant: string; color: string }> = {
    minor: { label: "Minor", variant: "secondary", color: "text-muted-foreground" },
    moderate: { label: "Moderate", variant: "warning", color: "text-warning" },
    major: { label: "Major", variant: "destructive", color: "text-destructive" },
    critical: { label: "Critical", variant: "destructive", color: "text-destructive" },
};

const PLACEHOLDER_ACTIVITY: ActivityItem[] = [
    {
        id: "a1",
        action: "created",
        actorName: "David Kim",
        entityType: "incident",
        entityName: "this incident",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
        id: "a2",
        action: "status_changed",
        actorName: "Marcus Johnson",
        entityType: "incident",
        description: "Status changed to Investigating",
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
];

const PLACEHOLDER_COMMENTS: CommentItem[] = [
    {
        id: "c1",
        authorId: "u1",
        authorName: "Marcus Johnson",
        content:
            "Vendor has been contacted. Replacement panel is being shipped overnight. ETA tomorrow morning.",
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
];

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
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(PLACEHOLDER_COMMENTS);

    const { data: incident, isLoading } = useIncident(incidentId);
    const { data: sbLocations } = useLocations();
    const { data: sbProjects } = useProjects();
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
    const daysSince = incident?.occurredAt
        ? Math.ceil((now - new Date(incident.occurredAt).getTime()) / 86400000)
        : 0;

    if (isLoading) {
        return (
            <LoadingState />
        );
    }

    if (!incident) {
        return (
            <EmptyState
                icon={AlertTriangle}
                title="Incident not found"
                description="The incident you're looking for doesn't exist or has been deleted."
                action={{ label: "Back to Incidents", onClick: () => router.push("/incidents") }}
            />
        );
    }

    const severityCfg = SEVERITY_CONFIG[incident.severity] ?? {
        label: "Minor",
        variant: "secondary",
        color: "text-muted-foreground",
    };

    const handleAddComment = async (content: string) => {
        setChatterComments((prev) => [
            ...prev,
            {
                id: `c-${Date.now()}`,
                authorId: "u1",
                authorName: "Marcus Johnson",
                content,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "investigation" as const, label: "Investigation" },
        { id: "resolution" as const, label: "Resolution" },
        { id: "chatter" as const, label: "Chatter", count: chatterComments.length },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Incident Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Number</span>
                        <span className="font-mono text-xs">{incident.number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="secondary" className="capitalize">
                            {incident.type.replace(/_/g, " ")}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Severity</span>
                        <Badge variant={severityCfg.variant as "default"}>
                            {severityCfg.label}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Occurred</span>
                        <span>{formatDate(incident.occurredAt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Reported</span>
                        <span>{formatDate(incident.reportedAt)}</span>
                    </div>
                    {incident.estimatedCost > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Cost</span>
                            <span className="font-medium">
                                {formatCurrency(incident.estimatedCost)}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Insurance</span>
                        <span>{incident.insuranceClaim ? "Claim Filed" : "No Claim"}</span>
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
                    {location && (
                        <EntityLink
                            entityType="location"
                            entityId={location.id}
                            entityName={location.name}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DetailLayout
            backHref="/incidents"
            backLabel="Incidents"
            entityType="incidents"
            entityId={incidentId}
            title={incident.title}
            subtitle={`${incident.number} · ${incident.specificLocation}`}
            status={incident.status}
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
            menuItems={[
                { label: "File Insurance Claim", onClick: () => router.push(`/insurance-policies/new?incidentId=${incidentId}`) },
                { label: "Close Incident", onClick: () => handleUpdate({ status: "closed" }) },
                ...crudMenuItems,
            ]}
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
                                    <Shield className="h-4 w-4" />
                                    <span className="text-xs">Severity</span>
                                </div>
                                <p className={`text-xl font-bold ${severityCfg.color}`}>
                                    {severityCfg.label}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs">Time Since</span>
                                </div>
                                <p className="text-xl font-bold">{daysSince}d</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span className="text-xs">Est. Cost</span>
                                </div>
                                <p className="text-xl font-bold">
                                    {formatCurrency(incident.estimatedCost)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Users className="h-4 w-4" />
                                    <span className="text-xs">Witnesses</span>
                                </div>
                                <p className="text-xl font-bold">{incident.witnessIds.length}</p>
                            </CardContent>
                        </Card>
                    </div>
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
                    {incident.immediateActions && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Immediate Actions Taken</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {incident.immediateActions}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    {incident.specificLocation && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Location</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{incident.specificLocation}</span>
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
            )}

            {activeTab === "investigation" && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Root Cause Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {incident.rootCause ? (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {incident.rootCause}
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
            )}

            {activeTab === "resolution" && (
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
                            {incident.preventiveMeasures ? (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {incident.preventiveMeasures}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No preventive measures documented yet
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="incident"
                    recordId={incidentId}
                    activityItems={PLACEHOLDER_ACTIVITY}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
