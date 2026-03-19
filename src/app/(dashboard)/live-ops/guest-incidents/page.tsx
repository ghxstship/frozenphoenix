import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { GuestIncidentsPageClient } from "./_client";

export default async function GuestIncidentsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <GuestIncidentsPageClient />
        </Suspense>
    );
}
