"use client";

import { ListPageShell } from "@/components/shells";
import { useChangeOrders } from "@/lib/supabase/hooks-pages";
import { CREATE_SOW_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "change_orders",
    title: "Change Orders",
    description: "Track and manage post-contract scope modifications",
    icon: AlertTriangle,
    createConfig: CREATE_SOW_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

export default function ChangeOrdersPage() {
    const { data: rawData, isLoading } = useChangeOrders();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
