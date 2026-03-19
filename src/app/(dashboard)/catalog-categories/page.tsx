import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CATALOG_CATEGORIES_PAGE } from "@/config/list-page-configs";

export default async function CatalogCategoriesPage() {
    const data = await fetchEntityList("catalog_category");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CATALOG_CATEGORIES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
