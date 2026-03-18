"use client";

import { ListPageShell } from "@/components/shells";
import { useKnowledgeBaseArticles } from "@/lib/supabase";
import { useCreateKBArticle } from "@/lib/supabase/hooks-documents";
import {
    useCreateKnowledgeArticle,
    useUpdateKnowledgeArticle,
} from "@/lib/supabase/hooks-feature-gaps";
import { KNOWLEDGE_BASE_PAGE } from "@/config/list-page-configs";

export default function KnowledgeBasePage() {
    const { data: rawData, isLoading } = useKnowledgeBaseArticles();
    const data = (rawData ?? []) as Record<string, unknown>[];
    const _create = useCreateKBArticle();
    const _createArticle = useCreateKnowledgeArticle();
    const _updateArticle = useUpdateKnowledgeArticle();

    return <ListPageShell config={KNOWLEDGE_BASE_PAGE} data={data} isLoading={isLoading} />;
}
