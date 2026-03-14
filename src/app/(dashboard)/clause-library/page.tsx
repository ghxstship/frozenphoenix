"use client";

import { ListPageShell } from "@/components/shells";
import { useClauseLibrary } from "@/lib/supabase/hooks-pages";
import { CREATE_CLAUSE_CONFIG } from "@/config/create-entity-configs";
import { BookLock } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "clause_library",
    title: "Clause Library",
    description:
        "Standard contract clauses with risk classification — reuse across contracts to ensure consistency",
    icon: BookLock,
    createConfig: CREATE_CLAUSE_CONFIG,
    searchKeys: ["title", "body"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function ClauseLibraryPage() {
    const { data: rawData, isLoading } = useClauseLibrary();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
