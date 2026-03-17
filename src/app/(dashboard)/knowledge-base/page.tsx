"use client";

import { ListPageShell } from "@/components/shells";
import { useKnowledgeBaseArticles } from "@/lib/supabase";
import { KNOWLEDGE_BASE_PAGE } from "@/config/list-page-configs";

export default function KnowledgeBasePage() {
    const { data: rawData, isLoading } = useKnowledgeBaseArticles();
    const data = (rawData ?? []) as Record<string, unknown>[];

    return <ListPageShell config={KNOWLEDGE_BASE_PAGE} data={data} isLoading={isLoading} />;
}
