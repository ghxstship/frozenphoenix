import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PIPELINE_PAGE } from "@/config/list-page-configs";

export default async function PipelinePage() {
    const data = await fetchEntityList("deal");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PIPELINE_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
