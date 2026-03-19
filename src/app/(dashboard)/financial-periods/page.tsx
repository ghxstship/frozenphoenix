import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { fetchEntityList } from "@/lib/api/server-fetch";
import { FINANCIAL_PERIODS_PAGE } from "@/config/list-page-configs";

export default async function FinancialPeriodsPage() {
    const data = await fetchEntityList("financial_period");
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={FINANCIAL_PERIODS_PAGE} data={data} isLoading={false} />
        </Suspense>
    );
}
