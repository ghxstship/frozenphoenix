import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CHANGE_ORDERS_PAGE } from "@/config/list-page-configs";

export default async function ChangeOrdersPage() {
    const data = await fetchEntityList("change_order");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CHANGE_ORDERS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
