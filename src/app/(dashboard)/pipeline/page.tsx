"use client";

import { ListPageShell } from "@/components/shells";
import { useDeals } from "@/lib/supabase/hooks";
import { CREATE_DEAL_CONFIG } from "@/config/create-entity-configs";
import { Calendar } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "pipeline",
    title: "Pipeline",
    description: "Manage your sales pipeline and deal flow",
    icon: Calendar,
    createConfig: CREATE_DEAL_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function PipelinePage() {
    const { data: rawData, isLoading } = useDeals();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
