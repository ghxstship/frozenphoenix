import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { SCAN_EVENTS_PAGE } from "@/config/list-page-configs";

export default async function ScanEventsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SCAN_EVENTS_PAGE} />
        </Suspense>
    );
}
