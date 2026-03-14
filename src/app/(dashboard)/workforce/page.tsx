"use client";

import { ListPageShell } from "@/components/shells";
import { useWorkerProfiles } from "@/lib/supabase/hooks-pages";
import { CREATE_WORKFORCE_CONFIG } from "@/config/create-entity-configs";
import { AlertTriangle } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "workforce",
    title: "Workforce Directory",
    description:
        "Unified view of all workers across all employment classifications — employees, contractors, freelancers, vendors, and more",
    icon: AlertTriangle,
    createConfig: CREATE_WORKFORCE_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function WorkforcePage() {
    const { data: rawData, isLoading } = useWorkerProfiles();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
