import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { JOB_COST_ENTRIES_PAGE } from "@/config/list-page-configs";

export default async function JobCostEntriesPage() {
    const data = await fetchEntityList("job_cost_entry");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={JOB_COST_ENTRIES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
