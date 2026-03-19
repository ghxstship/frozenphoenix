import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { EXPENSE_REPORTS_PAGE } from "@/config/list-page-configs";

export default async function ExpenseReportsPage() {
    const data = await fetchEntityList("expense_report");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={EXPENSE_REPORTS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
