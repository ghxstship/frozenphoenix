import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function FohZonesPage() {
    const data = await fetchEntityList("foh_zone");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="FOH_ZONES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
