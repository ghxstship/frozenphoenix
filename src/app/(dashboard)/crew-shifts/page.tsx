import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CREW_SHIFTS_PAGE } from "@/config/list-page-configs";

export default async function CrewShiftsPage() {
    const data = await fetchEntityList("crew_shift");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CREW_SHIFTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
