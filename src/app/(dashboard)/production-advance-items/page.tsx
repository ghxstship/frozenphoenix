import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PRODUCTION_ADVANCE_ITEMS_PAGE } from "@/config/list-page-configs";

export default async function ProductionAdvanceItemsPage() {
    const data = await fetchEntityList("production_advance_item");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PRODUCTION_ADVANCE_ITEMS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
