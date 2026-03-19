import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";
import { SPACE_BOOKINGS_PAGE } from "@/config/list-page-configs";

export default async function SpaceBookingsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell config={SPACE_BOOKINGS_PAGE} />
        </Suspense>
    );
}
