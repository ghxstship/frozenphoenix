import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CAMPAIGN_CHANNELS_PAGE } from "@/config/list-page-configs";

export default async function CampaignChannelsPage() {
    const data = await fetchEntityList("campaign_channel");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CAMPAIGN_CHANNELS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
