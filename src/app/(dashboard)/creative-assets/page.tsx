import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CREATIVE_ASSETS_PAGE } from "@/config/list-page-configs";

export default async function CreativeAssetsPage() {
    const data = await fetchEntityList("creative_asset");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CREATIVE_ASSETS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
