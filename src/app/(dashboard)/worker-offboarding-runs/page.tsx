import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function WorkerOffboardingRunsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="WORKER_OFFBOARDING_RUNS_PAGE" />
        </Suspense>
    );
}
