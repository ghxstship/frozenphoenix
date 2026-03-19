import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function QcGatesPage() {
    const data = await fetchEntityList("qc_gate");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="QC_GATES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
