import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CAMPAIGNS_PAGE } from "@/config/list-page-configs";

export default async function CampaignsPage() {
    const data = await fetchEntityList("campaign");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CAMPAIGNS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
