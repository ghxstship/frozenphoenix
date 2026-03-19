import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { REVENUE_SCHEDULES_PAGE } from "@/config/list-page-configs";

export default async function RevenueSchedulesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={REVENUE_SCHEDULES_PAGE} />
        </Suspense>
    );
}
