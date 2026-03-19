import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { PRODUCTION_EXPENSES_PAGE } from "@/config/list-page-configs";

export default async function ProductionExpensesPage() {
    const data = await fetchEntityList("production_expense");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={PRODUCTION_EXPENSES_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
