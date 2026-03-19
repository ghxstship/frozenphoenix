import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function AssetTagsPage() {
    const data = await fetchEntityList("asset_tag");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="ASSET_TAGS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
