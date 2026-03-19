import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { AdvancingReportsPageClient } from "./_client";

export default async function AdvancingReportsPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <AdvancingReportsPageClient />
        </Suspense>
    );
}
