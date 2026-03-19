import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PURCHASE_ORDERS_PAGE } from "@/config/list-page-configs";

export default async function PurchaseOrdersPage() {
    const data = await fetchEntityList("purchase_order");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PURCHASE_ORDERS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
