import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { READINESS_GATES_PAGE } from "@/config/list-page-configs";

export default async function ReadinessGatesPage() {
    const data = await fetchEntityList("readiness_gate");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={READINESS_GATES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
