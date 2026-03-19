import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { JOB_COST_ENTRIES_PAGE } from "@/config/list-page-configs";

export default async function JobCostingPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={JOB_COST_ENTRIES_PAGE} />
        </Suspense>
    );
}
