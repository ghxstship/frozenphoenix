import { Suspense } from "react";
import { LoadingState } from "@/components/layouts/loading-state";
import { OnboardingCompletePageClient } from "./_client";

export default async function OnboardingCompletePage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <OnboardingCompletePageClient />
        </Suspense>
    );
}
