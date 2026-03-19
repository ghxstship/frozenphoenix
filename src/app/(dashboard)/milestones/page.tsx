import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function MilestonesPage() {
    const data = await fetchEntityList("milestone");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="MILESTONES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
