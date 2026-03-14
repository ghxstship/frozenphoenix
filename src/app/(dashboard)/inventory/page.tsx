"use client";

import { ListPageShell } from "@/components/shells";
import { useInventoryItems } from "@/lib/supabase/hooks-pages";
import { CREATE_INVENTORY_ITEM_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "inventory",
    title: "Inventory",
    description: "Track stock levels, consumables, and reorder points",
    icon: AlertTriangle,
    createConfig: CREATE_INVENTORY_ITEM_CONFIG,
    searchKeys: ["name", "sku"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function InventoryPage() {
    const { data: rawData, isLoading } = useInventoryItems();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
