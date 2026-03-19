import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CATALOG_ITEMS_PAGE } from "@/config/list-page-configs";

export default async function CatalogItemsPage() {
    const data = await fetchEntityList("catalog_item");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CATALOG_ITEMS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
