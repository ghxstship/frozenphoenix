import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { RATE_CARDS_PAGE } from "@/config/list-page-configs";

export default async function RateCardsPage() {
    const data = await fetchEntityList("rate_card");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={RATE_CARDS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
