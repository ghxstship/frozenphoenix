"use client";

import { useRouter } from "next/navigation";
import {
    useActivation,
    useDeleteActivation,
    useEvents,
    useLocations,
    useProjects,
    useUpdateActivation,
} from "@/lib/supabase";
import { useDetailCrud } from "@/hooks/use-detail-crud";
import { DetailPageShell } from "@/components/shells/detail-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/layouts/empty-state";
import { EntityLink } from "@/components/linked-records/entity-link";
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
    fields: [
        { id: "description", label: "Description", accessorKey: "description", fullWidth: true },
        { id: "zone", label: "Zone", accessorKey: "zone" },
        {
            id: "install_date",
            label: "Install Date",
            accessorKey: "install_date",
            fieldType: "date",
            icon: Calendar,
        },
        {
            id: "strike_date",
            label: "Strike Date",
            accessorKey: "strike_date",
            fieldType: "date",
            icon: Calendar,
        },
        {
            id: "budget",
            label: "Budget",
            accessorKey: "budget",
            fieldType: "currency",
            icon: DollarSign,
        },
        {
            id: "expected_footfall",
            label: "Expected Footfall",
            accessorKey: "expected_footfall",
            fieldType: "number",
            icon: Users,
        },
        {
            id: "experience_goals",
            label: "Experience Goals",
            accessorKey: "experience_goals",
            fieldType: "tags",
            fullWidth: true,
        },
    ],
    sidebarFields: [
        { id: "type", label: "Type", accessorKey: "type", fieldType: "status" },
        { id: "zone", label: "Zone", accessorKey: "zone" },
        {
            id: "install_date",
            label: "Install Date",
            accessorKey: "install_date",
            fieldType: "date",
        },
        { id: "strike_date", label: "Strike Date", accessorKey: "strike_date", fieldType: "date" },
        { id: "budget", label: "Budget", accessorKey: "budget", fieldType: "currency" },
        {
            id: "expected_footfall",
            label: "Expected Footfall",
            accessorKey: "expected_footfall",
            fieldType: "number",
        },
    ],
    tabs: [],
};

export function ActivationDetailClient({
    id,
    initialRecord,
}: {
    id: string;
    initialRecord: Record<string, unknown> | null;
}) {
    const router = useRouter();
    const { menuItems: crudMenuItems, handleUpdate } = useDetailCrud({
        entityId: id,
        entityLabel: "Activation",
        listPath: "/activations",
        useUpdateHook: useUpdateActivation,
        useDeleteHook: useDeleteActivation,
    });
    const { data: activation, isLoading } = useActivation(id);
    const { data: sbLocations } = useLocations();
    const { data: sbProjects } = useProjects();
    const { data: sbEvents } = useEvents();
    const rec = (activation ?? initialRecord) as Record<string, unknown> | null;
    const location = rec
        ? (sbLocations ?? []).find((l: Record<string, unknown>) => l.id === rec.location_id)
        : null;
    const project = rec
        ? (sbProjects ?? []).find((p: Record<string, unknown>) => p.id === rec.project_id)
        : null;
    const activationEvents = activation
        ? (sbEvents ?? []).filter((e: Record<string, unknown>) => e.activation_id === id)
        : [];

    const _typeConfig = activation
        ? ACTIVATION_TYPE_CONFIG[activation.type as keyof typeof ACTIVATION_TYPE_CONFIG]
        : null;
    const components =
        activation && Array.isArray(activation.components) ? activation.components : [];
    const readyComponents = components.filter(
        (c: unknown) => (c as Record<string, unknown>).status === "ready"
    ).length;
    const enrichedRecord = rec ? { ...rec, _locationName: location?.name ?? "" } : null;

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

    const config: DetailPageConfig = {
        ...BASE_CONFIG,
        subtitleFn: () => location?.name ?? "",
        sidebarSlot,
        stats: [
            {
                label: "Budget",
                icon: DollarSign,
                compute: (r) => formatCurrency(Number(r.budget ?? 0)),
            },
            {
                label: "Components",
                icon: Package,
                compute: () => `${readyComponents}/${components.length} ready`,
            },
            { label: "Events", icon: Calendar, compute: () => activationEvents.length },
            {
                label: "Expected Footfall",
                icon: Users,
                compute: (r) => Number(r.expected_footfall ?? 0).toLocaleString(),
            },
        ],
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
                                                    {String(
                                                        (evt as Record<string, unknown>).start_time
                                                    )}
                                                    –
                                                    {String(
                                                        (evt as Record<string, unknown>).end_time
                                                    )}
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
            id={id}
            record={enrichedRecord}
            isLoading={isLoading && !initialRecord}
            menuItems={[
                {
                    label: "Duplicate",
                    onClick: () => router.push(`/activations/new?duplicateFrom=${id}`),
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
                <Button onClick={() => router.push(`/activations/${id}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            }
        />
    );
}
