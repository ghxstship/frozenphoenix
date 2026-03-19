import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function JobCostingPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="JOB_COST_ENTRIES_PAGE" />
        </Suspense>
    );
}
