import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { KNOWLEDGE_BASE_PAGE } from "@/config/list-page-configs";

export default async function KnowledgeBasePage() {
    const data = await fetchEntityList("knowledge_base_article");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={KNOWLEDGE_BASE_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
