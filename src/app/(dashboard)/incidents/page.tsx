"use client";

import { useMemo } from "react";
import { ListPageShell } from "@/components/shells";
import { useIncidents, useLocations, useProjects } from "@/lib/supabase";
import { INCIDENTS_PAGE } from "@/config/list-page-configs";
import { AlertTriangle, Shield } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    ...INCIDENTS_PAGE,
    title: "Incidents",
    createLabel: "Report Incident",
    exportable: true,
    stats: [
        { label: "Total Incidents", icon: AlertTriangle, filter: () => true },
        {
            label: "Open",
            icon: AlertTriangle,
            filter: (r) => r.status !== "closed" && r.status !== "resolved",
        },
        {
            label: "Critical/Major",
            icon: AlertTriangle,
            filter: (r) => r.severity === "critical" || r.severity === "major",
        },
        {
            label: "Est. Cost",
            icon: Shield,
            compute: (records) =>
                formatCurrency(
                    records.reduce((sum, r) => sum + (Number(r.estimated_cost) || 0), 0)
                ),
        },
    ],
    filters: [
        {
            id: "status",
            label: "Status",
            column: "status",
            options: [
                { value: "reported", label: "Reported" },
                { value: "investigating", label: "Investigating" },
                { value: "pending_action", label: "Pending Action" },
                { value: "resolved", label: "Resolved" },
                { value: "closed", label: "Closed" },
            ],
        },
    ],
    columns: [
        { id: "number", header: "Number", accessorKey: "number" },
        { id: "title", header: "Title", accessorKey: "title" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "severity", header: "Severity", accessorKey: "severity", fieldType: "priority" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "occurred_at", header: "Occurred", accessorKey: "occurred_at", fieldType: "date" },
        {
            id: "estimated_cost",
            header: "Est. Cost",
            accessorKey: "estimated_cost",
            fieldType: "currency",
        },
        { id: "location_name", header: "Location", accessorKey: "location_name" },
        { id: "project_name", header: "Project", accessorKey: "project_name" },
    ],
};

export default function IncidentsPage() {
    const { data: sbIncidents, isLoading: loadingIncidents } = useIncidents();
    const { data: sbLocations } = useLocations();
    const { data: sbProjects } = useProjects();

    const data = useMemo(() => {
        const locations = new Map((sbLocations ?? []).map((l) => [l.id, l.name]));
        const projects = new Map((sbProjects ?? []).map((p) => [p.id, p.name]));
        return (sbIncidents ?? []).map((i) => ({
            ...i,
            location_name: locations.get(i.location_id ?? "") ?? "",
            project_name: projects.get(i.project_id) ?? "",
        })) as unknown as Record<string, unknown>[];
    }, [sbIncidents, sbLocations, sbProjects]);

    return <ListPageShell config={config} data={data} isLoading={loadingIncidents} />;
}
