import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { BUDGET_APPROVALS_PAGE } from "@/config/list-page-configs";

export default async function BudgetApprovalsPage() {
    const data = await fetchEntityList("budget_approval");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={BUDGET_APPROVALS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
