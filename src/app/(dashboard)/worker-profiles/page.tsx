import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { WORKER_PROFILES_PAGE } from "@/config/list-page-configs";

export default async function WorkerProfilesPage() {
    const data = await fetchEntityList("worker_profile");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={WORKER_PROFILES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
