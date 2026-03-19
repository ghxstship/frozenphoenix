import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { WAREHOUSES_PAGE } from "@/config/list-page-configs";

export default async function WarehousesPage() {
    const data = await fetchEntityList("warehouse");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={WAREHOUSES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
