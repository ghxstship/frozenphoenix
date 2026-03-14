"use client";

import { useParams, useRouter } from "next/navigation";
import {
    useActivation,
    useDeleteActivation,
    useUpdateActivation,
} from "@/lib/supabase/hooks-pages";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { EntityLink } from "@/components/linked-records/entity-link";
import { useEvents, useLocations, useProjects } from "@/lib/supabase/hooks";
import { ACTIVATION_TYPE_CONFIG } from "@/config/production-config";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DetailPageConfig } from "@/types/detail-page-config";
import { Calendar, DollarSign, Edit, Package, Sparkles, Users } from "lucide-react";

const BASE_CONFIG: DetailPageConfig = {
    entityKey: "activations",
    titleKey: "name",
    statusKey: "status",
    icon: Sparkles,
    backHref: "/activations",
    backLabel: "Activations",
    chatterRecordType: "activation",
    fields: [],
    tabs: [],
};

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
    const { data: activation, isLoading } = useActivation(activationId);
    const { data: sbLocations } = useLocations();
    const { data: sbProjects } = useProjects();
    const { data: sbEvents } = useEvents();
    const rec = activation as Record<string, unknown> | null;
    const location = rec
        ? (sbLocations ?? []).find((l: Record<string, unknown>) => l.id === rec.location_id)
        : null;
    const project = rec
        ? (sbProjects ?? []).find((p: Record<string, unknown>) => p.id === rec.project_id)
        : null;
    const activationEvents = activation
        ? (sbEvents ?? []).filter((e: Record<string, unknown>) => e.activation_id === activationId)
        : [];

    const typeConfig = activation
        ? ACTIVATION_TYPE_CONFIG[activation.type as keyof typeof ACTIVATION_TYPE_CONFIG]
        : null;
    const components =
        activation && Array.isArray(activation.components) ? activation.components : [];
    const totalComponentCost = components.reduce(
        (sum: number, c: unknown) => sum + Number((c as Record<string, unknown>).cost ?? 0),
        0
    );
    const readyComponents = components.filter(
        (c: unknown) => (c as Record<string, unknown>).status === "ready"
    ).length;

    const enrichedRecord = rec ? { ...rec, _locationName: location?.name ?? "" } : null;

    const sidebarSlot = (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Activation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="secondary">
                            {typeConfig?.label ?? String(rec?.type ?? "")}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Zone</span>
                        <span className="font-medium">{String(rec?.zone ?? "—")}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Install Date</span>
                        <span>
                            {rec?.install_date ? formatDate(String(rec.install_date)) : "—"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Strike Date</span>
                        <span>{rec?.strike_date ? formatDate(String(rec.strike_date)) : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">
                            {formatCurrency(Number(rec?.budget ?? 0))}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Footfall</span>
                        <span>
                            {rec?.expected_footfall
                                ? Number(rec.expected_footfall).toLocaleString()
                                : "—"}
                        </span>
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

    const overviewSlot = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-xs">Budget</span>
                        </div>
                        <p className="text-xl font-bold">
                            {formatCurrency(Number(rec?.budget ?? 0))}
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
                            {readyComponents}/{components.length}
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
                            {Number(rec?.expected_footfall ?? 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">expected</p>
                    </CardContent>
                </Card>
            </div>
            {!!rec?.description && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{String(rec.description)}</p>
                    </CardContent>
                </Card>
            )}
            {Array.isArray(rec?.experience_goals) &&
                (rec.experience_goals as unknown[]).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Experience Goals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {(rec.experience_goals as unknown[]).map((g: unknown) => (
                                    <Badge key={String(g)} variant="secondary">
                                        {String(g)}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
        </div>
    );

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => location?.name ?? "",
        sidebarSlot,
        overviewSlot,
        tabs: [
            {
                id: "components",
                label: "Components",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Components</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {components.length === 0 ? (
                                <EmptyState
                                    icon={Package}
                                    title="No components"
                                    description="Add components to this activation"
                                />
                            ) : (
                                <div className="space-y-2">
                                    {components.map((rawComp: unknown, i: number) => {
                                        const comp = rawComp as Record<string, unknown>;
                                        return (
                                            <div
                                                key={String(comp.id ?? i)}
                                                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {String(comp.name ?? "")}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Qty: {String(comp.quantity ?? 0)} ·{" "}
                                                        {String(comp.type ?? "")}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium">
                                                        {formatCurrency(Number(comp.cost ?? 0))}
                                                    </span>
                                                    <StatusBadge
                                                        status={String(comp.status ?? "")}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ),
            },
            {
                id: "events",
                label: "Events",
                content: (
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
                ),
            },
            {
                id: "timeline",
                label: "Timeline",
                content: (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    {
                                        label: "Install Date",
                                        date: rec?.install_date ? String(rec.install_date) : "",
                                    },
                                    ...(Array.isArray(rec?.operating_hours)
                                        ? (rec.operating_hours as unknown[]).map(
                                              (rawOh: unknown) => {
                                                  const oh = rawOh as Record<string, unknown>;
                                                  return {
                                                      label: `Operating: ${String(oh.start_time ?? "")}–${String(oh.end_time ?? "")}`,
                                                      date: String(oh.date ?? ""),
                                                  };
                                              }
                                          )
                                        : []),
                                    {
                                        label: "Strike Date",
                                        date: rec?.strike_date ? String(rec.strike_date) : "",
                                    },
                                ]
                                    .filter((item) => item.date)
                                    .map((item, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">{item.label}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(item.date)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                ),
            },
        ],
    };

    return (
        <DetailPageShell
            config={config}
            id={activationId}
            record={enrichedRecord}
            isLoading={isLoading}
            menuItems={[
                {
                    label: "Duplicate",
                    onClick: () => router.push(`/activations/new?duplicateFrom=${activationId}`),
                },
                { label: "Archive", onClick: () => handleUpdate({ status: "archived" }) },
                ...crudMenuItems,
            ]}
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
        />
    );
}
