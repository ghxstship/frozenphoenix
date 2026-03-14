"use client";

import { ListPageShell } from "@/components/shells";
import { useTeamMembersPage } from "@/lib/supabase/hooks-pages";
import { CREATE_TEAM_CONFIG } from "@/config/create-entity-configs";
import { LayoutGrid } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "teams",
    title: "Remove member",
    description: "Manage organizational teams and membership",
    icon: LayoutGrid,
    createConfig: CREATE_TEAM_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function TeamsPage() {
    const { data: rawData, isLoading } = useTeamMembersPage();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
