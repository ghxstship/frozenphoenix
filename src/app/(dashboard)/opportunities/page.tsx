"use client";

import { ListPageShell } from "@/components/shells";
import { useOpportunities } from "@/lib/supabase/hooks-pages";
import { CREATE_OPPORTUNITY_CONFIG } from "@/config/create-entity-configs";
import { Building2 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "opportunities",
    title: "Opportunities",
    description: "Sales pipeline — track opportunities from discovery to close",
    icon: Building2,
    createConfig: CREATE_OPPORTUNITY_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
    exportable: true,
};

export default function OpportunitiesPage() {
    const { data: rawData, isLoading } = useOpportunities();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
