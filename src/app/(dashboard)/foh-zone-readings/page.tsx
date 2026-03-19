import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { FOH_ZONE_READINGS_PAGE } from "@/config/list-page-configs";

export default async function FohZoneReadingsPage() {
    const data = await fetchEntityList("foh_zone_reading");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={FOH_ZONE_READINGS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
