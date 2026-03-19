import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function ProductionBudgetLinesPage() {
    const data = await fetchEntityList("production_budget_line");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="PRODUCTION_BUDGET_LINES_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
