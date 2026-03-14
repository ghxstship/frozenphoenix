"use client";

import { ListPageShell } from "@/components/shells";
import { useProviderConnections } from "@/lib/supabase/hooks-external-sync";
import { CREATE_INTEGRATION_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "integrations",
    title: "Integrations",
    description: "Manage external provider connections for ticketing, POS, and data sync",
    icon: AlertTriangle,
    createConfig: CREATE_INTEGRATION_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function IntegrationsPage() {
    const { data: rawData, isLoading } = useProviderConnections();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
