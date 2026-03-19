import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function KnowledgeBasePage() {
    const data = await fetchEntityList("knowledge_base_article");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="KNOWLEDGE_BASE_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
