"use client";

import { ListPageShell } from "@/components/shells";
import { useAdvances } from "@/lib/supabase/hooks-advancing";
import { CREATE_ADVANCE_CONFIG } from "@/config/create-entity-configs";
import { Calendar } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "advancing",
    title: "Advancing",
    description: "Manage production advances, catalog orders, and fulfillment",
    icon: Calendar,
    createConfig: CREATE_ADVANCE_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function AdvancingPage() {
    const { data: rawData, isLoading } = useAdvances();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
