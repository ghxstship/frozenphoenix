import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PURCHASE_REQUISITIONS_PAGE } from "@/config/list-page-configs";

export default async function PurchaseRequisitionsPage() {
    const data = await fetchEntityList("purchase_requisition");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PURCHASE_REQUISITIONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
