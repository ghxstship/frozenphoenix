import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function WorkerProfilesPage() {
    const data = await fetchEntityList("worker_profile");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="WORKER_PROFILES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
