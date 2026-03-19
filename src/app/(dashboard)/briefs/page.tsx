import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function BriefsPage() {
    const data = await fetchEntityList("brief");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="BRIEFS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
