import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { TimeTrackingPageClient } from "./_client";

export default async function TimeTrackingPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <TimeTrackingPageClient />
        </Suspense>
    );
}
