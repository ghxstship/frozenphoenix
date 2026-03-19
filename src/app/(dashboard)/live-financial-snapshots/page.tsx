import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function LiveFinancialSnapshotsPage() {
    const data = await fetchEntityList("live_financial_snapshot");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell
                configKey="LIVE_FINANCIAL_SNAPSHOTS_PAGE"
                data={data}
                isLoading={false}
            />
        </Suspense>
    );
}
