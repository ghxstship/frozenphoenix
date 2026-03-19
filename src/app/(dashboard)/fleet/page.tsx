import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { FLEET_PAGE } from "@/config/list-page-configs";

export default async function FleetPage() {
    const data = await fetchEntityList("vehicle");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={FLEET_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
