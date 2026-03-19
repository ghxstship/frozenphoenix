import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function ScanEventsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="SCAN_EVENTS_PAGE" />
        </Suspense>
    );
}
