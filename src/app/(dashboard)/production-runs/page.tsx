import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ProductionRunsPage() {
    const data = await fetchEntityList("production_run");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="PRODUCTION_RUNS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
