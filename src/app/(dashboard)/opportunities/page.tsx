import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { OPPORTUNITIES_PAGE } from "@/config/list-page-configs";

export default async function OpportunitiesPage() {
    const data = await fetchEntityList("opportunity");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={OPPORTUNITIES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
