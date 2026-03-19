import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { SHIPMENTS_PAGE } from "@/config/list-page-configs";

export default async function ShipmentsPage() {
    const data = await fetchEntityList("shipment");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SHIPMENTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
