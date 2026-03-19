import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CONSUMABLE_USAGE_PAGE } from "@/config/list-page-configs";

export default async function ConsumableUsagePage() {
    const data = await fetchEntityList("consumable_usage");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CONSUMABLE_USAGE_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
