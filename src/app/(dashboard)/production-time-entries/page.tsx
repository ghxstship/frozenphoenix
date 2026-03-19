import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ProductionTimeEntriesPage() {
    const data = await fetchEntityList("production_time_entry");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="PRODUCTION_TIME_ENTRIES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
