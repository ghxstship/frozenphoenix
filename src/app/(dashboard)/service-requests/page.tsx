import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ServiceRequestsPage() {
    const data = await fetchEntityList("service_request");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="SERVICE_REQUESTS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
