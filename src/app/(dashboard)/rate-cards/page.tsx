import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function RateCardsPage() {
    const data = await fetchEntityList("rate_card");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="RATE_CARDS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
