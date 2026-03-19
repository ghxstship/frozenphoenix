import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { WORKER_CLASSIFICATIONS_PAGE } from "@/config/list-page-configs";

export default async function WorkerClassificationsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={WORKER_CLASSIFICATIONS_PAGE} />
        </Suspense>
    );
}
