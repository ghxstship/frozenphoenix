import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { REVIEW_CYCLES_PAGE } from "@/config/list-page-configs";

export default async function ReviewCyclesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={REVIEW_CYCLES_PAGE} />
        </Suspense>
    );
}
