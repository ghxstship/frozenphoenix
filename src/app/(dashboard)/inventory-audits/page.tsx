import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { INVENTORY_AUDITS_PAGE } from "@/config/list-page-configs";

export default async function InventoryAuditsPage() {
    const data = await fetchEntityList("inventory_audit");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={INVENTORY_AUDITS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
