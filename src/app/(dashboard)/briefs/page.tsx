import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { BRIEFS_PAGE } from "@/config/list-page-configs";

export default async function BriefsPage() {
    const data = await fetchEntityList("brief");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={BRIEFS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
