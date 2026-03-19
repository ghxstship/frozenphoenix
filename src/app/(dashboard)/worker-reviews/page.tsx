import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function WorkerReviewsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="WORKER_REVIEWS_PAGE" />
        </Suspense>
    );
}
