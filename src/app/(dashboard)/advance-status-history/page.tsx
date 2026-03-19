import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { ADVANCE_STATUS_HISTORY_PAGE } from "@/config/list-page-configs";

export default async function AdvanceStatusHistoryPage() {
    const data = await fetchEntityList("advance_status_history");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ADVANCE_STATUS_HISTORY_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
