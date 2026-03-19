import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { ASSET_VERSIONS_PAGE } from "@/config/list-page-configs";

export default async function AssetVersionsPage() {
    const data = await fetchEntityList("asset_version");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ASSET_VERSIONS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
