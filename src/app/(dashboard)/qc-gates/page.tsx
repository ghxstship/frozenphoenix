import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { QC_GATES_PAGE } from "@/config/list-page-configs";

export default async function QcGatesPage() {
    const data = await fetchEntityList("qc_gate");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={QC_GATES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
