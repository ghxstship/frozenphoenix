import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { StrikePageClient } from "./_client";

export default async function StrikePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <StrikePageClient />
        </Suspense>
    );
}
