import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function IntegrationsPage() {
    const data = await fetchEntityList("provider_connection");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="INTEGRATIONS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
