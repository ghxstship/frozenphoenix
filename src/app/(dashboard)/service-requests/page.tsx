"use client";

import { ListPageShell } from "@/components/shells";
import { useServiceRequests } from "@/lib/supabase/hooks-pages";
import { CREATE_SERVICE_REQUEST_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "service_requests",
    title: "Service Requests",
    description:
        "Triage incoming work requests from clients, online booking, and other channels into estimates, work orders, or projects",
    icon: AlertTriangle,
    createConfig: CREATE_SERVICE_REQUEST_CONFIG,
    searchKeys: ["title"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function ServiceRequestsPage() {
    const { data: rawData, isLoading } = useServiceRequests();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
