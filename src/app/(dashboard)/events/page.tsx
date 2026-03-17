"use client";

import { useMemo } from "react";
import { ListPageShell } from "@/components/shells";
import { useActivations, useEvents, useLocations, useProjects } from "@/lib/supabase";
import { EVENTS_PAGE } from "@/config/list-page-configs";
import { Calendar, Play, Users } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    ...EVENTS_PAGE,
    title: "Events",
    createLabel: "Schedule Event",
    exportable: true,
    importable: true,
    stats: [
        { label: "Total Events", icon: Calendar, filter: () => true },
        { label: "Confirmed", icon: Play, filter: (r) => r.status === "confirmed" },
        {
            label: "Total Attendees",
            icon: Users,
            compute: (records) =>
                records
                    .reduce((sum, r) => sum + (Number(r.attendee_count) || 0), 0)
                    .toLocaleString(),
        },
        {
            label: "VIP Guests",
            icon: Users,
            compute: (records) =>
                records.reduce((sum, r) => sum + (Number(r.vip_count) || 0), 0).toLocaleString(),
        },
    ],
    filters: [
        {
            id: "status",
            label: "Status",
            column: "status",
            options: [
                { value: "scheduled", label: "Scheduled" },
                { value: "confirmed", label: "Confirmed" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
            ],
        },
    ],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "type", header: "Type", accessorKey: "type" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "date", header: "Date", accessorKey: "date", fieldType: "date" },
        { id: "start_time", header: "Start", accessorKey: "start_time" },
        { id: "end_time", header: "End", accessorKey: "end_time" },
        { id: "attendee_count", header: "Attendees", accessorKey: "attendee_count" },
        { id: "location_name", header: "Location", accessorKey: "location_name" },
        { id: "project_name", header: "Project", accessorKey: "project_name" },
    ],
};

export default function EventsPage() {
    const { data: sbEvents, isLoading: loadingEvents } = useEvents();
    const { data: sbLocations } = useLocations();
    const { data: sbActivations } = useActivations();
    const { data: sbProjects } = useProjects();

    const data = useMemo(() => {
        const locations = new Map((sbLocations ?? []).map((l) => [l.id, l.name]));
        const activations = new Map((sbActivations ?? []).map((a) => [a.id, a.name]));
        const projects = new Map((sbProjects ?? []).map((p) => [p.id, p.name]));
        return (sbEvents ?? []).map((e) => ({
            ...e,
            location_name: locations.get(e.location_id ?? "") ?? "",
            activation_name: activations.get(e.activation_id ?? "") ?? "",
            project_name: projects.get(e.project_id) ?? "",
        })) as unknown as Record<string, unknown>[];
    }, [sbEvents, sbLocations, sbActivations, sbProjects]);

    return <ListPageShell config={config} data={data} isLoading={loadingEvents} />;
}
