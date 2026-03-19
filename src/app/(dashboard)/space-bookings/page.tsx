import { Suspense } from "react";
import { ListPageShell } from "@/components/shells";
import { LoadingState } from "@/components/layouts/loading-state";

export default async function SpaceBookingsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ListPageShell configKey="SPACE_BOOKINGS_PAGE" />
        </Suspense>
    );
}
