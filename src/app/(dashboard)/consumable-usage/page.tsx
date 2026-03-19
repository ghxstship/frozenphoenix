import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ConsumableUsagePage() {
    const data = await fetchEntityList("consumable_usage");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="CONSUMABLE_USAGE_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
