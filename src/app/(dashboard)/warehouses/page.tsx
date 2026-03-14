"use client";

import { ListPageShell } from "@/components/shells";
import { useWarehouses } from "@/lib/supabase/hooks-pages";
import { CREATE_WAREHOUSE_CONFIG } from "@/config/create-entity-configs";
import { MapPin } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "warehouses",
    title: "Warehouses",
    description: "Manage storage facilities and inventory locations",
    icon: MapPin,
    createConfig: CREATE_WAREHOUSE_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function WarehousesPage() {
    const { data: rawData, isLoading } = useWarehouses();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
