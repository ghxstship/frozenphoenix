import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { ESTIMATES_PAGE } from "@/config/list-page-configs";

export default async function EstimatesPage() {
    const data = await fetchEntityList("estimate");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={ESTIMATES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
