import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { ReadinessGatesPageClient } from "./_client";

export default async function ReadinessGatesPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ReadinessGatesPageClient />
        </Suspense>
    );
}
