import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PAYROLL_BATCHES_PAGE } from "@/config/list-page-configs";

export default async function PayrollBatchesPage() {
    const data = await fetchEntityList("payroll_batch");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PAYROLL_BATCHES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
