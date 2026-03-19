import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CreativeAssetsPage() {
    const data = await fetchEntityList("creative_asset");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CREATIVE_ASSETS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
