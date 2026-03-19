import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CAMPAIGN_ASSETS_PAGE } from "@/config/list-page-configs";

export default async function CampaignAssetsPage() {
    const data = await fetchEntityList("campaign_asset");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CAMPAIGN_ASSETS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
