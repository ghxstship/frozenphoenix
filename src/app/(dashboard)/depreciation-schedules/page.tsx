import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { DEPRECIATION_SCHEDULES_PAGE } from "@/config/list-page-configs";

export default async function DepreciationSchedulesPage() {
    const data = await fetchEntityList("depreciation_schedule");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={DEPRECIATION_SCHEDULES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
