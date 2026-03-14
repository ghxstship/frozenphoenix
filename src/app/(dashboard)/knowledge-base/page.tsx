"use client";

import { ListPageShell } from "@/components/shells";
import { useKnowledgeBaseArticles } from "@/lib/supabase/hooks-pages";
import { CREATE_KB_ARTICLE_CONFIG } from "@/config/create-entity-configs";
import { BookOpen } from "lucide-react";
import type { ListPageConfig } from "@/types/list-page-config";

const config: ListPageConfig = {
    entityKey: "knowledge_base",
    title: "Knowledge Base",
    description: "SOPs, templates, guides, and documentation",
    icon: BookOpen,
    createConfig: CREATE_KB_ARTICLE_CONFIG,
    searchKeys: ["name"],
    columns: [
        { id: "name", header: "Name", accessorKey: "name" },
        { id: "status", header: "Status", accessorKey: "status", fieldType: "status" },
        { id: "created_at", header: "Created", accessorKey: "created_at", fieldType: "date" },
    ],
};

export default function KnowledgeBasePage() {
    const { data: rawData, isLoading } = useKnowledgeBaseArticles();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={config} data={data} isLoading={isLoading} />;
}
