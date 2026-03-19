import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { WORKER_REVIEWS_PAGE } from "@/config/list-page-configs";

export default async function WorkerReviewsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={WORKER_REVIEWS_PAGE} />
        </Suspense>
    );
}
