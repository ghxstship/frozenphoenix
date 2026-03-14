"use client";

import { useMemo } from "react";
import { ListPageShell } from "@/components/shells";
import { useActivations, useLocations, useProjects } from "@/lib/supabase/hooks";
import { CREATE_ACTIVATION_CONFIG } from "@/config/create-entity-configs";
import { DollarSign, Sparkles, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "activations",
    title: "Activations",
    description: "Manage brand activations, installations, and experiences",
    icon: Sparkles,
    createConfig: CREATE_ACTIVATION_CONFIG,
    createLabel: "New Activation",
    exportable: true,
    searchKeys: ["name", "type", "zone"],
    stats: [
        { label: "Total Activations", icon: Sparkles, filter: () => true },
        {
            label: "Active",
            icon: Sparkles,
            filter: (r) => r.status === "active" || r.status === "installed",
        },
        {
            label: "Expected Footfall",
            icon: Users,
            compute: (records) =>
                records
                    .reduce((sum, r) => sum + (Number(r.expected_footfall) || 0), 0)
                    .toLocaleString(),
        },
        {
            label: "Total Budget",
            icon: DollarSign,
            compute: (records) =>
                formatCurrency(records.reduce((sum, r) => sum + (Number(r.budget) || 0), 0)),
        },
    ],
    filters: [
        {
            id: "status",
            label: "Status",
            column: "status",
            options: [
                { value: "planning", label: "Planning" },
                { value: "design", label: "Design" },
                { value: "build", label: "Build" },
                { value: "installed", label: "Installed" },
                { value: "active", label: "Active" },
            ],
        },
    ],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "zone", header: "Zone", accessorKey: "zone" },
        { id: "expected_footfall", header: "Footfall", accessorKey: "expected_footfall" },
        { id: "budget", header: "Budget", accessorKey: "budget", fieldType: "currency" },
    ],
};

export default function ActivationsPage() {
    const { data: sbActivations, isLoading: loadingActivations } = useActivations();
    const { data: sbLocations } = useLocations();
    const { data: sbProjects } = useProjects();

    const data = useMemo(() => {
        const locations = new Map((sbLocations ?? []).map((l) => [l.id, l.name]));
        const projects = new Map((sbProjects ?? []).map((p) => [p.id, p.name]));
        return (sbActivations ?? []).map((a) => ({
            ...a,
            location_name: locations.get(a.location_id ?? "") ?? "",
            project_name: projects.get(a.project_id) ?? "",
        })) as unknown as Record<string, unknown>[];
    }, [sbActivations, sbLocations, sbProjects]);

    return <ListPageShell config={config} data={data} isLoading={loadingActivations} />;
}
