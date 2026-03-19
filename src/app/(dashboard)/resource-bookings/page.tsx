import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function ResourceBookingsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="RESOURCE_BOOKINGS_PAGE" />
        </Suspense>
    );
}
