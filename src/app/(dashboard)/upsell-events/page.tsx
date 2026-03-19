import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { UPSELL_EVENTS_PAGE } from "@/config/list-page-configs";

export default async function UpsellEventsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={UPSELL_EVENTS_PAGE} />
        </Suspense>
    );
}
