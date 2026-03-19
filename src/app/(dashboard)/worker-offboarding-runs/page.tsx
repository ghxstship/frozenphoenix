import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { WORKER_OFFBOARDING_RUNS_PAGE } from "@/config/list-page-configs";

export default async function WorkerOffboardingRunsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={WORKER_OFFBOARDING_RUNS_PAGE} />
        </Suspense>
    );
}
