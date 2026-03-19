import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function LogisticsEventsPage() {
    const data = await fetchEntityList("logistics_event");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="LOGISTICS_EVENTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
