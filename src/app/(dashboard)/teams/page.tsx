import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { TEAMS_PAGE } from "@/config/list-page-configs";

export default async function TeamsPage() {
    const data = await fetchEntityList("team");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={TEAMS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
