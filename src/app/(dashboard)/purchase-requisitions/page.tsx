import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function PurchaseRequisitionsPage() {
    const data = await fetchEntityList("purchase_requisition");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="PURCHASE_REQUISITIONS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
