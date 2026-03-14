"use client";

import { ListPageShell } from "@/components/shells";
import { useScopesOfWork } from "@/lib/supabase/hooks-pages";
import { CREATE_SOW_CONFIG } from "@/config/create-entity-configs";
import { CheckCircle2 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "scopes_of_work",
    title: "Scopes of Work",
    description: "Manage SOW deliverables, billing, and project scope",
    icon: CheckCircle2,
    createConfig: CREATE_SOW_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function ScopesOfWorkPage() {
    const { data: rawData, isLoading } = useScopesOfWork();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
