import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CAMPAIGN_KPIS_PAGE } from "@/config/list-page-configs";

export default async function CampaignKpisPage() {
    const data = await fetchEntityList("campaign_kpi");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CAMPAIGN_KPIS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
