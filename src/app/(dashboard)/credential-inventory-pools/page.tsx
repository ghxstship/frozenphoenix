import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CREDENTIAL_INVENTORY_POOLS_PAGE } from "@/config/list-page-configs";

export default async function CredentialInventoryPoolsPage() {
    const data = await fetchEntityList("credential_inventory_pool");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CREDENTIAL_INVENTORY_POOLS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
