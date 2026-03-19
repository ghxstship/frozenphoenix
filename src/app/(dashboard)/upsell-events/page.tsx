import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function UpsellEventsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="UPSELL_EVENTS_PAGE" />
        </Suspense>
    );
}
