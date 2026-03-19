import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { WORK_ORDERS_PAGE } from "@/config/list-page-configs";

export default async function WorkOrdersPage() {
    const data = await fetchEntityList("work_order");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={WORK_ORDERS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
