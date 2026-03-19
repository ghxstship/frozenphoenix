import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CrewPage() {
    const data = await fetchEntityList("crew_member");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CREW_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
