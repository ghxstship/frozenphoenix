import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function CampaignsPage() {
    const data = await fetchEntityList("campaign");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CAMPAIGNS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
