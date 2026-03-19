import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { LiveFinancialsPageClient } from "./_client";

export default async function LiveFinancialsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <LiveFinancialsPageClient />
        </Suspense>
    );
}
