import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { REVENUE_RECOGNITION_ENTRIES_PAGE } from "@/config/list-page-configs";

export default async function Page() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={REVENUE_RECOGNITION_ENTRIES_PAGE} />
        </Suspense>
    );
}
