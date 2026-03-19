import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { SYNC_EVENTS_PAGE } from "@/config/list-page-configs";

export default async function Page() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SYNC_EVENTS_PAGE} />
        </Suspense>
    );
}
