import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function FohZoneReadingsPage() {
    const data = await fetchEntityList("foh_zone_reading");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="FOH_ZONE_READINGS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
