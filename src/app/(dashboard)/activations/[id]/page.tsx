"use client";

import React, { useState } from "react";
import { useQueryTabState } from "@/hooks/use-query-tab-state";
import { useParams, useRouter } from "next/navigation";
import { useDeleteActivation, useUpdateActivation } from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailLayout } from "@/components/layouts/detail-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { RecordChatter } from "@/components/activity";
import type { ActivityItem, CommentItem } from "@/components/activity";
import { EntityLink } from "@/components/linked-records/entity-link";
import { useActivation } from "@/lib/supabase/hooks-pages";
import { useEvents, useLocations, useProjects } from "@/lib/supabase/hooks";
import { ACTIVATION_TYPE_CONFIG } from "@/config/production-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, DollarSign, Edit, Loader2, Package, Sparkles, Users } from "lucide-react";

type TabId = "overview" | "components" | "events" | "timeline" | "chatter";
const TAB_VALUES = ["overview", "components", "events", "timeline", "chatter"] as const;

const PLACEHOLDER_ACTIVITY: ActivityItem[] = [
    {
        id: "a1",
        action: "created",
        actorName: "Sarah Chen",
        entityType: "activation",
        entityName: "this activation",
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
        id: "a2",
        action: "status_changed",
        actorName: "Marcus Johnson",
        entityType: "activation",
        description: "Status changed from Design to Build",
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
];

const PLACEHOLDER_COMMENTS: CommentItem[] = [
    {
        id: "c1",
        authorId: "u1",
        authorName: "Marcus Johnson",
        content:
            "Stage deck fabrication is ahead of schedule. LED wall vendor confirmed delivery for the 16th.",
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
];

export default function ActivationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const activationId = params.id as string;
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: activationId,
        entityLabel: "Activation",
        listPath: "/activations",
        useUpdateHook: useUpdateActivation,
        useDeleteHook: useDeleteActivation,
    });
    void handleUpdate;
    const [activeTab, setActiveTab] = useQueryTabState<TabId>({
        key: "tab",
        defaultValue: "overview",
        validValues: TAB_VALUES,
    });
    const [chatterComments, setChatterComments] = useState<CommentItem[]>(PLACEHOLDER_COMMENTS);

    const { data: activation, isLoading } = useActivation(activationId);
    const { data: sbLocations } = useLocations();
    const { data: sbProjects } = useProjects();
    const { data: sbEvents } = useEvents();
    const a = activation as Record<string, unknown> | null;
    const location = a
        ? (sbLocations ?? []).find((l: Record<string, unknown>) => l.id === a.location_id)
        : null;
    const project = a
        ? (sbProjects ?? []).find((p: Record<string, unknown>) => p.id === a.project_id)
        : null;
    const activationEvents = activation
        ? (sbEvents ?? []).filter((e: Record<string, unknown>) => e.activation_id === activationId)
        : [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!activation) {
        return (
            <EmptyState
                icon={Sparkles}
                title="Activation not found"
                description="The activation you're looking for doesn't exist or has been deleted."
                action={{
                    label: "Back to Activations",
                    onClick: () => router.push("/activations"),
                }}
            />
        );
    }

    const typeConfig =
        ACTIVATION_TYPE_CONFIG[activation.type as keyof typeof ACTIVATION_TYPE_CONFIG];
    const totalComponentCost =
        activation.components?.reduce((sum: number, c: { cost: number }) => sum + c.cost, 0) ?? 0;
    const readyComponents =
        activation.components?.filter((c: { status: string }) => c.status === "ready").length ?? 0;

    const handleAddComment = async (content: string) => {
        const newComment: CommentItem = {
            id: `c-${Date.now()}`,
            authorId: "u1",
            authorName: "Sarah Chen",
            content,
            createdAt: new Date().toISOString(),
        };
        setChatterComments((prev) => [...prev, newComment]);
    };

    const tabs = [
        { id: "overview" as const, label: "Overview" },
        {
            id: "components" as const,
            label: "Components",
            count: activation.components?.length ?? 0,
        },
        { id: "events" as const, label: "Events", count: activationEvents.length },
        { id: "timeline" as const, label: "Timeline" },
        { id: "chatter" as const, label: "Chatter", count: chatterComments.length },
    ];

    const sidebar = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Activation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="secondary">{typeConfig?.label ?? activation.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Zone</span>
                        <span className="font-medium">{activation.zone ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Install Date</span>
                        <span>
                            {activation.installDate ? formatDate(activation.installDate) : "—"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Strike Date</span>
                        <span>
                            {activation.strikeDate ? formatDate(activation.strikeDate) : "—"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">
                            {formatCurrency(activation.budget ?? 0)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Footfall</span>
                        <span>{activation.expectedFootfall?.toLocaleString() ?? "—"}</span>
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
            backHref="/activations"
            backLabel="Activations"
            entityType="activations"
            entityId={activationId}
            title={activation.name}
            subtitle={location?.name}
            status={activation.status}
            avatar={
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                    <Sparkles className="h-6 w-6" />
                </div>
            }
            actions={
                <Button onClick={() => router.push(`/activations/${activationId}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            }
            menuItems={[
                { label: "Duplicate", onClick: () => {} },
                { label: "Archive", onClick: () => {} },
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
                                    <DollarSign className="h-4 w-4" />
                                    <span className="text-xs">Budget</span>
                                </div>
                                <p className="text-xl font-bold">
                                    {formatCurrency(activation.budget ?? 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Component cost: {formatCurrency(totalComponentCost)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Package className="h-4 w-4" />
                                    <span className="text-xs">Components</span>
                                </div>
                                <p className="text-xl font-bold">
                                    {readyComponents}/{activation.components?.length ?? 0}
                                </p>
                                <p className="text-xs text-muted-foreground">ready</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs">Events</span>
                                </div>
                                <p className="text-xl font-bold">{activationEvents.length}</p>
                                <p className="text-xs text-muted-foreground">scheduled</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Users className="h-4 w-4" />
                                    <span className="text-xs">Footfall</span>
                                </div>
                                <p className="text-xl font-bold">
                                    {(activation.expectedFootfall ?? 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">expected</p>
                            </CardContent>
                        </Card>
                    </div>
                    {activation.description && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {activation.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                    {activation.experienceGoals && activation.experienceGoals.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Experience Goals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {activation.experienceGoals.map((g: string) => (
                                        <Badge key={g} variant="secondary">
                                            {g}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === "components" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Components</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!activation.components || activation.components.length === 0 ? (
                            <EmptyState
                                icon={Package}
                                title="No components"
                                description="Add components to this activation"
                            />
                        ) : (
                            <div className="space-y-2">
                                {activation.components.map(
                                    (comp: {
                                        id: string;
                                        name: string;
                                        type: string;
                                        quantity: number;
                                        status: string;
                                        cost: number;
                                        vendorId?: string;
                                    }) => (
                                        <div
                                            key={comp.id}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{comp.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Qty: {comp.quantity} · {comp.type}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium">
                                                    {formatCurrency(comp.cost)}
                                                </span>
                                                <StatusBadge status={comp.status} />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === "events" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activationEvents.length === 0 ? (
                            <EmptyState
                                icon={Calendar}
                                title="No events"
                                description="No events linked to this activation yet"
                            />
                        ) : (
                            <div className="space-y-2">
                                {activationEvents.map((evt) => (
                                    <div
                                        key={evt.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                                    >
                                        <div>
                                            <EntityLink
                                                entityType="event"
                                                entityId={evt.id}
                                                entityName={evt.name}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(evt.date)} ·{" "}
                                                {
                                                    (evt as Record<string, unknown>)
                                                        .start_time as string
                                                }
                                                –
                                                {
                                                    (evt as Record<string, unknown>)
                                                        .end_time as string
                                                }
                                            </p>
                                        </div>
                                        <StatusBadge status={evt.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeTab === "timeline" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { label: "Install Date", date: activation.installDate },
                                ...(activation.operatingHours?.map(
                                    (oh: { date: string; startTime: string; endTime: string }) => ({
                                        label: `Operating: ${oh.startTime}–${oh.endTime}`,
                                        date: oh.date,
                                    })
                                ) ?? []),
                                { label: "Strike Date", date: activation.strikeDate },
                            ]
                                .filter((item) => item.date)
                                .map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(item.date!)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "chatter" && (
                <RecordChatter
                    recordType="activation"
                    recordId={activationId}
                    activityItems={PLACEHOLDER_ACTIVITY}
                    comments={chatterComments}
                    currentUserId="u1"
                    onAddComment={handleAddComment}
                />
            )}
        </DetailLayout>
    );
}
