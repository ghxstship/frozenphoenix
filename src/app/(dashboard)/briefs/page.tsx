"use client";

import { ListPageShell } from "@/components/shells";
import { useBriefs } from "@/lib/supabase/hooks-pages";
import { CREATE_BRIEF_CONFIG } from "@/config/create-entity-configs";
import { CalendarDays } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "briefs",
    title: "Creative Briefs",
    description: "Strategic briefs connecting creative intent to measurable outcomes",
    icon: CalendarDays,
    createConfig: CREATE_BRIEF_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function BriefsPage() {
    const { data: rawData, isLoading } = useBriefs();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
