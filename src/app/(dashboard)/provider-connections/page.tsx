import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PROVIDER_CONNECTIONS_PAGE } from "@/config/list-page-configs";

export default async function ProviderConnectionsPage() {
    const data = await fetchEntityList("provider_connection");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PROVIDER_CONNECTIONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
