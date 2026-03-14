"use client";

import { ListPageShell } from "@/components/shells";
import { useSavedViews } from "@/lib/supabase/hooks-productive";
import { CREATE_SAVED_VIEW_CONFIG } from "@/config/create-entity-configs";
import { Columns } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "saved_views",
    title: "Saved Views",
    description: "Manage custom filtered, sorted, and grouped views shared across your team",
    icon: Columns,
    createConfig: CREATE_SAVED_VIEW_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function SavedViewsPage() {
    const { data: rawData, isLoading } = useSavedViews();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
