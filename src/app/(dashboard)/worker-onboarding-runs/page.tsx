import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { WORKER_ONBOARDING_RUNS_PAGE } from "@/config/list-page-configs";

export default async function WorkerOnboardingRunsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={WORKER_ONBOARDING_RUNS_PAGE} />
        </Suspense>
    );
}
