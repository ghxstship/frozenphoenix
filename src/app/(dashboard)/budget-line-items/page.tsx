import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { BUDGET_LINE_ITEMS_PAGE } from "@/config/list-page-configs";

export default async function BudgetLineItemsPage() {
    const data = await fetchEntityList("budget_line_item");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={BUDGET_LINE_ITEMS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
