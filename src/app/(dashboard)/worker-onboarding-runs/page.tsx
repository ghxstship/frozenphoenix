"use client";

import { ListPageShell } from "@/components/shells";
import { WORKER_ONBOARDING_RUNS_PAGE } from "@/config/list-page-configs";

export default function WorkerOnboardingRunsPage() {
    return <ListPageShell config={WORKER_ONBOARDING_RUNS_PAGE} />;
}
