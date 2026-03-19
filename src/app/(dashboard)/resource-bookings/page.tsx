import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { RESOURCE_BOOKINGS_PAGE } from "@/config/list-page-configs";

export default async function ResourceBookingsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={RESOURCE_BOOKINGS_PAGE} />
        </Suspense>
    );
}
