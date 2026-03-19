import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CrewAvailabilityPage() {
    const data = await fetchEntityList("crew_availability");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CREW_AVAILABILITY_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
