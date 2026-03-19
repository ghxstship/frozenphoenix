import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { LOGISTICS_EVENTS_PAGE } from "@/config/list-page-configs";

export default async function LogisticsEventsPage() {
    const data = await fetchEntityList("logistics_event");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={LOGISTICS_EVENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
