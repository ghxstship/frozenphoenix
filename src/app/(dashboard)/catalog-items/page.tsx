import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CatalogItemsPage() {
    const data = await fetchEntityList("catalog_item");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CATALOG_ITEMS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
