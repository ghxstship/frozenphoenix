import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function WorkerOnboardingRunsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="WORKER_ONBOARDING_RUNS_PAGE" />
        </Suspense>
    );
}
