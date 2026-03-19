import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function DepreciationSchedulesPage() {
    const data = await fetchEntityList("depreciation_schedule");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="DEPRECIATION_SCHEDULES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
