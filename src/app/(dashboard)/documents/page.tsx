"use client";

import { ListPageShell } from "@/components/shells";
import { useDocuments } from "@/lib/supabase/hooks-pages";
import { CREATE_DOCUMENT_CONFIG } from "@/config/create-entity-configs";
import { BookOpen } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "documents",
    title: "Documents",
    description: "Create, collaborate, and share documents across your team and projects",
    icon: BookOpen,
    createConfig: CREATE_DOCUMENT_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function DocumentsPage() {
    const { data: rawData, isLoading } = useDocuments();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
