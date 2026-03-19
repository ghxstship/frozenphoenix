import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { SchedulingPageClient } from "./_client";

export default async function SchedulingPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <SchedulingPageClient />
        </Suspense>
    );
}
