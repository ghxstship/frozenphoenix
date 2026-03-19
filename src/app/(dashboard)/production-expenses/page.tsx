import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ProductionExpensesPage() {
    const data = await fetchEntityList("production_expense");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="PRODUCTION_EXPENSES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
