import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { EVENTS_PAGE } from "@/config/list-page-configs";

export default async function EventsPage() {
    const data = await fetchEntityList("live_event");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={EVENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
