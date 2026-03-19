import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { CONSUMABLES_PAGE } from "@/config/list-page-configs";

export default async function ConsumablesPage() {
    const data = await fetchEntityList("consumable");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={CONSUMABLES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
