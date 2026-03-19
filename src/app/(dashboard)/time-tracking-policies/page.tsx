import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function TimeTrackingPoliciesPage() {
    const data = await fetchEntityList("time_tracking_policy");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="TIME_TRACKING_POLICIES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
