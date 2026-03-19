import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PRODUCTION_MILESTONES_PAGE } from "@/config/list-page-configs";

export default async function ProductionMilestonesPage() {
    const data = await fetchEntityList("production_milestone");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PRODUCTION_MILESTONES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
