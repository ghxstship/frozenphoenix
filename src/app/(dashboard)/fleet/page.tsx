"use client";

import { ListPageShell } from "@/components/shells";
import { useVehicles } from "@/lib/supabase/hooks";
import { CREATE_VEHICLE_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "fleet",
    title: "Fleet Management",
    description: "Vehicle tracking, dispatch, and logistics coordination",
    icon: AlertTriangle,
    createConfig: CREATE_VEHICLE_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function FleetPage() {
    const { data: rawData, isLoading } = useVehicles();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
