import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PRODUCTION_VERTICALS_PAGE } from "@/config/list-page-configs";

export default async function ProductionVerticalsPage() {
    const data = await fetchEntityList("production_vertical");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PRODUCTION_VERTICALS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
