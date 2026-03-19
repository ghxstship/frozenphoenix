import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function JobCostEntriesPage() {
    const data = await fetchEntityList("job_cost_entry");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="JOB_COST_ENTRIES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
