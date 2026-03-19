import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { BRANDS_PAGE } from "@/config/list-page-configs";

export default async function BrandsPage() {
    const data = await fetchEntityList("brand");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={BRANDS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
