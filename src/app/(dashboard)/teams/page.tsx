import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function TeamsPage() {
    const data = await fetchEntityList("team");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="TEAMS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
