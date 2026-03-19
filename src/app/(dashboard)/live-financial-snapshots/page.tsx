import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { LIVE_FINANCIAL_SNAPSHOTS_PAGE } from "@/config/list-page-configs";

export default async function LiveFinancialSnapshotsPage() {
    const data = await fetchEntityList("live_financial_snapshot");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={LIVE_FINANCIAL_SNAPSHOTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
