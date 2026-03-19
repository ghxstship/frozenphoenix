import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function SlaTrackingPage() {
    const data = await fetchEntityList("sla_tracking");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="SLA_TRACKING_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
