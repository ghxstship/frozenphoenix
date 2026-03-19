import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function EstimatesPage() {
    const data = await fetchEntityList("estimate");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="ESTIMATES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
