"use client";

import { ListPageShell } from "@/components/shells";
import { WORKER_OFFBOARDING_RUNS_PAGE } from "@/config/list-page-configs";

export default function WorkerOffboardingRunsPage() {
    return <ListPageShell config={WORKER_OFFBOARDING_RUNS_PAGE} />;
}
