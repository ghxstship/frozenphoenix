"use client";

import { useMemo } from "react";
import { ListPageShell } from "@/components/shells";
import { useLocations, useProjects } from "@/lib/supabase/hooks";
import { CREATE_LOCATION_CONFIG } from "@/config/create-entity-configs";
import { Building, DollarSign, MapPin, Warehouse } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "locations",
    title: "Locations",
    description: "Manage venues, warehouses, and project locations",
    icon: MapPin,
    createConfig: CREATE_LOCATION_CONFIG,
    createLabel: "Add Location",
    exportable: true,
    importable: true,
    searchKeys: ["name", "type"],
    stats: [
        { label: "Total Locations", icon: MapPin, filter: () => true },
        { label: "Venues", icon: Building, filter: (r) => r.type === "venue" },
        { label: "Warehouses", icon: Warehouse, filter: (r) => r.type === "warehouse" },
        {
            label: "Total Cost",
            icon: DollarSign,
            compute: (records) =>
                formatCurrency(records.reduce((sum, r) => sum + (Number(r.total_cost) || 0), 0)),
        },
    ],
    filters: [
        {
            id: "type",
            label: "Type",
            column: "type",
            options: [
                { value: "venue", label: "Venue" },
                { value: "warehouse", label: "Warehouse" },
                { value: "office", label: "Office" },
                { value: "site", label: "Site" },
            ],
        },
    ],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "capacity", header: "Capacity", accessorKey: "capacity" },
        { id: "square_footage", header: "Sq Ft", accessorKey: "square_footage" },
        {
            id: "daily_rate",
            header: "Daily Rate",
            accessorKey: "daily_rate",
            fieldType: "currency",
        },
        {
            id: "total_cost",
            header: "Total Cost",
            accessorKey: "total_cost",
            fieldType: "currency",
        },
        { id: "project_name", header: "Project", accessorKey: "project_name" },
    ],
};

export default function LocationsPage() {
    const { data: sbLocations, isLoading: loadingLocations } = useLocations();
    const { data: sbProjects } = useProjects();

    const data = useMemo(() => {
        const projects = new Map((sbProjects ?? []).map((p) => [p.id, p.name]));
        return (sbLocations ?? []).map((l) => ({
            ...l,
            project_name: projects.get(l.project_id ?? "") ?? "",
        })) as unknown as Record<string, unknown>[];
    }, [sbLocations, sbProjects]);

    return <ListPageShell config={config} data={data} isLoading={loadingLocations} />;
}
