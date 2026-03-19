import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";

export default async function BudgetsPage() {
    const data = await fetchEntityList("budget");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="BUDGETS_PAGE" data={data} isLoading={false} />
        </Suspense>
    );
}
