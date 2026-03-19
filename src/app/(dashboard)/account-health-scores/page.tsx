import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { ACCOUNT_HEALTH_SCORES_PAGE } from "@/config/list-page-configs";

export default async function AccountHealthScoresPage() {
    const data = await fetchEntityList("account_health_score");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ACCOUNT_HEALTH_SCORES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
