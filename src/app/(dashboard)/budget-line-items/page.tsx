import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function BudgetLineItemsPage() {
    const data = await fetchEntityList("budget_line_item");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="BUDGET_LINE_ITEMS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
