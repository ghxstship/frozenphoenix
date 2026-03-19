import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { LOAD_PLANS_PAGE } from "@/config/list-page-configs";

export default async function LoadPlansPage() {
    const data = await fetchEntityList("load_plan");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={LOAD_PLANS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
