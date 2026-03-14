"use client";

import { ListPageShell } from "@/components/shells";
import { useChecklists } from "@/lib/supabase/hooks-pages";
import { CREATE_CHECKLIST_CONFIG } from "@/config/create-entity-configs";
import { CheckCircle2 } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "checklists",
    title: "Job Checklists",
    description:
        "Template-based checklists for work orders, quality assurance, and safety compliance",
    icon: CheckCircle2,
    createConfig: CREATE_CHECKLIST_CONFIG,
    searchKeys: ["title"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function ChecklistsPage() {
    const { data: rawData, isLoading } = useChecklists();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
