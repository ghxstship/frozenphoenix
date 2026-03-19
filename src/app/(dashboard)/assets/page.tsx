import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { ASSETS_PAGE } from "@/config/list-page-configs";

export default async function AssetsPage() {
    const data = await fetchEntityList("asset");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ASSETS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
