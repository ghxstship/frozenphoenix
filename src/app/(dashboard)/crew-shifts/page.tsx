import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CrewShiftsPage() {
    const data = await fetchEntityList("crew_shift");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CREW_SHIFTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
