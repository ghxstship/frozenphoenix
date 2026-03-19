import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { LIVE_CREW_ASSIGNMENTS_PAGE } from "@/config/list-page-configs";

export default async function LiveCrewAssignmentsPage() {
    const data = await fetchEntityList("live_crew_assignment");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={LIVE_CREW_ASSIGNMENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
