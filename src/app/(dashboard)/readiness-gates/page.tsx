import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ReadinessGatesPage() {
    const data = await fetchEntityList("readiness_gate");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="READINESS_GATES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
