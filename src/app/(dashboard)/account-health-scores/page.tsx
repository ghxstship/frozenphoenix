import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function AccountHealthScoresPage() {
    const data = await fetchEntityList("account_health_score");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="ACCOUNT_HEALTH_SCORES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
