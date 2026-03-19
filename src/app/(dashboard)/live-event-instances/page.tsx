import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { LIVE_EVENT_INSTANCES_PAGE } from "@/config/list-page-configs";

export default async function LiveEventInstancesPage() {
    const data = await fetchEntityList("live_event_instance");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={LIVE_EVENT_INSTANCES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
