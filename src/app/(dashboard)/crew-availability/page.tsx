import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CREW_AVAILABILITY_PAGE } from "@/config/list-page-configs";

export default async function CrewAvailabilityPage() {
    const data = await fetchEntityList("crew_availability");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CREW_AVAILABILITY_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
